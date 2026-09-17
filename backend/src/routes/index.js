const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const studentRoutes = require('./student.routes');
const groupRoutes = require('./group.routes');
const assignmentRoutes = require('./assignment.routes');

const router = express.Router();

// Mount feature routers here as they are built in later phases.
// e.g. router.use('/submissions', submissionRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/students', studentRoutes);
router.use('/groups', groupRoutes);
router.use('/assignments', assignmentRoutes);

module.exports = router;
