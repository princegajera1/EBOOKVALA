import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  Home as HomeIcon, BookOpen, Heart, Download, Settings, 
  Star, Sparkles, Bell, ArrowRight, Check, Flame, Trophy, 
  TrendingUp, Clock, Library, History, Bookmark
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { dbService } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { BookCard } from "../../components/book/BookCard";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export const ReaderDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "home");
  const navigate = useNavigate();

  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings states
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [password, setPassword] = useState("");

  // Sync activeTab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const allBooks = await dbService.getBooks();
        
        // 1. Get Purchased/Owned Books
        const purchased = allBooks.filter(b => user.purchasedBooks.includes(b.id));
        setPurchasedBooks(purchased);
        
        // 2. Get Wishlisted Books
        const wish = allBooks.filter(b => user.wishlist.includes(b.id));
        setWishlistBooks(wish);

        // 3. Get AI Recommendations based on categories
        const purchasedCategories = purchased.flatMap(b => b.categories);
        const uniqueCategories = [...new Set(purchasedCategories)];
        const recommendations = allBooks.filter(
          b => !user.purchasedBooks.includes(b.id) && 
          b.status === "published" &&
          (uniqueCategories.length === 0 || b.categories.some(cat => uniqueCategories.includes(cat)))
        );
        setRecommendedBooks(recommendations.slice(0, 3));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ displayName });
      if (password) {
        toast.success("Profile & Password updated!");
        setPassword("");
      } else {
        toast.success("Profile details saved!");
      }
    } catch (err) {
      toast.error("Failed to update profile details.");
    }
  };

  const sidebarLinks = [
    { id: "home", label: "Overview", icon: HomeIcon },
    { id: "library", label: "My Library", icon: BookOpen },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "downloads", label: "Downloads", icon: Download },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Derive pages and details
  const totalPages = Object.values(user?.readingProgress || {}).reduce((sum, p) => sum + p.currentPage, 0);
  const activeStreak = user?.readingStreak || 3;

  const stats = [
    { label: "Added Books", value: purchasedBooks.length, desc: "In library" },
    { label: "Currently Reading", value: Object.keys(user?.readingProgress || {}).length, desc: "Active titles" },
    { label: "Pages Read", value: totalPages, desc: "Lifetime stats" },
    { label: "Reading Streak", value: `${activeStreak} Days`, desc: "Keep it burning!" }
  ];

  const MOCK_ACHIEVEMENTS = [
    { id: 1, name: "Early Adopter", desc: "Joined during launching year", date: "Jul 2026", unlocked: true },
    { id: 2, name: "Critical Reader", desc: "Left a verified book review", date: "Pending", unlocked: false },
    { id: 3, name: "Bookworm", desc: "Added 5+ books to library", date: "Jul 2026", unlocked: true },
    { id: 4, name: "Consistency Master", desc: "Maintain a 5-day streak", date: "Pending", unlocked: false }
  ];

  const WEEK_DAYS = [
    { day: "Mon", read: true },
    { day: "Tue", read: true },
    { day: "Wed", read: true },
    { day: "Thu", read: false },
    { day: "Fri", read: false },
    { day: "Sat", read: false },
    { day: "Sun", read: false }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center select-none text-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-bold text-brand-text-secondary">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      requiredRole="reader" 
      links={sidebarLinks} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
    >
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === "home" && (
        <div className="flex flex-col gap-8 text-left select-none transition-colors duration-300">
          
          {/* Header Greeting & Profile Completion */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-black text-brand-text">
                Welcome back, {user?.displayName ? user.displayName.split(" ")[0] : "Reader"} 👋
              </h1>
              <p className="text-xs text-brand-text-secondary mt-1.5 font-semibold">
                {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            {/* Profile Completion Bar */}
            <div className="w-full md:w-64 p-4 rounded-2xl bg-brand-card border border-brand-border shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-brand-text">
                <span>Profile Completion</span>
                <span className="text-brand-accent">85%</span>
              </div>
              <div className="h-2 bg-brand-bg-secondary rounded-full overflow-hidden border border-brand-border">
                <div className="h-full bg-brand-accent rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-brand-card border border-brand-border rounded-brand-card p-5 shadow-brand text-left">
                <p className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-mono font-black text-brand-text mt-2">{stat.value}</p>
                <p className="text-[10px] text-brand-text-secondary/70 mt-1 font-semibold">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Reading Streak Tracker */}
          <div className="p-6 rounded-brand-card bg-brand-card border border-brand-border shadow-brand">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold text-brand-text uppercase tracking-wider font-mono">Reading Streak</h3>
              </div>
              <span className="text-xs font-bold text-brand-text-secondary">Next milestone: 5 Days</span>
            </div>
            
            {/* Day nodes checklist */}
            <div className="grid grid-cols-7 gap-3 mt-4 text-center">
              {WEEK_DAYS.map((dayItem, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-brand-text-secondary uppercase">{dayItem.day}</span>
                  <div className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${
                    dayItem.read 
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                      : "bg-brand-bg-secondary border-brand-border text-brand-text-secondary/40"
                  }`}>
                    {dayItem.read ? <Check className="h-4.5 w-4.5" strokeWidth={3} /> : <Clock className="h-4 w-4" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Reading Section */}
          {purchasedBooks.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4 font-mono">Continue Reading</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchasedBooks.slice(0, 2).map((book) => {
                  const progress = user?.readingProgress?.[book.id] || { currentPage: 1, totalPages: 100 };
                  const percentage = Math.min(100, Math.max(1, Math.round((progress.currentPage / (book.pages || 100)) * 100)));
                  return (
                    <div key={book.id} className="flex gap-4 p-4 border border-brand-border rounded-brand-card bg-brand-card shadow-brand">
                      <div className="h-24 w-16 bg-brand-bg border border-brand-border rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img src={book.coverURL} alt={book.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0 text-left">
                        <div>
                          <h4 className="text-xs font-bold text-brand-text truncate leading-snug font-display">{book.title}</h4>
                          <p className="text-[10px] text-brand-text-secondary mt-0.5">by {book.authorName}</p>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-brand-text-secondary">
                            <span>Progress</span>
                            <span>{percentage}%</span>
                          </div>
                          <ProgressBar value={progress.currentPage} max={book.pages || 100} size="sm" />
                          <Link to={`/read/${book.slug}`} className="w-fit">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="h-8 px-4 rounded-full text-[10px] mt-1 font-bold"
                            >
                              Resume Reading
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Recommendations Timeline & Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Visual AI Recommendations timeline */}
            <div className="lg:col-span-7 text-left">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="h-4.5 w-4.5 text-brand-accent animate-pulse" />
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">AI Recommendation Pathway</h3>
              </div>
              
              {recommendedBooks.length > 0 ? (
                <div className="relative pl-6 border-l border-brand-border flex flex-col gap-8">
                  {recommendedBooks.map((rel, index) => (
                    <div key={rel.id} className="relative text-left">
                      {/* Timeline Node Icon */}
                      <span className="absolute -left-[35px] top-1.5 h-4.5 w-4.5 rounded-full bg-brand-card border-2 border-brand-accent flex items-center justify-center shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                      </span>
                      
                      <Link 
                        to={`/book/${rel.slug}`} 
                        className="flex gap-4 p-4 border border-brand-border rounded-[16px] bg-brand-card hover:shadow-brand hover:-translate-y-0.5 transition-all duration-300 group block"
                      >
                        <div className="h-16 w-11 bg-brand-bg-secondary border border-brand-border rounded-[6px] overflow-hidden shrink-0 shadow-sm">
                          <img src={rel.coverURL} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-grow flex flex-col justify-between py-0.5">
                          <div>
                            <h5 className="text-xs font-bold text-brand-text group-hover:text-brand-accent transition-colors truncate">{rel.title}</h5>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5">Recommended because you read {purchasedBooks[0]?.title || "our collection"}</p>
                          </div>
                          <span className="text-[9px] font-bold text-brand-success uppercase tracking-wider font-mono">Free Reader</span>
                        </div>
                        <div className="flex items-center shrink-0 pr-1">
                          <ArrowRight className="h-4.5 w-4.5 text-brand-text-secondary group-hover:text-brand-accent transition-colors" />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-brand-border rounded-brand-card text-xs text-brand-text-secondary bg-brand-card">
                  Explore library to generate custom recommendation pathway.
                </div>
              )}
            </div>

            {/* Achievements Milestones */}
            <div className="lg:col-span-5 text-left">
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">Achievements Milestones</h3>
              </div>

              <div className="border border-brand-border rounded-brand-card bg-brand-card shadow-brand divide-y divide-brand-border overflow-hidden">
                {MOCK_ACHIEVEMENTS.map((ach) => (
                  <div key={ach.id} className="p-4 hover:bg-brand-bg-secondary transition-colors text-left flex items-start gap-3">
                    <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      ach.unlocked 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                        : "bg-brand-bg-secondary border-brand-border text-brand-text-secondary/40"
                    }`}>
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-brand-text">{ach.name}</h5>
                        {ach.unlocked && <span className="text-[8px] bg-brand-success/15 text-brand-success font-bold px-1.5 py-0.25 rounded-full">Unlocked</span>}
                      </div>
                      <p className="text-[10px] text-brand-text-secondary mt-0.5 leading-normal">{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. LIBRARY TAB */}
      {activeTab === "library" && (
        <div className="flex flex-col gap-6 text-left select-none">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text">My Library</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Access your saved digital books.</p>
          </div>

          {purchasedBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {purchasedBooks.map((book) => (
                <motion.div 
                  key={book.id}
                  whileHover={{ y: -4, boxShadow: "var(--shadow-brand-hover)" }}
                  className="flex flex-col bg-brand-card rounded-brand-card border border-brand-border shadow-brand transition-all duration-300 group overflow-hidden"
                >
                  <div className="relative aspect-[2/3] w-full bg-brand-bg-secondary border-b border-brand-border overflow-hidden">
                    <img
                      src={book.coverURL}
                      alt={book.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                    />
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-brand-text leading-snug line-clamp-2 h-10 font-display">
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-brand-text-secondary mt-1 truncate">
                        by {book.authorName}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Link to={`/read/${book.slug}`}>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-full text-xs h-9 rounded-full font-bold shadow-sm"
                        >
                          Read Now
                        </Button>
                      </Link>
                      <a href={book.pdfURL} download={`${book.slug}.pdf`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs h-9 rounded-full font-bold border-brand-border hover:bg-brand-bg-secondary"
                        >
                          Download PDF
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Your Library is Empty"
              description="No saved eBooks found in your account yet. Visit the catalog to add free titles."
              actionLabel="Explore Catalog"
              onAction={() => navigate("/marketplace")}
            />
          )}
        </div>
      )}

      {/* 3. WISHLIST TAB */}
      {activeTab === "wishlist" && (
        <div className="flex flex-col gap-6 text-left select-none">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text">My Wishlist</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Books you've bookmarked for later.</p>
          </div>

          {wishlistBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistBooks.map((book) => (
                <BookCard key={book.id} book={book} view="grid" />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Your Wishlist is Empty"
              description="Save books to your wishlist while exploring EBOOKVALA to find them easily here."
              actionLabel="Browse Library"
              onAction={() => navigate("/marketplace")}
            />
          )}
        </div>
      )}

      {/* 4. DOWNLOADS TAB (Replaces Invoices billing lists) */}
      {activeTab === "downloads" && (
        <div className="flex flex-col gap-6 text-left select-none">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text">Local Downloads</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Manage downloaded files for offline access.</p>
          </div>

          {purchasedBooks.length > 0 ? (
            <div className="border border-brand-border rounded-brand-card shadow-brand overflow-hidden bg-brand-card">
              <table className="w-full text-xs text-left text-brand-text-secondary">
                <thead className="bg-brand-bg-secondary text-brand-text font-bold text-[10px] tracking-wider border-b border-brand-border uppercase">
                  <tr>
                    <th className="py-4 px-5">Book Detail</th>
                    <th className="py-4 px-5">File Format</th>
                    <th className="py-4 px-5">Size</th>
                    <th className="py-4 px-5 text-right">Download Link</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasedBooks.map((book) => (
                    <tr key={book.id} className="border-b border-brand-border last:border-0 hover:bg-brand-bg-secondary transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-7 bg-brand-bg-secondary border border-brand-border rounded-[4px] overflow-hidden shrink-0">
                            <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                          </div>
                          <span className="font-bold text-brand-text truncate max-w-[180px]">{book.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-[10px] font-bold">PDF Format</td>
                      <td className="py-4 px-5 font-mono text-[10px] font-bold">{book.fileSize || "14.2 MB"}</td>
                      <td className="py-4 px-5 text-right">
                        <a href={book.pdfURL} download={`${book.slug}.pdf`}>
                          <Button variant="outline" size="sm" className="h-8 px-3 rounded-full text-[10px] font-bold border-brand-border hover:bg-brand-bg-secondary">
                            <Download className="mr-1 h-3.5 w-3.5" />
                            PDF File
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-brand-border rounded-brand-card text-xs text-brand-text-secondary bg-brand-card">
              No files saved yet. Add books to your library to see download links.
            </div>
          )}
        </div>
      )}

      {/* 5. SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="flex flex-col gap-6 text-left max-w-lg">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text">Account Settings</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Manage profile configurations and security details.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 bg-brand-card border border-brand-border rounded-brand-card p-6 shadow-brand">
            <Input
              label="Full Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Input
              label="Registered Email (Cannot change)"
              type="email"
              value={user?.email}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
            <Input
              label="Update Password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="primary" className="h-11 w-full sm:w-fit mt-2 rounded-full text-xs font-bold px-6">
              Save Profile Changes
            </Button>
          </form>
        </div>
      )}

    </DashboardLayout>
  );
};

export default ReaderDashboard;
