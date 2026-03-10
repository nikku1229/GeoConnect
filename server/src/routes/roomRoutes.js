const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, roomController.createRoom);

router.post("/join", authMiddleware, roomController.joinRoom);

router.get("/myrooms", authMiddleware, roomController.getMyRooms);

router.post("/:roomId/leave", authMiddleware, roomController.leaveRoom);

module.exports = router;
