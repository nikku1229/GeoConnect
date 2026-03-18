const cron = require("node-cron");
const Room = require("../models/Room");

module.exports = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const result = await Room.deleteMany({
        members: { $size: 0 },
        lastActive: { $lt: oneHourAgo },
      });

      if (result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} inactive rooms`);
      }
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  });
};
