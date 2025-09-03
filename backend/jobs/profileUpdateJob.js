import cron from "node-cron";
import { processPendingProfileUpdates } from "./profileUpdateTask.js";

// Run every hour at minute 0
cron.schedule("0 * * * *", async () => {
  console.log("⏳ Running profile update cron job...");
  await processPendingProfileUpdates();
});
