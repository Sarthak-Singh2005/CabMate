const express = require("express");
const router =express.Router();
const {findRides} = require("./ride.Controller")
const authMiddleWare = require("../../middleware/authMiddleware");
router.post("/findrides",authMiddleWare,findRides);
module.exports = router;