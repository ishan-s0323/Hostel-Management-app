const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /inquiries
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT i.*, s.name AS student_name, st.name AS officer_name
               FROM inquiry i JOIN student s ON i.student_id = s.student_id
               LEFT JOIN staff st ON i.disciplinary_officer = st.staff_id WHERE 1=1`;
    const binds = {};
    if (status) { sql += ` AND i.status = :st`; binds.st = status; }
    if (req.user.userType === 'student') { sql += ` AND i.student_id = :sid`; binds.sid = req.user.id; }
    sql += ` ORDER BY i.start_date DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /inquiries - admin creates for student, students can raise their own
router.post('/', async (req, res) => {
  try {
    const { studentId, description, subject, disciplinaryOfficer } = req.body;
    const targetStudentId = req.user.userType === 'student' ? req.user.id : studentId;
    const result = await db.execute(
      `INSERT INTO inquiry (student_id, description, disciplinary_officer)
       VALUES (:sid, :idesc, :offid) RETURNING inquiry_id INTO :oid`,
      { sid: targetStudentId, idesc: description || subject || 'N/A', offid: disciplinaryOfficer || null,
        oid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.oid[0], message: 'Inquiry created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /inquiries/:id
router.put('/:id', authorize('admin', 'superadmin', 'warden'), async (req, res) => {
  try {
    const { status, disciplinaryOfficer } = req.body;
    const fields = []; const binds = { id: req.params.id };
    if (status) { fields.push('status = :st'); binds.st = status; }
    if (disciplinaryOfficer) { fields.push('disciplinary_officer = :offid'); binds.offid = disciplinaryOfficer; }
    if (!fields.length) return res.status(400).json({ error: 'No fields' });
    await db.execute(`UPDATE inquiry SET ${fields.join(', ')} WHERE inquiry_id = :id`, binds);
    res.json({ message: 'Inquiry updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
