const express = require("express");
const app = express();
const PORT = 8085;
const ws = require("http").createServer(app);
const wsOptions = {
  cors: {
    origin: "*",
  }

};
const dotenv = require("dotenv").config()
const io = require("socket.io")(ws, wsOptions);

ws.listen(PORT, () => {
  console.log(`WS Server is listening on ${PORT}`);
});

io.on("connection", (socket) => {
  socket.on("user action", (msg) => {
      const { type, message } = msg;
    io.emit("new action response", {
      type: type,
      message: message,
    });
  });

  socket.on("chat message", (msg) => {
    const { type, userName, message, userColor } = msg;
    io.emit("chat response", {
      type: type,
      userName: userName,
      message: message,
      userColor: userColor,
      date: new Date().toLocaleTimeString(),
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/tochi", (req, res) => {
  res.send("tochi");
});
