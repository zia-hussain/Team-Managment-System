// // actions.js (or wherever your actions are defined)
// import { getDatabase, ref, remove } from "firebase/database";
// import { auth } from "../../firebase/firebaseConfig"; // Adjust the path as necessary

// export const deleteExpense = (expenseId) => {
//   return async (dispatch) => {
//     const userId = auth.currentUser.uid; // Get the user ID
//     try {
//       await remove(ref(getDatabase(), `users/${userId}/expenses/${expenseId}`));
//       dispatch({ type: "DELETE_EXPENSE", payload: expenseId }); // Dispatch the delete action
//     } catch (error) {
//       console.error("Error deleting expense:", error);
//       // Optionally dispatch an error action or show a toast notification
//     }
//   };
// };
