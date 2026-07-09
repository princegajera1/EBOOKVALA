import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, Heart, User, LayoutDashboard, Settings } from "lucide-react";
import { useApp } from "../../store/AppContext";
import { useWishlist } from "../../hooks/useWishlist";
import Dock from "./Dock";

export const MobileDockNav = () => {
  const { user, isAuthenticated } = useApp();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // If we shouldn't show it (e.g. in full-screen reader view), hide it
  const isReaderView = location.pathname.startsWith("/read/");
  if (isReaderView) return null;

  // Resolve dynamic dashboard link depending on user role
  const getDashboardPath = () => {
    if (!isAuthenticated) return "/login";
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "author") return "/author/dashboard";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (!isAuthenticated) return "Sign In";
    if (user?.role === "admin") return "Admin";
    if (user?.role === "author") return "Author Space";
    return "My Library";
  };

  const activePath = location.pathname;

  const items = [
    {
      label: "Home",
      icon: <Home className={`h-5.5 w-5.5 ${activePath === "/" ? "text-brand-accent" : "text-brand-text-secondary"}`} />,
      onClick: () => navigate("/"),
      className: activePath === "/" ? "border-brand-accent bg-brand-accent/5" : ""
    },
    {
      label: "Explore",
      icon: <Compass className={`h-5.5 w-5.5 ${activePath === "/marketplace" ? "text-brand-accent" : "text-brand-text-secondary"}`} />,
      onClick: () => navigate("/marketplace"),
      className: activePath === "/marketplace" ? "border-brand-accent bg-brand-accent/5" : ""
    },
    {
      label: getDashboardLabel(),
      icon: <LayoutDashboard className={`h-5.5 w-5.5 ${activePath.includes("dashboard") ? "text-brand-accent" : "text-brand-text-secondary"}`} />,
      onClick: () => navigate(getDashboardPath()),
      className: activePath.includes("dashboard") ? "border-brand-accent bg-brand-accent/5" : ""
    },
    {
      label: "Support",
      icon: <Settings className={`h-5.5 w-5.5 ${activePath === "/contact" ? "text-brand-accent" : "text-brand-text-secondary"}`} />,
      onClick: () => navigate("/contact"),
      className: activePath === "/contact" ? "border-brand-accent bg-brand-accent/5" : ""
    }
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 md:hidden flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-auto">
        <Dock items={items} baseItemSize={48} magnification={64} distance={140} panelHeight={60} />
      </div>
    </div>
  );
};

export default MobileDockNav;
