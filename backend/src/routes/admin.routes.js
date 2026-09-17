const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Every route in this file requires a valid admin session.
router.use(protect, authorize('admin'));

router.get('/overview', adminController.getOverview);
router.get('/groups', adminController.listGroups);

module.exports = router;
