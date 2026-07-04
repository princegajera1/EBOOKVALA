import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { FullScreenSpinner } from "./ProtectedRoute";

export const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        const isLoggingOut = sessionStorage.getItem("logging_out") === "true";
        if (isLoggingOut) {
          sessionStorage.removeItem("logging_out");
        } else {
          toast.error("Please sign in as admin to continue");
        }
        navigate("/admin/login");
      } else if (!isAdmin) {
        toast.error("Access denied. Admin role required.");
        navigate("/");
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
