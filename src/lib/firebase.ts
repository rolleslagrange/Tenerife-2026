import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
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
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
const auth = getAuth(app);

// Sign in anonymously to ensure users share the same data without login
signInAnonymously(auth).catch((error) => {
  console.error("Error signing in anonymously: ", error);
});

export { db, auth };
