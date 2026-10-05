const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');

const {login, signup, verifyOtp, forgotPassword, resetPassword, getMe, changePassword} = require("../controllers/authController");

router.post('/login', login);
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
module.exports = router;
