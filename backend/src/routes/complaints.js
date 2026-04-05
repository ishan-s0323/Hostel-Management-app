const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /complaints
router.get('/', async (req, res) => {
  try {
    const { status, studentId } = req.query;
    let sql = `SELECT rc.*, s.name AS student_name, b.block_name, r.floor_num, r.room_type
               FROM room_complaints rc
               JOIN student s ON rc.student_id = s.student_id
               JOIN room r ON rc.room_id = r.room_id
               JOIN hostel_block b ON r.block_id = b.block_id WHERE 1=1`;
    const binds = {};
    if (status) { sql += ` AND rc.status = :st`; binds.st = status; }
    if (req.user.userType === 'student') { 
      sql += ` AND rc.student_id = :sid`; binds.sid = req.user.id; 
    } else if (studentId) { 
      sql += ` AND rc.student_id = :sid`; binds.sid = Number(studentId); 
    }
    sql += ` ORDER BY rc.reported_date DESC`;

    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /complaints
router.post('/', async (req, res) => {
  try {
    const { description, reporterName } = req.body;
    let { roomId } = req.body;
    const studentId = req.user.userType === 'student' ? req.user.id : req.body.studentId;

    if (!roomId) {
      const alloc = await db.execute(`SELECT room_id FROM allocation WHERE student_id = :sid AND status = 'active'`, { sid: studentId });
      if (alloc.rows.length > 0) {
        roomId = alloc.rows[0].ROOM_ID || alloc.rows[0][0]; // Depending on outFormat
      } else {
        return res.status(400).json({ error: 'No active room allocation found. Cannot file complaint.' });
      }
    }

    const result = await db.execute(
      `INSERT INTO room_complaints (room_id, student_id, description, reporter_name)
       VALUES (:rid, :sid, :cdesc, :rname) RETURNING complaint_id INTO :oid`,
      { rid: roomId, sid: studentId, cdesc: description, rname: reporterName || null,
        oid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.oid[0], message: 'Complaint registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /complaints/:id
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE room_complaints SET status = :st WHERE complaint_id = :id',
      { st: status, id: req.params.id });
    res.json({ message: 'Complaint updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
