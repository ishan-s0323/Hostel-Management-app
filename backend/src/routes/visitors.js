const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /visitors
router.get('/', async (req, res) => {
  try {
    let sql = `SELECT * FROM vw_active_visitors WHERE 1=1`;
    const binds = {};
    if (req.user.userType === 'student') {
      sql = `SELECT * FROM vw_active_visitors WHERE student_name = (SELECT name FROM student WHERE student_id = :sid)`;
      binds.sid = req.user.id;
    }
    sql += ` ORDER BY entry_time DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /visitors
router.post('/', async (req, res) => {
  try {
    const { studentId, visitorName, relation, phone, idProof } = req.body;
    const result = await db.execute(
      `INSERT INTO visitor_log (student_id, visitor_name, relation, phone, id_proof, approved_by_staff_id)
       VALUES (:sid, :vn, :rel, :ph, :idp, :aid) RETURNING visitor_id INTO :id`,
      { sid: studentId, vn: visitorName, rel: relation || null, ph: phone || null,
        idp: idProof || null, aid: req.user.userType !== 'student' ? req.user.id : null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Visitor logged' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /visitors/:id/checkout
router.put('/:id/checkout', async (req, res) => {
  try {
    await db.execute('UPDATE visitor_log SET exit_time = SYSTIMESTAMP WHERE visitor_id = :id', { id: req.params.id });
    res.json({ message: 'Visitor checked out' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
