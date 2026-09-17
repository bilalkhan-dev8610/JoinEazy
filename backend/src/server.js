require('dotenv').config();

const app = require('./app');
const { checkConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Fail fast if required secrets are missing, instead of booting into a
 * broken auth system that only errors once someone tries to log in.
 */
function assertRequiredEnv() {
  const required = ['JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}

async function start() {
  try {
    assertRequiredEnv();

    // Fail fast if the database isn't reachable on boot.
    await checkConnection();
    console.log('[postgres] connection established');

    app.listen(PORT, () => {
      console.log(`[server] listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  }
}

start();
