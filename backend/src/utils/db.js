const oracledb = require('oracledb');

// Use Thin mode (no Oracle Client needed for Node.js oracledb 6+)
// If you have Oracle Instant Client installed, comment this out
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;
oracledb.fetchAsString = [oracledb.CLOB];

let pool;

async function initialize() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('Oracle DB connection pool created');
  } catch (err) {
    console.error('Failed to create Oracle DB pool:', err.message);
    process.exit(1);
  }
}

async function close() {
  try {
    if (pool) {
      await pool.close(0);
      console.log('Oracle DB pool closed');
    }
  } catch (err) {
    console.error('Error closing pool:', err.message);
  }
}

async function execute(sql, binds = {}, opts = {}) {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...opts,
    });
    return result;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function executeMany(sql, binds, opts = {}) {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.executeMany(sql, binds, {
      autoCommit: true,
      ...opts,
    });
    return result;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Execute with manual transaction control
async function executeTransaction(callback) {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = { initialize, close, execute, executeMany, executeTransaction };
