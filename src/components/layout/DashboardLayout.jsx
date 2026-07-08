import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "../common/Sidebar";
import { useApp } from "../../store/AppContext";
import { motion } from "framer-motion";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";

export const DashboardLayout = ({ requiredRole, links = [], activeTab, onTabChange, children }) => {
  const { user, initialLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!initialLoading) {
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
  }, [isAuthenticated, user, initialLoading, navigate, requiredRole]);

  if (initialLoading) {
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

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  const handleTabSelect = (tabId) => {
    onTabChange?.(tabId);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex overflow-hidden transition-colors duration-300">
      {/* Collapsible Left Sidebar */}
      <Sidebar 
        links={links} 
        activeTab={activeTab} 
        onTabChange={handleTabSelect} 
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 border-b border-brand-border bg-brand-card/85 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-full md:hidden text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg-secondary focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs select-none">
              <span className="text-brand-text-secondary font-medium tracking-wide">EBOOKVALA</span>
              <span className="text-brand-text-secondary/50">/</span>
              <span className="text-brand-text font-bold capitalize tracking-tight">
                {activeTab === "overview" ? "Dashboard" : activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global search */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/40" />
              <input
                type="text"
                placeholder="Search command center..."
                className="w-full h-8.5 pl-9 pr-4 text-xs rounded-full border border-brand-border bg-brand-bg-secondary focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/30 transition-colors"
              />
            </div>

            {/* Notification bell */}
            <button 
              className="relative p-2 rounded-full text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg-secondary transition-colors"
              aria-label="View notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-danger" />
            </button>

            {/* Theme toggler */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg-secondary transition-colors"
              aria-label="Toggle visual theme"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Admin Profile Avatar */}
            <div className="h-8 w-8 rounded-full overflow-hidden border border-brand-border shadow-sm select-none">
              <img
                src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.displayName || "Admin")}`}
                alt="Profile"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main data-lenis-prevent className="flex-grow overflow-y-auto bg-brand-bg p-6 md:p-8">
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
    </div>
  );
};

export default DashboardLayout;
