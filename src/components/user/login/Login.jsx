import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import LoginImg from "../../../assets/images/2.jpg";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { auth, db } from "../../../firebase/firebaseConfig";
import { get, child, ref } from "firebase/database"; // Import necessary functions from Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/features/authSlice";

// Validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required")
    .matches(/^\S*$/, "Email cannot contain spaces"),
  password: Yup.string()
    .required("Password is required")
    .matches(/^\S*$/, "Password cannot contain spaces")
    .min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Authenticate the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Get the user ID
      const userId = userCredential.user.uid;

      // Fetch user data from the Realtime Database
      const userSnapshot = await get(child(ref(db), `users/${userId}`));

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const currentUserEmail = userCredential.user.email;

        // Dispatch login success with role
        dispatch(loginSuccess({ ...userCredential, role: userData.role }));

        // Store email and role in localStorage if needed
        localStorage.setItem("currentUser", currentUserEmail);
        localStorage.setItem("currentUserRole", userData.role); // Optional: store role in local storage

        // Navigate based on role
        if (userData.role === "admin") {
          navigate("/admin"); // Redirect to Admin Dashboard
        } else {
          navigate("/"); // Redirect to User Dashboard
        }
      } else {
        toast.error("User data not found in database.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials."); // Show error toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 select-none">
      <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left side - Form */}
        <div className="bg-gray-800 p-8 sm:p-12 flex items-center justify-center h-full relative">
          <div className="w-full max-w-xl relative z-30">
            <h2 className="text-3xl font-extrabold text-white">
              Login to your Account
              <span className="text-blue-500 pl-1">.</span>
            </h2>
            <p className="mt-4 text-gray-400">
              Not have an account?{" "}
              <Link to="/signup" className="text-blue-500">
                Sign Up
              </Link>
            </p>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6 mt-8">
                  <div>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-md bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="relative">
                    <Field
                      type={visible ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-md bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                    />
                    {visible ? (
                      <AiOutlineEye
                        className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors duration-200"
                        size={25}
                        onClick={() => setVisible(false)}
                      />
                    ) : (
                      <AiOutlineEyeInvisible
                        className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors duration-200"
                        size={25}
                        onClick={() => setVisible(true)}
                      />
                    )}
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#fff] bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(to left, rgba(17, 22, 29, 1) 0%, rgba(28, 37, 50, 1) 50%, rgba(0, 0, 0, 0) 100%)",
            }}
          ></div>
        </div>

        {/* Right side - Background image */}
        <div
          className="hidden lg:block bg-cover bg-center relative"
          style={{
            backgroundImage: `url("${LoginImg}")`,
            height: "100%",
            width: "100%",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(17, 22, 29, 1) 3%, rgba(0, 0, 0, 0) 100%)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
