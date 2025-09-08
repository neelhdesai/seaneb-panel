import User from "../models/User.js";

export const processPendingProfileUpdates = async () => {
  try {
    const now = new Date();
    const users = await User.find({ pendingUpdate: { $ne: null } });

    for (let user of users) {
      const diff = now - new Date(user.pendingUpdateAt);
      if (diff >= 24 * 60 * 60 * 1000) { 
        // Apply pending changes
        Object.assign(user, user.pendingUpdate);
        user.pendingUpdate = null;
        user.pendingUpdateAt = null;
        await user.save();
        console.log(`✅ Applied pending update for user ${user._id}`);
      }
    }
  } catch (err) {
    console.error("❌ Error processing pending profile updates:", err.message);
  }
};
