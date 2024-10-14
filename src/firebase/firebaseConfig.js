// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCJO9u-HG5gCwa0lMC5rRj8FJAWczn1dfM",
  authDomain: "expense-tracker-2ae8c.firebaseapp.com",
  projectId: "expense-tracker-2ae8c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getDatabase(app); // Ensure the app is passed here

export { auth, db };
