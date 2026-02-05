const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

//  Protect all group routes
router.use(authMiddleware.protect);

router.post('/create', groupController.create);
router.put('/update', groupController.updateGroup);
router.patch('/members/add', groupController.addMembers);
// router.put('/add-members', groupController.addMembers);
// router.put('/remove-members', groupController.removeMembers);
router.patch('/members/remove', groupController.removeMembers);

// router.get('/by-email/:email', groupController.getGroupByEmail);
router.get('/my-groups', groupController.getGroupByEmail);
router.get('/status', groupController.getGroupsByPaymentStatus);
// router.get('/by-status/:status', groupController.getGroupByStatus);
router.get('/audit/:groupId', groupController.getAuditLog);

module.exports = router;
