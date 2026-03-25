const sql = require('mssql');
const dbConfig = require('./db.config');

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(dbConfig);
  }
  return pool;
}

module.exports = { getPool, sql };
