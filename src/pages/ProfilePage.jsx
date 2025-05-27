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
import { signOut } from "firebase/auth";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [callTime, setCallTime] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [takenTimes, setTakenTimes] = useState([]);
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const avatarUrl = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(
    user?.displayName || "Cortexa"
  )}&emotion[]=happy`;
  const affirmations = [
    "You can hold joy and uncertainty at the same time.",
    "You’re allowed to feel good without needing a reason.",
    "Today doesn’t need to be perfect to be meaningful.",
    "Small wins are still wins. Let them count.",
    "Let your energy be what it is today.",
    "You’re allowed to take up space, even when things are calm.",
    "Not every moment needs fixing. Some just need noticing.",
    "You can move forward without rushing.",
    "Clarity takes time. Let it come on its own terms.",
    "Be proud of how far you’ve come.",
    "Some days will be soft. Let this be one if it is.",
  ];
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    const random =
      affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(random);
  }, []);

  const fetchTakenTimes = async () => {
    const querySnapshot = await getDocs(collection(db, "takenCallTimes"));
    const usedTimes = querySnapshot.docs.map((doc) => doc.id);
    setTakenTimes(usedTimes);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/"; // or use navigate("/login") if using React Router
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

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
    const formattedTime = `${hour}:${minute} ${period}`;
    if (!formattedTime) return alert("Pick a time first!");

    // Validate phone number format
    if (phone.length !== 12) {
      // +61 + 9 digits = 12 characters
      alert("Please enter a valid 9-digit number following +61");
      return;
    }

    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const timeSlotDocRef = doc(db, "takenCallTimes", formattedTime);

        const userSnap = await getDoc(userDocRef);
        const oldCallTime = userSnap.exists() ? userSnap.data().callTime : null;

        if (formattedTime === oldCallTime) {
          await setDoc(userDocRef, {
            phone,
            callTime: formattedTime,
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
          alert("That time slot is already taken. Please pick another.");
          return;
        }

        if (oldCallTime && oldCallTime !== formattedTime) {
          const oldTimeSlotDocRef = doc(db, "takenCallTimes", oldCallTime);
          await deleteDoc(oldTimeSlotDocRef);
        }

        await setDoc(userDocRef, {
          phone,
          callTime: formattedTime,
          uid: user.uid,
        });

        await setDoc(timeSlotDocRef, {
          uid: user.uid,
          timestamp: new Date(),
        });

        await fetchTakenTimes();
        setCallTime(formattedTime);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400 px-4">
        <div className="text-center space-y-2">
          {/*
          <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto" />{" "}
          */}
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 px-4 py-10 mb-8">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-gray-700"
          />

          <h1 className="text-2xl font-semibold text-orange-300">
            Hi, {user?.displayName || "there"}
          </h1>
          <p className="text-lg text-gray-400">
            {!isFormSubmitted || isEditing
              ? "Please enter your details"
              : "How are you really feeling today?"}
          </p>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">Today’s affirmation</p>
          <blockquote className="mt-2 text-base italic text-gray-300 max-w-md mx-auto leading-relaxed border-l-4 border-orange-400 pl-4">
            {affirmation}
          </blockquote>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="p-3 bg-green-800/30 border border-green-700 text-green-300 rounded text-sm text-center">
            {successMsg}
          </div>
        )}

        {/* Editable Form */}
        {!isFormSubmitted || isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <label className="block">
              <span className="text-sm text-gray-400 mb-1 block">
                Phone number
              </span>
              <div className="flex items-center bg-gray-900 border border-gray-700 rounded px-4 py-2">
                <span className="text-white">+61</span>
                <input
                  type="tel"
                  value={phone.replace("+61", "")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    if (value.length <= 9) {
                      setPhone("+61" + value);
                    }
                  }}
                  className="bg-transparent flex-1 ml-2 text-white placeholder-gray-500 focus:outline-none"
                  placeholder="Enter 9 digits"
                  maxLength={9}
                  required
                />
              </div>
            </label>

            {/* Call Time Selection */}
            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Select call time
              </label>
              <div className="flex gap-4">
                {[
                  { label: "Hour", val: hour, setter: setHour, range: 12 },
                  {
                    label: "Minute",
                    val: minute,
                    setter: setMinute,
                    options: ["00", "15", "30", "45"],
                  },
                  {
                    label: "Period",
                    val: period,
                    setter: setPeriod,
                    options: ["AM", "PM"],
                  },
                ].map(({ label, val, setter, range, options }, i) => (
                  <div key={label} className="relative w-1/3">
                    <select
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded appearance-none"
                    >
                      {(
                        options || [...Array(range)].map((_, i) => `${i + 1}`)
                      ).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-2.5 pointer-events-none text-gray-500">
                      ▼
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Taken Times */}
            {takenTimes.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-1">Taken slots:</p>
                <div className="flex flex-wrap gap-2">
                  {takenTimes.map((time) => (
                    <span
                      key={time}
                      className="text-xs bg-gray-800 border border-gray-700 px-2 py-1 rounded"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-md bg-orange-400 text-gray-950 font-semibold hover:bg-orange-500 transition-colors"
            >
              {isEditing ? "Update Details" : "Schedule Call"}
            </button>

            {/* Cancel Edit */}
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full py-3 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm"
              >
                Cancel
              </button>
            )}
          </form>
        ) : (
          // Read-Only View
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-orange-300 mb-4">
                Your Current Setup
              </h2>

              <div className="space-y-3 text-gray-300 text-base">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Phone</span>
                  <span className="font-medium">{phone}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-400">Daily Call Time</span>
                  <span className="font-medium">{callTime}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-gray-400 hover:text-orange-400 underline underline-offset-2 transition-colors"
            >
              Edit details
            </button>
            <div className="flex justify-center pt-6 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-orange-400 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
