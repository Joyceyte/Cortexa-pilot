import { useEffect, useState } from "react";
import { db, auth } from "../firebase"; // Make sure auth is exported from your firebase.js
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

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
      setLogs(logsData);
      setLoading(false);
    };

    fetchLogs();
  }, [user]);

  if (loading)
    return <div className="text-center text-white mt-10">Loading logs...</div>;

  return (
    <div id="webcrumbs">
      <div className="w-full flex justify-center">
        <div className="w-full flex justify-center">
          <div className="w-screen h-screen p-6 bg-gradient-to-br from-gray-900 to-black text-white font-sans">
            <header className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-orange-500">
                Conversation Logs
              </h1>
              <p className="text-gray-300 mt-2">
                Access and review your past conversations with Cortexa
              </p>
            </header>

            {logs.map((log) => (
              <Link
                to={`/logs/${log.id}`}
                key={log.id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-fuchsia-800 shadow-lg transform transition-all duration-300 hover:scale-102 hover:shadow-fuchsia-700/30 hover:border-fuchsia-600 cursor-pointer group block"
              >
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 transition-colors">
                    {log.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {log.transcript?.slice(0, 100)}...
                  </p>
                </div>
                <div className="bg-gray-900 p-4 flex justify-between items-center">
                  <button className="ml-auto text-fuchsia-400 hover:text-orange-400 transition-colors text-xl">
                    →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
