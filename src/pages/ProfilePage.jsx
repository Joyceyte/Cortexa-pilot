import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  deleteDoc,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";

function generateTimeSlots(startHour, endHour) {
  const times = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? "PM" : "AM";

    // Helper to format with leading zero
    const pad = (num) => num.toString().padStart(2, "0");

    // Push full hour
    times.push({
      value: `${pad(hour)}:00`, // 24h format for backend
      label: `${pad(displayHour)}:00 ${ampm}`, // AM/PM for frontend
    });

    // Push half hour except for last hour
    if (hour !== endHour) {
      times.push({
        value: `${pad(hour)}:30`,
        label: `${pad(displayHour)}:30 ${ampm}`,
      });
    }
  }

  return times;
}
const timeSlots = generateTimeSlots(0, 24);

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [callTime, setCallTime] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [takenTimes, setTakenTimes] = useState([]);

  // 1. Move fetchTakenTimes outside of useEffect so it can be called anytime
  const fetchTakenTimes = async () => {
    const querySnapshot = await getDocs(collection(db, "takenCallTimes"));
    const usedTimes = querySnapshot.docs.map((doc) => doc.id);
    setTakenTimes(usedTimes);
  };

  // 2. Call fetchTakenTimes once on mount to load initial data
  useEffect(() => {
    fetchTakenTimes();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      else setUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
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
    if (!callTime) return alert("Pick a time first!");

    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const timeSlotDocRef = doc(db, "takenCallTimes", callTime);

        const userSnap = await getDoc(userDocRef);
        const oldCallTime = userSnap.exists() ? userSnap.data().callTime : null;

        if (callTime === oldCallTime) {
          await setDoc(userDocRef, {
            phone,
            callTime,
            uid: user.uid,
          });
          setSuccessMsg("Details updated!");
          setTimeout(() => {
            setSuccessMsg("");
            setIsEditing(false);
            setIsFormSubmitted(true);
          }, 2000);
          return;
        }

        const timeSlotSnap = await getDoc(timeSlotDocRef);
        if (timeSlotSnap.exists()) {
          alert("That new call time is already taken. Please pick another.");
          return;
        }

        if (oldCallTime && oldCallTime !== callTime) {
          const oldTimeSlotDocRef = doc(db, "takenCallTimes", oldCallTime);
          await deleteDoc(oldTimeSlotDocRef);
        }

        await setDoc(userDocRef, {
          phone,
          callTime,
          uid: user.uid,
        });

        await setDoc(timeSlotDocRef, {
          uid: user.uid,
          timestamp: new Date(),
        });

        // 3. THIS IS THE KEY: refresh taken times so UI updates immediately
        await fetchTakenTimes();

        setSuccessMsg("Details updated!");
        setTimeout(() => {
          setSuccessMsg("");
          setIsEditing(false);
          setIsFormSubmitted(true);
        }, 2000);
      } catch (error) {
        console.error("Error saving data to Firestore:", error);
        alert("Something went wrong. Try again.");
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-serif p-6">
        <h1 className="text-3xl font-bold tracking-wide">Loading...</h1>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-serif p-8 flex flex-col max-w-lg mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-orange-500 tracking-wide">
        Welcome {user?.displayName || "User"}
      </h1>

      {successMsg && (
        <div className="mb-6 p-3 bg-green-900 bg-opacity-60 rounded font-semibold text-green-400 tracking-wide shadow-sm">
          {successMsg}
        </div>
      )}

      {!isFormSubmitted || isEditing ? (
        <>
          <p className="mb-6 text-gray-400 italic tracking-wide">
            {isEditing
              ? "Edit your details below."
              : "Please note that you can only submit this once."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-fuchsia-400 mb-2 tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 border border-fuchsia-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-fuchsia-400 mb-2 tracking-wide">
                Select Time for Call
              </label>
              <select
                required
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md text-black"
              >
                <option value="">Select a time</option>
                {timeSlots.map(({ value, label }) => (
                  <option
                    key={value}
                    value={value}
                    disabled={takenTimes.includes(value)}
                  >
                    {label} {takenTimes.includes(value) ? " (Unavailable)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-fuchsia-600 to-orange-500 hover:from-orange-500 hover:to-fuchsia-600 transition-colors text-white font-semibold py-3 rounded-lg shadow-lg"
            >
              {isEditing ? "Update Details" : "Schedule Call"}
            </button>
          </form>

          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg shadow-inner transition"
            >
              Cancel
            </button>
          )}
        </>
      ) : (
        <div className="text-gray-300 tracking-wide text-lg space-y-3">
          <p>You've already submitted your details!</p>
          <p>
            <span className="font-semibold text-fuchsia-400">Phone:</span>{" "}
            {phone}
          </p>
          <p>
            <span className="font-semibold text-fuchsia-400">Call Time:</span>{" "}
            {callTime}
          </p>
          <button
            className="mt-6 w-full bg-gradient-to-r from-fuchsia-600 to-orange-500 hover:from-orange-500 hover:to-fuchsia-600 transition-colors text-white font-semibold py-3 rounded-lg shadow-lg"
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
