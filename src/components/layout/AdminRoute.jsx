import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FullScreenSpinner } from "./ProtectedRoute";

export const AdminRoute = ({ children }) => {
  const { user, initialLoading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialLoading) {
      if (!isAuthenticated || !isAdmin) {
        navigate("/admin/login");
      }
    }
  }, [isAuthenticated, isAdmin, initialLoading, navigate]);

  if (initialLoading) {
    return <FullScreenSpinner />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return children;
};

export default AdminRoute;
