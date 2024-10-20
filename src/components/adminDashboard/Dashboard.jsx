import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-7xl w-full px-8 py-12">
        <h1 className="text-4xl font-extrabold">Admin Dashboard</h1>
        <p className="mt-4 text-gray-400">
          Welcome to the admin dashboard. Here you can manage users and view
          important data.
        </p>

        {/* Example Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            to="/manage-users"
            className="p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors duration-300"
          >
            <h2 className="text-2xl font-bold">Manage Users</h2>
            <p className="mt-2 text-gray-400">
              Add, remove, or update user information.
            </p>
          </Link>

          <Link
            to="/view-reports"
            className="p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors duration-300"
          >
            <h2 className="text-2xl font-bold">View Reports</h2>
            <p className="mt-2 text-gray-400">
              See detailed reports on system usage and user activity.
            </p>
          </Link>

          <Link
            to="/settings"
            className="p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors duration-300"
          >
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="mt-2 text-gray-400">
              Manage system settings and configurations.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
