//const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const { DateTime } = require("luxon");
const fetch = require("node-fetch");
require("dotenv").config(); // only needed if you're testing locally
const { FieldValue } = require("firebase-admin").firestore;


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

  snapshot.forEach(async (doc) => {
    const user = doc.data();
    const phoneNumber = user.phone;

    if (!phoneNumber) {
      logger.warn(`User ${doc.id} is missing a phone number.`);
      return;
    }

    logger.info(`📞 Triggering API call for user ${doc.id} at ${phoneNumber}`);

    const options = {
      method: "POST",
      headers: {
        authorization: process.env.BLANDY_API_AUTHORIZATION,
        "Content-Type": "application/json",
        encrypted_key: process.env.BLANDY_TWILLIO_ENCRYPTED_KEY,
        record: true
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        pathway_id: process.env.BLANDY_PATHWAY_ID,
        voice: "Public - Nat46686336-6c59-44a7-a326-278c36ebf8b3",

      }),
    };

    try {
      const response = await fetch("https://api.bland.ai/v1/calls", options);
      const result = await response.json();
      console.log('Bland POST call response:', result);
      logger.info(`✅ Bland call success for user ${doc.id}: ${JSON.stringify(result)}`);
 
     if (result.call_id) {
        // Save the pending call doc
        await db.collection("users").doc(doc.id).collection("pendingCalls").doc(result.call_id).set({
          phoneNumber,
          status: "pending",
        });
        logger.info(`📝 Saved pending call for user ${doc.id} with call_id ${result.call_id}`);
      } else {
        logger.warn(`No call_id returned for user ${doc.id}`);
      }
    } catch (err) {
      logger.error(`❌ Error calling Bland for user ${doc.id}:`, err);
    }
  });
};

exports.scheduledFetchTranscripts = onSchedule("every 2 minutes", async () => {
  try {
    const usersSnapshot = await admin.firestore().collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const pendingCallsRef = admin.firestore().collection("users").doc(userId).collection("pendingCalls");
      const pendingCallsSnapshot = await pendingCallsRef.get();

      for (const callDoc of pendingCallsSnapshot.docs) {
        const callId = callDoc.id;

        const options = {
          method: "GET",
          headers: {
            authorization: process.env.BLANDY_API_AUTHORIZATION,
          },
        };

        const response = await fetch(`https://api.bland.ai/v1/calls/${callId}`, options);

        if (!response.ok) {
          console.warn(`❌ Failed to fetch transcript for call ${callId} of user ${userId}`);
          continue;
        }

        const transcriptData = await response.json();

        if (transcriptData.concatenated_transcript?.length > 0) {
          const transcriptText = transcriptData.concatenated_transcript;

          const callDate = new Date(transcriptData.created_at).toLocaleString("en-AU", {
            timeZone: "Australia/Sydney",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          const title = `Call at ${callDate}`;

          await admin.firestore()
            .collection("users")
            .doc(userId)
            .collection("logs")
            .doc(callId)
            .set({
              transcript: transcriptText,
              title,
              callDate,
              summary: transcriptData.summary
            });

          await pendingCallsRef.doc(callId).delete();
          console.log(`✅ Saved & cleaned up call ${callId} for user ${userId}`);
        } else {
          console.log(`⏳ Transcript not ready for call ${callId}`);
        }
      }
    }

    console.log("✅ Scheduled transcript fetch complete");
  } catch (error) {
    console.error("❌ Scheduled transcript fetch failed:", error);
  }
});


/*
for emulator testing
exports.testScheduledHandler = onRequest(async (req, res) => {
  try {
    await runScheduledLogic();
    res.send("✅ Scheduled logic executed.");
  } catch (err) {
    logger.error("Error running scheduled logic:", err);
    res.status(500).send("❌ Error running scheduled logic.");
  }
});
*/ 

// Auto-trigger every minute (actual scheduled logic)


exports.scheduledHandler = onSchedule("every 1 minutes", async () => {
  await runScheduledLogic();
});


