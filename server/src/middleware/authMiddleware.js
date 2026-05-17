const jwt = require("jsonwebtoken");
function authMiddleWare(req,res,next){
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message: "Unathorized (no token)",
            });
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}
module.exports = authMiddleWare;  