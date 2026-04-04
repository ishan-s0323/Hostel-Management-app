const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /blocks
router.get('/', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM vw_block_occupancy');
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /blocks/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT b.*, s.name AS warden_name FROM hostel_block b LEFT JOIN staff s ON b.warden_id = s.staff_id WHERE b.block_id = :id`,
      { id: req.params.id }
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Block not found' });
    res.json(rowToCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /blocks
router.post('/', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { blockName, floors, wardenId } = req.body;
    const result = await db.execute(
      `INSERT INTO hostel_block (block_name, floors, warden_id) VALUES (:bn, :fl, :wid) RETURNING block_id INTO :id`,
      { bn: blockName, fl: floors, wid: wardenId || null, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Block created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /blocks/:id
router.put('/:id', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { blockName, floors, wardenId } = req.body;
    const fields = []; const binds = { id: req.params.id };
    if (blockName) { fields.push('block_name = :bn'); binds.bn = blockName; }
    if (floors) { fields.push('floors = :fl'); binds.fl = floors; }
    if (wardenId !== undefined) { fields.push('warden_id = :wid'); binds.wid = wardenId; }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    await db.execute(`UPDATE hostel_block SET ${fields.join(', ')} WHERE block_id = :id`, binds);
    res.json({ message: 'Block updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
