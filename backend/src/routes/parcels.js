const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /parcels
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT p.*, s.name AS student_name, st.name AS received_by_name
               FROM parcels p JOIN student s ON p.student_id = s.student_id
               LEFT JOIN staff st ON p.received_by = st.staff_id WHERE 1=1`;
    const binds = {};
    if (status) { sql += ` AND p.status = :st`; binds.st = status; }
    if (req.user.userType === 'student') { sql += ` AND p.student_id = :sid`; binds.sid = req.user.id; }
    sql += ` ORDER BY p.arrival_date DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /parcels
router.post('/', async (req, res) => {
  try {
    const { studentId, courierCompany, referenceNumber, pickupDeadline, weightCategory } = req.body;
    const result = await db.execute(
      `INSERT INTO parcels (student_id, courier_company, reference_number, pickup_deadline, weight_category, received_by)
       VALUES (:sid, :cc, :refnum, TO_DATE(:pd,'YYYY-MM-DD'), :wc, :rb) RETURNING parcel_id INTO :oid`,
      { sid: studentId, cc: courierCompany || null, refnum: referenceNumber || null,
        pd: pickupDeadline || null, wc: weightCategory || null,
        rb: req.user.userType !== 'student' ? req.user.id : null,
        oid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.oid[0], message: 'Parcel registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /parcels/:id
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE parcels SET status = :st WHERE parcel_id = :id', { st: status, id: req.params.id });
    res.json({ message: 'Parcel updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
