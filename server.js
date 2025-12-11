const { Server } = require("socket.io");
const { createServer } = require("http");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for now (adjust for production)
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join a room based on the problem ID
  socket.on("join_problem", (problemId) => {
    socket.join(problemId);
    console.log(`Socket ${socket.id} joined problem room: ${problemId}`);
  });

  // Join a room based on the contest ID
  socket.on("join_contest", (contestId) => {
    socket.join(contestId);
    console.log(`Socket ${socket.id} joined contest room: ${contestId}`);
  });


  // Handle new comment
  socket.on("new_comment", (data) => {
    // data should contain: { problemId, comment }
    // Broadcast to everyone in that problem's room EXCEPT the sender
    socket.to(data.problemId).emit("comment_added", data.comment);
  });

  // Handle vote update
  socket.on("vote_update", (data) => {
    // data: { problemId, commentId, upvotes, downvotes }
    socket.to(data.problemId).emit("vote_updated", data);
  });

  // --- Chat System ---
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  socket.on("send_message", (data) => {
    // data: { conversationId, message }
    // Broadcast to the room
    socket.to(data.conversationId).emit("new_message", data.message);
  });
  
  // Join user's personal room for notifications (like friend requests)
  socket.on("join_user", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined user room: ${userId}`);
  });

  socket.on("send_friend_request", (data) => {
    // data: { receiverId, request }
    socket.to(data.receiverId).emit("friend_request_received", data.request);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
