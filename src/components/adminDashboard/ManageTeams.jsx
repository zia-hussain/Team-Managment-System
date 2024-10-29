import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { ref, onValue, set, getDatabase } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import { selectUsers, fetchUsers } from "../../redux/features/userSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import DarkModeToggle from "@mui/icons-material/Brightness4";
import LightModeToggle from "@mui/icons-material/Brightness7";
import { useNavigate } from "react-router-dom";
import { fetchUserName } from "../../redux/actions/action";
import { toast } from "react-toastify";
import LogoutModal from "../Modals/LogoutModal";
import { logout } from "../../redux/features/authSlice";
import { MenuItem, Select } from "@mui/material";
import { toggleDarkMode } from "../../redux/features/themeSlice";
import { dark } from "@mui/material/styles/createPalette";

const ManageTeams = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users);
  const [teamName, setTeamName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [questions, setQuestions] = useState([{ id: Date.now(), text: "" }]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const darkMode = useSelector((state) => state.theme.darkMode);

  const handleToggleTheme = () => {
    dispatch(toggleDarkMode());
  };
  const categories = ["Marketing", "Sales", "Development", "Design"];

  useEffect(() => {
    const fetchUser = async () => {
      const usersRef = ref(db, "users");
      onValue(usersRef, (snapshot) => {
        const usersList = [];
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          if (userData.role === "user") {
            usersList.push({ id: childSnapshot.key, ...userData });
          }
        });
        console.log("test run 1");
        dispatch(fetchUsers())
          .then((res) => {
            console.log(res, "res @!@");
          })
          .catch((err) => {
            console.log(err, "err @!@");
          });
        dispatch(selectUsers(usersList));
      });
    };

    fetchUser();
  }, [dispatch]);

  const handleCreateTeam = async () => {
    // Validate inputs
    if (
      !teamName ||
      !selectedCategory ||
      selectedUsers.length === 0 ||
      questions.some((q) => q.text.trim() === "")
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const db = getDatabase();
    const newTeamRef = ref(db, "teams/" + Date.now());

    try {
      // Fetch user names for selected users
      const memberDetails = await Promise.all(
        selectedUsers.map(async (userId) => {
          const name = await fetchUserName(userId); // Fetch user name by ID
          return { id: userId, name }; // Create an object with id and name
        })
      );

      // Create a members object where each key is the user's id
      const members = memberDetails.reduce((acc, member) => {
        acc[member.id] = { name: member.name, answers: {} }; // Add empty answers object for each member
        return acc;
      }, {});

      // Set new team data to Firebase
      await set(newTeamRef, {
        name: teamName,
        category: selectedCategory,
        members, // Store each member's details under their actual id
        questions: questions.map((q) => q.text), // Store the questions
      });

      // Show success message
      toast.success("Team has been successfully added!");

      // Reset form fields
      resetFormFields();
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Something went wrong. Please try again!");
    }
  };

  // Function to reset form fields
  const resetFormFields = () => {
    setTeamName("");
    setSelectedCategory("");
    setSelectedUsers([]);
    setFilter("");
    setQuestions([{ id: Date.now(), text: "" }]);
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleQuestionChange = (id, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text: value } : q))
    );
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, { id: Date.now(), text: "" }]);
  };

  const handleRemoveQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const highlightText = (text, search) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={index} className="font-bold text-blue-400 inline">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
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
      className={`min-h-screen w-full flex flex-col items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      } p-5 hide-scrollbar overflow-hidden`}
    >
      <div className="flex items-center justify-between w-full">
        <button
          className={`hidden lg:flex items-center ${
            darkMode
              ? "text-blue-400 hover:text-blue-500"
              : "text-blue-600 hover:text-blue-800"
          } transition duration-200`}
          onClick={handleBackClick}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>

        <div className="flex lg:justify-end justify-between items-center w-full">
          <div className="cursor-pointer" onClick={handleToggleTheme}>
            {darkMode ? <LightModeToggle /> : <DarkModeToggle />}
          </div>

          <button
            className={`ml-4 px-3 py-2 ${
              darkMode
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-600 hover:bg-red-700"
            } text-white font-semibold rounded`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-4 mb-2 lg:mt-0">
        <h1
          className={`text-5xl font-extrabold mb-4 bg-gradient-to-r ${
            darkMode ? "from-sky-300 to-blue-500" : "from-blue-500 to-blue-700"
          } bg-clip-text text-transparent`}
        >
          Create Teams
        </h1>

        <p
          className={`${
            darkMode ? "text-gray-400" : "text-gray-600"
          } mt-2 mb-8 text-center`}
        >
          Create and manage your teams below.
        </p>
      </div>

      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded p-8 w-[95vw] md:max-w-lg shadow-lg`}
      >
        <h2 className="text-4xl font-bold mb-6">Create a New Team</h2>

        <div className="mb-6">
          <label
            className={`${
              darkMode ? "text-gray-300" : "text-gray-800"
            } block mb-2`}
          >
            Select Team Category
          </label>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            displayEmpty
            className={`w-full ${
              darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-800"
            } rounded`}
            inputProps={{ "aria-label": "Select Team Category" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: darkMode ? "#374151" : "#FFFFFF",
                  color: darkMode ? "#FFFFFF" : "#000000",
                },
              },
            }}
            sx={{
              "& .MuiSelect-icon": {
                color: darkMode ? "#9CA3AF" : "#6B7280",
              },
            }}
          >
            <MenuItem value="" disabled selected>
              <p className={`${darkMode ? "text-white" : ""}`}>
                Choose a category...
              </p>
            </MenuItem>
            {categories.map((category, index) => (
              <MenuItem
                key={index}
                value={category}
                sx={{
                  "&:hover": {
                    backgroundColor: darkMode ? "#4b5563" : "#E5E7EB",
                  },
                  color: darkMode ? "#FFFFFF" : "#000000",
                }}
              >
                {category}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div className="mb-6">
          <label
            className={`${
              darkMode ? "text-gray-300" : "text-gray-800"
            } block mb-2`}
          >
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className={`w-full p-4 ${
              darkMode
                ? "bg-gray-700 text-white placeholder-gray-400"
                : "bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-400 hover:border-gray-700 focus:border-blue-500"
            } rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 `}
          />
        </div>

        <div className="mb-6 relative">
          <label
            className={`${
              darkMode ? "text-gray-300" : "text-gray-800"
            } block mb-2`}
          >
            Add Members
          </label>
          <div className="relative">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter users by name"
              className={`w-full p-4 pr-10 ${
                darkMode
                  ? "bg-gray-700 text-white placeholder-gray-400"
                  : "bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-400 hover:border-gray-700 focus:border-blue-500"
              } rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 `}
            />
          </div>
          {filter && (
            <ul
              className={`absolute mt-2 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              } rounded max-h-60 w-full overflow-y-auto border shadow-lg z-10`}
            >
              {users
                .filter((user) =>
                  user.name.toLowerCase().includes(filter.toLowerCase())
                )
                .slice(0, 15)
                .map((user) => (
                  <li
                    key={user.id}
                    className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    } ${
                      selectedUsers.includes(user.id)
                        ? darkMode
                          ? "bg-gray-600"
                          : "bg-gray-300"
                        : ""
                    } transition duration-200`}
                    onClick={() => handleUserSelection(user.id)}
                  >
                    {highlightText(user.name, filter)}
                  </li>
                ))}
              {users.filter((user) =>
                user.name.toLowerCase().includes(filter.toLowerCase())
              ).length === 0 && (
                <li className="px-4 py-2 text-gray-400 text-center">
                  No users found
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="mb-6">
          <label
            className={`${
              darkMode ? "text-gray-300" : "text-gray-800"
            } block mb-2`}
          >
            Questions
          </label>
          {questions.map((question) => (
            <div key={question.id} className="flex items-center mb-3">
              <input
                type="text"
                value={question.text}
                onChange={(e) =>
                  handleQuestionChange(question.id, e.target.value)
                }
                placeholder="Enter your question"
                className={`flex-1 p-4 ${
                  darkMode
                    ? "bg-gray-700 text-white placeholder-gray-400"
                    : "bg-gray-100 text-gray-800 placeholder-gray-500 "
                } rounded mr-2 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 `}
              />
              <button
                type="button"
                onClick={() => handleRemoveQuestion(question.id)}
                className={`p-3 rounded ${
                  darkMode
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-red-600 hover:bg-red-700"
                } transition duration-200`}
              >
                <FontAwesomeIcon width={20} icon={faTrash} color="#fff" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className={`w-full p-3 rounded text-white ${
              darkMode
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-blue-600 hover:bg-blue-700"
            } transition duration-200`}
          >
            <FontAwesomeIcon width={20} icon={faPlus} />
            <span className="ml-2">Add Question</span>
          </button>
        </div>

        <button
          onClick={handleCreateTeam}
          className={`w-full p-4 rounded text-white font-bold text-xl ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-blue-700 hover:bg-blue-600"
          } transition-colors duration-300`}
        >
          Create Team
        </button>
      </div>

      {showLogoutModal && (
        <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
    </div>
  );
};

export default ManageTeams;
