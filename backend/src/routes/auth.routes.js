const express = require('express');
const router = express.Router();
const { checkEmail, registerUser, loginUser } = require('../controllers/auth.controller');

router.post("/check-email", checkEmail);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router; // Mapped to /api/auth in app_2.js