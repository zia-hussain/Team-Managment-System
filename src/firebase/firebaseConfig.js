import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore"; // Correct import for Firestore
import { getStorage } from "firebase/storage"; // Import Storage if needed

const firebaseConfig = {
  apiKey: "AIzaSyDqERVZduLx1AW98hNEL8Ps2Nj9c3OYUBU",
  authDomain: "practice-18ee8.firebaseapp.com",
  databaseURL: "https://practice-18ee8-default-rtdb.firebaseio.com",
  projectId: "practice-18ee8",
  storageBucket: "practice-18ee8.appspot.com",
  messagingSenderId: "458044216392",
  appId: "1:458044216392:web:3ae7f3bd59923af370747d",
  measurementId: "G-Q1N2D63N8S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, db, firestore, storage, app };
