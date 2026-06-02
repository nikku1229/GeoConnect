const cron = require("node-cron");
const Pin = require("../models/Pin");

module.exports = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await Pin.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      if (result.deletedCount > 0) {
        console.log(`🗑️ Deleted ${result.deletedCount} expired pins`);
      }
    } catch (err) {
      console.error("Pin cleanup error:", err);
    }
  });
};
