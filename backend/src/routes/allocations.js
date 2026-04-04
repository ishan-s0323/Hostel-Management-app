const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /allocations
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT a.*, s.name AS student_name, s.department, r.room_type, b.block_name, r.floor_num
               FROM allocation a
               JOIN student s ON a.student_id = s.student_id
               JOIN room r ON a.room_id = r.room_id
               JOIN hostel_block b ON r.block_id = b.block_id WHERE 1=1`;
    const binds = {};
    if (status) { sql += ` AND a.status = :st`; binds.st = status; }
    sql += ` ORDER BY a.created_at DESC`;

    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /allocations - allocate room using stored procedure
router.post('/', authorize('admin', 'superadmin', 'warden'), async (req, res) => {
  try {
    const { studentId, roomId } = req.body;
    const result = await db.execute(
      `BEGIN sp_allocate_room(:sid, :rid, :success, :message, :allocId); END;`,
      {
        sid: studentId, rid: roomId,
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
        allocId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    const success = result.outBinds.success;
    const message = result.outBinds.message;
    if (success === 1) {
      res.status(201).json({ id: result.outBinds.allocId, message });
    } else {
      res.status(400).json({ error: message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /allocations/:id/release
router.put('/:id/release', authorize('admin', 'superadmin', 'warden'), async (req, res) => {
  try {
    const result = await db.execute(
      `BEGIN sp_release_room(:aid, :success, :message); END;`,
      {
        aid: req.params.id,
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );
    if (result.outBinds.success === 1) {
      res.json({ message: result.outBinds.message });
    } else {
      res.status(400).json({ error: result.outBinds.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /allocations/:id/transfer
router.put('/:id/transfer', authorize('admin', 'superadmin', 'warden'), async (req, res) => {
  try {
    const { newRoomId } = req.body;
    const result = await db.execute(
      `BEGIN sp_transfer_room(:aid, :nrid, :success, :message, :newAllocId); END;`,
      {
        aid: req.params.id, nrid: newRoomId,
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
        newAllocId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    if (result.outBinds.success === 1) {
      res.json({ id: result.outBinds.newAllocId, message: result.outBinds.message });
    } else {
      res.status(400).json({ error: result.outBinds.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
