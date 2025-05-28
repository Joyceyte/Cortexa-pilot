import { useEffect, useState } from "react";
import { openai } from "../api/openai";
import LoadingSpinner from "./LoadingSpinner";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const reflectionQuestions = [
  "How can I make my daily life easier and nicer for myself?",
  "What (which thoughts, beliefs and patterns) can I let go of?",
  "What do I want less of in my life? And where might more come from?",
  "What gave me energy over the past day? And what took my energy away?",
  "What do I want to learn?",
  "Am I spending my time the way I want to spend it?",
  "What is holding me back from living the life I want to live?",
  "In what areas am I underestimating myself?",
  "What were my greatest moments this day?",
  "What is missing in my life and how can I get that?",
  "What mistakes have I made? What have I learned from them?",
  "How will I approach things differently next day?",
  "What is important to me in life? Am I organising my life accordingly?",
  "What is the best advice I’ve received?",
  "What would I say to the version of myself from a day ago?",
  "What have I achieved this day?",
  "What obstacles did you face? What have you done to tackle them?",
  "What am I worried about?",
  "What’s most important to me in my life? What am I doing about that?",
  "What do I want to do differently?",
  "When was the last time I stepped out of my comfort zone?",
  "What advice would I give someone younger?",
  "What's one thing that made you smile or gave you energy?",
  "When I’m not feeling well or in pain, what’s the best way to look after myself?",
  "Have I achieved my goals? Why/why not?",
  "What do I want to take from today into tomorrow?",
  "How can you make tomorrow a better or nicer day?",
  "What is the first step you want to take tomorrow?",
];

export default function FollowUpQuestion({
  transcript: propTranscript,
  logId,
}) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateOrFetchFollowUp = async () => {
      if (!propTranscript || !logId) return;
      setLoading(true);

      const user = auth.currentUser;
      if (!user) return;

      const logRef = doc(db, "users", user.uid, "logs", logId);
      const logSnap = await getDoc(logRef);

      if (!logSnap.exists()) {
        console.error("Log not found.");
        setLoading(false);
        return;
      }

      const logData = logSnap.data();

      if (logData.followUpQuestion) {
        setQuestion(logData.followUpQuestion);
        setLoading(false);
        return;
      }

      const prompt = `You are a helpful assistant generating a reflection question based on a transcript.

Instructions:
- Unless the transcript is clearly a system message or auto-generated (e.g. "voicemail detection"), ALWAYS begin your response with a single sentence that shows understanding of what the user expressed. This should sound natural and supportive — like something a person would say to show they were listening. Example: "That sounds like a moment of calm in your day."
- Then, follow up with one single reflection question, reworded gently from the list below.
- If the transcript is system-generated, empty, or only includes text like "voicemail detection", skip the first sentence and just output the reworded question.
- Never include any greetings,labels, headers, or quotes.
- Output exactly 1–2 short sentences.

Transcript:
"""
${propTranscript}
"""

Pick one question to reword:

${reflectionQuestions.map((q) => `- ${q}`).join("\n")}`;

      try {
        const followUpRes = await openai(prompt);
        const cleaned = followUpRes.trim();
        setQuestion(cleaned);

        // ✅ Save result to Firestore
        await updateDoc(logRef, { followUpQuestion: cleaned });
      } catch (err) {
        console.error("Error generating follow-up:", err);
        setQuestion(
          "Sorry, we couldn't generate a reflection question this time."
        );
      }

      setLoading(false);
    };

    generateOrFetchFollowUp();
  }, [propTranscript, logId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-black p-5 shadow-md">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 h-full w-1 bg-fuchsia-500 opacity-50 blur-sm" />

      {/* Content */}
      <p className="text-sm font-semibold text-fuchsia-400 mb-2 tracking-wide">
        Today’s reflection prompt
      </p>
      <p className="text-base italic leading-relaxed text-gray-100">
        {question}
      </p>
    </div>
  );
}
