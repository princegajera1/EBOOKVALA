import {
  LayoutDashboard,
  Library,
  Heart,
  Download,
  Trophy,
  Settings,
  LogOut,
} from "lucide-react";

export const READER_SIDEBAR_LINKS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "library", label: "My Library", icon: Library },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "logout", label: "Logout", icon: LogOut, action: "logout" },
];
