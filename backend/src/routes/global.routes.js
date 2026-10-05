const express = require('express');
const router = express.Router();
const { createPost, interactWithPost, commentOnPost } = require('../controllers/global.controller');

router.post("/post", createPost);
router.post("/interact", interactWithPost);
router.post("/comment", commentOnPost);

module.exports = router; // Mapped to /api/global in app_2.js[cite: 7]