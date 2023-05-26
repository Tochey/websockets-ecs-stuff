const express = require("express");
const app = express();
const SERVER_PORT = 8085;
const WS_PORT = 8086;
const ws = require("http").createServer(app);
const wsOptions = {
  cors: {
    origin: "*",
  }

};
const dotenv = require("dotenv").config()
const io = require("socket.io")(ws, wsOptions);

ws.listen(WS_PORT, () => {
  console.log(`WS Server is listening on ${WS_PORT}`);
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

app.listen(SERVER_PORT, () => {
  console.log(`Server is listening on ${SERVER_PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
