const express = require("express");
const router = express.Router();

const {
  registerUserController,
  loginUserController,
  logoutUserController,
} = require("./auth.Controller");
const authMiddleWare = require("../../middleware/authMiddleware");
router.post("/login", loginUserController);
router.post("/register", registerUserController);
router.post("/logout", logoutUserController);
module.exports = router;
