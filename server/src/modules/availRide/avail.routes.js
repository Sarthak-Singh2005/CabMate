const express = require("express");
const router = express.Router();
const { availRide,ownerRide,reqRide,acceptRide,rejectRide,cancelRide,getBookingRequests } = require("./avail.Controllers");
const authMiddleWare = require("../../middleware/authMiddleware");
router.get("/avail", authMiddleWare, availRide);
router.post("/bookingconfirm", authMiddleWare, reqRide);
router.post("/bookingconfirm/accept", authMiddleWare, acceptRide);
router.post("/bookingconfirm/reject", authMiddleWare, rejectRide);
router.get("/bookingrequests/:rideId", authMiddleWare, getBookingRequests);
router.get("/owner", authMiddleWare, ownerRide);

router.post("/owner/cancel/:rideId", authMiddleWare, cancelRide);
module.exports = router;
  