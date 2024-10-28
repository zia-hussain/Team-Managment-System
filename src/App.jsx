import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import store from "./redux/store"; // Adjust the path if necessary
import Dashboard from "./components/userDashboard/Dashboard";
import Login from "./components/user/login/Login";
import Signup from "./components/user/signup/Signup";
import PrivateRoute from "./components/PrivateRoute"; // Adjust the path if necessary
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications
import AdminDashboard from "./components/adminDashboard/Dashboard";
import ManageTeams from "./components/adminDashboard/ManageTeams";
import ManageUsers from "./components/adminDashboard/ManageUsers";
import TeamDetailPage from "./components/userDashboard/TeamDetailPage";
import "./App.css";

const App = () => {
  return (
    <div className="hide-scrollbar">
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/teams/:teamId" element={<TeamDetailPage />} />

            {/* Private routes need to be wrapped with <Route> */}
            <Route
              path="/"
              element={
                <PrivateRoute element={<Dashboard />} requiredRole="user" />
              }
            />

            {/* Admin-specific route */}
            <Route
              path="/admin"
              element={
                <PrivateRoute
                  element={<AdminDashboard />}
                  requiredRole="admin"
                />
              }
            />
            <Route path="/create-teams" element={<ManageTeams />} />
            <Route path="/manage-users" element={<ManageUsers />} />
          </Routes>

          {/* Toast container for notifications */}
          <ToastContainer
            position="top-right" // Adjust position as needed
            autoClose={5000} // Duration in milliseconds
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="dark" // Adjust to match your theme
          />
        </BrowserRouter>
      </Provider>
    </div>
  );
};

export default App;
