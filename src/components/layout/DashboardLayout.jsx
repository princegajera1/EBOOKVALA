import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "../common/Sidebar";
import { useApp } from "../../store/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toast } from "react-hot-toast";

export const DashboardLayout = ({ requiredRole, links = [], activeTab, onTabChange, children }) => {
  const { user, initialLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in-memory newest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(list);
    }, (err) => {
      console.error("Error subscribing to notifications:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleMarkAsRead = async (notif) => {
    try {
      await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    const toastId = toast.loading("Marking all notifications as read...");
    try {
      await Promise.all(unread.map(n => 
        updateDoc(doc(db, "notifications", n.id), { isRead: true })
      ));
      toast.success("All notifications marked as read!", { id: toastId });
    } catch (err) {
      toast.error("Failed to update notifications.", { id: toastId });
    }
  };

  const handleNotifClick = async (notif) => {
    await handleMarkAsRead(notif);
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const groupedNotifications = notifications.reduce((acc, notif) => {
    const cat = notif.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(notif);
    return acc;
  }, {});

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
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg-secondary transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-brand-danger text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2.5 w-80 max-h-[460px] overflow-y-auto z-50 bg-brand-card border border-brand-border rounded-[20px] shadow-brand-hover p-4 text-left flex flex-col gap-3 font-sans no-scrollbar"
                    >
                      <div className="flex items-center justify-between border-b border-brand-border pb-2">
                        <span className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-bold text-brand-accent hover:underline cursor-pointer bg-transparent border-0 outline-none"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2 text-brand-text-secondary/50">
                          <Bell className="h-8 w-8 stroke-[1.5]" />
                          <div>
                            <p className="text-xs font-bold text-brand-text">All caught up!</p>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5">No notifications yet.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[380px] no-scrollbar">
                          {Object.entries(groupedNotifications).map(([category, list]) => (
                            <div key={category} className="flex flex-col gap-1.5">
                              <span className="text-[9px] font-bold tracking-widest uppercase font-mono text-brand-accent px-1">
                                {category}
                              </span>
                              <div className="flex flex-col gap-1">
                                {list.map((notif) => (
                                  <div
                                    key={notif.id}
                                    onClick={() => handleNotifClick(notif)}
                                    className={`group flex items-start gap-2.5 p-2 rounded-xl border border-transparent transition-all duration-200 cursor-pointer text-left ${
                                      notif.isRead 
                                        ? "hover:bg-[#1a1a1c]/30" 
                                        : "bg-brand-accent/5 border-brand-accent/15 hover:bg-brand-accent/8"
                                    }`}
                                  >
                                    {!notif.isRead && (
                                      <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-brand-accent shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-[11px] leading-tight ${notif.isRead ? "text-brand-text-secondary font-medium" : "text-brand-text font-bold"}`}>
                                        {notif.title}
                                      </p>
                                      <p className="text-[10px] text-brand-text-secondary mt-0.5 leading-snug line-clamp-2">
                                        {notif.message}
                                      </p>
                                      <span className="block text-[8px] font-semibold text-brand-text-secondary/40 mt-1 font-mono">
                                        {getRelativeTime(notif.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

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
                alt={`Profile avatar of ${user?.displayName || "Admin"}`}
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
