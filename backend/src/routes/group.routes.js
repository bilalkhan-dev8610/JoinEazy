const express = require('express');
const groupController = require('../controllers/group.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const {
  validateCreateGroup,
  validateAddMember,
  validateUpdateGroup,
  validateUuidParam,
} = require('../middlewares/validators');

const router = express.Router();

// Every route in this file requires a valid student session.
router.use(protect, authorize('student'));

router.post('/', validateCreateGroup, groupController.createGroup);
router.get('/mine', groupController.getMyGroup);
router.patch('/mine', validateUpdateGroup, groupController.updateGroup);
router.delete('/mine', groupController.deleteGroup);
router.post('/mine/leave', groupController.leaveGroup);
router.post('/mine/members', validateAddMember, groupController.addMember);
router.delete('/mine/members/:userId', validateUuidParam('userId'), groupController.removeMember);

module.exports = router;
