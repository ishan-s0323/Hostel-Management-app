const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

// GET /staff
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT s.staff_id, s.name, s.role, s.phone, s.email, s.block_id, b.block_name, s.created_at
       FROM staff s LEFT JOIN hostel_block b ON s.block_id = b.block_id ORDER BY s.staff_id`
    );
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /staff/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT s.staff_id, s.name, s.role, s.phone, s.email, s.block_id, b.block_name
       FROM staff s LEFT JOIN hostel_block b ON s.block_id = b.block_id WHERE s.staff_id = :id`,
      { id: req.params.id }
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Staff not found' });
    res.json(rowToCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /staff/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, role, phone, blockId } = req.body;
    const fields = []; const binds = { id: req.params.id };
    if (name) { fields.push('name = :n'); binds.n = name; }
    if (role) { fields.push('role = :r'); binds.r = role; }
    if (phone) { fields.push('phone = :p'); binds.p = phone; }
    if (blockId !== undefined) { fields.push('block_id = :bid'); binds.bid = blockId; }
    if (!fields.length) return res.status(400).json({ error: 'No fields' });
    await db.execute(`UPDATE staff SET ${fields.join(', ')} WHERE staff_id = :id`, binds);
    res.json({ message: 'Staff updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /staff/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM staff WHERE staff_id = :id', { id: req.params.id });
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
