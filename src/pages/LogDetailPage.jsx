import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import FollowUpQuestion from "../components/FollowUpQuestion";

const LogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [titleLine, setTitleLine] = useState("");

  useEffect(() => {
    const fetchLog = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const logRef = doc(db, "users", user.uid, "logs", id);
      const logSnap = await getDoc(logRef);

      if (logSnap.exists()) {
        const data = logSnap.data();
        setLog(data);
        if (data.titleLine) {
          setTitleLine(data.titleLine);
        }
      }

      setLoading(false);
    };

    fetchLog();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Loading...
      </div>
    );

  if (!log)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-500">
        Log not found
      </div>
    );

  const cleanedTranscript = log.transcript
    .replace(/\r\n|\r/g, "\n") // normalize all breaks to \n
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n\n");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 px-4 py-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6 mb-32">
        {/* Back */}
        <button
          onClick={() => navigate("/logs")}
          className="text-left text-sm text-gray-400 hover:text-orange-300 transition-colors"
        >
          ← Back
        </button>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-orange-300">
            {titleLine || "Untitled log"}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Written by you, felt by Cortexa
          </p>
        </div>

        {/* Log Body */}
        <div className="whitespace-pre-wrap text-base rounded-lg leading-relaxed text-gray-300 border border-gray-800 p-5 bg-gray-900 tracking-wide">
          {cleanedTranscript}
        </div>

        {/* Follow-up */}
        {log.transcript && id && (
          <FollowUpQuestion transcript={log.transcript} logId={id} />
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-600">
          You made it through today. That's worth logging.
        </p>
      </div>
    </div>
  );
};

export default LogDetailPage;
