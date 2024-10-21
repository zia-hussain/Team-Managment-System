// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice"; // Import the auth slice reducer
import { thunk } from "redux-thunk"; // Import thunk
import userReducer from "./features/userSlice";
import teamsReducer from "./teamsReducer";

const store = configureStore({
  reducer: {
    auth: authReducer, // Add auth reducer
    users: userReducer,
    teams: teamsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk), // Add thunk middleware
});

export default store;
