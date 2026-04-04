const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /students
router.get('/', async (req, res) => {
  try {
    const { search, department, year, page = 1, limit = 20 } = req.query;
    let sql = `SELECT s.*, a.room_id, r.room_type, b.block_name
               FROM student s
               LEFT JOIN allocation a ON s.student_id = a.student_id AND a.status = 'active'
               LEFT JOIN room r ON a.room_id = r.room_id
               LEFT JOIN hostel_block b ON r.block_id = b.block_id WHERE 1=1`;
    const binds = {};

    if (search) { sql += ` AND LOWER(s.name) LIKE :search`; binds.search = `%${search.toLowerCase()}%`; }
    if (department) { sql += ` AND s.department = :dept`; binds.dept = department; }
    if (year) { sql += ` AND s.year_of_study = :yr`; binds.yr = Number(year); }

    sql += ` ORDER BY s.student_id OFFSET :offset ROWS FETCH NEXT :lim ROWS ONLY`;
    binds.offset = (page - 1) * limit;
    binds.lim = Number(limit);

    const result = await db.execute(sql, binds);
    const countResult = await db.execute('SELECT COUNT(*) AS cnt FROM student');
    res.json({ students: rowsToCamel(result.rows), total: countResult.rows[0].CNT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /students/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT s.*, a.room_id, a.check_in_date, r.room_type, b.block_name, r.floor_num
       FROM student s
       LEFT JOIN allocation a ON s.student_id = a.student_id AND a.status = 'active'
       LEFT JOIN room r ON a.room_id = r.room_id
       LEFT JOIN hostel_block b ON r.block_id = b.block_id
       WHERE s.student_id = :id`, { id: req.params.id }
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Student not found' });
    const student = rowToCamel(result.rows[0]);
    delete student.password;

    // Get emergency contacts
    const ec = await db.execute('SELECT * FROM emergency_contact WHERE student_id = :id', { id: req.params.id });
    student.emergencyContacts = rowsToCamel(ec.rows);

    // Get fees summary
    const fees = await db.execute(
      `SELECT NVL(SUM(amount),0) AS total, NVL(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) AS paid,
       NVL(SUM(CASE WHEN status IN ('pending','overdue') THEN amount ELSE 0 END),0) AS pending
       FROM fees WHERE student_id = :id`, { id: req.params.id }
    );
    student.feeSummary = rowToCamel(fees.rows[0]);

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /students/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, gender, department, yearOfStudy, cgpa } = req.body;
    const fields = [];
    const binds = { id: req.params.id };
    if (name) { fields.push('name = :name'); binds.name = name; }
    if (phone) { fields.push('phone = :phone'); binds.phone = phone; }
    if (gender) { fields.push('gender = :gender'); binds.gender = gender; }
    if (department) { fields.push('department = :dept'); binds.dept = department; }
    if (yearOfStudy) { fields.push('year_of_study = :yr'); binds.yr = yearOfStudy; }
    if (cgpa !== undefined) { fields.push('cgpa = :cgpa'); binds.cgpa = cgpa; }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    await db.execute(`UPDATE student SET ${fields.join(', ')} WHERE student_id = :id`, binds);
    res.json({ message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /students/:id
router.delete('/:id', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    await db.execute('DELETE FROM student WHERE student_id = :id', { id: req.params.id });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
