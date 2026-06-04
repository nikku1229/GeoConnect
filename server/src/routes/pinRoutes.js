const express = require("express");
const router = express.Router();
const pinController = require("../controllers/pinController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware); 

router.post("/create", pinController.createPin);
router.get("/room/:roomId", pinController.getRoomPins);
router.delete("/:pinId", pinController.deletePin);

module.exports = router;
