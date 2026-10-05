const express = require('express');
const router = express.Router();
const { getAvailableChats, getChatHistory } = require('../controllers/message.controller');

router.get("/list/:userName", getAvailableChats);
router.get("/history/:roomId", getChatHistory);

module.exports = router; // Mapped to /api/messages in app_2.js[cite: 7]