import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "../common/Sidebar";
import { useApp } from "../../store/AppContext";
import { motion } from "framer-motion";

export const DashboardLayout = ({ requiredRole, links = [], activeTab, onTabChange, children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Secret admin token bypasses role checks
  const hasSecretToken = sessionStorage.getItem("secret_admin_token") === "granted";

  useEffect(() => {
    if (!loading && !hasSecretToken) {
      if (!isAuthenticated) {
        if (requiredRole === "admin") {
          navigate("/635284");
        } else {
          navigate("/login");
        }
      } else if (requiredRole && user?.role !== requiredRole) {
        if (user?.role === "admin") {
          navigate("/admin/dashboard");
        } else if (user?.role === "author") {
          navigate("/author/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    }
  }, [isAuthenticated, user, loading, navigate, requiredRole, hasSecretToken]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-brand-bg flex items-center justify-center select-none transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-8 w-8 animate-spin text-brand-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-brand-text-secondary">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  // Allow access if secret token is present (admin override)
  if (!hasSecretToken && (!isAuthenticated || (requiredRole && user?.role !== requiredRole))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-bg-secondary flex overflow-hidden transition-colors duration-300">
      {/* Dashboard Sidebar */}
      <Sidebar links={links} activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Panel */}
      <main className="flex-grow h-screen overflow-y-auto bg-brand-bg-secondary p-6 md:p-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
