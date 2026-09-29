const jwt = require("jsonwebtoken");
const userModel = require("../modules/auth/auth.model");

async function authMiddleWare(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized (no token)",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  try {
    const user = await userModel.findById(decoded.id).select("tokenVersion");
    if (!user || (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.user = decoded;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authMiddleWare;