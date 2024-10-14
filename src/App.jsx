import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import store from "./redux/store"; // Adjust the path if necessary
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
import PrivateRoute from "./components/PrivateRoute"; // Adjust the path if necessary
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
        </Routes>
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
  );
};

export default App;
