const express=require("express");
const router = express.Router();
const {editRide} = require("./editRide.Controllers");
const {fetchforEdit} = require("./editRide.Controllers");
const authMiddleWare = require("../../middleware/authMiddleware");
router.patch("/:id1/edit", authMiddleWare, editRide);
router.get("/fetchedit/:id1",authMiddleWare,fetchforEdit);
module.exports = router;