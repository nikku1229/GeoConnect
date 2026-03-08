const Location = require("../models/Location");
const User = require("../models/User");

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

      // console.log(`User ${userId} joined room ${roomId}`);

      io.to(roomId).emit("user_status", {
        userId,
        status: "online",
      });
    });

    // LOCATION UPDATE
    // LOCATION UPDATE
    socket.on("location_update", async (data) => {
      const { userId, roomId, latitude, longitude, name } = data;

      // console.log("SERVER RECEIVED LOCATION:", latitude, longitude);

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
      console.log("User disconnected");

      if (socket.roomId && socket.userId) {
        io.to(socket.roomId).emit("user-disconnected", socket.userId);
      }
    });
  });
};
