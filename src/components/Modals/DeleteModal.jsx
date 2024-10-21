// import React from "react";

// const DeleteModal = ({ onClose, onConfirm, teamName }) => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//       <div className="bg-gray-700 rounded-lg p-6 w-1/3">
//         <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
//         <p>Are you sure you want to delete {teamName}?</p>
//         <div className="flex justify-between mt-4">
//           <button
//             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//             onClick={onConfirm}
//           >
//             Delete
//           </button>
//           <button
//             className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
//             onClick={() => {
//               alert("hello");
//               console.log("Closing modal..."); // Debugging log
//               onClose(); // This should be updating the state
//               console.log("Modal closed."); // Check if this line executes
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeleteModal;
