import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import SignupImg from "../../assets/images/signup shop img.jpg";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Adjust path accordingly
import { getDatabase, ref, set } from "firebase/database";
import { db } from "../../firebase/firebaseConfig"; // Ensure you import Realtime Database
import { toast } from "react-toastify";

const ShopCreate = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();
    const form = event.target;

    const values = {
      name: form.name.value,
      email: form.email.value,
      password: form.password.value,
      confirmPassword: form.confirmPassword.value,
      salary: form.salary.value, // Get the salary value
    };

    if (values.password !== values.confirmPassword) {
      setError("Passwords must match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      console.log("User created:", userCredential.user);

      // Save the user name and salary in Realtime Database
      const userId = userCredential.user.uid;
      await set(ref(db, `users/${userId}`), {
        name: values.name,
        email: values.email,
        salary: values.salary, // Save salary in the database
      });

      console.log(`User data saved for UID: ${userId}`);
      toast.success("Signup successful! Welcome!");

      navigate("/");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Signup failed. Please check your details.");
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 select-none">
      <div className="max-w-7xl w-full h-screen grid grid-cols-1 lg:grid-cols-2 overflow-auto">
        {/* Left side - Image */}
        <div
          className="hidden lg:block bg-cover bg-center relative"
          style={{
            backgroundImage: `url("${SignupImg}")`,
            height: "100%",
            width: "100%",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to left, rgba(17, 22, 29, 1) 3%, rgba(0, 0, 0, 0) 100%)",
            }}
          ></div>
        </div>

        {/* Right side - Form */}
        <div className="bg-gray-800 p-8 sm:p-12 flex items-center justify-center h-full relative">
          <div className="w-full max-w-md relative z-30">
            <h2 className="text-3xl font-extrabold text-white">
              Create Your Account
              <span className="text-blue-500 pl-1">.</span>
            </h2>
            <p className="mt-4 text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500">
                Sign In
              </Link>
            </p>

            <form className="space-y-6 mt-8" onSubmit={handleSignup}>
              {/* Name Field */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-md bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-md bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <input
                  type="number"
                  name="salary"
                  placeholder="Monthly Salary"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-md bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-md bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-3 top-3 cursor-pointer text-gray-400"
                    size={25}
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-3 top-3 cursor-pointer text-gray-400"
                    size={25}
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <input
                  type={visibleConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-md bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Error Message */}
              {error && <div className="text-red-500 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(to right, rgba(17, 22, 29, 1) 0%, rgba(28, 37, 50, 1) 100%)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ShopCreate;
