const express = require('express');
const authController= require('../controllers/authControllers');
const router = express.Router();


router.post('/register',authController.register);
router.post('/login',authController.login);
router.post('/is-user-logged-in',authController.isUserLoggedIn);
router.post('/logout',authController.logout);

module.exports=router;