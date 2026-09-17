const { Pool } = require('pg');

// All connection values come from environment variables (see .env.example).
// No credentials are hardcoded here.
const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  // Catches errors on idle clients so the process doesn't crash silently.
  console.error('[postgres] unexpected error on idle client', err);
});

/**
 * Simple query helper. Keeps db access centralized so controllers/models
 * don't talk to the pool directly.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Verifies the database connection is reachable. Used on startup and by
 * the health check route.
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
