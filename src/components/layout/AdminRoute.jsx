import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FullScreenSpinner } from "./ProtectedRoute";

export const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Secret token granted via /635284 page
  const hasSecretToken = sessionStorage.getItem("secret_admin_token") === "granted";

  useEffect(() => {
    if (!loading && !hasSecretToken) {
      if (!isAuthenticated || !isAdmin) {
        navigate("/635284");
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate, hasSecretToken]);

  if (loading) {
    return <FullScreenSpinner />;
  }

  // Allow access if secret token OR proper Firebase admin auth
  if (!hasSecretToken && (!isAuthenticated || !isAdmin)) {
    return null;
  }

  return children;
};

export default AdminRoute;
