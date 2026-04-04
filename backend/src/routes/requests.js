const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// === ROOM CHANGE REQUESTS ===

// GET /requests/room-change
router.get('/room-change', async (req, res) => {
  try {
    let sql = `SELECT rcr.*, s.name AS student_name, b.block_name AS requested_block_name, st.name AS reviewer_name
               FROM room_change_request rcr
               JOIN student s ON rcr.student_id = s.student_id
               LEFT JOIN hostel_block b ON rcr.requested_block = b.block_id
               LEFT JOIN staff st ON rcr.reviewed_by = st.staff_id WHERE 1=1`;
    const binds = {};
    if (req.user.userType === 'student') { sql += ` AND rcr.student_id = :sid`; binds.sid = req.user.id; }
    sql += ` ORDER BY rcr.created_at DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /requests/room-change
router.post('/room-change', async (req, res) => {
  try {
    const { currentRoomId, requestedBlock, requestedRoomType, reason } = req.body;
    const sid = req.user.userType === 'student' ? req.user.id : req.body.studentId;
    const result = await db.execute(
      `INSERT INTO room_change_request (student_id, current_room_id, requested_block, requested_room_type, reason)
       VALUES (:sid, :crid, :rb, :rrt, :reason) RETURNING request_id INTO :id`,
      { sid, crid: currentRoomId || null, rb: requestedBlock || null, rrt: requestedRoomType || null,
        reason: reason || null, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Request submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /requests/room-change/:id
router.put('/room-change/:id', authorize('admin', 'superadmin', 'warden'), async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute(
      'UPDATE room_change_request SET status = :st, reviewed_by = :rb WHERE request_id = :id',
      { st: status, rb: req.user.id, id: req.params.id }
    );
    res.json({ message: 'Request updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === WAITLIST ===

// GET /requests/waitlist
router.get('/waitlist', async (req, res) => {
  try {
    let sql = `SELECT w.*, s.name AS student_name, s.cgpa, b.block_name
               FROM waitlist w JOIN student s ON w.student_id = s.student_id
               LEFT JOIN hostel_block b ON w.block_id = b.block_id WHERE 1=1`;
    const binds = {};
    if (req.user.userType === 'student') { sql += ` AND w.student_id = :sid`; binds.sid = req.user.id; }
    sql += ` ORDER BY w.priority_rank ASC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /requests/waitlist
router.post('/waitlist', async (req, res) => {
  try {
    const { blockId, roomType } = req.body;
    const sid = req.user.userType === 'student' ? req.user.id : req.body.studentId;
    // Get student CGPA for priority
    const stu = await db.execute('SELECT cgpa FROM student WHERE student_id = :sid', { sid });
    const cgpa = stu.rows.length ? stu.rows[0].CGPA : null;
    const result = await db.execute(
      `INSERT INTO waitlist (student_id, block_id, room_type, based_on_cgpa) VALUES (:sid, :bid, :rt, :cgpa) RETURNING waitlist_id INTO :id`,
      { sid, bid: blockId || null, rt: roomType || null, cgpa,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Added to waitlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /requests/waitlist/:id
router.delete('/waitlist/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM waitlist WHERE waitlist_id = :id', { id: req.params.id });
    res.json({ message: 'Removed from waitlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
