const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /feedback
router.get('/', async (req, res) => {
  try {
    let sql = `SELECT hf.*, s.name AS student_name FROM hostel_feedback hf
               JOIN student s ON hf.student_id = s.student_id WHERE 1=1`;
    const binds = {};
    if (req.user.userType === 'student') { sql += ` AND hf.student_id = :sid`; binds.sid = req.user.id; }
    sql += ` ORDER BY hf.date_submitted DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /feedback/summary
router.get('/summary', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM vw_feedback_averages');
    res.json(result.rows.length ? rowToCamel(result.rows[0]) : {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /feedback
router.post('/', async (req, res) => {
  try {
    const { messRating, cleanlinessRating, wifiRating, maintenanceRating, comments } = req.body;
    const sid = req.user.userType === 'student' ? req.user.id : req.body.studentId;
    const result = await db.execute(
      `INSERT INTO hostel_feedback (student_id, mess_rating, cleanliness_rating, wifi_rating, maintenance_rating, comments)
       VALUES (:sid, :mr, :cr, :wr, :mnr, :cm) RETURNING feedback_id INTO :id`,
      { sid, mr: messRating, cr: cleanlinessRating, wr: wifiRating, mnr: maintenanceRating,
        cm: comments || null, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Feedback submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
