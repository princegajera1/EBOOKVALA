import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import logoImg from "../../assets/logo.png";

// ---------------------------------------------------------------------------
// SidebarNavItem — individual nav button with framer-motion micro interactions
// ---------------------------------------------------------------------------
const SidebarNavItem = ({ link, isActive, isCollapsed, onTabChange }) => {
  const Icon = link.icon;

  return (
    <motion.button
      key={link.id}
      onClick={() => onTabChange(link.id)}
      whileTap={{ scale: 0.97 }}
      aria-label={link.label}
      aria-current={isActive ? "page" : undefined}
      className={`
        relative flex items-center gap-3 w-full rounded-[12px] text-xs font-bold
        transition-all duration-200 cursor-pointer outline-none
        focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-1 focus-visible:ring-offset-brand-card
        ${isCollapsed ? "justify-center px-0 py-3" : "px-3.5 py-2.5"}
        ${isActive
          ? "text-brand-text bg-brand-bg-secondary border border-brand-border shadow-[0_1px_4px_0_rgba(15,23,42,0.06)]"
          : "text-brand-text-secondary hover:bg-brand-bg-secondary hover:text-brand-text border border-transparent"
        }
      `}
    >
      {/* Animated active left-bar indicator */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            layoutId="activeIndicator"
            className="absolute left-1.5 top-2 bottom-2 w-[3px] rounded-full bg-brand-accent"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>

      {/* Icon with subtle scale on hover */}
      <motion.span
        whileHover={{ scale: 1.13 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="shrink-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <Icon
          className={`h-[18px] w-[18px] transition-colors duration-200 ${
            isActive ? "text-brand-accent" : "text-brand-text-secondary/70"
          }`}
        />
      </motion.span>

      {/* Label — hidden when collapsed */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
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
// SidebarProfileCard — avatar + name + role, clickable → settings
// ---------------------------------------------------------------------------
const SidebarProfileCard = ({ user, isCollapsed, onTabChange }) => {
  const avatarSrc =
    user?.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      user?.displayName || "U"
    )}`;

  const handleClick = () => {
    if (onTabChange) onTabChange("settings");
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      aria-label={isCollapsed ? `Profile: ${user?.displayName}` : "Go to settings"}
      className={`
        w-full flex items-center gap-3 p-2.5 rounded-[14px]
        bg-brand-bg-secondary border border-brand-border
        shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]
        hover:border-brand-accent/30 hover:shadow-[0_2px_8px_0_rgba(15,23,42,0.08)]
        transition-all duration-200 cursor-pointer outline-none
        focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-1 focus-visible:ring-offset-brand-card
        ${isCollapsed ? "justify-center" : ""}
      `}
    >
      {/* Avatar */}
      <div className="h-9 w-9 rounded-full overflow-hidden bg-brand-card border-2 border-brand-border shadow-sm shrink-0">
        <img
          src={avatarSrc}
          alt={`Avatar of ${user?.displayName || "user"}`}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Name + role — hidden when collapsed */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex-1 overflow-hidden text-left"
          >
            {/* Name row with verified badge */}
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-[13px] font-bold text-brand-text truncate leading-tight">
                {user?.displayName || "User"}
              </p>
              {/* Verified badge — shown for authors and admins */}
              {(user?.role === "author" || user?.role === "admin") && (
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 text-brand-accent"
                  aria-label="Verified"
                />
              )}
            </div>
            {/* Role chip */}
            <p className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest mt-0.5 truncate">
              {user?.role} Mode
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ---------------------------------------------------------------------------
// Sidebar — main export
// ---------------------------------------------------------------------------
export const Sidebar = ({ links = [], activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="shrink-0 h-screen sticky top-0 bg-brand-card border-r border-brand-border
                 flex flex-col z-30 select-none overflow-hidden"
      aria-label="Dashboard Sidebar"
    >
      {/* ── Inner scrollable area ── */}
      <div className="flex flex-col flex-1 justify-between overflow-y-auto no-scrollbar px-3 py-4">

        {/* ── Top section: Brand + Profile + Nav ── */}
        <div className="flex flex-col gap-5">

          {/* Brand header + collapse toggle */}
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-1`}>
            {!isCollapsed ? (
              <Link
                to="/"
                className="text-[15px] font-display font-black tracking-tight text-brand-text
                           hover:cursor-pointer rounded-md flex items-center gap-2
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent
                           focus-visible:ring-offset-2 focus-visible:ring-offset-brand-card"
                tabIndex={0}
              >
                <img src={logoImg} className="h-6 w-6 object-contain rounded-md" alt="EBOOKVALA logo" />
                <span>EBOOKVALA</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent
                           focus-visible:ring-offset-2 focus-visible:ring-offset-brand-card"
                aria-label="Go to home"
              >
                <img src={logoImg} className="h-7 w-7 object-contain rounded-md" alt="EBOOKVALA logo" />
              </Link>
            )}

            {/* Collapse toggle — desktop only */}
            {!isCollapsed && (
              <motion.button
                onClick={() => setIsCollapsed(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.93 }}
                className="hidden md:flex p-1.5 rounded-full border border-brand-border bg-brand-card
                           hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text
                           cursor-pointer transition-colors duration-200
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </motion.button>
            )}
            {isCollapsed && (
              <motion.button
                onClick={() => setIsCollapsed(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.93 }}
                className="hidden md:flex p-1.5 rounded-full border border-brand-border bg-brand-card
                           hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text
                           cursor-pointer transition-colors duration-200 mt-1
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </div>

          {/* Profile card */}
          <SidebarProfileCard
            user={user}
            isCollapsed={isCollapsed}
            onTabChange={onTabChange}
          />

          {/* Thin divider */}
          <div className="h-px bg-brand-border/60 mx-1" aria-hidden="true" />

          {/* Navigation */}
          <nav
            className="flex flex-col gap-0.5"
            aria-label="Main navigation"
            role="navigation"
          >
            {links.map((link) => (
              <SidebarNavItem
                key={link.id}
                link={link}
                isActive={activeTab === link.id}
                isCollapsed={isCollapsed}
                onTabChange={onTabChange}
              />
            ))}
          </nav>
        </div>

        {/* ── Bottom section: divider + Sign Out ── */}
        <div className="flex flex-col gap-2 pt-4">
          <div className="h-px bg-brand-border/60 mx-1 mb-1" aria-hidden="true" />

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className={`
              flex items-center gap-3 w-full px-3.5 py-2.5 rounded-[12px]
              text-xs font-bold text-brand-danger
              hover:bg-brand-danger/10 border border-transparent
              hover:border-brand-danger/20
              cursor-pointer transition-all duration-200 outline-none
              focus-visible:ring-2 focus-visible:ring-brand-danger focus-visible:ring-offset-1 focus-visible:ring-offset-brand-card
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
            aria-label="Sign out"
          >
            <motion.span
              whileHover={{ rotate: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="shrink-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </motion.span>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="leading-none"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

      </div>
    </motion.aside>
  );
};

export default Sidebar;
