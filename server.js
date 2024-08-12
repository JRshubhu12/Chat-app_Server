const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://fabulous-empanada-9e0abf.netlify.app",
    methods: ["GET", "POST"],
  },
});

let users = [];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("new_user", (data) => {
    // Check for duplicate usernames
    if (!users.some((user) => user.username === data.username)) {
      users.push({ id: socket.id, username: data.username });
    }
    io.emit("user_list", users);
  });

  socket.on("send_message", (data) => {
    const receiverUser = users.find((user) => user.username === data.receiver);
    if (receiverUser) {
      io.to(receiverUser.id).emit("receive_message", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    users = users.filter((user) => user.id !== socket.id);
    io.emit("user_list", users);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
