import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FullScreenSpinner } from "./ProtectedRoute";

export const GuestRoute = ({ children }) => {
  const { user, initialLoading, isAuthenticated, isReader, isAuthor, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialLoading && isAuthenticated) {
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else if (isAuthor) {
        navigate("/author/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, isReader, isAuthor, isAdmin, initialLoading, navigate]);

  if (initialLoading) {
    return <FullScreenSpinner />;
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return children;
};

export default GuestRoute;
