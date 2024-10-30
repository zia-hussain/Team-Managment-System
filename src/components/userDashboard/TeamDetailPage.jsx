import React, { useEffect, useState } from "react";
import { getDatabase, off, onValue, update, ref } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { auth } from "../../firebase/firebaseConfig";
import { logout } from "../../redux/features/authSlice";
import { toggleDarkMode } from "../../redux/features/themeSlice";
import LogoutModal from "../Modals/LogoutModal";
import DarkModeToggle from "@mui/icons-material/Brightness4";
import LightModeToggle from "@mui/icons-material/Brightness7";

export default function Component() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teamId } = useParams();
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const darkMode = useSelector((state) => state.theme.darkMode);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const teamRef = ref(db, `teams/${teamId}`);

    onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const membersArray = Object.keys(data.members || {}).map(
          (memberId) => ({
            id: memberId,
            ...data.members[memberId],
          })
        );
        setTeamDetails({ ...data, members: membersArray });
      } else {
        setTeamDetails(null);
      }
      setLoading(false);
    });

    return () => {
      off(teamRef);
    };
  }, [teamId]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAnswerSubmit = () => {
    const currentUserId = auth.currentUser?.uid;
    if (!answer || selectedQuestionIndex === null || !currentUserId) {
      toast.error("Please fill in the answer and select a valid question!");
      return;
    }

    const db = getDatabase();
    const memberAnswersRef = ref(
      db,
      `teams/${teamId}/members/${currentUserId}/answers`
    );

    update(memberAnswersRef, {
      [selectedQuestionIndex]: { answer, timestamp: Date.now() },
    })
      .then(() => {
        toast.success("Answer submitted successfully!");
        setAnswer("");
        handleClose();
      })
      .catch((error) => {
        toast.error("Failed to submit answer. Please try again!");
      });
  };

  const handleBackClick = () => navigate(-1);
  const handleToggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    dispatch(logout());
    setShowLogoutModal(false);
  };

  const cancelLogout = () => setShowLogoutModal(false);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="spinner"></div>
      </div>
    );
  }

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

        <div className="flex lg:justify-end justify-between items-center w-full">
          <div className="cursor-pointer" onClick={handleToggleTheme}>
            {darkMode ? <LightModeToggle /> : <DarkModeToggle />}
          </div>

          <button
            className={`ml-4 px-3 py-2 font-semibold rounded ${
              darkMode
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        className={`w-full max-w-4xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-2xl shadow-lg overflow-hidden mt-8`}
      >
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-indigo-400">
              {teamDetails.name}
            </h1>
            <p className="text-2xl text-gray-400">
              Type: {teamDetails.category}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Team Members</h2>
            <ul className="grid grid-cols-2 gap-4">
              {teamDetails.members.map((member, index) => (
                <li
                  key={member.id}
                  className={`p-4 rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-gray-100"
                      : "bg-gray-100 text-gray-900"
                  } text-xl`}
                >
                  {index + 1} - {member.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Questions</h2>
            <ul className="space-y-4">
              {teamDetails.questions.map((question, index) => (
                <li
                  key={index}
                  className={`p-4 rounded-lg flex items-center justify-between ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <span className="text-xl font-semibold">
                    Q{index + 1}: {question}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedQuestionIndex(index);
                      handleOpen();
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      darkMode
                        ? "bg-white text-gray-900"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    Answer
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div
            className={`p-6 w-full max-w-md rounded-lg ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
            }`}
          >
            <h2 className="text-2xl font-semibold mb-4">Answer Question</h2>
            <textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className={`w-full min-h-[150px] rounded-lg p-2 focus:ring-2 ${
                darkMode
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-900"
              }`}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleClose}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  darkMode
                    ? "text-gray-100 border border-gray-100"
                    : "text-gray-900 border border-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAnswerSubmit}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  darkMode
                    ? "bg-gray-100 text-gray-900"
                    : "bg-gray-700 text-white"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
    </div>
  );
}
