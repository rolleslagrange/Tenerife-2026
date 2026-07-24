import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD9UOnvyEqph6m7SVmPdfiCOMjrBjJ6vBc",
  authDomain: "tenerife-7f7d1.firebaseapp.com",
  projectId: "tenerife-7f7d1",
  storageBucket: "tenerife-7f7d1.firebasestorage.app",
  messagingSenderId: "692471504608",
  appId: "1:692471504608:web:dd7a1f09e9100a64443a85"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
  } else if (err.code == 'unimplemented') {
    console.warn("The current browser does not support all of the features required to enable persistence");
  }
});

// Sign in anonymously to ensure users share the same data without login
signInAnonymously(auth).catch((error) => {
  console.error("Error signing in anonymously: ", error);
});

export { db, auth };
