const { Server } = require("socket.io");
const { createServer } = require("http");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for now (adjust for production)
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map(); // userId -> Set(socketIds)
const collabRooms = new Map(); // roomId -> { code: string, language: string, users: Map<socketId, { username, image }> }

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  let currentUserId = null;

  // --- Collaborative Coding ---
  socket.on("join_collab", ({ roomId, username, image, dbUserId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined collab room: ${roomId}`);
    
    // Initialize room if needed
    if (!collabRooms.has(roomId)) {
      collabRooms.set(roomId, { code: "", language: "javascript", users: new Map() });
    }
    
    const room = collabRooms.get(roomId);
    room.users.set(socket.id, { username, image, dbUserId });

    // Send current room state to the new joiner
    socket.emit("code_update", { code: room.code, language: room.language, isInit: true });
    
    // Broadcast updated user list to ALL in room (including self)
    const userList = Array.from(room.users.entries()).map(([id, user]) => ({ id, ...user }));
    io.in(roomId).emit("room_users_update", userList);
    
    // Notify others
    socket.to(roomId).emit("user_joined_collab", { username });
  });

  socket.on("code_update", ({ roomId, code, language }) => {
    if (collabRooms.has(roomId)) {
       const room = collabRooms.get(roomId);
       room.code = code;
       room.language = language;
    }
    // Broadcast to everyone else in the room
    socket.to(roomId).emit("code_update", { code, language });
  });

  socket.on("cursor_move", ({ roomId, position, username }) => {
    socket.to(roomId).emit("cursor_update", { userId: socket.id, username, position });
  });

  const handleLeaveRoom = (socketId) => {
     // Find which rooms this socket is in (inefficient but works for small scale)
     // Better: track socket -> roomId mapping. For now, iterate.
     for (const [roomId, room] of collabRooms.entries()) {
        if (room.users.has(socketId)) {
           room.users.delete(socketId);
           
           // Broadcast updated list
           const userList = Array.from(room.users.entries()).map(([id, user]) => ({ id, ...user }));
           io.in(roomId).emit("room_users_update", userList);
           
           if (room.users.size === 0) {
              collabRooms.delete(roomId);
           }
           break; // Assuming 1 active collab room per socket for now
        }
     }
  };

  socket.on("leave_collab", ({ roomId }) => {
    socket.leave(roomId);
    if (collabRooms.has(roomId)) {
       const room = collabRooms.get(roomId);
       room.users.delete(socket.id);
       
       const userList = Array.from(room.users.entries()).map(([id, user]) => ({ id, ...user }));
       io.in(roomId).emit("room_users_update", userList);

       if (room.users.size === 0) {
          collabRooms.delete(roomId);
       }
    }
  });

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
    // data: { conversationId, message, recipientIds }
    // 1. Broadcast to the conversation room (for those currently viewing the chat)
    socket.to(data.conversationId).emit("new_message", data.message);

    // 2. Broadcast to each recipient's personal room (for sidebar updates)
    if (data.recipientIds && Array.isArray(data.recipientIds)) {
      data.recipientIds.forEach(id => {
        socket.to(id).emit("new_message", data.message);
      });
    }
  });
  
  // Join user's personal room for notifications (like friend requests)
  socket.on("join_user", (userId) => {
    socket.join(userId);
    currentUserId = userId;
    
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      io.emit("user_online", { userId });
    }
    onlineUsers.get(userId).add(socket.id);
    
    console.log(`Socket ${socket.id} joined user room: ${userId}`);
  });

  socket.on("get_online_users", (callback) => {
    callback(Array.from(onlineUsers.keys()));
  });

  socket.on("send_friend_request", (data) => {
    // data: { receiverId, request }
    socket.to(data.receiverId).emit("friend_request_received", data.request);
  });

  // Generic Notification System
  socket.on("send_notification", (data) => {
    // data: { recipientId, notification }
    socket.to(data.recipientId).emit("notification_received", data.notification);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    handleLeaveRoom(socket.id); // Clean up collab rooms

    if (currentUserId && onlineUsers.has(currentUserId)) {
      const sockets = onlineUsers.get(currentUserId);
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(currentUserId);
        io.emit("user_offline", { userId: currentUserId, lastActive: new Date() });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
