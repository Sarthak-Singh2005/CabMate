const express = require("express");
const router = express.Router();
const{createnewride} = require("./createRide.Controller");
const authMiddleWare = require("../../middleware/authMiddleware");
router.post("/createride",authMiddleWare,createnewride);
module.exports = router;