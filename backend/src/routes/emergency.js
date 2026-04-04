const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /emergency/:studentId
router.get('/:studentId', async (req, res) => {
  try {
    const result = await db.execute(
      'SELECT * FROM emergency_contact WHERE student_id = :sid ORDER BY contact_id',
      { sid: req.params.studentId }
    );
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /emergency
router.post('/', async (req, res) => {
  try {
    const { studentId, name, relation, phone, email } = req.body;
    const sid = req.user.userType === 'student' ? req.user.id : studentId;
    const result = await db.execute(
      `INSERT INTO emergency_contact (student_id, name, relation, phone, email)
       VALUES (:sid, :n, :r, :p, :e) RETURNING contact_id INTO :id`,
      { sid, n: name, r: relation, p: phone, e: email || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Contact added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /emergency/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM emergency_contact WHERE contact_id = :id', { id: req.params.id });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
