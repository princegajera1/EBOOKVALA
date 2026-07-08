import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Search, Flame, Bell, Sparkles, Trophy, BookOpen, Clock, 
  Settings as SettingsIcon, LogOut, Sun, Moon, Command, X, ArrowUpRight
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { READER_SIDEBAR_LINKS } from "./config/sidebarLinks";
import { useAuth } from "../../hooks/useAuth";
import { dbService } from "../../services/db";
import { Button } from "../../components/ui/Button";

// Import Tab Submodules
import { Overview } from "./modules/Overview";
import { Library } from "./modules/Library";
import { Wishlist } from "./modules/Wishlist";
import { Downloads } from "./modules/Downloads";
import { Achievements } from "./modules/Achievements";
import { Settings } from "./modules/Settings";

export const ReaderDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const navigate = useNavigate();

  // Database states
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Command Palette states
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== "logout") setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allBooks = await dbService.getBooks();
        setBooks(allBooks || []);
      } catch (err) {
        console.error("Failed to load catalog books:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Listen for Ctrl+K / Cmd+K to trigger Arc Browser style Search Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTabChange = (tabId) => {
    if (tabId === "logout") return;
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Filter books for the Arc Command Palette
  const filteredCommandBooks = books.filter(b => {
    if (!commandQuery.trim()) return false;
    const q = commandQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || 
           (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
           (b.authorName && b.authorName.toLowerCase().includes(q));
  }).slice(0, 5);

  return (
    <DashboardLayout
      requiredRole="reader"
      links={READER_SIDEBAR_LINKS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      
      {/* Dynamic Command Palette (Arc Browser style search overlay) */}
      {commandOpen && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-md z-50 flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
          <div className="bg-[#161618] border border-brand-border/60 rounded-[24px] w-full max-w-xl shadow-brand-hover overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-brand-border/60">
              <Search className="h-4.5 w-4.5 text-brand-text-secondary opacity-85 shrink-0" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search catalog, authors, genres... (Esc to close)"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-brand-text focus:outline-none placeholder:text-brand-text-secondary/50 font-semibold"
              />
              <button onClick={() => setCommandOpen(false)} className="text-brand-text-secondary hover:text-brand-text cursor-pointer p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-2 max-h-[300px] overflow-y-auto no-scrollbar">
              {filteredCommandBooks.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest px-3 py-1.5">Matching Books</p>
                  {filteredCommandBooks.map(b => (
                    <div 
                      key={b.id} 
                      onClick={() => { setCommandOpen(false); navigate(`/book/${b.slug || b.id}`); }}
                      className="flex items-center justify-between p-2.5 rounded-[12px] hover:bg-brand-bg-secondary/40 cursor-pointer select-none transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-7 bg-[#111] rounded border border-brand-border/40 overflow-hidden shrink-0">
                          <img src={b.coverURL} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 text-left">
                          <h4 className="text-xs font-bold text-brand-text group-hover:text-brand-accent transition-colors truncate">{b.title}</h4>
                          <p className="text-[9px] text-brand-text-secondary mt-0.5 truncate">by {b.authorName}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-brand-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              ) : commandQuery.trim() ? (
                <p className="text-[11px] text-brand-text-secondary py-6 font-semibold">No results match your search term.</p>
              ) : (
                <div className="py-6 text-center text-[11px] text-brand-text-secondary font-semibold">
                  Type to start searching EbookVala catalog...
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center px-4 py-2.5 bg-brand-bg-secondary/35 border-t border-brand-border/50 text-[9px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider">
              <span>Navigate with arrow keys</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      )}

      {/* STICKY ARC-STYLE HEADER */}
      <div className="sticky top-0 z-20 bg-brand-bg-secondary/80 backdrop-blur-md border-b border-brand-border/50 -mx-6 md:-mx-8 px-6 md:px-8 py-3.5 flex items-center justify-between gap-4 select-none mb-6">
        
        {/* Arc Browser Style Search Trigger */}
        <button 
          onClick={() => setCommandOpen(true)}
          className="flex items-center justify-between bg-brand-card border border-brand-border/70 hover:border-brand-accent/25 px-3.5 py-2 rounded-full w-full max-w-[280px] shadow-sm cursor-pointer hover:bg-brand-bg-secondary/35 transition-all text-brand-text-secondary/80 hover:text-brand-text group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="h-3.5 w-3.5 text-brand-text-secondary group-hover:text-brand-accent transition-colors shrink-0" />
            <span className="text-[11px] font-semibold truncate">Search catalog...</span>
          </div>
          <div className="flex items-center gap-0.5 font-mono text-[9px] bg-brand-bg-secondary px-1.5 py-0.5 rounded border border-brand-border/50 text-brand-text-secondary font-bold shrink-0">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </button>

        {/* Action Widgets */}
        <div className="flex items-center gap-4.5 shrink-0">
          
          {/* Active Reading Streak Indicator */}
          <div className="flex items-center gap-1.5 hover:scale-105 transition-transform duration-200 cursor-pointer" title="Your active reading streak">
            <Flame className="h-4 w-4 text-brand-accent fill-brand-accent animate-pulse" />
            <span className="text-xs font-mono font-black text-brand-text">{user?.streak || 5} Days</span>
          </div>

          <div className="h-4 w-px bg-brand-border/60"></div>

          {/* Notification Bell */}
          <button className="relative p-1.5 rounded-full border border-brand-border bg-brand-card hover:bg-brand-bg-secondary hover:scale-105 transition-all cursor-pointer shadow-sm text-brand-text-secondary hover:text-brand-text">
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <Bell className="h-4 w-4" />
          </button>

          {/* Theme Visual Toggle (Dark by default, looks cool) */}
          <button className="p-1.5 rounded-full border border-brand-border bg-brand-card hover:bg-brand-bg-secondary hover:scale-105 transition-all cursor-pointer shadow-sm text-brand-text-secondary hover:text-brand-text">
            <Moon className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-brand-border/60"></div>

          {/* Quick Profile Widget */}
          <div 
            onClick={() => handleTabChange("settings")}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
          >
            <div className="h-7 w-7 rounded-full overflow-hidden bg-brand-card border border-brand-border/80">
              <img 
                src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "Reader")}`} 
                alt="" 
                className="h-full w-full object-cover" 
              />
            </div>
          </div>

        </div>

      </div>

      {/* DYNAMIC TAB COMPONENT ROUTING */}
      <div className="min-h-[60vh] transition-all duration-300">
        {loading ? (
          <div className="flex flex-col gap-8 text-left select-none animate-pulse">
            <div className="h-[160px] bg-brand-card/30 rounded-[24px] border border-brand-border/40" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-[140px] md:col-span-2 bg-brand-card/30 rounded-[24px] border border-brand-border/40" />
              <div className="h-[140px] bg-brand-card/30 rounded-[24px] border border-brand-border/40" />
            </div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && <Overview user={user} books={books} />}
            {activeTab === "library" && <Library user={user} books={books} onTabChange={handleTabChange} />}
            {activeTab === "wishlist" && <Wishlist user={user} books={books} onUpdateWishlist={async (newList) => await updateProfile({ wishlist: newList })} />}
            {activeTab === "downloads" && <Downloads user={user} books={books} />}
            {activeTab === "achievements" && <Achievements user={user} books={books} />}
            {activeTab === "settings" && <Settings user={user} onSaveProfile={updateProfile} />}
          </>
        )}
      </div>

    </DashboardLayout>
  );
};

export default ReaderDashboard;
