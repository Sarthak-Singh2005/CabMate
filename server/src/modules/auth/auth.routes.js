const express = require("express");
const router = express.Router();
const {registerUserController,loginUserController} = require("./auth.Controller");
const authMiddleWare = require("server/src/middleware/authMiddleware.js");
router.post("/Login",loginUserController);
router.post("/register",registerUserController);
module.exports = router;