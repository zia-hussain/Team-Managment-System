import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/authSlice";
import { ref, getDatabase, onValue } from "firebase/database"; // Import Firebase functions
import { auth } from "../../firebase/firebaseConfig"; // Import your firebase config
import { onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState(""); // State to hold the username
  const [loading, setLoading] = useState(true); // State to track loading

  const handleLogout = () => {
    dispatch(logout());
  };

  // Fetch the username from Firebase
  const fetchUsername = async (userId) => {
    const userNameRef = ref(getDatabase(), `users/${userId}/name`);
    onValue(userNameRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setUsername(userData); // Directly set the username as it points to the name field
      } else {
        setUsername("Guest"); // Default to 'Guest' if no user data is found
      }
      setLoading(false); // Set loading to false after data is fetched
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUsername(user.uid); // Fetch the username based on user ID
      } else {
        console.error("No user is currently logged in");
        setLoading(false); // Stop loading if no user is logged in
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className=" p-5 h-screen w-full bg-[#1F2937] text-white">
      <div className="">
        <h1>Dashboard</h1>
        <p>
          {/* Display loading state or fetched username */}
          {loading
            ? "Loading..."
            : `Welcome, ${username} yeh dashboard tumhara hai, HEHE!`}
        </p>
        <button
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-5
      rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
