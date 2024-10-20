import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element: Component, requiredRole }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Check if the user is authenticated and has the required role
  if (isAuthenticated && (!requiredRole || user.role === requiredRole)) {
    return Component;
  }

  // If not authenticated or doesn't have the required role, redirect to login
  return <Navigate to="/login" />;
};

export default PrivateRoute;
