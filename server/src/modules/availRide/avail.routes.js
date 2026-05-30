const express = require("express");
const router = express.Router();
const { availRide } = require("./avail.Controllers");
const { ownerRide } = require("./avail.Controllers");
const authMiddleWare = require("../../middleware/authMiddleware");
router.get("/avail", authMiddleWare, availRide);
router.get("/owner", authMiddleWare, ownerRide);
module.exports = router;
