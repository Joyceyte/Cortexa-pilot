import { useEffect, useState } from "react";
import { openai } from "../api/openai";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function LogSummary({ logId, transcript }) {
  const [summary, setSummary] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Wait for auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch/generate/save summary
  useEffect(() => {
    const fetchSummary = async () => {
      if (!user || !logId || !transcript) return;

      const logRef = doc(db, "users", user.uid, "logs", logId);
      const logSnap = await getDoc(logRef);
      if (!logSnap.exists()) return;

      const firestoreSummary = logSnap.data().summary?.trim();

      if (firestoreSummary) {
        // Always sync local state with Firestore
        setSummary(firestoreSummary);
        setLoading(false);
        return;
      }

      // No summary saved → generate one
      const prompt = `Summarize the following conversation into a single short phrase less than 10 words that could work as a logbook title. Use natural, emotionally intelligent language. Do not include any punctuation like periods or quotes.

Transcript:
"""
${transcript}
"""`;

      try {
        const aiRes = await openai(prompt);
        const newSummary = aiRes.trim();

        // Save to Firestore
        await updateDoc(logRef, { summary: newSummary });

        // Always re-fetch to make sure
        const updatedSnap = await getDoc(logRef);
        const confirmed = updatedSnap.data().summary?.trim();
        setSummary(confirmed || newSummary);
      } catch (err) {
        console.error("🔥 Error generating/saving summary:", err);
      }

      setLoading(false);
    };

    fetchSummary();
  }, [user, logId, transcript]);

  if (loading) return null;
  return summary || null;
}
