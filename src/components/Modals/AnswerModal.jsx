const AnswerModal = ({ member, onClose, questions }) => {
  // Log each answer for debugging
  console.log("Member Answers: ", member.answers);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {member.name}'s Answers
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
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

        {/* Answer Content */}
        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((question, index) => {
              const userAnswer = member?.answers?.find(
                (answer) => answer.questionId === question.id
              );
              return (
                <div key={index}>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {`Q-${index + 1} `}
                    {question} {/* Assuming question has a text property */}
                  </p>
                  {userAnswer ? (
                    <p className="text-gray-600 dark:text-gray-400">
                      {userAnswer.answer} {/* Displaying the user's answer */}
                    </p>
                  ) : (
                    <p className="text-red-500">
                      This person didn't respond to this question.
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No questions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerModal;
