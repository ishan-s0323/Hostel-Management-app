const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { rowsToCamel } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin', 'superadmin', 'warden'));

// GET /audit
router.get('/', async (req, res) => {
  try {
    const { entityType, action, page = 1, limit = 20 } = req.query;
    let sql = `SELECT * FROM vw_recent_audit WHERE 1=1`;
    const binds = {};
    if (entityType) { sql += ` AND entity_type = :et`; binds.et = entityType; }
    if (action) { sql += ` AND action = :act`; binds.act = action; }

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) AS cnt');
    const countResult = await db.execute(countSql, binds);

    sql += ` OFFSET :offset ROWS FETCH NEXT :lim ROWS ONLY`;
    binds.offset = (page - 1) * limit;
    binds.lim = Number(limit);

    const result = await db.execute(sql, binds);
    res.json({ logs: rowsToCamel(result.rows), total: countResult.rows[0].CNT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
