require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/database");
const http = require("http");
const { Server } = require("socket.io");
connectDb();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
   cors:{
      origin:"http://localhost:5173",
      credentials:true,
   }
});
io.on("connection", (socket) => {
   console.log("User Connected");
   socket.on("send_message", (data) => {
      console.log(data);
      io.emit("receive_message", data);
   });
   socket.on("disconnect", () => {
      console.log("User Disconnected");
   });
});
server.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});