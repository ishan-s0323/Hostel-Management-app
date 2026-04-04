const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /biometric
router.get('/', async (req, res) => {
  try {
    const { studentId, scanType, date } = req.query;
    let sql = `SELECT bl.*, s.name AS student_name FROM biometric_log bl
               JOIN student s ON bl.student_id = s.student_id WHERE 1=1`;
    const binds = {};
    if (studentId) { sql += ` AND bl.student_id = :sid`; binds.sid = Number(studentId); }
    if (scanType) { sql += ` AND bl.scan_type = :st`; binds.st = scanType; }
    if (date) { sql += ` AND TRUNC(bl.log_timestamp) = TO_DATE(:dt,'YYYY-MM-DD')`; binds.dt = date; }
    if (req.user.userType === 'student') { sql += ` AND bl.student_id = :mysid`; binds.mysid = req.user.id; }
    sql += ` ORDER BY bl.log_timestamp DESC FETCH FIRST 100 ROWS ONLY`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /biometric
router.post('/', async (req, res) => {
  try {
    const { studentId, scanType, scanLocation, fineAmount } = req.body;
    const result = await db.execute(
      `INSERT INTO biometric_log (student_id, scan_type, scan_location, fine_amount)
       VALUES (:sid, :st, :sl, :fa) RETURNING log_id INTO :id`,
      { sid: studentId, st: scanType, sl: scanLocation || null, fa: fineAmount || 0,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Log recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
