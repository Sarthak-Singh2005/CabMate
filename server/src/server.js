require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/database");
const http = require("http");
const { Server } = require("socket.io");
const { setIo } = require("./socket");
connectDb();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("join", (userId) => {
    socket.join(userId);

    console.log(`${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});
setIo(io);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
