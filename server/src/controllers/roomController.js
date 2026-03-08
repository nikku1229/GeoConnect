const Room = require("../models/Room");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// CREATE ROOM
const createRoom = async (req, res) => {
  try {
    const { roomName, password } = req.body;

    const roomId = uuidv4().slice(0, 8);

    const hashedPassword = await bcrypt.hash(password, 10);

    const room = await Room.create({
      roomName,
      roomId,
      password: hashedPassword,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { rooms: room._id },
    });

    res.json(room);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// JOIN ROOM
const joinRoom = async (req, res) => {
  try {
    const { roomId, password } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const match = await bcrypt.compare(password, room.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// LEAVE ROOM
const leaveRoom = async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId });

  room.members = room.members.filter(
    (id) => id.toString() !== req.user._id.toString(),
  );

  await room.save();

  res.json({ message: "Left room" });
};

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
};
