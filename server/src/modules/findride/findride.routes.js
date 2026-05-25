const express=require("express");
 const router = express.Router();
const {findride} = require("./findride.Controllers");
const authMiddleWare = require("../../middleware/authMiddleware");
router.post("/findride",authMiddleWare,findride);
module.exports = router;