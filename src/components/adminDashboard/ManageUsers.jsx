import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTeams,
  fetchTeamMembers,
  deleteMember,
  deleteTeam,
} from "../../redux/actions/action";
import DarkModeToggle from "@mui/icons-material/Brightness4";
import LightModeToggle from "@mui/icons-material/Brightness7";
import DetailModal from "../Modals/DetailModal";
import { get, getDatabase, ref, remove, set } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";
import LogoutModal from "../Modals/LogoutModal";
import { logout } from "../../redux/features/authSlice";
import { toggleDarkMode } from "../../redux/features/themeSlice";

const ManageUsers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const [memberNames, setMemberNames] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState("");
  const darkMode = useSelector((state) => state.theme.darkMode);
  console.log("Dark Mode", darkMode);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch user name by userId
  const fetchUserName = async (userId) => {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return userData.name || "No Name";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    return "Error fetching name";
  };

  // Fetch all teams on component mount
  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  // Fetch member names when teams are loaded
  useEffect(() => {
    const fetchMemberNames = async () => {
      const newMemberNames = {};
      for (let team of teams) {
        if (team.members && team.members.length > 0) {
          const names = await Promise.all(
            team.members.map(async (memberId) => {
              const name = await fetchUserName(memberId);
              return { id: memberId, name };
            })
          );
          newMemberNames[team.id] = names;
        }
      }
      setMemberNames(newMemberNames); // Store member names
    };

    if (teams.length > 0) {
      fetchMemberNames();
    }
  }, [teams]);

  // Handle opening the details modal for a team
  const handleOpen = (team) => {
    setSelectedTeam(team);
    dispatch(fetchTeamMembers(team.id)); // Fetch team members
    setOpen(true);
  };

  // Handle closing the modal
  const handleClose = () => {
    setOpen(false);
    setSelectedTeam(null);
  };

  // Handle delete user or team
  const handleDeleteUser = async (teamId, memberId) => {
    const db = getDatabase();
    const memberRef = ref(db, `teams/${teamId}/members/${memberId}`); // Directly point to the member's reference

    try {
      // Remove the member from Firebase
      await remove(memberRef);
      console.log("Member deleted successfully");

      // Update UI by filtering out the deleted member
      setSelectedTeam((prevTeam) => {
        const updatedMembers = { ...prevTeam.members }; // Create a shallow copy
        delete updatedMembers[memberId]; // Remove the member by ID
        return {
          ...prevTeam,
          members: updatedMembers, // Update members in the state
        };
      });
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  // Handle deleting a team
  const handleDeleteTeam = (teamId) => {
    setItemToDelete(`Team ${teamId}`);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete.startsWith("Team")) {
      const teamId = itemToDelete.split(" ")[1];
      dispatch(deleteTeam(teamId));
    }
    setShowDeleteModal(false);
    handleClose();
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleToggleTheme = () => {
    dispatch(toggleDarkMode());
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

  return (
    <div
      className={`min-h-screen flex flex-col items-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } p-5`}
    >
      <div className="flex items-center justify-between w-full">
        <button
          className={`hidden lg:flex items-center ${
            darkMode
              ? "text-blue-400 hover:text-blue-600"
              : "text-blue-600 hover:text-blue-800"
          } transition duration-200`}
          onClick={handleBackClick}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>

        <div className="flex lg:justify-end justify-between items-center w-full float-end">
          <div className="cursor-pointer" onClick={handleToggleTheme}>
            {darkMode ? <LightModeToggle /> : <DarkModeToggle />}
          </div>

          <button
            className={`ml-4 px-3 py-2 font-semibold rounded text-white ${
              darkMode
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <h1 className="mt-4 lg:mt-0 text-5xl font-extrabold mb-2 bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
        Manage Teams & Users
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {loading ? (
          <>
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className={`${
                  darkMode ? "bg-gray-800" : "bg-gray-200"
                } rounded-lg p-6 shadow-lg`}
              >
                <Skeleton variant="text" width="80%" height={40} />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={30}
                  className="mt-2"
                />
                <Skeleton variant="rectangular" height={40} className="mt-4" />
              </div>
            ))}
          </>
        ) : teams.length === 0 ? (
          <div
            className={`h-[50vh] flex items-center justify-center ${
              darkMode ? "bg-gray-900" : "bg-gray-100"
            }`}
          >
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-gray-200"
              } rounded-lg p-6 shadow-lg w-full max-w-md flex flex-col items-center mx-auto`}
            >
              <h2
                className={`text-2xl font-bold text-center ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No Teams Available
              </h2>
              <p
                className={`mt-2 text-center ${
                  darkMode ? "text-gray-500" : "text-gray-700"
                }`}
              >
                Please create a new team to get started.
              </p>
            </div>
          </div>
        ) : (
          teams.map((team) => {
            const memberCount = team.members
              ? Object.keys(team.members).length
              : 0;
            return (
              <div
                key={team.id}
                className={`rounded-lg p-6 shadow-lg transition cursor-pointer ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => handleOpen(team)}
              >
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {team.name}
                </h2>
                <p
                  className={`mt-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Members: {memberCount}
                </p>
                <button
                  className={`mt-4 p-2 rounded-lg transition-colors w-full ${
                    darkMode
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-red-400 hover:bg-red-500 text-black"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTeam(team.id);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete Team
                </button>
              </div>
            );
          })
        )}
      </div>

      {showDeleteModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center ${
            darkMode ? "bg-black bg-opacity-50" : "bg-gray-500 bg-opacity-30"
          } z-50`}
        >
          <div
            className={`${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            } rounded-lg p-6 w-1/3`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              Confirm Deletion
            </h2>
            <p className={darkMode ? "text-white" : "text-black"}>
              Are you sure you want to delete?
            </p>
            <div className="flex justify-between mt-4">
              <button
                className={`px-4 py-2 rounded ${
                  darkMode
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-red-400 hover:bg-red-500 text-black"
                }`}
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  darkMode
                    ? "bg-gray-300 hover:bg-gray-400 text-black"
                    : "bg-gray-400 hover:bg-gray-500 text-white"
                }`}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <DetailModal
          selectedTeam={selectedTeam}
          onCancel={handleClose}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {showLogoutModal && (
        <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
    </div>
  );
};

export default ManageUsers;
