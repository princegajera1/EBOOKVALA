import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase Configuration using verified project keys
const firebaseConfig = {
  apiKey: "AIzaSyDDNoQJeIxLTTNPpUyMMWlPf3DAyE4A6R8",
  authDomain: "ebookvala-53c0d.firebaseapp.com",
  projectId: "ebookvala-53c0d",
  storageBucket: "ebookvala-53c0d.firebasestorage.app",
  messagingSenderId: "931188621419",
  appId: "1:931188621419:web:1cf9545a8eb521071f712e",
  measurementId: "G-YSF5JQNZWY"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics (only in browser environments where supported)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics, googleProvider };
