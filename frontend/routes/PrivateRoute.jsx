import { Navigate } from "react-router";

export default function PrivateRoute({ children, allowedRoles }) {
  const isAuthenticated = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("role"); // "admin" or "consultant"

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect if user doesn't have the right role
    return <Navigate to="/login" replace />;
  }

  return children;
}
