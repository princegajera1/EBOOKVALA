import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Heart, Menu, X, LogOut, LayoutDashboard, 
  Bell, Sun, Moon, BookOpen, Flame, Sparkles, Clock, Compass 
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useApp } from "../../store/AppContext";
import { useWishlist } from "../../hooks/useWishlist";
import { dbService } from "../../services/db";
import { Button } from "../ui/Button";

export const Navbar = () => {
  const { user, logout, isAuthenticated, theme, toggleTheme } = useApp();
  const { wishlist } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [continueReadingBook, setContinueReadingBook] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Keyboard shortcut: Pressing "/" focuses search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchOverlay(true);
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setShowSearchOverlay(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setShowSearchOverlay(false);
  }, [location]);

  // Load "Continue Reading" book dynamically
  useEffect(() => {
    const fetchLastReadBook = async () => {
      if (isAuthenticated && user?.readingProgress) {
        const progressEntries = Object.entries(user.readingProgress);
        if (progressEntries.length > 0) {
          // Sort by lastRead descending
          progressEntries.sort((a, b) => new Date(b[1].lastRead) - new Date(a[1].lastRead));
          const latestBookId = progressEntries[0][0];
          const allBooks = await dbService.getBooks();
          const bookObj = allBooks.find(b => b.id === latestBookId);
          setContinueReadingBook(bookObj);
        }
      } else {
        setContinueReadingBook(null);
      }
    };
    fetchLastReadBook();
  }, [user, isAuthenticated]);

  // Handle Search Suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        const allBooks = await dbService.getBooks();
        const filtered = allBooks.filter(
          (b) =>
            b.status === "published" &&
            (b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              b.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              b.categories.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())))
        );
        setSuggestions(filtered.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    };
    getSuggestions();
  }, [searchQuery]);

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchOverlay(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchOverlay(false);
      setSearchQuery("");
    }
  };

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "author") return "/author/dashboard";
    return "/dashboard";
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Explore Library", path: "/marketplace" },
    { label: "About", path: "/about" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact Us", path: "/contact" }
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[76px] flex items-center transition-all duration-300 ${
          isScrolled 
            ? "bg-brand-bg/95 backdrop-blur-[10px] shadow-brand border-b border-brand-border/40" 
            : "bg-brand-bg border-b border-brand-border"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          
          {/* Left Column: Logo */}
          <Link 
            to="/" 
            className="text-[22px] font-extrabold tracking-tighter text-brand-text select-none leading-none hover:opacity-90 shrink-0 font-display"
          >
            EBOOKVALA
          </Link>

          {/* Center Column: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, idx) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={idx}
                  to={link.path}
                  className={`relative py-1 text-[13px] font-medium transition-colors duration-200 hover:text-brand-text ${
                    isActive ? "text-brand-text font-bold" : "text-brand-text-secondary"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span 
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-accent rounded-full" 
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Column: Search & Actions */}
          <div className="flex items-center gap-6">
            {/* Smart Search Bar */}
            <div ref={searchContainerRef} className="hidden md:flex items-center relative w-64 max-w-[260px]">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative group">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search books, authors..."
                    value={searchQuery}
                    onFocus={() => setShowSearchOverlay(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-bg-secondary border border-brand-border/60 hover:border-brand-border/90 hover:bg-brand-bg-secondary/75 pl-9 pr-8 py-2.5 text-xs rounded-full focus:outline-none focus:bg-brand-bg focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 transition-all placeholder:text-brand-text-secondary/55 text-brand-text font-medium"
                  />
                  <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-brand-text-secondary/50 transition-colors group-focus-within:text-brand-accent" />
                  <span className="absolute right-3.5 top-2.5 py-0.5 px-1.5 rounded bg-brand-bg border border-brand-border/80 text-[8.5px] font-bold text-brand-text-secondary/70 shadow-sm select-none pointer-events-none group-focus-within:opacity-0 transition-opacity duration-200">
                    /
                  </span>
                </div>
              </form>

              {/* Smart Suggestions Overlay */}
              <AnimatePresence>
                {showSearchOverlay && (searchQuery.trim().length > 1 || suggestions.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-11 left-0 right-0 z-50 bg-brand-card border border-brand-border rounded-brand-card shadow-brand-hover p-2 select-none"
                  >
                    {suggestions.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-brand-accent" /> Live Suggestions
                        </p>
                        {suggestions.map((book) => (
                          <Link
                            key={book.id}
                            to={`/book/${book.slug}`}
                            onClick={() => setShowSearchOverlay(false)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-bg-secondary transition-colors text-left"
                          >
                            <div className="h-10 w-7 rounded overflow-hidden bg-brand-bg border border-brand-border shrink-0">
                              <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-brand-text truncate">{book.title}</p>
                              <p className="text-[10px] text-brand-text-secondary truncate">by {book.authorName}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-brand-text-secondary">
                        No matching books found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 select-none">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text transition-all duration-200 cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Wishlist Link */}
                  <Link
                    to="/dashboard?tab=wishlist"
                    className="p-2 rounded-full hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text transition-colors relative"
                    aria-label="Wishlist"
                  >
                    <Heart className={`h-4.5 w-4.5 ${wishlist.length > 0 ? "fill-brand-text text-brand-text" : ""}`} />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-brand-accent text-white text-[8px] font-bold flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  {/* Continue Reading Button (Instantly visible if progress exists) */}
                  {continueReadingBook && (
                    <Link
                      to={`/dashboard?tab=home`}
                      className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-accent/10 hover:bg-brand-accent/15 text-brand-accent text-xs font-semibold transition-all"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Continue Reading</span>
                    </Link>
                  )}

                  {/* Reading Stats (Streak count) with Premium Glow & Hover Animation */}
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full cursor-pointer hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all select-none"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.12, 1],
                        rotate: [0, 4, -4, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                    </motion.div>
                    <span>{user?.readingStreak || 3}d Streak</span>
                  </motion.div>

                  {/* Profile Button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 cursor-pointer focus:outline-none"
                    >
                      <div className="h-8.5 w-8.5 rounded-full border border-brand-border overflow-hidden bg-brand-bg-secondary shadow-sm hover:ring-2 hover:ring-brand-accent/50 transition-all">
                        <img 
                          src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
                          alt={user.displayName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.18 }}
                            className="absolute right-0 mt-2.5 w-56 z-50 bg-brand-card border border-brand-border rounded-brand-card shadow-brand-hover p-1.5"
                          >
                            <div className="px-3 py-2.5 border-b border-brand-border select-none text-left">
                              <p className="text-xs font-bold text-brand-text truncate">{user.displayName}</p>
                              <p className="text-[10px] text-brand-text-secondary truncate mt-0.5">{user.email}</p>
                              <div className="inline-block mt-2 px-2 py-0.5 bg-brand-accent/15 text-brand-accent text-[9px] font-bold uppercase rounded-full">
                                {user.role} Account
                              </div>
                            </div>
                            <div className="py-1">
                              <Link
                                to={getDashboardLink()}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-brand-text hover:bg-brand-bg-secondary transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <LayoutDashboard className="h-4 w-4 text-brand-text-secondary" />
                                My Dashboard
                              </Link>
                              {continueReadingBook && (
                                <Link
                                  to={`/dashboard?tab=home`}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-brand-text hover:bg-brand-bg-secondary transition-colors"
                                  onClick={() => setIsProfileOpen(false)}
                                >
                                  <BookOpen className="h-4 w-4 text-brand-text-secondary" />
                                  Resume: {continueReadingBook.title.slice(0, 14)}...
                                </Link>
                              )}
                              <button
                                onClick={() => {
                                  logout();
                                  setIsProfileOpen(false);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-brand-danger hover:bg-brand-danger/10 transition-colors cursor-pointer"
                              >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* Guest Auth Buttons */
                <div className="flex items-center gap-2 select-none">
                  <Link to="/login">
                    <Button variant="secondary" size="sm" className="h-9 px-4 rounded-brand-btn text-xs font-bold bg-transparent border-transparent hover:bg-brand-bg-secondary">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" className="h-9 px-4 rounded-brand-btn text-xs font-bold shadow-sm">
                      Start Free
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Responsive Navigation) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm z-50 bg-brand-card border-l border-brand-border p-6 flex flex-col justify-between shadow-brand-hover"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-brand-border">
                  <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider font-mono">Navigation</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-brand-bg-secondary text-brand-text-secondary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Links */}
                <div className="flex flex-col gap-4 mt-6 text-left">
                  {navLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      to={link.path}
                      className="text-base font-bold text-brand-text hover:text-brand-accent transition-colors py-1 flex items-center gap-2"
                    >
                      <Compass className="h-4.5 w-4.5 text-brand-text-secondary/70" />
                      {link.label}
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <Link
                      to="/dashboard?tab=wishlist"
                      className="text-base font-bold text-brand-text hover:text-brand-accent transition-colors py-1 flex items-center gap-2"
                    >
                      <Heart className="h-4.5 w-4.5 text-brand-text-secondary/70" />
                      Wishlist ({wishlist.length})
                    </Link>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-brand-border flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 mb-2 px-1 text-left">
                      <div className="h-11 w-11 rounded-full border border-brand-border overflow-hidden bg-brand-bg-secondary shrink-0">
                        <img 
                          src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
                          alt={user.displayName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-text truncate">{user.displayName}</p>
                        <p className="text-[10px] text-brand-text-secondary truncate mt-0.5">{user.email}</p>
                        <p className="text-[9px] font-bold text-amber-500 mt-1 flex items-center gap-0.5">
                          <Flame className="h-3 w-3 fill-amber-500" /> {user?.readingStreak || 3} Day Streak
                        </p>
                      </div>
                    </div>
                    <Link to={getDashboardLink()} className="w-full">
                      <Button variant="outline" className="w-full text-xs font-bold py-2.5 rounded-brand-btn">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full text-brand-danger hover:bg-brand-danger/10 text-xs font-bold py-2.5 rounded-brand-btn"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="w-full">
                      <Button variant="secondary" className="w-full font-bold">Login</Button>
                    </Link>
                    <Link to="/register" className="w-full">
                      <Button variant="primary" className="w-full font-bold shadow-sm">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
