import {
  getDatabase,
  off,
  onValue,
  push,
  ref,
  set,
  update,
} from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addAnswer } from "../../redux/actions/action";
import { useDispatch } from "react-redux";
import { auth } from "../../firebase/firebaseConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Component() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teamId } = useParams();
  const [teamDetails, setTeamDetails] = useState(null);
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [memberIndex, setMemberIndex] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const teamRef = ref(db, `teams/${teamId}`);

    onValue(teamRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        // Convert members to an array
        const membersArray = Object.keys(data.members || {}).map(
          (memberId) => ({
            id: memberId,
            ...data.members[memberId],
          })
        );
        setTeamDetails({ ...data, members: membersArray });
      } else {
        setTeamDetails(null); // Handle case where no team data is found
      }
    });

    return () => {
      off(teamRef); // Cleanup listener
    };
  }, [teamId]);

  console.log("Team Details:", teamDetails);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAnswerSubmit = () => {
    const currentUserId = auth.currentUser.uid; // Get current user's ID

    // Debugging logs
    console.log("Answer:", answer);
    console.log("Selected Question Index:", selectedQuestionIndex);
    console.log("Member ID (current user):", currentUserId);

    // Ensure answer, question, and member are selected
    if (!answer || selectedQuestionIndex === null || !currentUserId) {
      toast.error("Please fill in the answer and select a valid question!");
      return;
    }

    const db = getDatabase();

    const memberAnswersRef = ref(
      db,
      `teams/${teamId}/members/${currentUserId}/answers`
    );

    const answerData = {
      [selectedQuestionIndex]: {
        answer: answer,
        timestamp: Date.now(),
      },
    };

    update(memberAnswersRef, answerData)
      .then(() => {
        toast.success("Answer submitted successfully!");
        setAnswer("");
        handleClose();
      })
      .catch((error) => {
        toast.error("Failed to submit answer. Please try again!");
        console.error("Error submitting answer:", error);
      });
  };

  if (!teamDetails) return <div className="loading">Loading...</div>;

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center">
      <button
        className="absolute left-10 top-10 flex items-center text-blue-400 hover:text-blue-600 transition duration-200"
        onClick={handleBackClick}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back
      </button>
      <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
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
            <h2 className="text-3xl font-semibold flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Team Members
            </h2>
            <ul className="grid grid-cols-2 gap-4">
              {teamDetails.members.map((member, index) => (
                <li
                  key={member.id}
                  className="bg-gray-700 rounded-lg p-4 text-xl"
                >
                  {index + 1}
                  {"-"} {member.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-semibold flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Questions
            </h2>
            <ul className="space-y-4">
              {teamDetails.questions.map((question, index) => (
                <li
                  key={index}
                  className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <span className="text-xl">
                    <span className="text-indigo-400 font-semibold mr-2">
                      Q{index + 1}:
                    </span>
                    {question}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedQuestionIndex(index);
                      setMemberId(memberId); // Assuming `member` object contains `id`
                      setMemberIndex(
                        teamDetails.members.findIndex((m) => m.id === memberId)
                      );
                      handleOpen();
                    }}
                    className="ml-4 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
                  >
                    Answer
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Answer Question</h2>
            <div className="mb-4 max-h-[60vh] overflow-auto">
              <textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full min-h-[150px] bg-gray-700 text-gray-100 border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-white text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAnswerSubmit}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
