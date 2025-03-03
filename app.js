const express = require("express");
const app = express();
const path = require("path");
const socketIO = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const fs = require("fs");
const io = socketIO(server);
  const socketController = require("./controller/SocketController")
  socketController.setSocketIOInstance(io);
const routes=require("./routes/route")



app.use(express.json());
app.use('/user',routes)

app.use(express.static(path.join(__dirname, "public")));

// Set the 'views' directory for HTML files
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/FileDirectory", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

io.on("connection", (socket) => {
  console.log("A user connected");
});





module.exports = { app, server };