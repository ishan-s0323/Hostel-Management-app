const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /notifications
router.get('/', async (req, res) => {
  try {
    let sql, binds;
    if (req.user.userType === 'student') {
      sql = `SELECT * FROM notifications WHERE student_id = :userid ORDER BY date_sent DESC FETCH FIRST 50 ROWS ONLY`;
      binds = { userid: req.user.id };
    } else {
      sql = `SELECT * FROM notifications WHERE staff_id = :userid OR (staff_id IS NULL AND student_id IS NULL)
             ORDER BY date_sent DESC FETCH FIRST 50 ROWS ONLY`;
      binds = { userid: req.user.id };
    }
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /notifications/unread-count
router.get('/unread-count', async (req, res) => {
  try {
    let sql, binds;
    if (req.user.userType === 'student') {
      sql = `SELECT COUNT(*) AS cnt FROM notifications WHERE student_id = :userid AND is_read = 0`;
      binds = { userid: req.user.id };
    } else {
      sql = `SELECT COUNT(*) AS cnt FROM notifications WHERE staff_id = :userid AND is_read = 0`;
      binds = { userid: req.user.id };
    }
    const result = await db.execute(sql, binds);
    res.json({ count: result.rows[0].CNT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    await db.execute('UPDATE notifications SET is_read = 1 WHERE notification_id = :id', { id: req.params.id });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /notifications/mark-all-read
router.put('/mark-all-read', async (req, res) => {
  try {
    if (req.user.userType === 'student') {
      await db.execute('UPDATE notifications SET is_read = 1 WHERE student_id = :userid AND is_read = 0', { userid: req.user.id });
    } else {
      await db.execute('UPDATE notifications SET is_read = 1 WHERE staff_id = :userid AND is_read = 0', { userid: req.user.id });
    }
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
