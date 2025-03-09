// components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem("user_role");
  const isAuthenticated = !!localStorage.getItem("access_token");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    switch(userRole) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "pandit":
        return <Navigate to="/pandit/dashboard" replace />;
      case "vendor":
        return <Navigate to="/vendor/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  return <Outlet />;
};

export default ProtectedRoute;