import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_zEBzQjgQNtwy2QnwGEaggLGWxOFEUAM",
  authDomain: "janubar-dd03b.firebaseapp.com",
  projectId: "janubar-dd03b",
  storageBucket: "janubar-dd03b.firebasestorage.app",
  messagingSenderId: "372756948515",
  appId: "1:372756948515:web:2f9e1db0b1059752d2b396",
  measurementId: "G-5JXYMF4HXM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, analytics, auth, storage, db }; 