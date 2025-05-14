import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Import db instead of firestore
import { onAuthStateChanged } from "firebase/auth"; // Import auth hook
import { doc, setDoc, getDoc } from "firebase/firestore"; // Firestore methods to set data

const ProfilePage = () => {
  const [user, setUser] = useState(null); // State to hold user data
  const [phone, setPhone] = useState("");
  const [callTime, setCallTime] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Listen to auth state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set the authenticated user to state
      } else {
        setUser(null); // If user logs out, set to null
      }
      setLoading(false); // Set loading to false once the auth state is determined
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setPhone(data.phone || "");
          setCallTime(data.callTime || "");
          setIsFormSubmitted(true);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          phone,
          callTime,
          uid: user.uid,
        });
        console.log("Saved to Firestore for user:", user.uid);
        setSuccessMsg("Details updated!");
        setTimeout(() => {
          setSuccessMsg("");
          setIsEditing(false);
          setIsFormSubmitted(true);
        }, 2000);
      } catch (error) {
        console.error("Error saving data to Firestore:", error);
      }
    } else {
      console.log("No user logged in");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Welcome {user?.displayName || "User"}
      </h1>
      {successMsg && (
        <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>
      )}
      {!isFormSubmitted || isEditing ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            {isEditing
              ? "Edit your details below."
              : "Please note that you can only submit this once."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Time for Call
              </label>
              <select
                required
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md"
              >
                <option value="">Select a time</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              {isEditing ? "Update Details" : "Schedule Call"}
            </button>
          </form>
          {isEditing && (
            <button
              type="button"
              className="w-full mt-2 bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          )}
        </>
      ) : (
        <div className="text-lg text-green-500">
          <p>You've already submitted your details!</p>
          <p>Phone: {phone}</p>
          <p>Call Time: {callTime}</p>
          <button
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            onClick={() => setIsEditing(true)}
          >
            Edit Details
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
