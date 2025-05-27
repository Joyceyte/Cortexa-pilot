import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const LogsPage = () => {
  const user = auth.currentUser;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      const userLogsRef = collection(db, "users", user.uid, "logs");
      const snapshot = await getDocs(userLogsRef);
      const logsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      logsData.sort((a, b) => new Date(b.callDate) - new Date(a.callDate));
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
        <p className="text-sm text-gray-500 mt-1">
          Reflecting on your days, one entry at a time
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
                {log.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(log.callDate).toLocaleDateString("en-AU", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                at{" "}
                {new Date(log.callDate).toLocaleTimeString("en-AU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <p className="text-sm text-gray-300 line-clamp-3 mb-4">
              {log.transcript?.slice(0, 200)}...
            </p>

            {log.summary && (
              <div className="bg-gray-800 border border-gray-700 rounded-md p-3">
                <p className="text-xs text-gray-400 mb-1">Summary</p>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {log.summary}
                </p>
              </div>
            )}

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
              When you start talking, we’ll start saving.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
