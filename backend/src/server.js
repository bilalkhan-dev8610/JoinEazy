require('dotenv').config();

const app = require('./app');
const { checkConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Fail fast if required secrets are missing.
 */
function assertRequiredEnv() {
  const required = ['JWT_SECRET'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}`
    );
  }
}

async function start() {
  try {
    assertRequiredEnv();

    // Check PostgreSQL connection before starting the server
    await checkConnection();

    console.log('[postgres] connection established');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `[server] listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`
      );
    });
  } catch (err) {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  }
}

start();