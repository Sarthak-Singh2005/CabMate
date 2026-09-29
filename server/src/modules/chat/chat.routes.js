const express = require("express");
const multer = require("multer");
const crypto = require("node:crypto");
const os = require("node:os");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// Store uploads on disk so concurrent requests do not retain whole files in RAM.
const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_req, _file, cb) => cb(null, crypto.randomUUID()),
  }),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 5, // Maximum 5 files per message
  },

  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Only JPG, PNG, WEBP, GIF, and PDF files are allowed"
      ),
      false
    );
  },
});

// Error handler for Multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error(
      `[Chat Upload Error] Multer error: ${err.code} - ${err.message}`
    );

    return res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    console.error(`[Chat Upload Error] ${err.message}`);

    return res.status(400).json({
      message: err.message,
    });
  }

  next();
};

const {
  createConversation,
  createRideGroup,
  getRideGroup,
  updateRideGroup,
  sendMessage,
  getMessages,
  getAttachment,
  getRideChats,
  editMessage,
  deleteMessage,
} = require("./chat.controller");

// Create 1-to-1 conversation
router.post(
  "/conversation",
  authMiddleware,
  createConversation
);

// Create ride group
router.post(
  "/group/:rideId",
  authMiddleware,
  createRideGroup
);

// Get ride group
router.get(
  "/group/:rideId",
  authMiddleware,
  getRideGroup
);

// Update ride group
router.patch(
  "/group/conversation/:conversationId",
  authMiddleware,
  updateRideGroup
);

// Send message with optional attachments
router.post(
  "/send",
  authMiddleware,
  upload.array("files", 5),
  handleUploadError,
  sendMessage
);

// Get messages
router.get(
  "/messages/:conversationId",
  authMiddleware,
  getMessages
);

// Get attachment
router.get(
  "/attachments/:filename",
  authMiddleware,
  getAttachment
);

// Get ride chats
router.get(
  "/ride/:rideId",
  authMiddleware,
  getRideChats
);

// Edit message
router.patch(
  "/message/:messageId",
  authMiddleware,
  editMessage
);

// Delete message
router.delete(
  "/message/:messageId",
  authMiddleware,
  deleteMessage
);

module.exports = router;