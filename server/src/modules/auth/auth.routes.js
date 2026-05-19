const express = require("express");
const router = express.Router();
const {registerUserController,loginUserController} = require("./auth.Controller");
const authMiddleWare = require("../../middleware/authMiddleware");
router.post("/login",loginUserController);
router.post("/register",registerUserController);
module.exports = router;