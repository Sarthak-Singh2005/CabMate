const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./modules/auth/auth.routes");
const rideRoutes = require("./modules/rides/ride.routes");
const createRideRoutes = require("./modules/createRide/createRide.routes");
const availRoutes = require("./modules/availRide/avail.routes");
const findride = require("./modules/findride/findride.routes")
const chatRoutes =require("./modules/chat/chat.routes");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/rides", createRideRoutes);
app.use("/api/rides", availRoutes);
app.use("/api/rides", findride);
app.use("/api/chat", chatRoutes);
app.get("/", (req, res) => {
  res.send("Server Working");
});
module.exports = app;
