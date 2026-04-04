const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

// GET /reports/fees
router.get('/fees', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT f.fee_id, s.name AS student_name, s.department, f.fee_type, f.amount, f.status,
       TO_CHAR(f.due_date,'YYYY-MM-DD') AS due_date FROM fees f JOIN student s ON f.student_id = s.student_id ORDER BY f.due_date DESC`
    );
    if (req.query.format === 'csv') {
      const rows = result.rows;
      let csv = 'Fee ID,Student,Department,Type,Amount,Status,Due Date\n';
      rows.forEach(r => { csv += `${r.FEE_ID},${r.STUDENT_NAME},${r.DEPARTMENT},${r.FEE_TYPE},${r.AMOUNT},${r.STATUS},${r.DUE_DATE}\n`; });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fees_report.csv');
      return res.send(csv);
    }
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reports/occupancy
router.get('/occupancy', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM vw_block_occupancy');
    if (req.query.format === 'csv') {
      const rows = result.rows;
      let csv = 'Block,Floors,Warden,Total Rooms,Total Capacity,Occupancy,Available\n';
      rows.forEach(r => { csv += `${r.BLOCK_NAME},${r.FLOORS},${r.WARDEN_NAME || 'N/A'},${r.TOTAL_ROOMS},${r.TOTAL_CAPACITY},${r.TOTAL_OCCUPANCY},${r.AVAILABLE_BEDS}\n`; });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=occupancy_report.csv');
      return res.send(csv);
    }
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reports/students
router.get('/students', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM vw_student_room_fees');
    if (req.query.format === 'csv') {
      const rows = result.rows;
      let csv = 'Student ID,Name,Department,Year,CGPA,Block,Room Type,Total Fees,Paid,Pending\n';
      rows.forEach(r => { csv += `${r.STUDENT_ID},${r.NAME},${r.DEPARTMENT},${r.YEAR_OF_STUDY},${r.CGPA},${r.BLOCK_NAME || 'N/A'},${r.ROOM_TYPE || 'N/A'},${r.TOTAL_FEES},${r.PAID_FEES},${r.PENDING_FEES}\n`; });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students_report.csv');
      return res.send(csv);
    }
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reports/collection
router.get('/collection', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM vw_fee_collection_monthly');
    if (req.query.format === 'csv') {
      const rows = result.rows;
      let csv = 'Month,Payments,Total Collected,Method\n';
      rows.forEach(r => { csv += `${r.MONTH},${r.TOTAL_PAYMENTS},${r.TOTAL_COLLECTED},${r.PAYMENT_METHOD}\n`; });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=collection_report.csv');
      return res.send(csv);
    }
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
