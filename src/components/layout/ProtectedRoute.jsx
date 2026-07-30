import React, { useEffect, useRef } from "react";
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
  const { user, initialLoading, isAuthenticated, upgradeToAuthor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isUpgradingRef = useRef(false);

  useEffect(() => {
    if (!initialLoading) {
      if (!isAuthenticated) {
        const isLoggingOut = sessionStorage.getItem("logging_out") === "true";
        if (isLoggingOut) {
          sessionStorage.removeItem("logging_out");
        } else {
          toast.error("Please sign in to continue");
        }
        navigate("/login", { state: { from: location.pathname } });
      } else if (role && user?.role !== role) {
        if (role === "reader" && (user?.role === "author" || user?.role === "admin")) {
          // Allow author or admin to view reader workspace
          return;
        }
        if (role === "author" && user?.role === "reader") {
          if (!isUpgradingRef.current) {
            isUpgradingRef.current = true;
            upgradeToAuthor()
              .then(() => {
                toast.success("Welcome to Author Dashboard! 🚀");
              })
              .catch(err => {
                console.error("Failed to upgrade role to author:", err);
                toast.error("Failed to switch to Author Dashboard.");
                navigate("/dashboard", { replace: true });
              })
              .finally(() => {
                isUpgradingRef.current = false;
              });
          }
        } else if (user?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          toast.error("Access denied");
          navigate("/");
        }
      }
    }
  }, [isAuthenticated, user?.role, initialLoading, navigate, role, location.pathname, upgradeToAuthor]);

  const hasAccess = isAuthenticated && (!role || user?.role === role || (role === "reader" && (user?.role === "author" || user?.role === "admin")));

  if (initialLoading || !hasAccess) {
    return <FullScreenSpinner />;
  }

  return children;
};

export default ProtectedRoute;
