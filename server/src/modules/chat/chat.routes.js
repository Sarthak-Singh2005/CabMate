const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const router = express.Router();

const {
  createConversation,
  sendMessage,
  getMessages,
  getRideChats,
} = require("./chat.controller");
router.post("/conversation", authMiddleware, createConversation);
router.post("/send", authMiddleware, sendMessage);
router.get("/messages/:conversationId",authMiddleware, getMessages);
router.get("/ride/:rideId", authMiddleware, getRideChats);
module.exports = router;
