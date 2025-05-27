import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) navigate("/profile");
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/profile");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert("Failed to sign in with Google.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-10 text-center border border-gray-800 rounded-xl bg-gray-900 px-6 py-10 shadow-lg">
        <img
          src="/cortexalogo.png"
          alt="Cortexa Logo"
          className="w-20 h-20 mx-auto rounded-full border border-gray-700"
        />

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-orange-300">
            Welcome to Cortexa
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your private AI voice journal. Soft check-ins. Real reflections.
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border border-gray-700 bg-gray-800 hover:bg-gray-700 text-sm text-gray-200 font-medium py-3 rounded-lg transition-colors"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
            alt="Google"
            className="w-4 h-4"
          />
          <span>Sign in with Google</span>
        </button>
      </div>

      <p className="mt-10 text-xs text-gray-500">
        Your voice. Your pace. Private by default.
      </p>
    </div>
  );
}
