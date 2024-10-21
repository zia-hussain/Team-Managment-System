import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/authSlice";
import { ref, getDatabase, onValue } from "firebase/database"; // Import Firebase functions
import { auth } from "../../firebase/firebaseConfig"; // Import your firebase config
import { onAuthStateChanged } from "firebase/auth";
import LogoutModal from "../Modals/LogoutModal"; // Import the LogoutModal component
import AddIcon from "@mui/icons-material/Add"; // For Create Team icon
import DarkModeToggle from "@mui/icons-material/Brightness4"; // Icon for dark mode
import LightModeToggle from "@mui/icons-material/Brightness7"; // Icon for light mode
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState(""); // State to hold the username
  const [loading, setLoading] = useState(true); // State to track loading
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State to control modal visibility
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [teams, setTeams] = useState([]); // State to hold the user's teams
  console.log(teams, "teams");

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

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
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

  // Fetch teams the user is a member of
  const fetchUserTeams = async (userId) => {
    const userTeamsRef = ref(getDatabase(), `/teams`);
    onValue(userTeamsRef, (snapshot) => {
      const teamsData = snapshot.val() || {};
      const teamList = Object.keys(teamsData).map((key) => ({
        id: key,
        ...teamsData[key],
      }));
      setTeams(teamList);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUsername(user.uid);
        fetchUserTeams(user.uid); // Fetch the user's teams
      } else {
        console.error("No user is currently logged in");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className={`p-5 min-h-screen w-full ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      } transition duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="cursor-pointer" onClick={toggleTheme}>
            {darkMode ? <LightModeToggle /> : <DarkModeToggle />}
          </div>
          <h1 className="ml-3 text-2xl font-bold">
            Welcome, {loading ? "Loading..." : username}!
          </h1>
        </div>
        <button
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Create Team Card */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center transition-transform transform hover:scale-105">
          <AddIcon style={{ fontSize: 50, color: "#3B82F6" }} />
          <h2 className="mt-2 text-lg font-semibold">Create Team</h2>
          <p className="text-center text-gray-400">
            Start a new team and become the leader!
          </p>
          <Link
            to={"/manage-teams"}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Create Team
          </Link>
        </div>

        {/* Team Cards */}
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-5 flex flex-col transition-transform transform hover:scale-105 cursor-pointer border-l-4 border-blue-600 backdrop-blur-lg"
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            {/* Team Name */}
            <h2 className="mt-2 text-3xl font-bold text-white">{team.name}</h2>

            {/* Team Type */}
            <p className="text-md text-blue-300 font-medium mb-2">
              Type: {team.category || "Unspecified"}
            </p>

            {/* Members Count */}
            <p className="text-end text-7xl font-bold text-gray-700">
              {team.members.length}
            </p>
          </div>
        ))}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
    </div>
  );
};

export default Dashboard;
