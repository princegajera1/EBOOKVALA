import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FullScreenSpinner } from "./ProtectedRoute";

export const AdminRoute = ({ children }) => {
  const { user, initialLoading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const isUnlockedBySession = typeof window !== "undefined" && sessionStorage.getItem("admin_session_unlocked") === "true";
  const isSuperAdmin = user?.email && (
    user.email.toLowerCase().trim() === "princegajera944@gmail.com" || 
    user.email.toLowerCase().trim() === "admin@ebookvala.com"
  );
  const hasAccess = (isAuthenticated && (isAdmin || isSuperAdmin)) || isUnlockedBySession;

  useEffect(() => {
    if (!initialLoading) {
      if (!hasAccess) {
        navigate("/admin/login");
      }
    }
  }, [hasAccess, initialLoading, navigate]);

  if (initialLoading) {
    return <FullScreenSpinner />;
  }

  if (!hasAccess) {
    return <FullScreenSpinner />;
  }

  return children;
};

export default AdminRoute;
