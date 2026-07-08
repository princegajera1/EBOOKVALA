import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import logoImg from "../../assets/logo.png";

const EXPANDED_WIDTH = 228;
const COLLAPSED_WIDTH = 72;

// ---------------------------------------------------------------------------
// SidebarNavItem
// ---------------------------------------------------------------------------
const SidebarNavItem = ({
  link,
  isActive,
  isCollapsed,
  onTabChange,
  onLogout,
  layoutIdPrefix = "",
}) => {
  const Icon = link.icon;
  const isLogout = link.action === "logout";

  const handleClick = () => {
    if (isLogout) {
      onLogout?.();
      return;
    }
    onTabChange?.(link.id);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ x: isCollapsed ? 0 : 2 }}
      whileTap={{ scale: 0.98 }}
      aria-label={link.label}
      title={isCollapsed ? link.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={`
        group relative flex items-center w-full rounded-brand-btn text-[13px] font-medium
        transition-colors duration-200 cursor-pointer outline-none
        focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-1 focus-visible:ring-offset-brand-card
        ${isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2"}
        ${
          isLogout
            ? "text-brand-danger hover:bg-brand-danger/8 hover:text-brand-danger"
            : isActive
              ? "text-brand-text bg-brand-bg-secondary"
              : "text-brand-text-secondary hover:bg-brand-bg-secondary/80 hover:text-brand-text"
        }
      `}
    >
      <AnimatePresence>
        {isActive && !isLogout && (
          <motion.span
            layoutId={`${layoutIdPrefix}activeIndicator`}
            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-accent"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        )}
      </AnimatePresence>

      <motion.span
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="shrink-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <Icon
          className={`h-[17px] w-[17px] transition-colors duration-200 ${
            isLogout
              ? "text-brand-danger/80 group-hover:text-brand-danger"
              : isActive
                ? "text-brand-accent"
                : "text-brand-text-secondary/75 group-hover:text-brand-text"
          }`}
          strokeWidth={isActive || isLogout ? 2.25 : 2}
        />
      </motion.span>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="truncate leading-none"
          >
            {link.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ---------------------------------------------------------------------------
// SidebarProfileCard
// ---------------------------------------------------------------------------
const SidebarProfileCard = ({ user, isCollapsed, onTabChange }) => {
  const avatarSrc =
    user?.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      user?.displayName || "U"
    )}`;

  return (
    <motion.button
      onClick={() => onTabChange?.("settings")}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      aria-label={isCollapsed ? `Profile: ${user?.displayName}` : "Go to settings"}
      className={`
        w-full flex items-center rounded-brand-card
        bg-brand-bg-secondary/60 border border-brand-border/80
        hover:border-brand-accent/25 hover:bg-brand-bg-secondary
        transition-all duration-200 cursor-pointer outline-none
        focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-1 focus-visible:ring-offset-brand-card
        ${isCollapsed ? "justify-center p-2" : "gap-2.5 p-2.5"}
      `}
    >
      <div className="h-8 w-8 rounded-full overflow-hidden bg-brand-card border border-brand-border shrink-0">
        <img
          src={avatarSrc}
          alt={`Avatar of ${user?.displayName || "user"}`}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="flex-1 overflow-hidden text-left min-w-0"
          >
            <p className="text-[13px] font-semibold text-brand-text truncate leading-tight">
              {user?.displayName || "User"}
            </p>
            <p className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider mt-0.5 truncate">
              {user?.role || "reader"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ---------------------------------------------------------------------------
// SidebarContent — shared between desktop + mobile drawer
// ---------------------------------------------------------------------------
const SidebarContent = ({
  links,
  activeTab,
  onTabChange,
  isCollapsed,
  setIsCollapsed,
  onMobileClose,
  isMobile = false,
  layoutIdPrefix = "",
  showProfile = true,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const hasNavLogout = links.some((l) => l.action === "logout");

  const handleLogout = () => {
    logout();
    navigate("/");
    onMobileClose?.();
  };

  const handleNavClick = (tabId) => {
    onTabChange?.(tabId);
    onMobileClose?.();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-col flex-1 gap-4 px-3 py-4 overflow-y-auto no-scrollbar">
        {/* Brand */}
        <div
          className={`flex items-center shrink-0 ${
            isCollapsed && !isMobile ? "justify-center" : "justify-between"
          } px-0.5`}
        >
          {!isCollapsed || isMobile ? (
            <Link
              to="/"
              onClick={onMobileClose}
              className="text-sm font-display font-black tracking-tight text-brand-text
                         flex items-center gap-2 rounded-md
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <img src={logoImg} className="h-6 w-6 object-contain rounded-md" alt="EBOOKVALA logo" />
              <span>EBOOKVALA</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              aria-label="Go to home"
            >
              <img src={logoImg} className="h-7 w-7 object-contain rounded-md" alt="EBOOKVALA logo" />
            </Link>
          )}

          {isMobile ? (
            <motion.button
              onClick={onMobileClose}
              whileTap={{ scale: 0.92 }}
              className="p-2 rounded-brand-btn text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg-secondary
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </motion.button>
          ) : (
            !isCollapsed && (
              <motion.button
                onClick={() => setIsCollapsed(true)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="hidden lg:flex p-1.5 rounded-full border border-brand-border bg-brand-card
                           hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </motion.button>
            )
          )}

          {!isMobile && isCollapsed && (
            <motion.button
              onClick={() => setIsCollapsed(false)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="hidden lg:flex absolute -right-3 top-4 p-1.5 rounded-full border border-brand-border bg-brand-card shadow-brand
                         hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent z-10"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </div>

        {showProfile && (
          <SidebarProfileCard
            user={user}
            isCollapsed={isCollapsed && !isMobile}
            onTabChange={handleNavClick}
          />
        )}

        <div className="h-px bg-brand-border/50" aria-hidden="true" />

        <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
          {links.map((link) => (
            <SidebarNavItem
              key={link.id}
              link={link}
              isActive={activeTab === link.id}
              isCollapsed={isCollapsed && !isMobile}
              onTabChange={handleNavClick}
              onLogout={handleLogout}
              layoutIdPrefix={layoutIdPrefix}
            />
          ))}
        </nav>

        {/* Live Users Presence Widget */}
        <div className="mt-6 border-t border-brand-border/30 pt-4">
          {!isCollapsed || isMobile ? (
            <div className="mx-1 p-3 bg-brand-bg-secondary/40 border border-brand-border/40 rounded-[14px] text-left select-none shadow-inner">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-brand-success uppercase tracking-wider">Live Users: 8 Active</span>
              </div>
              <div className="mt-2.5 flex flex-col gap-1.5 text-[9px] font-semibold text-brand-text-secondary">
                <div className="flex justify-between items-center border-b border-brand-border/10 pb-1">
                  <span>This Week:</span>
                  <span className="text-brand-text font-mono font-bold">+12 Users</span>
                </div>
                <div className="flex justify-between items-center border-b border-brand-border/10 pb-1">
                  <span>This Month:</span>
                  <span className="text-brand-text font-mono font-bold">+48 Users</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>This Year:</span>
                  <span className="text-brand-text font-mono font-bold">+286 Users</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex items-center justify-center h-7 w-7 rounded-full bg-brand-success/15 text-brand-success border border-brand-success/20 font-bold text-[10px]" title="8 Live Users">
              8
            </div>
          )}
        </div>
      </div>

      {/* Legacy bottom logout — only when nav links don't include logout */}
      {!hasNavLogout && (
        <div className="shrink-0 px-3 pb-4 pt-2 border-t border-brand-border/50">
          <SidebarNavItem
            link={{ id: "logout-fallback", label: "Sign Out", icon: LogOut, action: "logout" }}
            isActive={false}
            isCollapsed={isCollapsed && !isMobile}
            onLogout={handleLogout}
            layoutIdPrefix={layoutIdPrefix}
          />
        </div>
      )}
    </div>
  );
};



// ---------------------------------------------------------------------------
// Sidebar — main export
// ---------------------------------------------------------------------------
export const Sidebar = ({
  links = [],
  activeTab,
  onTabChange,
  mobileOpen = false,
  onMobileClose,
  showProfile = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (mobileOpen) setIsCollapsed(false);
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative hidden md:flex shrink-0 h-screen sticky top-0 bg-brand-card/95 backdrop-blur-sm
                   border-r border-brand-border flex-col z-30 select-none overflow-hidden"
        aria-label="Dashboard Sidebar"
      >
        <SidebarContent
          links={links}
          activeTab={activeTab}
          onTabChange={onTabChange}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          layoutIdPrefix="desktop-"
          showProfile={showProfile}
        />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-brand-primary/20 backdrop-blur-[2px] z-40 md:hidden"
              onClick={onMobileClose}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed left-0 top-0 h-full w-[min(280px,88vw)] bg-brand-card border-r border-brand-border
                         flex flex-col z-50 md:hidden shadow-brand-hover"
              aria-label="Mobile navigation"
              role="dialog"
              aria-modal="true"
            >
              <SidebarContent
                links={links}
                activeTab={activeTab}
                onTabChange={onTabChange}
                isCollapsed={false}
                setIsCollapsed={setIsCollapsed}
                onMobileClose={onMobileClose}
                isMobile
                layoutIdPrefix="mobile-"
                showProfile={showProfile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
