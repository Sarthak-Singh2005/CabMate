const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});
const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const {
  registerUserController,
  loginUserController,
  logoutUserController,
  changePasswordController,
  getCurrentUserController,
} = require("./auth.Controller");
const authMiddleWare = require("../../middleware/authMiddleware");
router.post("/login", loginLimiter, loginUserController);
router.post("/register", registrationLimiter, registerUserController);
router.post("/logout", authMiddleWare, logoutUserController);
router.get("/me", authMiddleWare, getCurrentUserController);
router.patch(
  "/change-password",
  authMiddleWare,
  sensitiveActionLimiter,
  changePasswordController,
);

module.exports = router;
