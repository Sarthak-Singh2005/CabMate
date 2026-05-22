const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./modules/auth/auth.routes");
const rideRoutes = require("./modules/rides/ride.routes");
const createRideRoutes = require("./modules/createRide/createRide.routes");
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
app.get("/", (req, res) => {
  res.send("Server Working");
});
module.exports = app;
