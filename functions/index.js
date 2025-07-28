// functions/index.js
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getDatabase } = require("firebase-admin/database");
const admin = require("firebase-admin");

admin.initializeApp();
const db = getDatabase();

// Run every 5 minutes to clean up expired messages
exports.deleteExpiredMessages = onSchedule("every 5 minutes", async () => {
  const messagesRef = db.ref("messages");
  const snapshot = await messagesRef.once("value");
  const messages = snapshot.val() || {};
  
  const now = Date.now();
  let deletedCount = 0;
  
  for (const [key, message] of Object.entries(messages)) {
    if (message.ttl && now > message.ttl) {
      await messagesRef.child(key).remove();
      deletedCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} expired messages`);
  return null;
});