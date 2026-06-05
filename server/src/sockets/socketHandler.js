const Location = require("../models/Location");
const User = require("../models/User");
const Room = require("../models/Room");
const Pin = require("../models/Pin");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // USER JOINS ROOM
    socket.on("join_room", async (data) => {
      try {
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

        if (room) {
          await Room.updateOne({ roomId }, { $addToSet: { members: userId } });

          await User.findByIdAndUpdate(userId, {
            $addToSet: { rooms: room._id },
          });

          if (room.createdBy) {
            socket.emit("room_creator", {
              creatorId: room.createdBy.toString(),
            });
          }
        }

        // SEND EXISTING USERS LOCATIONS
        const existingLocations = await Location.find({ roomId })
          .populate("userId", "isOnline")
          .lean();

        socket.emit(
          "all_locations",
          existingLocations.map((loc) => ({
            userId: loc.userId._id.toString(),
            latitude: loc.latitude,
            longitude: loc.longitude,
            name: loc.name,
            online: loc.userId.isOnline,
          })),
        );

        // AFTER joining room, send existing pins
        const existingPins = await Pin.find({ roomId })
          .sort({ createdAt: -1 })
          .lean();
        socket.emit("all_pins", existingPins);

        io.to(roomId).emit("user_status", {
          userId,
          status: "online",
        });

        await Room.updateOne({ roomId }, { lastActive: new Date() });
      } catch (err) {
        console.error("Joined room error:", err);
      }
    });

    // LOCATION UPDATE
    socket.on("location_update", async (data) => {
      try {
        const { userId, roomId, latitude, longitude, name } = data;

        await Location.findOneAndUpdate(
          { userId, roomId },
          { latitude, longitude, name, updatedAt: Date.now() },
          { upsert: true },
        );

        io.to(roomId).emit("location_update", {
          userId,
          latitude,
          longitude,
          name,
        });
      } catch (err) {
        console.error("Location update error:", err);
      }
    });

    // INACTIVE USER
    socket.on("user_inactive", async ({ roomId, userId }) => {
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
        });

        io.to(roomId).emit("user_status", {
          userId,
          status: "offline",
        });
      } catch (err) {
        console.error("User inactive error:", err);
      }
    });

    // DISCONNECT
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      try {
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
          });
        }

        if (socket.roomId && socket.userId) {
          io.to(socket.roomId).emit("user_status", {
            userId: socket.userId,
            status: "offline",
          });
        }
      } catch (err) {
        console.error("Disconnect error:", err);
      }
    });

    // CHAT MESSAGE
    socket.on("send_message", (data) => {
      try {
        const { roomId, userId, username, message } = data;

        io.to(roomId).emit("receive_message", {
          userId,
          username,
          message,
          time: new Date(),
        });
      } catch (err) {
        console.error("Send message error:", err);
      }
    });

    // LEAVE ROOM
    socket.on("leave_room", async ({ roomId, userId }) => {
      try {
        socket.leave(roomId);

        const room = await Room.findOne({ roomId });

        if (!room) return;

        await Room.updateOne({ roomId }, { $pull: { members: userId } });

        await User.findByIdAndUpdate(userId, {
          $pull: { rooms: room._id },
          isOnline: false,
        });

        // DELETE LOCATION
        await Location.deleteOne({
          userId,
          roomId,
        });

        io.to(roomId).emit("user-disconnected", userId);
      } catch (err) {
        console.error(err);
      }
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

        await Location.deleteOne({
          userId: targetUserId,
          roomId,
        });

        await User.findByIdAndUpdate(targetUserId, {
          $pull: { rooms: room._id },
        });
      } catch (err) {
        console.error("Kick error:", err);
      }
    });

    // NEW PIN CREATED (Broadcast to room)
    socket.on("new_pin", async (data) => {
      try {
        const { roomId, pin } = data;

        const existingPin = await Pin.findOne({
          roomId,
          userId: socket.userId,
          latitude: pin.latitude,
          longitude: pin.longitude,
          createdAt: { $gt: new Date(Date.now() - 60000) }, // Last 1 minute
        });

        if (existingPin) {
          return;
        }

        const newPin = await Pin.create({
          roomId,
          userId: socket.userId,
          userName: socket.username,
          comment: pin.comment,
          latitude: pin.latitude,
          longitude: pin.longitude,
          locationName: pin.locationName || "",
        });

        // Broadcast to all in room including sender
        io.to(roomId).emit("pin_added", {
          ...newPin.toObject(),
          isOwn: false,
        });
      } catch (err) {
        console.error("New pin error:", err);
      }
    });

    // PIN DELETED
    socket.on("delete_pin", async ({ roomId, pinId }) => {
      try {
        const pin = await Pin.findById(pinId);

        if (!pin) return;

        // Check if user is creator
        if (pin.userId.toString() !== socket.userId) {
          socket.emit("pin_delete_error", { message: "Not your pin" });
          return;
        }

        await Pin.deleteOne({ _id: pinId });

        io.to(roomId).emit("pin_removed", { pinId });
      } catch (err) {
        console.error("Delete pin error:", err);
      }
    });

    socket.on("search_location", async (data) => {
      try {
        const { roomId, location, userId, username } = data;

        // Broadcast to all users in room including sender
        io.to(roomId).emit("location_searched", {
          userId,
          username,
          location,
          timestamp: new Date(),
        });

        // Auto clear after 10 seconds (optional)
        setTimeout(() => {
          io.to(roomId).emit("clear_searched_location", { userId });
        }, 60000);
      } catch (err) {
        console.error("Search location error:", err);
      }
    });

    // Clear search location manually
    socket.on("clear_search_location", ({ roomId, userId }) => {
      io.to(roomId).emit("clear_searched_location", { userId });
    });
  });
};
