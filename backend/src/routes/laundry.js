const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /laundry
router.get('/', async (req, res) => {
  try {
    let sql = `SELECT lo.*, s.name AS student_name FROM laundry_order lo
               JOIN student s ON lo.student_id = s.student_id WHERE 1=1`;
    const binds = {};
    if (req.user.userType === 'student') { sql += ` AND lo.student_id = :sid`; binds.sid = req.user.id; }
    sql += ` ORDER BY lo.submit_date DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /laundry/:id (with items)
router.get('/:id', async (req, res) => {
  try {
    const order = await db.execute(
      `SELECT lo.*, s.name AS student_name FROM laundry_order lo JOIN student s ON lo.student_id = s.student_id WHERE lo.order_id = :id`,
      { id: req.params.id }
    );
    if (!order.rows.length) return res.status(404).json({ error: 'Order not found' });
    const items = await db.execute('SELECT * FROM laundry_items WHERE order_id = :id', { id: req.params.id });
    const result = rowToCamel(order.rows[0]);
    result.items = rowsToCamel(items.rows);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /laundry
router.post('/', async (req, res) => {
  try {
    const { expectedReturnDate, items } = req.body;
    const sid = req.user.userType === 'student' ? req.user.id : req.body.studentId;
    const result = await db.execute(
      `INSERT INTO laundry_order (student_id, expected_return_date)
       VALUES (:sid, TO_DATE(:erd,'YYYY-MM-DD')) RETURNING order_id INTO :id`,
      { sid, erd: expectedReturnDate || null, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    const orderId = result.outBinds.id[0];
    if (items && items.length) {
      for (const item of items) {
        await db.execute(
          'INSERT INTO laundry_items (order_id, item_type, quantity) VALUES (:oid, :it, :qty)',
          { oid: orderId, it: item.itemType, qty: item.quantity || 1 }
        );
      }
    }
    res.status(201).json({ id: orderId, message: 'Laundry order created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /laundry/:id
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE laundry_order SET status = :st WHERE order_id = :id', { st: status, id: req.params.id });
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
