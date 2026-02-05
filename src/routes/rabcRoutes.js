const express = require('express');
const rbacController = require('../controllers/rbacController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

//  Protect all group routes
router.use(authMiddleware.protect);

router.post('/create', rbacController.create);
router.patch('/update', rbacController.update);
router.post('/delete', rbacController.delete);
router.get('/getAllUsers', rbacController.getAllUsers);



module.exports = router;
