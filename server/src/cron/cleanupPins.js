const cron = require("node-cron");
const Pin = require("../models/Pin");

module.exports = () => {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

      const result = await Pin.deleteMany({
        createdAt: { $lt: fiveHoursAgo },
      });
    } catch (err) {
      console.error("Pin cleanup error:", err);
    }
  });

  console.log("✅ Pin cleanup cron started (runs every hour)");
};
