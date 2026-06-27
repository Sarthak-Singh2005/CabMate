require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/database");
const http = require("http");
const { Server } = require("socket.io");
const { setIo } = require("./socket");
const jwt = require("jsonwebtoken");
connectDb();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (!name) {
      return cookies;
    }

    cookies[name] = decodeURIComponent(valueParts.join("="));
    return cookies;
  }, {});
}

io.use((socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies.token;

    if (!token) {
      return next(new Error("Unauthorized socket connection"));
    }

    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    return next(new Error("Invalid socket token"));
  }
});

io.on("connection", (socket) => {
  console.log("[Socket] User Connected - Socket ID:", socket.id);

  const joinAuthenticatedRoom = () => {
    const userIdStr = socket.user.id.toString();
    socket.join(userIdStr);
    console.log(`[Socket] ${userIdStr} joined room - Socket ID: ${socket.id}`);
    console.log(
      `[Socket] Room members for ${userIdStr}:`,
      io.sockets.adapter.rooms.get(userIdStr)?.size || 0,
    );
  };

  joinAuthenticatedRoom();

  socket.on("disconnect", () => {
    console.log("[Socket] User Disconnected - Socket ID:", socket.id);
  });
});
setIo(io);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
