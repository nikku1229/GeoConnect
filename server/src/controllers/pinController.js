const Pin = require("../models/Pin");

const createPin = async (req, res) => {
  try {
    const { roomId, comment, latitude, longitude, locationName } = req.body;

    const pin = await Pin.create({
      roomId,
      userId: req.user._id,
      userName: req.user.name,
      comment,
      latitude,
      longitude,
      locationName: locationName || "",
    });

    res.status(201).json(pin);
  } catch (err) {
    console.error("Create pin error:", err);
    res.status(500).json({ message: "Failed to create pin" });
  }
};

const getRoomPins = async (req, res) => {
  try {
    const { roomId } = req.params;

    const pins = await Pin.find({ roomId }).sort({ createdAt: -1 }).lean();

    res.json(pins);
  } catch (err) {
    console.error("Get pins error:", err);
    res.status(500).json({ message: "Failed to fetch pins" });
  }
};

const deletePin = async (req, res) => {
  try {
    const { pinId } = req.params;

    const pin = await Pin.findById(pinId);

    if (!pin) {
      return res.status(404).json({ message: "Pin not found" });
    }

    if (pin.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own pins" });
    }

    await Pin.deleteOne({ _id: pinId });

    res.json({ message: "Pin deleted successfully" });
  } catch (err) {
    console.error("Delete pin error:", err);
    res.status(500).json({ message: "Failed to delete pin" });
  }
};

module.exports = {
  createPin,
  getRoomPins,
  deletePin,
};
