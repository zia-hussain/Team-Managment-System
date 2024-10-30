import React, { useState } from "react";
import AnswerModal from "./AnswerModal";

const DetailModal = ({
  title,
  selectedTeam,
  onCancel,
  onDeleteUser,
  theme,
}) => {
  const [selectedMember, setSelectedMember] = useState(null);
  console.log(theme, "Theme");

  // Retrieve questions specific to the selected team
  const questions = selectedTeam.questions || []; // Access questions directly from the selected team

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div
        className={`rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 ease-in-out border ${
          theme
            ? "bg-gray-900 border-gray-800 text-gray-100"
            : "bg-white border-gray-300 text-gray-800"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title || "Team Members"}</h2>
          <button
            onClick={onCancel}
            className={`hover:text-red-500 transition-colors duration-200 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
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
                className={`flex justify-between items-center p-4 rounded shadow transition-transform transform ${
                  theme
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <span className="text-lg font-semibold">{memberData.name}</span>
                <div className="space-x-2">
                  <button
                    className={`p-2 rounded transition-colors duration-200 ${
                      theme
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-blue-700 hover:bg-blue-600 text-white"
                    }`}
                    onClick={() => setSelectedMember({ id, ...memberData })}
                  >
                    View Answers
                  </button>
                  <button
                    className={`p-2 rounded transition-colors duration-200 ${
                      theme
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
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
            <p className={theme ? "text-gray-400" : "text-gray-500"}>
              No members found.
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onCancel}
          className={`mt-8 w-full font-bold py-3 px-4 rounded-md transition-colors duration-200 transform ${
            theme
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-blue-700 hover:bg-blue-600 text-white"
          }`}
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
