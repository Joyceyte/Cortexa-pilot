import { onSchedule } from 'firebase-functions/v2/scheduler'; // Use v2 scheduler
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fetch from 'node-fetch';
import * as logger from 'firebase-functions/logger';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Firebase Admin SDK
initializeApp();  // Default initialization

// Initialize Firestore
const db = getFirestore();

// Cloud function that runs every 5 minutes
export const checkAndTriggerCalls = onSchedule(
  {
    schedule: '0,5,10,15,20,25,30,35,40,45,50,55 * * * *',
  // Set schedule (Cron format)
    timeZone: 'Australia/Sydney', // Set timezone
  },
  async () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Get time in HH:mm format

    // Query Firestore to find users whose callTime matches the current time
    const snapshot = await db.collection('users')
      .where('callTime', '==', currentTime)
      .get();

    logger.info(`Checking users for callTime == ${currentTime}`);

    // Get API key and pathway ID from Firebase environment config
    const apiKey = process.env.BLANDY_API_URL;
    const pathwayId = process.env.BLANDY_PATHWAY_ID;
    const twillioKey = process.env.BLANDY_TWILLIO_ENCRYPTED_KEY;
    // Loop through matching users and trigger calls
    snapshot.forEach(async (doc) => {
      const { phone } = doc.data();
      if (!phone) return;

      const options = {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
          encrypted_key: twillioKey,
        },
        body: JSON.stringify({
          phone_number: phone,
          pathway_id: pathwayId,
        }),
      };

      try {
        const res = await fetch('https://api.bland.ai/v1/calls', options);
        if (res.ok) {
          logger.info(`Successfully triggered call for ${phone}`);
        } else {
          logger.error(`Failed to trigger call for ${phone}, status: ${res.status}`);
        }
      } catch (err) {
        logger.error(`Error triggering call for ${phone}:`, err);
      }
    });
  }
);
