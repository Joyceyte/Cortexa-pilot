import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [users, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

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
    <div className="w-full min-h-screen p-8 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex flex-col items-center justify-center text-white font-sans">
      <div className="w-full flex flex-col items-center justify-center p-4 pt-12">
        <div className="w-full flex justify-center mb-8">
          <img
            src="/cortexalogo.png"
            alt="Cortexa Logo"
            className="w-48 h-48"
          />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-orange-200">
          Welcome to Cortexa
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-center md:text-left text-orange-100 opacity-90">
          An interactive AI voice journal
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center space-x-3 bg-white text-gray-800 font-medium py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group w-64 mx-auto mt-8"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
            alt="Google logo"
            className="w-5 h-5"
            keywords="google, logo, sign in"
          />
          <span className="group-hover:text-purple-800 transition-colors duration-300">
            Sign in with Google
          </span>
          {/* Next: "Add more sign-in options like Apple, Facebook" */}
        </button>
      </div>

      <div className="w-full flex justify-center items-center mt-12">
        <div className="relative w-[280px] h-[280px] bg-gradient-to-tr from-purple-600 to-purple-900 rounded-full flex items-center justify-center shadow-2xl">
          <div className="absolute inset-4 rounded-full bg-indigo-950 flex items-center justify-center">
            <div className="relative w-3/4 h-3/4">
              <div className="absolute h-full w-full rounded-full bg-purple-700 opacity-20 animate-ping"></div>
              <img
                src="/src/assets/cortexalogo.png"
                alt="Cortexa Logo"
                className="w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-orange-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 1a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1z" />
                  <path d="M9.17 3.17a1 1 0 0 1 0 1.42L7.76 6a1 1 0 1 1-1.42-1.42l1.42-1.41a1 1 0 0 1 1.41 0zM1 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H2a1 1 0 0 1-1-1z" />
                  <path d="M3.17 14.83a1 1 0 0 1 1.42 0l1.41 1.42a1 1 0 0 1-1.42 1.41l-1.41-1.41a1 1 0 0 1 0-1.42zM12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1z" />
                  <path d="M14.83 16.83a1 1 0 0 1 0 1.42l-1.42 1.41a1 1 0 1 1-1.41-1.41l1.41-1.42a1 1 0 0 1 1.42 0zM19 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1z" />
                  <path d="M16.83 9.17a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 1 1-1.41 1.42l-1.42-1.42a1 1 0 0 1 0-1.41z" />
                  <circle cx="12" cy="12" r="6" fill="#fbbf24" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Next: "Add floating voice wave animation" */}
      </div>
    </div>
  );
}
