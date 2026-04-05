const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /fees
router.get('/', async (req, res) => {
  try {
    const { studentId, status } = req.query;
    let sql = `SELECT f.*, s.name AS student_name FROM fees f
               JOIN student s ON f.student_id = s.student_id WHERE 1=1`;
    const binds = {};
    if (req.user.userType === 'student') {
      sql += ` AND f.student_id = :sid`; binds.sid = req.user.id;
    } else if (studentId) {
      sql += ` AND f.student_id = :sid`; binds.sid = Number(studentId);
    }
    if (status) { sql += ` AND f.status = :st`; binds.st = status; }
    sql += ` ORDER BY f.due_date DESC`;

    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /fees/summary
router.get('/summary', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT NVL(SUM(amount),0) AS total, NVL(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) AS collected,
       NVL(SUM(CASE WHEN status IN ('pending','overdue') THEN amount ELSE 0 END),0) AS outstanding,
       COUNT(CASE WHEN status='overdue' THEN 1 END) AS overdue_count FROM fees`
    );
    res.json(rowToCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /fees - admin creates for any student, student creates advance for themselves
router.post('/', async (req, res) => {
  try {
    const { studentId, amount, dueDate, feeType } = req.body;
    // Students can only create fees for themselves
    const targetStudentId = req.user.userType === 'student' ? req.user.id : studentId;
    if (!targetStudentId) return res.status(400).json({ error: 'studentId required' });
    const result = await db.execute(
      `INSERT INTO fees (student_id, amount, due_date, fee_type) VALUES (:sid, :amt, TO_DATE(:dd,'YYYY-MM-DD'), :ftype)
       RETURNING fee_id INTO :oid`,
      { sid: targetStudentId, amt: amount, dd: dueDate, ftype: feeType,
        oid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.oid[0], message: 'Fee created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /fees/:id/pay
router.post('/:id/pay', async (req, res) => {
  try {
    const feeId = Number(req.params.id);
    const { amountPaid, paymentMethod, transactionReference } = req.body;

    const feeResult = await db.execute(
      'SELECT fee_id, student_id, amount FROM fees WHERE fee_id = :fid',
      { fid: feeId }
    );
    if (!feeResult.rows.length) return res.status(404).json({ error: 'Fee not found' });

    const feeRow = feeResult.rows[0];
    const studentId = feeRow.STUDENT_ID || feeRow[1];

    // Insert payment record
    const payResult = await db.execute(
      `INSERT INTO payments (fee_id, student_id, amount_paid, payment_method, transaction_reference, payment_status)
       VALUES (:pfid, :psid, :pamt, :pmethod, :ptref, 'completed') RETURNING payment_id INTO :paid`,
      {
        pfid: feeId,
        psid: studentId,
        pamt: Number(amountPaid),
        pmethod: paymentMethod || 'cash',
        ptref: transactionReference || null,
        paid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    // Also explicitly mark fee as paid (in case trigger doesn't fire)
    await db.execute(
      `UPDATE fees SET status = 'paid' WHERE fee_id = :fid`,
      { fid: feeId }
    );

    res.json({ paymentId: payResult.outBinds.paid[0], message: 'Payment recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /fees/mark-overdue
router.post('/mark-overdue', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const result = await db.execute(
      `BEGIN sp_mark_overdue_fees(:cnt); END;`,
      { cnt: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.json({ markedCount: result.outBinds.cnt, message: 'Overdue fees marked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
