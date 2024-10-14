// firebase/service.js
import { getDatabase, ref, remove } from "firebase/database";

export const deleteExpenseFromFirebase = async (expenseId, userId) => {
  const db = getDatabase();
  const expenseRef = ref(db, `users/${userId}/expenses/${expenseId}`);
  await remove(expenseRef); // This deletes the expense from Firebase
};
