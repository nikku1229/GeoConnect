const Location = require("../models/Location");
const User = require("../models/User");
const Room = require("../models/Room");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // USER JOINS ROOM
    socket.on("join_room", async (data) => {
      const { roomId, userId, username } = data;

      socket.join(roomId);

      socket.userId = userId;
      socket.username = username;
      socket.roomId = roomId;

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });

      // GET ROOM CREATOR
      const room = await Room.findOne({ roomId });

      if (room && room.createdBy) {
        socket.emit("room_creator", {
          creatorId: room.createdBy.toString(),
        });
      }

      io.to(roomId).emit("user_status", {
        userId,
        status: "online",
      });
    });

    // LOCATION UPDATE
    socket.on("location_update", async (data) => {
      const { userId, roomId, latitude, longitude, name } = data;

      await Location.findOneAndUpdate(
        { userId, roomId },
        { latitude, longitude, updatedAt: Date.now() },
        { upsert: true },
      );

      io.to(roomId).emit("location_update", {
        userId,
        latitude,
        longitude,
        name,
      });
    });

    // DISCONNECT
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      try {
        if (socket.userId) {
          // mark user offline
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
          });
        }

        if (socket.roomId && socket.userId) {
          io.to(socket.roomId).emit("user_status", {
            userId: socket.userId,
            status: "offline",
          });

          io.to(socket.roomId).emit("user-disconnected", socket.userId);
        }
      } catch (err) {
        console.error("Disconnect error:", err);
      }
    });

    // CHAT MESSAGE
    socket.on("send_message", (data) => {
      const { roomId, userId, username, message } = data;

      io.to(roomId).emit("receive_message", {
        userId,
        username,
        message,
        time: new Date(),
      });
    });

    // LEAVE ROOM
    socket.on("leave_room", async ({ roomId, userId }) => {
      socket.leave(roomId);

      io.to(roomId).emit("user-disconnected", userId);
    });

    // KICK USER
    socket.on("kick_user", async ({ roomId, targetUserId }) => {
      try {
        const room = await Room.findOne({ roomId });

        if (!room) return;

        if (room.createdBy.toString() !== socket.userId) return;

        const sockets = await io.in(roomId).fetchSockets();

        const targetSocket = sockets.find((s) => s.userId === targetUserId);

        if (targetSocket) {
          targetSocket.leave(roomId);

          targetSocket.emit("user_kicked");

          io.to(roomId).emit("user-disconnected", targetUserId);
        }

        await Room.updateOne({ roomId }, { $pull: { members: targetUserId } });
      } catch (err) {
        console.error("Kick error:", err);
      }
    });
  });
};
