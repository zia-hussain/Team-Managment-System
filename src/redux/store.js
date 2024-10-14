// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice"; // Import the auth slice reducer
import { thunk } from "redux-thunk"; // Import thunk

const store = configureStore({
  reducer: {
    auth: authReducer, // Add auth reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk), // Add thunk middleware
});

export default store;
