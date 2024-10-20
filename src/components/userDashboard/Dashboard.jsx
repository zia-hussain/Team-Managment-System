import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/authSlice";
import { ref, getDatabase, onValue } from "firebase/database"; // Import Firebase functions
import { auth } from "../../firebase/firebaseConfig"; // Import your firebase config
import { onAuthStateChanged } from "firebase/auth";
import LogoutModal from "../Modals/LogoutModal"; // Import the LogoutModal component

const Dashboard = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState(""); // State to hold the username
  const [loading, setLoading] = useState(true); // State to track loading
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State to control modal visibility

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Fetch the username from Firebase
  const fetchUsername = async (userId) => {
    const userNameRef = ref(getDatabase(), `users/${userId}/name`);
    onValue(userNameRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setUsername(userData);
      } else {
        setUsername("Guest");
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUsername(user.uid);
      } else {
        console.error("No user is currently logged in");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-5 h-screen w-full bg-[#1F2937] text-white">
      <div className="">
        <h1>Dashboard</h1>
        <p>
          {loading
            ? "Loading..."
            : `Welcome, ${username} yeh dashboard tumhara hi hai, HEHE!`}
        </p>
        <button
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-5 rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
    </div>
  );
};

export default Dashboard;
