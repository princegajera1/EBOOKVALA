import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FullScreenSpinner } from "./ProtectedRoute";

export const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !isAdmin) {
        navigate("/635284");
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  if (loading) {
    return <FullScreenSpinner />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return children;
};

export default AdminRoute;
