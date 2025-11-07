import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles }) {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // "admin" or "consultant"

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect if user doesn't have the right role
    return <Navigate to="/login" replace />;
  }

  return children;
}
