import { Navigate, Outlet } from "react-router-dom";

export function isAuthenticated() {
  const token = localStorage.getItem("access_token");
  return token !== null;
}

export default function ProtectedRoute() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}