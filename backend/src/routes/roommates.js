const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /roommates/preference (get own preference)
router.get('/preference', async (req, res) => {
  try {
    const sid = req.user.userType === 'student' ? req.user.id : req.query.studentId;
    const result = await db.execute('SELECT * FROM roommate_preference WHERE student_id = :sid', { sid });
    res.json(result.rows.length ? rowToCamel(result.rows[0]) : null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /roommates/preference (upsert)
router.post('/preference', async (req, res) => {
  try {
    const { sleepSchedule, studyHabit, neatnessLevel } = req.body;
    const sid = req.user.userType === 'student' ? req.user.id : req.body.studentId;

    const existing = await db.execute('SELECT preference_id FROM roommate_preference WHERE student_id = :sid', { sid });
    if (existing.rows.length) {
      await db.execute(
        `UPDATE roommate_preference SET sleep_schedule = :ss, study_habit = :sh, neatness_level = :nl WHERE student_id = :sid`,
        { ss: sleepSchedule, sh: studyHabit, nl: neatnessLevel, sid }
      );
      res.json({ message: 'Preference updated' });
    } else {
      await db.execute(
        `INSERT INTO roommate_preference (student_id, sleep_schedule, study_habit, neatness_level) VALUES (:sid, :ss, :sh, :nl)`,
        { sid, ss: sleepSchedule, sh: studyHabit, nl: neatnessLevel }
      );
      res.status(201).json({ message: 'Preference saved' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /roommates/calculate-compatibility
router.post('/calculate-compatibility', async (req, res) => {
  try {
    const { student1Id, student2Id } = req.body;
    const result = await db.execute(
      `BEGIN sp_calc_compatibility(:s1, :s2, :pct); END;`,
      { s1: student1Id, s2: student2Id, pct: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    const pct = result.outBinds.pct;
    if (pct === -1) return res.status(400).json({ error: 'Preferences not set for one or both students' });
    res.json({ student1Id, student2Id, compatibilityPercentage: pct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /roommates/compatibility
router.get('/compatibility', async (req, res) => {
  try {
    let sql = `SELECT rc.*, s1.name AS student1_name, s2.name AS student2_name
               FROM roommate_compatibility rc
               JOIN student s1 ON rc.student1_id = s1.student_id
               JOIN student s2 ON rc.student2_id = s2.student_id WHERE 1=1`;
    const binds = {};
    if (req.user.userType === 'student') {
      sql += ` AND (rc.student1_id = :sid OR rc.student2_id = :sid2)`;
      binds.sid = req.user.id; binds.sid2 = req.user.id;
    }
    sql += ` ORDER BY rc.compatibility_percentage DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
