const express = require("express");
const router = express.Router();

const { getDetail } = require("./profile.Controllers");
const authMiddleWare = require("../../middleware/authMiddleware");

router.get("/:profileId", authMiddleWare, getDetail);

module.exports = router;
