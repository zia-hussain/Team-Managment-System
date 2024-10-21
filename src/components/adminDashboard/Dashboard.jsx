import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchTeams } from "../../redux/actions/action";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchTeams(dispatch));
    // .then((res) => {
    //   console.log(res, "hence chk");
    // })
    // .catch((err) => {
    //   console.log(err, "hence chk");
    // });
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-5xl w-full px-8 py-12 text-center">
        <h1 className="text-4xl font-extrabold">Admin Dashboard</h1>
        <p className="mt-4 text-gray-400">
          Welcome to the admin dashboard. Here you can manage users and view
          important data.
        </p>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
          <Link
            to="/manage-users"
            className="p-8 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl font-bold">Manage Users</h2>
            <p className="mt-2 text-gray-400 text-center">
              Add, remove, or update user information.
            </p>
          </Link>

          <Link
            to="/manage-teams"
            className="p-8 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl font-bold">Manage Teams</h2>
            <p className="mt-2 text-gray-400 text-center">
              Create and manage teams and their members.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
