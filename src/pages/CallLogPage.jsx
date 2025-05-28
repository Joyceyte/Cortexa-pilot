import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { openai } from "../api/openai";

const LogsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wait for Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch logs and generate titleLine if missing
  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;

      const userLogsRef = collection(db, "users", user.uid, "logs");
      const snapshot = await getDocs(userLogsRef);

      const logsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const logId = docSnap.id;

          // Convert "18 May 2025 at 04:15 pm" → Date
          const cleanDateStr = data.callDate.replace(" at", "");
          const parsedCallDate = new Date(cleanDateStr);

          const formattedDate = parsedCallDate.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
          });

          if (data.titleLine) {
            return {
              id: logId,
              ...data,
              parsedCallDate,
            };
          }

          // Generate summary from transcript
          const prompt = `Summarize the following conversation into a single short phrase less than 10 words that could work as a logbook title. Use natural, emotionally intelligent language. Do not include any punctuation like periods or quotes.

Transcript:
"""
${data.transcript}
"""`;

          try {
            const aiRes = await openai(prompt);
            const summary = aiRes.trim();
            const titleLine = `${formattedDate}: ${summary}`;

            // Save to Firestore
            const ref = doc(db, "users", user.uid, "logs", logId);
            await updateDoc(ref, {
              summary,
              titleLine,
            });

            return {
              id: logId,
              ...data,
              summary,
              titleLine,
              parsedCallDate,
            };
          } catch (err) {
            console.error("🔥 Failed to generate summary:", err);
            return {
              id: logId,
              ...data,
              parsedCallDate,
            };
          }
        })
      );

      // Sort by date (newest first)
      logsData.sort((a, b) => b.parsedCallDate - a.parsedCallDate);
      setLogs(logsData);
      setLoading(false);
    };

    fetchLogs();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 px-4 py-8">
      <header className="mb-10 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-semibold text-orange-300">Your Journal</h1>
        <p className="text-sm text-gray-500 pt-4">
          Reflecting on your days, one entry at a time.
        </p>
        <p className="text-sm text-gray-500 pt-2">
          Your latest call may take up to 2 minutes to upload.
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-6 mb-24">
        {logs.map((log) => (
          <Link
            to={`/logs/${log.id}`}
            key={log.id}
            className="block border border-gray-800 bg-gray-900 rounded-lg p-5 transition-colors"
          >
            <div className="mb-3">
              <h3 className="text-lg font-medium text-orange-200">
                {log.titleLine}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {log.parsedCallDate.toLocaleDateString("en-AU", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                at{" "}
                {log.parsedCallDate.toLocaleTimeString("en-AU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <p className="text-sm text-gray-300 line-clamp-3 mb-4">
              {log.transcript?.slice(0, 200)}...
            </p>

            <div className="mt-4 text-sm text-orange-400 flex items-center gap-2">
              View full entry
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No journal entries yet</p>
            <p className="text-sm mt-2">
              When you start talking, we'll start saving.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
