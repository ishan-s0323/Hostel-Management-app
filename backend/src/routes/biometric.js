const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /biometric  - student sees own logs, admin sees all
router.get('/', async (req, res) => {
  try {
    const { studentId, date } = req.query;
    let sql = `SELECT bl.*, s.name AS student_name
               FROM biometric_log bl
               JOIN student s ON bl.student_id = s.student_id
               WHERE 1=1`;
    const binds = {};

    if (req.user.userType === 'student') {
      sql += ` AND bl.student_id = :bsid`;
      binds.bsid = req.user.id;
    } else if (studentId) {
      sql += ` AND bl.student_id = :bsid`;
      binds.bsid = Number(studentId);
    }
    if (date) {
      sql += ` AND TRUNC(bl.log_timestamp) = TO_DATE(:bdate, 'YYYY-MM-DD')`;
      binds.bdate = date;
    }
    sql += ` ORDER BY bl.log_timestamp DESC`;

    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /biometric/today-summary - admin overview of today's attendance
router.get('/today-summary', authorize('admin', 'superadmin', 'warden'), async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT s.student_id, s.name, s.phone,
              MAX(CASE WHEN bl.scan_type = 'ENTRY' THEN bl.log_timestamp END) AS last_entry,
              MAX(CASE WHEN bl.scan_type = 'EXIT'  THEN bl.log_timestamp END) AS last_exit,
              COUNT(CASE WHEN bl.scan_type = 'ENTRY' AND TRUNC(bl.log_timestamp) = TRUNC(SYSDATE) THEN 1 END) AS entries_today,
              COUNT(CASE WHEN TRUNC(bl.log_timestamp) = TRUNC(SYSDATE) AND bl.fine_amount > 0 THEN 1 END) AS fines_today
       FROM student s
       LEFT JOIN biometric_log bl ON s.student_id = bl.student_id
       GROUP BY s.student_id, s.name, s.phone
       ORDER BY s.name`
    );
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /biometric/scan - log an entry or exit for a student
router.post('/scan', async (req, res) => {
  try {
    const { studentId, scanType, scanLocation } = req.body;

    // Determine student ID - student can self-scan, admin/staff can scan any
    const targetStudentId = req.user.userType === 'student' ? req.user.id : Number(studentId);
    const type = (scanType || 'ENTRY').toUpperCase();

    if (!['ENTRY', 'EXIT'].includes(type)) {
      return res.status(400).json({ error: "scanType must be 'ENTRY' or 'EXIT'" });
    }

    // Check if student has a curfew restriction from open inquiries
    const inquiryResult = await db.execute(
      `SELECT description FROM inquiry
       WHERE student_id = :bsid AND status IN ('open', 'under_review')
       AND UPPER(description) LIKE '%CURFEW%'
       ORDER BY start_date DESC`,
      { bsid: targetStudentId }
    );

    let fineAmount = 0;
    let curfewViolation = false;

    // Check for curfew violation on EXIT
    if (type === 'EXIT' && inquiryResult.rows.length > 0) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      // Extract curfew time from description e.g. "curfew: 21:30" or "curfew: 9:30"
      const descText = (inquiryResult.rows[0].DESCRIPTION || '').toString();
      const match = descText.match(/curfew[:\s]+(\d{1,2}):(\d{2})/i);
      if (match) {
        const curfewHour = parseInt(match[1], 10);
        const curfewMin  = parseInt(match[2], 10);
        const curfewMinutes = curfewHour * 60 + curfewMin;
        if (nowMinutes > curfewMinutes) {
          fineAmount = 50; // ₹50 fine per curfew violation
          curfewViolation = true;
        }
      }
    }

    const result = await db.execute(
      `INSERT INTO biometric_log (student_id, scan_type, scan_location, fine_amount)
       VALUES (:bsid, :btype, :bloc, :bfine) RETURNING log_id INTO :boid`,
      {
        bsid: targetStudentId,
        btype: type,
        bloc: scanLocation || 'Main Gate',
        bfine: fineAmount,
        boid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      logId: result.outBinds.boid[0],
      scanType: type,
      fineAmount,
      curfewViolation,
      message: curfewViolation
        ? `${type} logged. ⚠ Curfew violation detected! Fine: ₹${fineAmount}`
        : `${type} logged successfully`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /biometric/curfew-status/:studentId - check student's current curfew restriction
router.get('/curfew-status/:studentId', async (req, res) => {
  try {
    const targetId = req.user.userType === 'student' ? req.user.id : Number(req.params.studentId);
    const result = await db.execute(
      `SELECT i.inquiry_id, i.description, i.start_date, i.status
       FROM inquiry i
       WHERE i.student_id = :bsid AND i.status IN ('open', 'under_review')
       AND UPPER(i.description) LIKE '%CURFEW%'
       ORDER BY i.start_date DESC`,
      { bsid: targetId }
    );

    if (!result.rows.length) {
      return res.json({ hasCurfew: false, curfewTime: null });
    }

    const desc = (result.rows[0].DESCRIPTION || '').toString();
    const match = desc.match(/curfew[:\s]+(\d{1,2}):(\d{2})/i);
    const curfewTime = match ? `${match[1].padStart(2,'0')}:${match[2]}` : null;

    res.json({
      hasCurfew: true,
      curfewTime,
      inquiryId: result.rows[0].INQUIRY_ID,
      description: result.rows[0].DESCRIPTION,
      status: result.rows[0].STATUS
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
