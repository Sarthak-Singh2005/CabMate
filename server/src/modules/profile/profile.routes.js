const express = require("express");
const router = express.Router();

const {
  getDetail,
  updateProfile,
  getJoinedRides,
} = require("./profile.Controllers");
const authMiddleWare = require("../../middleware/authMiddleware");

router.get("/:profileId", authMiddleWare, getDetail);
router.patch("/", authMiddleWare, updateProfile);
router.get("/joined/rides", authMiddleWare, getJoinedRides);

module.exports = router;
