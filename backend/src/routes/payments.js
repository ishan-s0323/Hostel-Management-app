const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /payments
router.get('/', async (req, res) => {
  try {
    const { studentId, feeId } = req.query;
    let sql = `SELECT p.*, s.name AS student_name FROM payments p
               JOIN student s ON p.student_id = s.student_id WHERE 1=1`;
    const binds = {};
    if (studentId) { sql += ` AND p.student_id = :sid`; binds.sid = Number(studentId); }
    if (feeId) { sql += ` AND p.fee_id = :fid`; binds.fid = Number(feeId); }
    sql += ` ORDER BY p.payment_date DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
