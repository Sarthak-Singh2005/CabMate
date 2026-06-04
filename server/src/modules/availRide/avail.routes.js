const express = require("express");
const router = express.Router();
const { availRide } = require("./avail.Controllers");
const { ownerRide } = require("./avail.Controllers");
const { reqRide } = require("./avail.Controllers");
const { acceptRide } = require("./avail.Controllers");
const { getBookingRequests } = require("./avail.Controllers");
const authMiddleWare = require("../../middleware/authMiddleware");
router.get("/avail", authMiddleWare, availRide);
router.post("/bookingconfirm", authMiddleWare, reqRide);
router.post("/bookingconfirm/accept", authMiddleWare, acceptRide);
router.get("/bookingrequests/:rideId", authMiddleWare, getBookingRequests);
router.get("/owner", authMiddleWare, ownerRide);
module.exports = router;
  