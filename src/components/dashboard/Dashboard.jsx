import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/authSlice";

const Dashboard = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };
  return (
    <div>
      <h1>Dashboard</h1>
      <p>This is the dashboard page.</p>
      <button className="" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
