const express = require('express');
const authController = require('../controllers/authControllers');
const router = express.Router();
const { loginValidators, resetPasswordValidator } = require('../Validators/authValidators')



router.post('/register', authController.register);
router.post('/login', loginValidators, authController.login);
router.post('/is-user-logged-in', authController.isUserLoggedIn);
router.post('/logout', authController.logout);
router.post('/google-auth', authController.googleSso);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", resetPasswordValidator, authController.changePassword);

module.exports = router;