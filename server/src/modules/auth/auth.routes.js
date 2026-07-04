const express = require("express");
const router = express.Router();

const {
  registerUserController,
  loginUserController,
  logoutUserController,
  changePasswordController,
  forgotPasswordController,
  googleLoginController,
} = require("./auth.Controller");
const authMiddleWare = require("../../middleware/authMiddleware");
router.post("/login", loginUserController);
router.post("/register", registerUserController);
router.post("/logout", logoutUserController);
router.patch("/change-password", authMiddleWare, changePasswordController);
router.post("/forgot-password", forgotPasswordController);

router.post("/google",googleLoginController);
module.exports = router;
