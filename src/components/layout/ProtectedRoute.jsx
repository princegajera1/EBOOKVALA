import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

export const FullScreenSpinner = () => (
  <div className="h-screen w-screen bg-brand-bg flex flex-col items-center justify-center select-none">
    <div className="flex flex-col items-center gap-4">
      <svg className="h-8 w-8 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="text-xs font-medium text-brand-text-secondary">Authenticating...</span>
    </div>
  </div>
);

export const ProtectedRoute = ({ role, children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        const isLoggingOut = sessionStorage.getItem("logging_out") === "true";
        if (isLoggingOut) {
          sessionStorage.removeItem("logging_out");
        } else {
          toast.error("Please sign in to continue");
        }
        navigate("/login", { state: { from: location } });
      } else if (role && user?.role !== role) {
        if (user?.role === "author") {
          navigate("/author/dashboard", { replace: true });
        } else if (user?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (user?.role === "reader") {
          navigate("/dashboard", { replace: true });
        } else {
          toast.error("Access denied");
          navigate("/");
        }
      }
    }
  }, [isAuthenticated, user, loading, navigate, role, location]);

  if (loading) {
    return <FullScreenSpinner />;
  }

  if (!isAuthenticated || (role && user?.role !== role)) {
    return null; // Will redirect in useEffect
  }

  return children;
};

export default ProtectedRoute;
