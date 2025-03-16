require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // update with your frontend URL when deploying
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// MongoDB connection (replace <connection_string> with your Atlas URI)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Listen for note updates
  socket.on("noteUpdate", (data) => {
    // Broadcast to other clients in the same room/note
    socket.to(data.noteId).emit("noteUpdated", data);
  });

  // Handle real-time presence tracking
  socket.on("joinNote", (data) => {
    socket.join(data.noteId);
    io.to(data.noteId).emit("userJoined", {
      user: data.user,
      noteId: data.noteId,
    });
  });

  socket.on("leaveNote", (data) => {
    socket.leave(data.noteId);
    io.to(data.noteId).emit("userLeft", {
      user: data.user,
      noteId: data.noteId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Routes
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
