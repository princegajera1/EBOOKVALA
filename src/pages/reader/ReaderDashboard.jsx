import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  Home as HomeIcon, BookOpen, Heart, Download, Settings, 
  Star, Sparkles, Bell, ArrowRight, Check, Flame, Trophy, 
  TrendingUp, Clock, Library, History, Bookmark, Search, Mic,
  Volume2, MessageSquare, Play, Award, Zap, Compass, Share2,
  Trash2, Send, X, Headphones, BookMarked, Eye, ChevronRight
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
import { motion, AnimatePresence } from "framer-motion";

export const ReaderDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "home");
  const navigate = useNavigate();

  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [allBooksList, setAllBooksList] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings states
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [password, setPassword] = useState("");

  // AI Assistant Panel states
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiSelectedBook, setAiSelectedBook] = useState("");
  const [aiMode, setAiMode] = useState("standard"); // standard, simple, technical
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", text: "Hello! I am your EBOOKVALA AI Reading Assistant. Select a book above or ask me to explain, summarize, or quiz you on any topic!" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiWriting, setAiWriting] = useState(false);
  const chatEndRef = useRef(null);

  // Search/Filters
  const [searchText, setSearchText] = useState("");
  const [dailyGoalMins, setDailyGoalMins] = useState(30);
  const [currentReadMins, setCurrentReadMins] = useState(18);

  // Community State Mock
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Aditi Sharma",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Aditi",
      book: "Designing Data-Intensive Applications",
      content: "Just finished Chapter 5 on Replication. The trade-offs between single-leader and multi-leader replication are beautifully explained. Highly recommend it to anyone building scalable systems!",
      likes: 12,
      liked: false,
      comments: 3,
      time: "2 hours ago"
    },
    {
      id: 2,
      author: "Rohan Gupta",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rohan",
      book: "Clean Code",
      content: "Remember: 'Code is clean if it can be understood by a teammate in a single reading.' Keep those functions small, folks!",
      likes: 24,
      liked: true,
      comments: 8,
      time: "5 hours ago"
    }
  ]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostBook, setNewPostBook] = useState("");

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
        setAllBooksList(allBooks || []);
        
        // 1. Get Purchased/Owned Books
        const purchased = allBooks.filter(b => user.purchasedBooks?.includes(b.id));
        setPurchasedBooks(purchased);
        if (purchased.length > 0 && !aiSelectedBook) {
          setAiSelectedBook(purchased[0].id);
        }
        
        // 2. Get Wishlisted Books
        const wish = allBooks.filter(b => user.wishlist?.includes(b.id));
        setWishlistBooks(wish);

        // 3. Get AI Recommendations based on categories
        const purchasedCategories = purchased.flatMap(b => b.categories || []);
        const uniqueCategories = [...new Set(purchasedCategories)];
        const recommendations = allBooks.filter(
          b => !user.purchasedBooks?.includes(b.id) && 
          b.status === "published" &&
          (uniqueCategories.length === 0 || b.categories?.some(cat => uniqueCategories.includes(cat)))
        );
        setRecommendedBooks(recommendations.slice(0, 3));

        // 4. Fetch reviews left by this user
        try {
          const reviews = await dbService.getReviewsByUserId(user.uid);
          setUserReviews(reviews || []);
        } catch (e) {
          setUserReviews([]);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Scroll to bottom of AI chat when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages]);

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

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    const newPost = {
      id: Date.now(),
      author: user?.displayName || "Anonymous Reader",
      avatar: user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`,
      book: newPostBook || "General Discussion",
      content: newPostContent,
      likes: 0,
      liked: false,
      comments: 0,
      time: "Just now"
    };
    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setNewPostBook("");
    toast.success("Post shared with community!");
  };

  const handleLikePost = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  // AI Assistant action handlers
  const askAI = async (queryText) => {
    if (!queryText.trim()) return;
    
    // Add user message
    const userMsg = { role: "user", text: queryText };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput("");
    setAiWriting(true);

    // Mock realistic answers based on selected book and query
    setTimeout(() => {
      const activeBookObj = allBooksList.find(b => b.id === aiSelectedBook);
      const title = activeBookObj ? activeBookObj.title : "Active Book";
      
      let reply = "";
      const q = queryText.toLowerCase();

      if (q.includes("summarize") || q.includes("summary")) {
        reply = `Here is a summary of ${title}. It focuses on core conceptual methodologies, step-by-step optimization strategies, and robust development patterns. Chapter 1 introduces fundamental building blocks, while subsequent chapters expand into deep systems analysis and real-world architectures.`;
      } else if (q.includes("quiz") || q.includes("test")) {
        reply = `Let's test your knowledge on ${title}!\n\n**Question:** What is the primary architectural bottleneck discussed in Chapter 2, and how does asynchronous concurrency resolve it?\n\n*Reply directly to answer this question!*`;
      } else if (q.includes("quote") || q.includes("takeaway")) {
        reply = `Key takeaway from ${title}:\n\n> "Simplicity is a prerequisite for reliability. Complex architectures hide subtle failure modes."\n\nEnsure your design abstracts dependencies cleanly.`;
      } else {
        reply = `Great question. Regarding "${queryText}" in relation to ${title}, the text emphasizes utilizing isolated interfaces to contain boundary errors. Under ${aiMode === "simple" ? "a basic explanation mode" : "a production technical context"}, this prevents runtime side effects.`;
      }

      setAiMessages(prev => [...prev, { role: "assistant", text: reply }]);
      setAiWriting(false);
    }, 1200);
  };

  const sidebarLinks = [
    { id: "home", label: "Overview", icon: HomeIcon },
    { id: "library", label: "My Library", icon: BookOpen },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "community", label: "Community Feed", icon: MessageSquare },
    { id: "downloads", label: "Downloads", icon: Download },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Derive stats
  const totalPages = Object.values(user?.readingProgress || {}).reduce(
    (sum, p) => sum + (p.currentPage || 0),
    0
  );

  const computeStreak = () => {
    const progress = user?.readingProgress || {};
    const readDates = new Set(
      Object.values(progress)
        .filter(p => p.lastRead)
        .map(p => new Date(p.lastRead).toLocaleDateString("en-CA"))
    );

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toLocaleDateString("en-CA");
      if (readDates.has(key)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak || 3; // Fallback to 3 if new
  };
  const activeStreak = computeStreak();

  const computeProfileCompletion = () => {
    const checks = [
      !!user?.displayName,
      !!user?.email,
      !!user?.photoURL,
      (user?.purchasedBooks?.length || 0) > 0,
      (user?.wishlist?.length || 0) > 0,
      activeStreak > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };
  const profileCompletion = computeProfileCompletion();

  const achievements = [
    { id: 1, name: "First Chapter", desc: "Started reading your first publication", xp: 100, unlocked: true },
    { id: 2, name: "Bookworm", desc: "Own 5 or more digital books", xp: 250, unlocked: purchasedBooks.length >= 5 },
    { id: 3, name: "Word Master", desc: "Requested 10+ AI vocabulary lookups", xp: 150, unlocked: true },
    { id: 4, name: "Super Streak", desc: "Maintained a 3+ day streak", xp: 300, unlocked: activeStreak >= 3 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center select-none text-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-bold text-brand-text-secondary">Loading reader workspace...</span>
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
      {/* Sticky top navbar search & widgets */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-[#090909]/80 border-b border-brand-border py-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 px-2 select-none">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="Quick AI Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-[#111] border border-brand-border rounded-full pl-9 pr-8 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent placeholder:text-brand-text-secondary/50"
          />
          <Mic className="absolute right-3 top-3 h-3.5 w-3.5 text-brand-text-secondary hover:text-brand-text cursor-pointer" />
        </div>

        {/* Daily Goal tracker & Streak metrics */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 bg-[#181818] border border-brand-border rounded-full py-1.5 px-4 text-xs font-bold text-brand-text">
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-bounce" />
            <span>{activeStreak} Day Streak</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono">Daily Goal:</span>
            <div className="relative h-9 w-9 rounded-full border border-brand-border bg-[#181818] flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold text-brand-accent">
                {Math.round((currentReadMins / dailyGoalMins) * 100)}%
              </span>
            </div>
          </div>

          <button className="relative p-2 rounded-full border border-brand-border hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text cursor-pointer">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-brand-accent" />
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === "home" && (
        <div className="flex flex-col gap-8 text-left select-none transition-colors duration-300">
          {/* Greeting Hero Header */}
          <div className="bg-gradient-to-r from-brand-accent/15 via-[#181818] to-[#181818] border border-brand-border rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-accent/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full">
                PREMIUM SUBSCRIBER
              </span>
              <h1 className="text-3xl font-display font-black text-brand-text mt-3">
                Good Morning, {user?.displayName ? user.displayName.split(" ")[0] : "Reader"} 👋
              </h1>
              <p className="text-xs text-brand-text-secondary mt-1.5 font-semibold">
                Explore the latest publications or continue your active reading path.
              </p>
            </div>
            
            <div className="bg-[#090909]/40 backdrop-blur-md border border-brand-border rounded-2xl p-4 flex flex-col gap-1.5 w-full md:w-64">
              <div className="flex justify-between items-center text-[10px] font-bold text-brand-text">
                <span>Profile Completion</span>
                <span className="text-brand-accent">{profileCompletion}%</span>
              </div>
              <div className="h-2 bg-brand-bg-secondary rounded-full overflow-hidden border border-brand-border">
                <div className="h-full bg-brand-accent rounded-full" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
          </div>

          {/* Continue Reading - Large Hero Widget */}
          {purchasedBooks.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">Continue Reading</h3>
                <span className="text-[10px] font-bold text-brand-accent hover:underline cursor-pointer flex items-center gap-1">
                  All books <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              {(() => {
                const book = purchasedBooks[0];
                const progress = user?.readingProgress?.[book.id] || { currentPage: 1, totalPages: 100 };
                const percentage = Math.min(100, Math.max(1, Math.round((progress.currentPage / (book.pages || 100)) * 100)));
                return (
                  <div className="flex flex-col md:flex-row gap-6 p-6 border border-brand-border rounded-[24px] bg-[#181818] shadow-brand relative group overflow-hidden">
                    <div className="h-44 w-30 bg-brand-bg border border-brand-border/40 rounded-xl overflow-hidden shrink-0 shadow-lg relative">
                      <img src={book.coverURL} alt={book.title} className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1 text-left min-w-0">
                      <div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="bg-[#111] border border-brand-border text-brand-accent text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                            {book.categories?.[0] || "eBook"}
                          </span>
                          <span className="text-[10px] text-brand-text-secondary/70 font-mono">
                            Est. completion: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-brand-text mt-2 leading-snug font-display truncate">{book.title}</h4>
                        <p className="text-xs text-brand-text-secondary mt-1">by <strong className="text-brand-text">{book.authorName}</strong></p>
                        
                        <p className="text-xs text-brand-text-secondary/70 mt-3 line-clamp-2 leading-relaxed">
                          {book.subtitle || "Continue reading from where you left off. Access custom dictionary tools, highlight panels, and real-time AI context."}
                        </p>
                      </div>

                      <div className="mt-5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-brand-text-secondary mb-2">
                          <span>Reading Progress</span>
                          <span>{percentage}% ({progress.currentPage}/{book.pages || 100} pages)</span>
                        </div>
                        <ProgressBar value={progress.currentPage} max={book.pages || 100} size="sm" />
                        
                        <div className="flex flex-wrap gap-3 mt-4">
                          <Link to={`/read/${book.slug || book.id}`}>
                            <Button variant="primary" size="sm" className="h-9 px-5 rounded-full text-xs font-bold shadow-sm">
                              <Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Continue Reading
                            </Button>
                          </Link>
                          <Button onClick={() => { setIsAiOpen(true); setAiSelectedBook(book.id); }} variant="outline" size="sm" className="h-9 px-4 rounded-full text-xs font-bold border-brand-border text-brand-text hover:bg-brand-bg-secondary">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand-accent" /> Read with AI
                          </Button>
                          <a href={book.pdfURL} download={`${book.slug}.pdf`}>
                            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-full text-xs font-bold text-brand-text-secondary hover:bg-brand-bg-secondary">
                              <Download className="mr-1.5 h-3.5 w-3.5" /> Download Offline
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="py-10 text-center border border-dashed border-brand-border rounded-[24px] bg-[#181818] p-6">
              <BookMarked className="h-8 w-8 text-brand-text-secondary opacity-60 mx-auto mb-3" />
              <p className="text-xs font-bold text-brand-text">Your library is currently empty.</p>
              <Button onClick={() => navigate("/marketplace")} variant="primary" className="mt-4 rounded-full text-xs font-bold px-5 h-9">
                Find eBooks
              </Button>
            </div>
          )}

          {/* Quick Actions (Glass cards grid) */}
          <div>
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4 font-mono">Reader Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {[
                { label: "Continue Reading", icon: Play, action: () => { if (purchasedBooks[0]) navigate(`/read/${purchasedBooks[0].id}`); } },
                { label: "Read Offline", icon: Download, action: () => handleTabChange("downloads") },
                { label: "Open Notes", icon: BookMarked, action: () => handleTabChange("settings") },
                { label: "AI Summarizer", icon: Sparkles, action: () => setIsAiOpen(true) },
                { label: "Community Feed", icon: MessageSquare, action: () => handleTabChange("community") },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <button
                    key={i}
                    onClick={act.action}
                    className="p-4 rounded-2xl bg-[#181818] border border-brand-border hover:border-brand-accent/50 hover:bg-[#1f1f1f] transition-all duration-300 text-left flex flex-col gap-4 cursor-pointer group shadow-sm"
                  >
                    <div className="h-8 w-8 rounded-xl bg-[#111] border border-brand-border flex items-center justify-center text-brand-text-secondary group-hover:text-brand-accent transition-colors">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-bold text-brand-text leading-snug">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analytics Overview and Pathway */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual AI Pathway */}
            <div className="lg:col-span-7 text-left">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="h-4.5 w-4.5 text-brand-accent animate-pulse" />
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">AI Recommendation Pathway</h3>
              </div>
              
              {recommendedBooks.length > 0 ? (
                <div className="relative pl-6 border-l border-brand-border flex flex-col gap-6">
                  {recommendedBooks.map((rel) => (
                    <div key={rel.id} className="relative text-left">
                      <span className="absolute -left-[33px] top-2 h-3.5 w-3.5 rounded-full bg-[#181818] border-2 border-brand-accent flex items-center justify-center shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                      </span>
                      
                      <Link 
                        to={`/book/${rel.id}`} 
                        className="flex gap-4 p-4 border border-brand-border rounded-2xl bg-[#181818] hover:bg-[#1f1f1f] hover:translate-y-[-2px] transition-all duration-300 group block"
                      >
                        <div className="h-14 w-9.5 bg-brand-bg-secondary border border-brand-border rounded overflow-hidden shrink-0 shadow-sm">
                          <img src={rel.coverURL} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-grow flex flex-col justify-between py-0.5">
                          <div>
                            <h5 className="text-xs font-bold text-brand-text group-hover:text-brand-accent transition-colors truncate">{rel.title}</h5>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5">Custom match based on your preferences</p>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-brand-accent uppercase tracking-wider">PREDICTED FOR YOU</span>
                        </div>
                        <div className="flex items-center shrink-0 pr-1">
                          <ChevronRight className="h-4 w-4 text-brand-text-secondary group-hover:text-brand-accent transition-colors" />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-brand-border rounded-2xl text-xs text-brand-text-secondary bg-[#181818]">
                  Explore the catalog to build custom path coordinates.
                </div>
              )}
            </div>

            {/* Achievements Milestones */}
            <div className="lg:col-span-5 text-left">
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">Achievements</h3>
              </div>

              <div className="border border-brand-border rounded-2xl bg-[#181818] shadow-brand divide-y divide-brand-border overflow-hidden">
                {achievements.map((ach) => (
                  <div key={ach.id} className="p-4 hover:bg-brand-bg-secondary transition-colors text-left flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      ach.unlocked 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                        : "bg-brand-bg-secondary border-brand-border text-brand-text-secondary/40"
                    }`}>
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-brand-text">{ach.name}</h5>
                        <span className="text-[8px] font-mono bg-brand-accent/15 text-brand-accent px-1.5 py-0.5 rounded">+{ach.xp} XP</span>
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
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text">My Library</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Access your purchased and registered eBooks.</p>
          </div>

          {purchasedBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {purchasedBooks.map((book) => (
                <motion.div 
                  key={book.id}
                  whileHover={{ y: -4 }}
                  className="flex flex-col bg-[#181818] rounded-2xl border border-brand-border shadow-brand transition-all duration-300 group overflow-hidden"
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
                      <Link to={`/read/${book.slug || book.id}`}>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-full text-xs h-9 rounded-full font-bold shadow-sm"
                        >
                          Read Now
                        </Button>
                      </Link>
                      <a href={book.pdfURL} download={`${book.slug || book.id}.pdf`}>
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
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
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

      {/* 4. ACHIEVEMENTS TAB */}
      {activeTab === "achievements" && (
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text">Achievements & progression</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Track XP milestones, level unlock progress, and badges.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none font-display">
            <div className="p-5 border border-brand-border rounded-[20px] bg-[#181818]">
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-text-secondary uppercase">Level Progress</span>
              <h3 className="text-3xl font-black text-brand-text mt-3">Level 4</h3>
              <p className="text-xs text-brand-text-secondary mt-1">450 / 1000 XP to next level</p>
              <div className="h-2 bg-brand-bg-secondary border border-brand-border rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-brand-accent rounded-full" style={{ width: "45%" }} />
              </div>
            </div>
            <div className="p-5 border border-brand-border rounded-[20px] bg-[#181818]">
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-text-secondary uppercase">Points Accrued</span>
              <h3 className="text-3xl font-black text-brand-text mt-3">1,420 Coins</h3>
              <p className="text-xs text-brand-text-secondary mt-1">Earned via review streaks & notes</p>
            </div>
            <div className="p-5 border border-brand-border rounded-[20px] bg-[#181818]">
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-text-secondary uppercase">Focus Score</span>
              <h3 className="text-3xl font-black text-brand-text mt-3">94%</h3>
              <p className="text-xs text-brand-text-secondary mt-1">Consistent daily read metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {achievements.map((ach) => (
              <div key={ach.id} className="p-5 border border-brand-border bg-[#181818] rounded-[20px] flex flex-col justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${
                    ach.unlocked ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-brand-bg-secondary border-brand-border text-brand-text-secondary/40"
                  }`}>
                    <Trophy className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-brand-accent uppercase tracking-widest">
                    {ach.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <div className="text-left mt-2">
                  <h5 className="text-xs font-bold text-brand-text">{ach.name}</h5>
                  <p className="text-[10px] text-brand-text-secondary mt-1 leading-relaxed">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. COMMUNITY TAB */}
      {activeTab === "community" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left select-none animate-fade-in">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text">Community Discussions</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Share your key highlights, notes, and thoughts with fellow readers.</p>
            </div>

            {/* Create new post */}
            <form onSubmit={handleCreatePost} className="p-5 border border-brand-border bg-[#181818] rounded-[20px] flex flex-col gap-4">
              <textarea
                placeholder="Share your thoughts or highlight takeaways..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                className="w-full bg-[#111] border border-brand-border rounded-[14px] p-3 text-xs focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/40"
              />
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <input
                  type="text"
                  placeholder="Reference Book (optional)"
                  value={newPostBook}
                  onChange={(e) => setNewPostBook(e.target.value)}
                  className="w-full sm:w-60 bg-[#111] border border-brand-border rounded-full px-4 py-1.5 text-xs text-brand-text placeholder:text-brand-text-secondary/40"
                />
                <Button type="submit" variant="primary" size="sm" className="h-9 rounded-full text-xs font-bold px-5">
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Share Note
                </Button>
              </div>
            </form>

            {/* Social feed list */}
            <div className="flex flex-col gap-4">
              {posts.map((p) => (
                <div key={p.id} className="p-5 border border-brand-border bg-[#181818] rounded-[20px] flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt="" className="h-9 w-9 rounded-full bg-brand-bg-secondary" />
                      <div>
                        <h5 className="text-xs font-bold text-brand-text">{p.author}</h5>
                        <p className="text-[9px] text-brand-text-secondary font-mono mt-0.5">{p.time}</p>
                      </div>
                    </div>
                    {p.book && (
                      <span className="bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                        {p.book}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-text-secondary leading-relaxed">{p.content}</p>
                  
                  <div className="h-px bg-brand-border/60" />
                  <div className="flex gap-4 text-[10px] font-bold text-brand-text-secondary select-none">
                    <button onClick={() => handleLikePost(p.id)} className={`hover:text-brand-accent flex items-center gap-1.5 cursor-pointer ${p.liked ? "text-brand-accent" : ""}`}>
                      <Heart className={`h-4 w-4 ${p.liked ? "fill-current" : ""}`} /> {p.likes} Likes
                    </button>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" /> {p.comments} Comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 text-left flex flex-col gap-5">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Trending Channels</h4>
            <div className="border border-brand-border rounded-[20px] bg-[#181818] p-4 flex flex-col gap-3 font-display">
              {[
                { title: "#scalable-systems", readers: 48 },
                { title: "#clean-code", readers: 104 },
                { title: "#startup-frameworks", readers: 32 },
              ].map((ch, i) => (
                <div key={i} className="flex justify-between items-center py-1 hover:bg-[#1f1f1f] rounded px-2 cursor-pointer transition-colors">
                  <span className="text-xs font-bold text-brand-text">{ch.title}</span>
                  <span className="text-[9px] font-mono text-brand-text-secondary bg-[#111] px-2 py-0.5 rounded-full">
                    {ch.readers} active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. DOWNLOADS TAB */}
      {activeTab === "downloads" && (
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text">Local Downloads</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Manage downloaded files for offline access.</p>
          </div>

          {purchasedBooks.length > 0 ? (
            <div className="border border-brand-border rounded-brand-card shadow-brand overflow-hidden bg-[#181818]">
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
                    <tr key={book.id} className="border-b border-brand-border last:border-0 hover:bg-brand-bg-secondary/40 transition-colors">
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
            <div className="text-center py-12 border border-dashed border-brand-border rounded-brand-card text-xs text-brand-text-secondary bg-[#181818]">
              No files saved yet. Add books to your library to see download links.
            </div>
          )}
        </div>
      )}

      {/* 7. SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="flex flex-col gap-6 text-left max-w-lg animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text">Account Settings</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Manage profile configurations and security details.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 bg-[#181818] border border-brand-border rounded-brand-card p-6 shadow-brand">
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

      {/* Persistent Floating AI Reader Assistant Console */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        {/* Toggle Button with pulse animation */}
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="h-14 w-14 rounded-full bg-brand-accent hover:bg-brand-accent/90 text-white flex items-center justify-center shadow-lg relative cursor-pointer group transition-transform duration-300 hover:scale-105"
        >
          <span className="absolute inset-0 rounded-full bg-brand-accent/25 animate-ping group-hover:animate-none" />
          {isAiOpen ? <X className="h-6 w-6 relative z-10" /> : <Sparkles className="h-6 w-6 relative z-10" />}
        </button>

        {/* Console Panel */}
        <AnimatePresence>
          {isAiOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[550px] bg-[#181818]/90 backdrop-blur-xl border border-brand-border rounded-[24px] shadow-2xl flex flex-col overflow-hidden font-display text-left"
            >
              {/* Header */}
              <div className="p-4 border-b border-brand-border bg-[#090909]/60 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-accent" />
                  <div>
                    <h4 className="text-xs font-bold text-brand-text">EBOOKVALA AI Assistant</h4>
                    <p className="text-[9px] text-brand-text-secondary mt-0.5">Contextual reading support</p>
                  </div>
                </div>
                
                {/* Explanation Mode selector */}
                <select
                  value={aiMode}
                  onChange={(e) => setAiMode(e.target.value)}
                  className="bg-[#111] border border-brand-border text-[9.5px] font-bold text-brand-text-secondary rounded-full px-3 py-1 cursor-pointer focus:outline-none"
                >
                  <option value="standard">Standard</option>
                  <option value="simple">Explain like I'm 10</option>
                  <option value="technical">Explain technically</option>
                </select>
              </div>

              {/* Book context select */}
              <div className="p-3 border-b border-brand-border/40 bg-[#111] flex items-center justify-between gap-2">
                <span className="text-[9px] font-mono font-bold text-brand-text-secondary uppercase">Context:</span>
                <select
                  value={aiSelectedBook}
                  onChange={(e) => setAiSelectedBook(e.target.value)}
                  className="flex-1 bg-transparent text-xs font-bold text-brand-text focus:outline-none cursor-pointer max-w-[250px]"
                >
                  {purchasedBooks.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                  {purchasedBooks.length === 0 && (
                    <option value="">General Chat</option>
                  )}
                </select>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-[#090909]/40">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto text-right" : "mr-auto text-left"}`}>
                    <span className="text-[9px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest mb-1.5 select-none">
                      {msg.role === "user" ? "You" : "AI Assistant"}
                    </span>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-brand-accent text-white rounded-tr-none" 
                        : "bg-[#181818] border border-brand-border text-brand-text rounded-tl-none"
                    }`}>
                      {msg.text.split("\n").map((line, idx) => (
                        <p key={idx} className={idx > 0 ? "mt-2" : ""}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
                {aiWriting && (
                  <div className="mr-auto text-left max-w-[80%]">
                    <span className="text-[9px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest mb-1.5 select-none">AI Assistant</span>
                    <div className="p-3 rounded-2xl bg-[#181818] border border-brand-border text-brand-text rounded-tl-none flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-brand-accent rounded-full animate-bounce" />
                      <span className="h-1.5 w-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Actions Panel */}
              <div className="p-2 border-t border-brand-border/40 bg-[#111] flex gap-1.5 overflow-x-auto select-none">
                <button onClick={() => askAI("Summarize this book")} className="shrink-0 bg-[#181818] border border-brand-border hover:border-brand-accent text-[9px] font-bold text-brand-text px-3 py-1 rounded-full transition-colors cursor-pointer">
                  Summarize Book
                </button>
                <button onClick={() => askAI("Generate a quiz for this chapter")} className="shrink-0 bg-[#181818] border border-brand-border hover:border-brand-accent text-[9px] font-bold text-brand-text px-3 py-1 rounded-full transition-colors cursor-pointer">
                  Generate Quiz
                </button>
                <button onClick={() => askAI("Extract core takeaways")} className="shrink-0 bg-[#181818] border border-brand-border hover:border-brand-accent text-[9px] font-bold text-brand-text px-3 py-1 rounded-full transition-colors cursor-pointer">
                  Key Takeaways
                </button>
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={(e) => { e.preventDefault(); askAI(aiInput); }}
                className="p-3 border-t border-brand-border bg-[#090909]/80 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question about the book..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-1 bg-[#111] border border-brand-border rounded-[14px] px-3.5 py-2 text-xs text-brand-text placeholder:text-brand-text-secondary/40 focus:outline-none"
                />
                <button type="submit" className="h-8.5 w-8.5 rounded-full bg-brand-accent hover:bg-brand-accent/90 text-white flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </DashboardLayout>
  );
};

export default ReaderDashboard;
