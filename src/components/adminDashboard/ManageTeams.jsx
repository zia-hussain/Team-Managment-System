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

const ManageTeams = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users);
  const [teamName, setTeamName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [questions, setQuestions] = useState([{ id: Date.now(), text: "" }]);
  const [darkMode, setDarkMode] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-5 hide-scrollbar overflow-hidden">
      <div className="flex items-center justify-between w-full">
        <button
          className="hidden lg:flex items-center text-blue-400 hover:text-blue-600 transition duration-200"
          onClick={handleBackClick}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>

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
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
        Create Teams
      </h1>

      <p className="mt-2 text-gray-400 mb-8 text-center">
        Create and manage your teams below.
      </p>

      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-lg ">
        <h2 className="text-4xl font-bold mb-6">Create a New Team</h2>

        {/* Team Category Selection */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-300">
            Select Team Category
          </label>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            displayEmpty
            className="w-full bg-gray-700 !text-gray-300 !rounded-lg"
            inputProps={{ "aria-label": "Select Team Category" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "#374151",
                  color: "#FFFFFF",
                },
              },
            }}
            sx={{
              "& .MuiSelect-icon": {
                color: "#9CA3AF", // Change color here
              },
            }}
          >
            <MenuItem value="" disabled selected>
              Choose a category...
            </MenuItem>
            {categories.map((category, index) => (
              <MenuItem
                key={index}
                value={category}
                sx={{
                  "&:hover": {
                    backgroundColor: "#4b5563", // Hover background color
                  },
                  color: "#FFFFFF", // Optional: Text color
                }}
              >
                {category}
              </MenuItem>
            ))}
          </Select>
        </div>

        {/* Team Name Input */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-300">Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="w-full p-4 bg-gray-700 rounded-lg text-white placeholder-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* User Filter Input */}
        <div className="mb-6 relative">
          <label className="block mb-2 text-gray-300 text-sm font-medium">
            Add Members
          </label>
          <div className="relative">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter users by name"
              className="w-full p-4 pr-10 bg-gray-700 rounded-lg text-white placeholder-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User List */}
          {filter && (
            <ul className="absolute mt-2 bg-gray-800 rounded-lg max-h-60 w-full overflow-y-auto border border-gray-700 shadow-lg z-10">
              {users
                .filter((user) =>
                  user.name.toLowerCase().includes(filter.toLowerCase())
                )
                .slice(0, 15) // Limit displayed users to 15 for better UX
                .map((user) => (
                  <li
                    key={user.id}
                    className={`flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-700 ${
                      selectedUsers.includes(user.id) ? "bg-gray-600" : ""
                    } transition duration-200`}
                    onClick={() => handleUserSelection(user.id)}
                  >
                    {highlightText(user.name, filter)}{" "}
                    {/* Highlight matching text */}
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

        {/* Questions Input Section */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-300">Questions</label>
          {questions.map((question) => (
            <div key={question.id} className="flex items-center mb-3">
              <input
                type="text"
                value={question.text}
                onChange={(e) =>
                  handleQuestionChange(question.id, e.target.value)
                }
                placeholder="Enter your question"
                className="flex-1 p-3 border border-gray-400 rounded mr-2 bg-gray-700 text-white placeholder-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveQuestion(question.id)}
                className="bg-red-500 p-3 rounded hover:bg-red-600 transition duration-200"
              >
                <FontAwesomeIcon width={20} icon={faTrash} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="bg-blue-500 w-full p-3 rounded hover:bg-blue-600 transition duration-200"
          >
            <FontAwesomeIcon width={20} icon={faPlus} />
            <span className="ml-2">Add Question</span>
          </button>
        </div>

        <button
          onClick={handleCreateTeam}
          className="w-full p-4 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors duration-300"
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
