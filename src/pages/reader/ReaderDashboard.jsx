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
                          <img src={b.coverURL} alt={`Cover of the book ${b.title}`} decoding="async" className="h-full w-full object-cover" />
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
