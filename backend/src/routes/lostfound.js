const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /lostfound/lost
router.get('/lost', async (req, res) => {
  try {
    let sql = `SELECT li.*, s.name AS student_name FROM lost_items li JOIN student s ON li.student_id = s.student_id WHERE 1=1`;
    const binds = {};
    if (req.user.userType === 'student') { sql += ` AND li.student_id = :sid`; binds.sid = req.user.id; }
    sql += ` ORDER BY li.lost_date DESC`;
    const result = await db.execute(sql, binds);
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /lostfound/lost
router.post('/lost', async (req, res) => {
  try {
    const { itemName, description } = req.body;
    const sid = req.user.userType === 'student' ? req.user.id : req.body.studentId;
    const result = await db.execute(
      `INSERT INTO lost_items (student_id, item_name, description) VALUES (:sid, :in, :desc) RETURNING lost_id INTO :id`,
      { sid, in: itemName, desc: description || null, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Lost item reported' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /lostfound/found
router.get('/found', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT fi.*, st.name AS found_by_name FROM found_items fi
       LEFT JOIN staff st ON fi.found_by_staff = st.staff_id ORDER BY fi.found_date DESC`
    );
    res.json(rowsToCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /lostfound/found
router.post('/found', async (req, res) => {
  try {
    const { itemName, description, location } = req.body;
    const staffId = req.user.userType !== 'student' ? req.user.id : null;
    const result = await db.execute(
      `INSERT INTO found_items (found_by_staff, item_name, description, location) VALUES (:sid, :in, :desc, :loc) RETURNING found_id INTO :id`,
      { sid: staffId, in: itemName, desc: description || null, loc: location || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Found item reported' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /lostfound/claim
router.post('/claim', async (req, res) => {
  try {
    const { lostId, foundId } = req.body;
    const result = await db.execute(
      `INSERT INTO item_claim (lost_id, found_id) VALUES (:lid, :fid) RETURNING claim_id INTO :id`,
      { lid: lostId || null, fid: foundId || null, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );
    res.status(201).json({ id: result.outBinds.id[0], message: 'Claim submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /lostfound/claim/:id
router.put('/claim/:id', async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    await db.execute('UPDATE item_claim SET verification_status = :vs WHERE claim_id = :id',
      { vs: verificationStatus, id: req.params.id });
    if (verificationStatus === 'verified') {
      const claim = await db.execute('SELECT * FROM item_claim WHERE claim_id = :id', { id: req.params.id });
      if (claim.rows.length) {
        if (claim.rows[0].LOST_ID) await db.execute('UPDATE lost_items SET status = :s WHERE lost_id = :id', { s: 'claimed', id: claim.rows[0].LOST_ID });
        if (claim.rows[0].FOUND_ID) await db.execute('UPDATE found_items SET status = :s WHERE found_id = :id', { s: 'claimed', id: claim.rows[0].FOUND_ID });
      }
    }
    res.json({ message: 'Claim updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
