import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import logoImg from "../../assets/logo.png";

export const Sidebar = ({ links = [], activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div 
      className={`shrink-0 h-screen sticky top-0 bg-brand-card border-r border-brand-border flex flex-col justify-between p-4 transition-all duration-300 z-30 select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Brand & Collapse header */}
      <div>
        <div className="flex items-center justify-between mb-8 px-2">
          {!isCollapsed ? (
            <Link to="/" className="text-lg font-display font-black tracking-tight text-brand-text hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-card rounded-md flex items-center gap-2">
              <img src={logoImg} className="h-6 w-6 object-contain rounded-md" alt="Logo" />
              <span>EBOOKVALA</span>
            </Link>
          ) : (
            <Link to="/" className="text-xs font-display font-black tracking-tight text-brand-text mx-auto hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-card rounded-md">
              <img src={logoImg} className="h-7 w-7 object-contain rounded-md" alt="Logo" />
            </Link>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-full border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text cursor-pointer transition-colors"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* User Info Bar */}
        <div className={`flex items-center gap-3 mb-6 p-2 rounded-xl bg-brand-bg-secondary border border-brand-border ${isCollapsed ? "justify-center" : ""}`}>
          <div className="h-8.5 w-8.5 rounded-full overflow-hidden bg-brand-card border border-brand-border shrink-0">
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`} 
              alt="Avatar" 
              className="h-full w-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold text-brand-text truncate leading-none">{user?.displayName}</p>
              <p className="text-[9px] font-mono font-bold text-brand-text-secondary truncate mt-1 uppercase tracking-wider">{user?.role} Mode</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer relative ${
                  isActive 
                    ? "text-brand-text bg-brand-bg-secondary border border-brand-border" 
                    : "text-brand-text-secondary hover:bg-brand-bg-secondary hover:text-brand-text"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-1.5 top-2.5 bottom-2.5 w-0.75 rounded-full bg-brand-accent"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-brand-accent" : "text-brand-text-secondary/70"}`} />
                {!isCollapsed && <span>{link.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-bold text-brand-danger hover:bg-brand-danger/10 cursor-pointer transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
