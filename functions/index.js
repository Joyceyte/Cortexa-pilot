const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { DateTime } = require("luxon");

admin.initializeApp();
const db = admin.firestore();

function getLocalTimeStr() {
  return DateTime.now()
    .setZone("Australia/Sydney")
    .toFormat("HH:mm");
}

const runScheduledLogic = async () => {
  const nowStr = getLocalTimeStr();

  logger.info(`Checking users with callTime == ${nowStr}`);

  const usersRef = db.collection("users");
  const snapshot = await usersRef.where("callTime", "==", nowStr).get();

  if (snapshot.empty) {
    logger.info("No users scheduled for call at this time.");
    return;
  }

  snapshot.forEach((doc) => {
    const user = doc.data();
    logger.info(`Triggering API call for user ${doc.id} with callTime ${user.callTime}`);

    // Filler API call - replace with real call logic
    console.log(`🔥 API call triggered for user ${doc.id}`);
  });
};

exports.testScheduledHandler = onRequest(async (req, res) => {
  try {
    await runScheduledLogic();
    res.send("✅ Scheduled logic executed.");
  } catch (err) {
    logger.error("Error running scheduled logic:", err);
    res.status(500).send("❌ Error running scheduled logic.");
  }
});

exports.scheduledHandler = onSchedule("every 1 minutes", async (event) => {
  await runScheduledLogic();
});
