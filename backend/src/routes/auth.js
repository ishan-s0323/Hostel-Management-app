const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'Email, password and userType required' });
    }

    let result, user;
    if (userType === 'student') {
      result = await db.execute('SELECT * FROM student WHERE email = :email', { email });
      if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
      user = rowToCamel(result.rows[0]);
      user.role = 'student';
      user.id = user.studentId;
    } else {
      result = await db.execute('SELECT * FROM staff WHERE email = :email', { email });
      if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
      user = rowToCamel(result.rows[0]);
      user.id = user.staffId;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password;
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/register-student
router.post('/register-student', async (req, res) => {
  try {
    const { name, email, password, gender, department, yearOfStudy, phone } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.execute(
      `INSERT INTO student (name, email, password, gender, department, year_of_study, phone)
       VALUES (:name, :email, :pw, :gender, :dept, :yr, :phone)
       RETURNING student_id INTO :id`,
      { name, email, pw: hashed, gender: gender || null, dept: department || null,
        yr: yearOfStudy || null, phone: phone || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Student registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/register-staff (admin only)
router.post('/register-staff', authenticate, async (req, res) => {
  try {
    const { name, email, password, role, phone, blockId } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.execute(
      `INSERT INTO staff (name, email, password, role, phone, block_id)
       VALUES (:name, :email, :pw, :role, :phone, :bid)
       RETURNING staff_id INTO :id`,
      { name, email, pw: hashed, role, phone: phone || null, bid: blockId || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Staff registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.userType === 'student') {
      result = await db.execute('SELECT * FROM student WHERE student_id = :id', { id: req.user.id });
    } else {
      result = await db.execute('SELECT * FROM staff WHERE staff_id = :id', { id: req.user.id });
    }
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const user = rowToCamel(result.rows[0]);
    user.role = req.user.role;
    user.id = req.user.id;
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/fix-passwords (temporary)
router.get('/fix-passwords', async (req, res) => {
  try {
    const hashed = await bcrypt.hash('password123', 10);
    await db.execute('UPDATE student SET password = :pw', { pw: hashed });
    await db.execute('UPDATE staff SET password = :pw', { pw: hashed });
    res.json({ message: 'All passwords hashed to password123' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
