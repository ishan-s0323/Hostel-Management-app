const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /housekeeping
router.get('/', async (req, res) => {
  try {
    const { status, date } = req.query;
    let sql = `SELECT rk.*, r.room_type, r.floor_num, b.block_name, st.name AS staff_name
               FROM room_keeping rk
               JOIN room r ON rk.room_id = r.room_id
               JOIN hostel_block b ON r.block_id = b.block_id
               JOIN staff st ON rk.staff_id = st.staff_id WHERE 1=1`;
    const binds = {};
    if (status) { sql += ` AND rk.status = :st`; binds.st = status; }
    if (date) { sql += ` AND rk.scheduled_date = TO_DATE(:dt,'YYYY-MM-DD')`; binds.dt = date; }
    sql += ` ORDER BY rk.scheduled_date DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /housekeeping
router.post('/', authorize('admin', 'superadmin', 'warden', 'housekeeping'), async (req, res) => {
  try {
    const { roomId, staffId, scheduledDate } = req.body;
    const result = await db.execute(
      `INSERT INTO room_keeping (room_id, staff_id, scheduled_date)
       VALUES (:rid, :sid, TO_DATE(:sd,'YYYY-MM-DD')) RETURNING schedule_id INTO :id`,
      { rid: roomId, sid: staffId, sd: scheduledDate,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Schedule created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /housekeeping/:id
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE room_keeping SET status = :st WHERE schedule_id = :id', { st: status, id: req.params.id });
    res.json({ message: 'Schedule updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
