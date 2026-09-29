const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./modules/auth/auth.routes");
const createRideRoutes = require("./modules/createRide/createRide.routes");
const availRoutes = require("./modules/availRide/avail.routes");
const findride = require("./modules/findride/findride.routes");
const chatRoutes = require("./modules/chat/chat.routes");
const editRideRoutes = require("./modules/editRide/editRide.routes");
const notificationRoutes = require("./modules/notifications/notifications.routes");
const profileRoutes = require("./modules/profile/profile.routes");

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.path} | Query: ${JSON.stringify(req.query)}`);
  next();
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  let expectedOrigin;
  try {
    expectedOrigin = new URL(process.env.CLIENT_URL).origin;
  } catch {
    return res.status(500).json({ message: "Client origin is not configured" });
  }

  if (req.get("origin") !== expectedOrigin) {
    return res.status(403).json({ message: "Invalid request origin" });
  }

  return next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/rides", createRideRoutes);
app.use("/api/rides", editRideRoutes);
app.use("/api/rides", availRoutes);
app.use("/api/rides", findride);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("Server Working");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({ message });
});

module.exports = app;
