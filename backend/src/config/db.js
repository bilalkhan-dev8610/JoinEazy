const { Pool } = require('pg');

// Render PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[postgres] unexpected error on idle client', err);
});

/**
 * Simple query helper.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Verifies that PostgreSQL is reachable.
 */
const checkConnection = async () => {
  const result = await pool.query('SELECT NOW() AS now');
  return result.rows[0];
};

module.exports = {
  pool,
  query,
  checkConnection,
};