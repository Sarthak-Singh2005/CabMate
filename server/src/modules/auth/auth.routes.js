const express = require("express");
const router = express.Router();

const {
  registerUserController,
  loginUserController,
  logoutUserController,
  changePasswordController,
  forgotPasswordController,
} = require("./auth.Controller");
const authMiddleWare = require("../../middleware/authMiddleware");
router.post("/login", loginUserController);
router.post("/register", registerUserController);
router.post("/logout", logoutUserController);
router.patch("/change-password", authMiddleWare, changePasswordController);
router.post("/forgot-password", forgotPasswordController);
module.exports = router;
