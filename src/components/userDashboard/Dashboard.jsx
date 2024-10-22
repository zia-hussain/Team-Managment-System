import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/authSlice";
import { ref, getDatabase, onValue } from "firebase/database";
import { auth } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import LogoutModal from "../Modals/LogoutModal";
import AddIcon from "@mui/icons-material/Add";
import DarkModeToggle from "@mui/icons-material/Brightness4";
import LightModeToggle from "@mui/icons-material/Brightness7";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";
import { Tooltip } from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [teams, setTeams] = useState([]);

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

  const fetchUsername = async (userId) => {
    const userNameRef = ref(getDatabase(), `users/${userId}/name`);
    onValue(userNameRef, (snapshot) => {
      const userData = snapshot.val();
      setUsername(userData || "Guest");
      setLoading(false);
    });
  };

  const fetchUserTeams = async (userId) => {
    const userTeamsRef = ref(getDatabase(), `teams`);
    onValue(userTeamsRef, (snapshot) => {
      const teamsData = snapshot.val() || {}; // Fetch all teams from the DB
      const userTeams = Object.keys(teamsData)
        .filter((teamId) => {
          const team = teamsData[teamId];
          const members = team.members;

          // Check if members exist and if userId is part of the team
          if (Array.isArray(members)) {
            // If members is an array, use includes
            return members.includes(userId);
          } else if (typeof members === "object" && members !== null) {
            // If members is an object, use hasOwnProperty
            return members.hasOwnProperty(userId);
          }
          return false;
        })
        .map((teamId) => ({
          id: teamId,
          ...teamsData[teamId],
        }));

      setTeams(userTeams); // Set the fetched teams for the UI
      setLoading(false); // Set loading to false once teams are fetched
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUsername(user.uid);
        fetchUserTeams(user.uid);
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
        <h1 className="text-2xl font-bold flex items-center">
          Welcome,{" "}
          {loading ? (
            <Skeleton
              variant="text"
              width={100}
              height={50}
              style={{
                display: "inline-block",
                backgroundColor: "rgba(107, 114, 128, 0.3)",
                marginLeft: "5px",
                marginRight: "2px",
              }}
            />
          ) : (
            username
          )}
          !
        </h1>

        <div className="flex items-center">
          <div className="cursor-pointer" onClick={toggleTheme}>
            {darkMode ? <LightModeToggle /> : <DarkModeToggle />}
          </div>

          <button
            className="ml-4 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Create Team Card */}
        <div
          className={`rounded-lg shadow-lg p-5 flex flex-col items-center justify-center transition-transform transform ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-400"
              : "bg-white border-gray-300 text-gray-600"
          }`}
          style={{ borderWidth: "1px" }}
        >
          <AddIcon
            style={{ fontSize: 50, color: darkMode ? "#3B82F6" : "#2563EB" }}
          />
          <h2
            className={`mt-2 text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Create Team
          </h2>
          <p className="text-center">Start a new team and become the leader!</p>
          <Link
            to={"/create-teams"}
            className={`mt-4 px-4 py-2 ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } rounded flex items-center`}
          >
            Create Team
          </Link>
        </div>

        {/* Skeleton Loaders for Team Cards */}
        {loading
          ? [1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-5 flex flex-col transition-transform transform"
              >
                <Skeleton
                  variant="text"
                  height={40}
                  width="60%"
                  style={{
                    backgroundColor: "rgba(107, 114, 128, 0.1)",
                  }}
                />
                <Skeleton
                  variant="text"
                  height={20}
                  width="50%"
                  style={{
                    backgroundColor: "rgba(107, 114, 128, 0.1)",
                  }}
                />
                <Skeleton
                  variant="text"
                  height={60}
                  width="80%"
                  style={{
                    backgroundColor: "rgba(107, 114, 128, 0.1)",
                  }}
                />
              </div>
            ))
          : // Team Cards after loading
            teams.map((team) => (
              <Tooltip key={team.id} title={team.name} arrow>
                <div
                  title={team.name}
                  className={`rounded-lg shadow-lg p-5 flex flex-col transition-transform transform cursor-pointer border-l-4 backdrop-blur-lg ${
                    darkMode
                      ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-600 border-l-blue-600"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 border-l-blue-500"
                  }`}
                  onClick={() => navigate(`/teams/${team.id}`)} // Use backticks for dynamic path
                >
                  {/* Team Name */}
                  <h2
                    className={`mt-2 text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {team.name}
                  </h2>

                  {/* Team Category */}
                  <p
                    className={`text-md font-medium mb-2 ${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    Type: {team.category || "Unspecified"}
                  </p>

                  {/* Members Count */}
                  <p
                    className={`text-end text-7xl font-bold ${
                      darkMode ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {team.members.length}
                  </p>
                </div>
              </Tooltip>
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
