const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /rooms
router.get('/', async (req, res) => {
  try {
    const { blockId, roomType, status } = req.query;
    let sql = `SELECT r.*, b.block_name FROM room r JOIN hostel_block b ON r.block_id = b.block_id WHERE 1=1`;
    const binds = {};
    if (blockId) { sql += ` AND r.block_id = :bid`; binds.bid = Number(blockId); }
    if (roomType) { sql += ` AND r.room_type = :rt`; binds.rt = roomType; }
    
    if (req.user.userType === 'student') {
      sql += ` AND r.availability_status = 'available'`;
    } else if (status) {
      sql += ` AND r.availability_status = :st`; binds.st = status;
    }
    sql += ` ORDER BY b.block_name, r.floor_num, r.room_id`;

    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /rooms/suggest - suggest available rooms sorted by occupancy
router.get('/suggest', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT r.*, b.block_name FROM room r
       JOIN hostel_block b ON r.block_id = b.block_id
       WHERE r.availability_status = 'available' AND r.current_occupancy < r.capacity
       ORDER BY r.current_occupancy ASC, r.rent_per_month ASC
       FETCH FIRST 10 ROWS ONLY`
    );
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT r.*, b.block_name FROM room r JOIN hostel_block b ON r.block_id = b.block_id WHERE r.room_id = :id`,
      { id: req.params.id }
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Room not found' });
    const room = rowToCamel(result.rows[0]);

    // Get current occupants
    const occ = await db.execute(
      `SELECT s.student_id, s.name, s.department FROM allocation a
       JOIN student s ON a.student_id = s.student_id
       WHERE a.room_id = :id AND a.status = 'active'`, { id: req.params.id }
    );
    room.occupants = rowsToCamel(occ.rows);
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /rooms
router.post('/', authorize('admin', 'superadmin', 'warden'), async (req, res) => {
  try {
    const { blockId, roomType, capacity, floorNum, rentPerMonth } = req.body;
    const result = await db.execute(
      `INSERT INTO room (block_id, room_type, capacity, floor_num, rent_per_month)
       VALUES (:bid, :rt, :cap, :fl, :rent) RETURNING room_id INTO :id`,
      { bid: blockId, rt: roomType, cap: capacity, fl: floorNum, rent: rentPerMonth || 0,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Room created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /rooms/:id
router.put('/:id', authorize('admin', 'superadmin', 'warden'), async (req, res) => {
  try {
    const { roomType, capacity, rentPerMonth, availabilityStatus } = req.body;
    const fields = [];
    const binds = { id: req.params.id };
    if (roomType) { fields.push('room_type = :rt'); binds.rt = roomType; }
    if (capacity) { fields.push('capacity = :cap'); binds.cap = capacity; }
    if (rentPerMonth !== undefined) { fields.push('rent_per_month = :rent'); binds.rent = rentPerMonth; }
    if (availabilityStatus) { fields.push('availability_status = :st'); binds.st = availabilityStatus; }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    await db.execute(`UPDATE room SET ${fields.join(', ')} WHERE room_id = :id`, binds);
    res.json({ message: 'Room updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
