import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const functions = getFunctions(app);

// Connect to Firebase Emulators if running locally
if (window.location.hostname === "localhost") {
  // Firestore Emulator
  connectFirestoreEmulator(db, "localhost", 8080);  // Adjust the port if necessary
  
  // Authentication Emulator
  connectAuthEmulator(auth, "http://localhost:9099");  // Authentication emulator port
  
  // Functions Emulator
  connectFunctionsEmulator(functions, "localhost", 5001);  // Functions emulator port
}

export { auth, db, provider, functions };
