import { Server } from "socket.io";
import { createServer } from "http";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";

const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:3000";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

const redisOptions = redisUrl.startsWith("rediss://")
  ? { tls: { rejectUnauthorized: false } }
  : {};

const pubClient = new Redis(redisUrl, redisOptions);
const subClient = pubClient.duplicate();

pubClient.on("error", (err) => {
  console.error("Redis Pub Client Error:", err);
});

subClient.on("error", (err) => {
  console.error("Redis Sub Client Error:", err);
});

// Use the adapter
io.adapter(createAdapter(pubClient, subClient));

const log = (level, msg, data = "") => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${msg}`, data);
};

io.on("connection", (socket) => {
  log("info", "Client connected:", socket.id);

  // --- Collaborative Coding ---
  socket.on("join_collab", async ({ roomId, username, image, dbUserId }) => {
    socket.join(roomId);
    log("info", `Socket ${socket.id} joined collab room: ${roomId}`);

    // Redis key setup
    const roomStateKey = `collab:${roomId}:state`;
    const roomUsersKey = `collab:${roomId}:users`;

    // Initialize room if needed
    const exists = await pubClient.exists(roomStateKey);
    if (!exists) {
      await pubClient.hset(roomStateKey, { code: "", language: "javascript" });
      // Expiration to avoid stale data (e.g., 24 hours)
      await pubClient.expire(roomStateKey, 86400);
      await pubClient.expire(roomUsersKey, 86400);
    }

    // Add user
    const userData = JSON.stringify({ username, image, dbUserId });
    await pubClient.hset(roomUsersKey, socket.id, userData);

    // Get current room state
    const state = await pubClient.hgetall(roomStateKey);

    // Send current room state to the new joiner
    socket.emit("code_update", {
      code: state.code || "",
      language: state.language || "javascript",
      isInit: true,
    });

    // Broadcast updated user list to ALL in room (including self)
    const rawUsers = await pubClient.hgetall(roomUsersKey);
    const userList = Object.entries(rawUsers).map(([id, userStr]) => ({
      id,
      ...JSON.parse(userStr),
    }));
    io.in(roomId).emit("room_users_update", userList);

    // Notify others
    socket.to(roomId).emit("user_joined_collab", { username });
  });

  socket.on("code_update", async ({ roomId, code, language }) => {
    const roomStateKey = `collab:${roomId}:state`;
    if (await pubClient.exists(roomStateKey)) {
      await pubClient.hset(roomStateKey, { code, language });
    }
    // Broadcast to everyone else in the room
    socket.to(roomId).emit("code_update", { code, language });
  });

  socket.on("cursor_move", ({ roomId, position, username }) => {
    socket
      .to(roomId)
      .emit("cursor_update", { userId: socket.id, username, position });
  });

  const handleLeaveRoom = async (roomId, socketId) => {
    const roomUsersKey = `collab:${roomId}:users`;
    const roomStateKey = `collab:${roomId}:state`;

    await pubClient.hdel(roomUsersKey, socketId);

    const rawUsers = await pubClient.hgetall(roomUsersKey);
    const userKeys = Object.keys(rawUsers);

    if (userKeys.length === 0) {
      await pubClient.del(roomStateKey);
      await pubClient.del(roomUsersKey);
    } else {
      const userList = Object.entries(rawUsers).map(([id, userStr]) => ({
        id,
        ...JSON.parse(userStr),
      }));
      io.in(roomId).emit("room_users_update", userList);
    }
  };

  socket.on("leave_collab", async ({ roomId }) => {
    socket.leave(roomId);
    await handleLeaveRoom(roomId, socket.id);
  });

  // Handle disconnecting to clean up rooms
  socket.on("disconnecting", async () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        await handleLeaveRoom(roomId, socket.id);
      }
    }
  });

  // Join a room based on the problem ID
  socket.on("join_problem", (problemId) => {
    socket.join(problemId);
    log("info", `Socket ${socket.id} joined problem room: ${problemId}`);
  });

  // Join a room based on the contest ID
  socket.on("join_contest", (contestId) => {
    socket.join(contestId);
    log("info", `Socket ${socket.id} joined contest room: ${contestId}`);
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
    log("info", `Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  socket.on("send_message", (data) => {
    // data: { conversationId, message, recipientIds }
    // 1. Broadcast to the conversation room (for those currently viewing the chat)
    socket.to(data.conversationId).emit("new_message", data.message);

    // 2. Broadcast to each recipient's personal room (for sidebar updates)
    if (data.recipientIds && Array.isArray(data.recipientIds)) {
      data.recipientIds.forEach((id) => {
        socket.to(id).emit("new_message", data.message);
      });
    }
  });

  // Join user's personal room for notifications (like friend requests)
  socket.on("join_user", async (userId) => {
    socket.join(userId);

    const userSocketsKey = `user:${userId}:sockets`;

    // Add socket to user's set of active sockets
    await pubClient.sadd(userSocketsKey, socket.id);
    // Keep a reverse lookup to clean up on disconnect
    await pubClient.set(`socket:${socket.id}:user`, userId);

    const socketCount = await pubClient.scard(userSocketsKey);
    if (socketCount === 1) {
      // First socket for this user = they just came online
      await pubClient.sadd("global:online_users", userId);
      io.emit("user_online", { userId });
    }

    log("info", `Socket ${socket.id} joined user room: ${userId}`);
  });

  socket.on("get_online_users", async (callback) => {
    // Avoid O(N) blocking KEYS command by using a dedicated SET for online users
    const onlineUserIds = await pubClient.smembers("global:online_users");
    callback(onlineUserIds);
  });

  socket.on("send_friend_request", (data) => {
    // data: { receiverId, request }
    socket.to(data.receiverId).emit("friend_request_received", data.request);
  });

  // Generic Notification System
  socket.on("send_notification", (data) => {
    // data: { recipientId, notification }
    socket
      .to(data.recipientId)
      .emit("notification_received", data.notification);
  });

  socket.on("disconnect", async () => {
    log("info", "Client disconnected:", socket.id);

    const socketUserKey = `socket:${socket.id}:user`;
    const userId = await pubClient.get(socketUserKey);

    if (userId) {
      const userSocketsKey = `user:${userId}:sockets`;
      await pubClient.srem(userSocketsKey, socket.id);

      const socketCount = await pubClient.scard(userSocketsKey);
      if (socketCount === 0) {
        // Last socket disconnected
        await pubClient.srem("global:online_users", userId);
        await pubClient.del(userSocketsKey);
        io.emit("user_offline", { userId, lastActive: new Date() });
      }
      await pubClient.del(socketUserKey);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  log("info", `Socket.io server running on port ${PORT}`);
});
