import React, { useState } from "react";
import { useSelector } from "react-redux"; // Import useSelector
import AnswerModal from "./AnswerModal";

const DetailModal = ({ title, selectedTeam, onCancel, onDeleteUser }) => {
  const [selectedMember, setSelectedMember] = useState(null);

  // Retrieve questions specific to the selected team
  const questions = selectedTeam.questions || []; // Access questions directly from the selected team

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 ease-in-out border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">
            {title || "Team Members"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          {selectedTeam.members &&
          Object.keys(selectedTeam.members).length > 0 ? (
            Object.entries(selectedTeam.members).map(([id, memberData]) => (
              <div
                key={id}
                className="flex justify-between items-center p-4 bg-gray-800 rounded-lg shadow transition-transform transform"
              >
                <span className="text-lg font-semibold text-gray-300">
                  {memberData.name}
                </span>
                <div className="space-x-2">
                  <button
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition-colors duration-200"
                    onClick={() => setSelectedMember({ id, ...memberData })}
                  >
                    View Answers
                  </button>
                  <button
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-500 transition-colors duration-200"
                    onClick={() => {
                      if (selectedTeam && id) {
                        onDeleteUser(selectedTeam.id, id);
                      } else {
                        console.error("Invalid team or member data", {
                          selectedTeam,
                          id,
                        });
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No members found.</p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 transform"
        >
          Close
        </button>
      </div>

      {/* Display Answer Modal when a member is selected */}
      {selectedMember && (
        <AnswerModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          questions={questions} // Pass questions specific to the selected team
        />
      )}
    </div>
  );
};

export default DetailModal;
