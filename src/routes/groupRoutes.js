const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeMiddleware = require('../middleware/authorizeMiddleware');


const router = express.Router();

//  Protect all group routes
router.use(authMiddleware.protect);

router.post('/create', authorizeMiddleware('group:create'), groupController.create);
router.put('/update', authorizeMiddleware('group:update'), groupController.updateGroup);
router.patch('/members/add', authorizeMiddleware('group:update'), groupController.addMembers);
// router.put('/add-members', groupController.addMembers);
// router.put('/remove-members', groupController.removeMembers);
router.patch('/members/remove', authorizeMiddleware('group:update'), groupController.removeMembers);

// router.get('/by-email/:email', groupController.getGroupByEmail);
router.get('/my-groups', authorizeMiddleware('group:view'), groupController.getGroupByEmail);
router.get('/status', authorizeMiddleware('group:view'), groupController.getGroupsByPaymentStatus);
// router.get('/by-status/:status', groupController.getGroupByStatus);
router.get('/:groupId/audit', authorizeMiddleware('group:view'), groupController.getAuditLog);

module.exports = router;
