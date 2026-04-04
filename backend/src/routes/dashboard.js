const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel, rowToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const result = await db.execute(
      `BEGIN sp_get_dashboard_stats(:ts,:tr,:or,:ar,:tf,:cf,:pf,:oc,:aa,:tst,:pl); END;`,
      {
        ts: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        tr: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        or: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        ar: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        tf: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        cf: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        pf: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        oc: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        aa: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        tst: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        pl: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    const o = result.outBinds;
    res.json({
      totalStudents: o.ts, totalRooms: o.tr, occupiedRooms: o.or, availableRooms: o.ar,
      totalFees: o.tf, collectedFees: o.cf, pendingFees: o.pf,
      openComplaints: o.oc, activeAllocations: o.aa, totalStaff: o.tst, pendingLaundry: o.pl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /dashboard/room-types
router.get('/room-types', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT room_type, COUNT(*) AS count, SUM(current_occupancy) AS occupancy, SUM(capacity) AS capacity
       FROM room GROUP BY room_type`
    );
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /dashboard/monthly-collection
router.get('/monthly-collection', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT TO_CHAR(payment_date, 'YYYY-MM') AS month, SUM(amount_paid) AS total
       FROM payments WHERE payment_status = 'completed'
       GROUP BY TO_CHAR(payment_date, 'YYYY-MM') ORDER BY month DESC FETCH FIRST 12 ROWS ONLY`
    );
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /dashboard/feedback-summary
router.get('/feedback-summary', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM vw_feedback_averages');
    res.json(result.rows.length ? rowToCamel(result.rows[0]) : {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /dashboard/student-stats (for student dashboard)
router.get('/student-stats', async (req, res) => {
  try {
    const sid = req.user.id;
    const alloc = await db.execute(
      `SELECT a.*, r.room_type, r.floor_num, b.block_name FROM allocation a
       JOIN room r ON a.room_id = r.room_id JOIN hostel_block b ON r.block_id = b.block_id
       WHERE a.student_id = :sid AND a.status = 'active'`, { sid }
    );
    const fees = await db.execute(
      `SELECT NVL(SUM(amount),0) AS total, NVL(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) AS paid,
       NVL(SUM(CASE WHEN status IN ('pending','overdue') THEN amount ELSE 0 END),0) AS pending FROM fees WHERE student_id = :sid`, { sid }
    );
    const complaints = await db.execute(
      `SELECT COUNT(*) AS cnt FROM room_complaints WHERE student_id = :sid AND status IN ('open','in_progress')`, { sid }
    );
    res.json({
      room: alloc.rows.length ? rowToCamel(alloc.rows[0]) : null,
      fees: rowToCamel(fees.rows[0]),
      openComplaints: complaints.rows[0].CNT
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
