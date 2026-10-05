const express = require('express');
const router = express.Router();
const { getProfile, toggleFollow } = require('../controllers/userProfile.controller');

router.get("/:userName", getProfile);
router.post("/follow", toggleFollow);

module.exports = router; // Mapped to /api/user in app_2.js[cite: 7]