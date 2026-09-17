const express = require('express');
const { checkConnection } = require('../config/db');

const router = express.Router();

/**
 * GET /api/health
 * Basic liveness check + database connectivity check.
 * This exists purely to validate the Phase 1 foundation wiring
 * (Express server + PostgreSQL connection); it is not a feature.
 */
router.get('/', async (req, res, next) => {
  try {
    const db = await checkConnection();
    res.status(200).json({
      success: true,
      message: 'API is healthy',
      db_time: db.now,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
