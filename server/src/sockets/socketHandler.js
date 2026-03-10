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
    // socket.on("disconnect", async () => {
    //   console.log("User disconnected");

    //   if (socket.roomId && socket.userId) {
    //     socket.to(socket.roomId).emit("user-disconnected", socket.userId);
    //   }
    // });
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
  });
};
