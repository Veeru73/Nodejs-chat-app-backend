const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const connectDB = require("./utils/database");
const cors = require("cors");
const path = require("path");
connectDB();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.raw());
app.use(cors());

const userRouter = require("./routes/user_route");
app.use("/user", userRouter);

const chatRouter = require("./routes/chat_route");
app.use("/chat", chatRouter);

const messageRouter = require("./routes/message_route");
app.use("/message", messageRouter);

// // --------------------------------Deployment----------------------------
// // const a = require("../frontend/chat-app/public/index.html");
// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV === "production") {
//   app.use(
//     express.static(
//       path.join(__dirname1, "/frontend/chat-app/public/index.html")
//     )
//   );
//   app.get("*", (req, res) => {
//     res.sendFile(
//       path.resolve(__dirname1, "frontend", "chat-app", "public", "index.html")
//     );
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running successfully");
//   });
// }

// --------------------------------Deployment-----------------------------

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Something went wrong";
  return res.status(statusCode).json({ success: false, message });
});

app.use("*", (req, res, next) => {
  return res.status(400).json({ error: "Path not found" });
});
const createServer = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const { Server } = require("socket.io");

const io = new Server(createServer, {
  pingTimeout: 60000,
  cors: { origin: "*" }, // cors: { origin: "http://localhost:3000" }
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    // console.log("useredta--------", userData?._id);
    socket.emit("connected");
  });

  socket.on("joinChat", (room) => {
    socket.join(room);
    // console.log("user joinde room", room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stopTyping", (room) => socket.in(room).emit("stopTyping"));

  socket.on("newMessage", (newMessageReceived) => {
    // console.log("this is new message received---------->", newMessageReceived);
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not define");
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("messageReceived", newMessageReceived);
    });

    socket.off("setup", () => {
      // console.log("user disconnected");
      socket.leave(userData._id);
    });
  });
});
