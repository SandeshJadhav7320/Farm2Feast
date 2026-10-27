import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, isAdmin } from "@/utils/auth";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  adminOnly = false,
}: ProtectedRouteProps) {
  const authenticated = isAuthenticated();

  // Not logged in
  if (!authenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Admin-only route
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}