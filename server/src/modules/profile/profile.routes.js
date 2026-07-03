const express = require("express");
const router = express.Router();

const { getDetail, updateProfile } = require("./profile.Controllers");
const authMiddleWare = require("../../middleware/authMiddleware");

router.get("/:profileId", authMiddleWare, getDetail);
router.patch("/", authMiddleWare, updateProfile);

module.exports = router;
