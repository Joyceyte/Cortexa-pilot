import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const LogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const logRef = doc(db, "users", user.uid, "logs", id);
      const logSnap = await getDoc(logRef);
      if (logSnap.exists()) {
        setLog(logSnap.data());
      }
      setLoading(false);
    };

    fetchLog();
  }, [id]);

  if (loading)
    return (
      <div className="text-white mt-10 text-center">Loading...</div>
    );
  if (!log)
    return (
      <div className="text-red-400 mt-10 text-center">Log not found</div>
    );

  // Clean up transcript spacing
  const cleanedTranscript = log.transcript
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n\n");

  return (
    <div className="w-screen min-h-screen p-8 bg-gradient-to-br from-gray-900 to-black text-white font-serif flex flex-col max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate("/logs")}
        className="mb-6 self-start text-fuchsia-400 hover:text-orange-400 transition-colors font-semibold flex items-center gap-1"
      >
        ← Back
      </button>

      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-orange-500 tracking-wide">
          {log.title}
        </h1>
        <p className="text-gray-400 mt-3 italic tracking-wide">
          Your personal Cortexa journal entry
        </p>
      </header>

      <main
        className="flex-1 overflow-y-auto bg-gray-900 border border-fuchsia-800 rounded-lg p-8 shadow-lg leading-relaxed text-gray-300 text-lg whitespace-pre-wrap"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {cleanedTranscript}
      </main>

      {/* Add some padding below main so scroll shows bottom nicely */}
      <div className="h-10" />
    </div>
  );
};

export default LogDetailPage;
