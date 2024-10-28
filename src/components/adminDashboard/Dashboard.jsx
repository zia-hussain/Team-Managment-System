import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchTeams } from "../../redux/actions/action";
import DarkModeToggle from "@mui/icons-material/Brightness4"; // Icon for dark mode
import LightModeToggle from "@mui/icons-material/Brightness7"; // Icon for light mode
import { getDatabase, onValue, ref } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import LogoutModal from "../Modals/LogoutModal";
import { logout } from "../../redux/features/authSlice";
import { toggleDarkMode } from "../../redux/features/themeSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState(""); // State to hold the username
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State to control modal visibility
  const [loading, setLoading] = useState(true); // State to track loading
  const darkMode = useSelector((state) => state.theme.darkMode);

  const handleToggleTheme = () => {
    dispatch(toggleDarkMode());
  };

  const fetchUsername = async (userId) => {
    const userNameRef = ref(getDatabase(), `users/${userId}/name`);
    onValue(userNameRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setUsername(userData);
      } else {
        setUsername("Admin");
      }
      setLoading(false);
    });
  };

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

  useEffect(() => {
    dispatch(fetchTeams(dispatch));
  }, []);
  return (
    <div
      className={`p-5 min-h-screen w-full ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      } transition duration-300`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Welcome, {loading ? "Loading..." : username}!
        </h1>

        <div className="flex items-center">
          <div className="cursor-pointer" onClick={handleToggleTheme}>
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

      <div className="grid md:grid-cols-1 gap-6 mt-20 text-center">
        <h1 className="text-4xl font-extrabold">Admin Dashboard</h1>
        <p className="mt-4 text-gray-400">
          Welcome to the admin dashboard. Here you can manage users and view
          important data.
        </p>

        {/* Admin Actions */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8`}>
          <Link
            to="/manage-users"
            className={`p-14 rounded-lg shadow-lg transition-colors duration-300 flex flex-col items-center justify-center ${
              darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <h2 className={`text-3xl font-bold`}>Manage Users</h2>
            <p
              className={`mt-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              } text-center`}
            >
              Add, remove, or update user information.
            </p>
          </Link>

          <Link
            to="/create-teams"
            className={`p-14 rounded-lg shadow-lg transition-colors duration-300 flex flex-col items-center justify-center ${
              darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <h2 className="text-3xl font-bold">Create Teams</h2>
            <p className="mt-2 text-gray-400 text-center">
              Create and manage teams and their members.
            </p>
          </Link>
        </div>
      </div>
      {showLogoutModal && (
        <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
    </div>
  );
};

export default AdminDashboard;
