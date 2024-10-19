import React from "react";

const DetailModal = ({ title, selectedItem, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 ease-in-out scale-95 hover:scale-100 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {title || "Item Details"}
          </h2>
          <button
            onClick={onCancel}
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

        {/* Content */}
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Amount
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                Rs: {selectedItem.amount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Date
                </p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {new Date(selectedItem.date).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Category
                </p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {selectedItem.category}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Notes
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-200">
                {selectedItem.notes || "No additional notes available."}
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-105"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DetailModal;
