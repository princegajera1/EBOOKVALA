import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { Footer } from "../common/Footer";
import { motion, AnimatePresence } from "framer-motion";

// New Responsive Navigation Components
import PillNav from "../PillNav/PillNav";
import StaggeredMenu from "../StaggeredMenu/StaggeredMenu";
import MobileDockNav from "../Dock/MobileDockNav";

import { Sun, Moon } from "lucide-react";
import logoImg from "../../assets/logo.png";

export const MarketLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, theme, toggleTheme } = useApp();

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "author") return "/author/dashboard";
    return "/dashboard";
  };

  const handleSignOut = () => {
    logout();
    const protectedPrefixes = ["/dashboard", "/author", "/admin"];
    if (protectedPrefixes.some(prefix => location.pathname.startsWith(prefix))) {
      navigate("/");
    }
  };

  // Build nav items dynamically
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Explore Library", href: "/marketplace" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" }
  ];

  if (isAuthenticated) {
    navItems.push({ label: "Dashboard", href: getDashboardLink() });
    navItems.push({ 
      label: "Toggle Theme", 
      icon: theme === "dark" ? Sun : Moon, 
      ariaLabel: "Toggle Theme", 
      href: "#", 
      onClick: toggleTheme 
    });
    navItems.push({ label: "Log Out", href: "#", onClick: handleSignOut });
  } else {
    navItems.push({ 
      label: "Toggle Theme", 
      icon: theme === "dark" ? Sun : Moon, 
      ariaLabel: "Toggle Theme", 
      href: "#", 
      onClick: toggleTheme 
    });
    navItems.push({ label: "Log In", href: "/login" });
    navItems.push({ label: "Register", href: "/register" });
  }

  const socialLinks = [
    { label: "X (Twitter)", link: "https://x.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
    { label: "GitHub", link: "https://github.com" }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between transition-colors duration-300 relative">
      
      {/* 1. PillNav (Desktop + Tablet Navigation: >= 768px) */}
      <header className="fixed top-4 left-4 right-4 z-40 hidden md:block max-w-6xl mx-auto w-[calc(100%-2rem)]">
        <PillNav 
          logo={logoImg} 
          logoAlt="EBOOKVALA" 
          items={navItems} 
          activeHref={location.pathname} 
          baseColor="var(--card)"
          pillColor="var(--bg-secondary)"
          pillTextColor="var(--text)"
          hoveredPillTextColor="#FFFFFF"
          initialLoadAnimation 
        />
      </header>

      {/* 2. StaggeredMenu (Mobile Drawer Navigation: < 768px) */}
      <div className="md:hidden">
        <StaggeredMenu 
          isFixed 
          items={navItems} 
          socialItems={socialLinks} 
          displaySocials 
          position="right" 
          accentColor="var(--accent)" 
          logoUrl={logoImg} 
        />
      </div>

      {/* 3. Mobile Dock Quick-nav Action Bar (Mobile Only: < 768px) */}
      <MobileDockNav />
      
      {/* Main Content Area: Added extra padding-top to prevent overlaps with floating headers */}
      <main className="flex-grow pt-24 lg:pt-32 bg-brand-bg overflow-hidden relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
};

export default MarketLayout;
