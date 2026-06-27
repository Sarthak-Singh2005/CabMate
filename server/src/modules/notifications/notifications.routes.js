const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markAsRead,
} = require("./notifications.Controllers");
const authMiddleWare = require("../../middleware/authMiddleware");

router.get("/", authMiddleWare, getNotifications);
router.patch("/mark-all-read", authMiddleWare, markAllRead);
router.patch("/:id/read", authMiddleWare, markAsRead);

module.exports = router;