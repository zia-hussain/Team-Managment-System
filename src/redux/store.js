// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice"; // Import the auth slice reducer
import { thunk } from "redux-thunk"; // Import thunk
import userReducer from "./features/userSlice";
import teamsReducer from "./teamsReducer";
import themeSlice from "./features/themeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer, // Add auth reducer
    users: userReducer,
    teams: teamsReducer,
    theme: themeSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk), // Add thunk middleware
});

export default store;
