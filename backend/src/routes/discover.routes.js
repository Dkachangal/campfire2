const express = require('express');
const router = express.Router();
const { getFeed, searchUser } = require('../controllers/discover.controller');

router.get("/feed", getFeed);
router.get("/search", searchUser);

module.exports = router; // Mapped to /api/discoverPage in app_2.js[cite: 7]