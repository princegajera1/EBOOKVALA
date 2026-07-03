import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, ArrowLeft, Mail, ChevronLeft, ChevronRight, 
  ShieldCheck, Search, BookOpen, Download, BrainCircuit, Users, BookMarked, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { dbService } from "../services/db";
import { CategoriesSection } from "../components/sections/CategoriesSection";
import { FadeUp } from "../components/common/FadeUp";
import { BookCard } from "../components/book/BookCard";

// Hero Book Covers Mockup Configurations
const heroBooks = [
  {
    id: 1,
    title: "Designing for Scale",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=280&h=420&fit=crop"
  },
  {
    id: 2,
    title: "Zero to $10M ARR",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=280&h=420&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "The Minimalist UI",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=280&h=420&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "Atomic Habits",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=280&h=420&fit=crop&crop=center"
  },
  {
    id: 5,
    title: "Think Again",
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=280&h=420&fit=crop&crop=center"
  }
];

const positions = [
  { rotate: -18, x: -110, y: 30, scale: 0.78, opacity: 0.45 },
  { rotate: -9,  x: -55,  y: 12, scale: 0.87, opacity: 0.68 },
  { rotate: -1,  x: 0,    y: 0,  scale: 1.00, opacity: 1.00 },
  { rotate: 9,   x: 55,   y: 12, scale: 0.87, opacity: 0.68 },
  { rotate: 18,  x: 110,  y: 30, scale: 0.78, opacity: 0.45 },
];

export const Landing = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  
  const [activeIdx, setActiveIdx] = useState(2);
  const [isEntered, setIsEntered] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsEntered(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const allBooks = await dbService.getBooks();
      const published = allBooks.filter(b => b.status === "published");
      
      setFeaturedBooks(published.filter(b => b.isFeatured));
      
      const sortedBySales = [...published].sort((a, b) => b.salesCount - a.salesCount).slice(0, 9);
      setBestSellers(sortedBySales);

      // Recently added (sorted by date or ID decending)
      const sortedByDate = [...published].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
      setRecentlyAdded(sortedByDate);
    };
    fetchData();
  }, []);

  const handleCarouselScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(heroSearchQuery.trim())}`);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="flex flex-col select-none bg-brand-bg transition-colors duration-300">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[85vh] pt-28 pb-16 scroll-mt-[76px]">
        
        {/* Left Content */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/25 text-brand-accent text-xs font-bold w-fit uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> 100% Free Open Library
          </div>

          <h1 
            className="text-5xl sm:text-6xl lg:text-[70px] font-display font-black text-brand-text leading-[1.05] tracking-tight"
          >
            Your next great read is <br className="hidden sm:inline" />
            <span className="text-brand-accent">completely free.</span>
          </h1>
          
          <p className="text-base sm:text-lg font-medium text-brand-text-secondary leading-relaxed max-w-xl">
            Read, download, and study with advanced AI assistants on technology, design, and business. No pricing plans. No billing dashboards. 100% community-driven.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="font-bold h-12.5 px-6 rounded-full border-brand-border hover:bg-brand-bg-secondary text-brand-text">
                Browse Library
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register?role=author">
              <Button variant="ghost" size="lg" className="font-bold h-12.5 px-6 rounded-full text-brand-text hover:bg-brand-bg-secondary">
                Publish a Book
              </Button>
            </Link>
          </div>

          {/* Embedded Hero Search */}
          <form onSubmit={handleHeroSearch} className="w-full max-w-lg mt-2">
            <div className="relative flex items-center p-1.5 rounded-2xl bg-brand-bg-secondary border border-brand-border shadow-brand focus-within:ring-4 focus-within:ring-brand-accent/10 focus-within:border-brand-accent transition-all duration-300">
              <Search className="absolute left-4.5 h-4.5 w-4.5 text-brand-text-secondary/50" />
              <input
                type="text"
                placeholder="Search tech, design, business books..."
                value={heroSearchQuery}
                onChange={(e) => setHeroSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none pl-11 pr-32 py-3 text-xs sm:text-sm font-semibold placeholder:text-brand-text-secondary/50 text-brand-text"
              />
              <Button type="submit" variant="primary" className="absolute right-1.5 h-10.5 px-5 text-xs font-bold rounded-xl shadow-sm">
                Search
              </Button>
            </div>
          </form>

          {/* Stat Numbers */}
          <div className="mt-8 pt-8 border-t border-brand-border flex flex-wrap gap-6 lg:gap-10 select-none">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs leading-tight">
                <p className="font-bold text-brand-text">4.9/5 Rating</p>
                <p className="text-brand-text-secondary">50,000+ Readers</p>
              </div>
            </div>
            
            <div className="hidden sm:block h-8 w-[1px] bg-brand-border" />
            
            <div className="text-xs leading-tight">
              <p className="font-bold text-brand-text">10,000+ eBooks</p>
              <p className="text-brand-text-secondary">Free Access</p>
            </div>
            
            <div className="hidden sm:block h-8 w-[1px] bg-brand-border" />
            
            <div className="text-xs leading-tight">
              <p className="font-bold text-brand-text">100% Free Forever</p>
              <p className="text-brand-text-secondary">First Year Guarantee</p>
            </div>
          </div>
        </div>

        {/* Right Floating Mockups Stack */}
        <motion.div 
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="lg:col-span-5 h-[360px] sm:h-[440px] lg:h-[520px] relative flex items-center justify-center overflow-visible"
        >
          <div className="absolute h-[380px] w-[380px] rounded-full bg-brand-accent/5 z-0 blur-2xl pointer-events-none" />
          
          <div className="relative w-[210px] h-[315px] z-10">
            {heroBooks.map((book, idx) => {
              const posIdx = (idx - activeIdx + 2 + 5) % 5;
              const pos = positions[posIdx];
              const zIndex = posIdx === 2 ? 5 : (posIdx === 1 || posIdx === 3 ? 3 : 1);
              const isActive = posIdx === 2;

              return (
                <motion.div
                  key={book.id}
                  onClick={() => setActiveIdx(idx)}
                  animate={{ 
                    opacity: pos.opacity, 
                    x: pos.x, 
                    rotate: pos.rotate, 
                    scale: pos.scale,
                    y: [pos.y, pos.y - 6, pos.y]
                  }}
                  transition={{
                    y: { 
                      duration: 4.5 + idx * 0.4, 
                      repeat: Infinity, 
                      ease: "easeInOut"
                    },
                    default: { 
                      type: "spring", 
                      stiffness: 170, 
                      damping: 24
                    }
                  }}
                  className="absolute inset-0 cursor-pointer"
                  style={{ zIndex }}
                >
                  <div 
                    className={`w-[210px] aspect-[2/3] rounded-[18px] overflow-hidden transition-all duration-300 ${
                      isActive 
                        ? "shadow-brand-hover border-2 border-brand-accent/30" 
                        : "shadow-brand border border-brand-border"
                    } bg-brand-card`}
                  >
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-full h-full object-cover select-none"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </section>

      {/* 2. RECENTLY ADDED */}
      {recentlyAdded.length > 0 && (
        <div className="bg-brand-bg-secondary border-t border-brand-border py-16 md:py-20 transition-colors duration-300 scroll-mt-[76px]">
          <div className="max-w-7xl mx-auto px-6 w-full text-left">
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">New Arrivals</span>
            <h2 className="text-3xl font-display font-black text-brand-text mt-3 mb-8">Recently Added Books</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyAdded.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. FEATURED BOOKS (Carousel) */}
      <div className="bg-brand-bg border-t border-brand-border py-16 md:py-20 scroll-mt-[76px]">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-end justify-between mb-8">
            <div className="text-left">
              <FadeUp delay={0}>
                <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase">Editor's Choice</span>
              </FadeUp>
              <FadeUp delay={0.05}>
                <h2 className="text-3xl sm:text-[42px] font-display font-bold text-brand-text mt-1">
                  Featured This Week
                </h2>
              </FadeUp>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/marketplace">
                <Button variant="secondary" size="sm" className="h-9 px-4 text-xs font-bold rounded-full border-brand-border bg-brand-bg hover:bg-brand-bg-secondary text-brand-text">
                  View All
                </Button>
              </Link>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleCarouselScroll("prev")}
                  className="p-2.5 rounded-full border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text cursor-pointer transition-colors"
                  aria-label="Previous featured books"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleCarouselScroll("next")}
                  className="p-2.5 rounded-full border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text cursor-pointer transition-colors"
                  aria-label="Next featured books"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Window */}
          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
          >
            {featuredBooks.map((book, idx) => (
              <FadeUp key={book.id} delay={idx * 0.08}>
                <div className="w-[280px] shrink-0 snap-start">
                  <BookCard book={book} />
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>

      {/* 4. VALUE PROPOSITION GRID (Replaces PricingSection) */}
      <div className="bg-brand-bg-secondary border-t border-brand-border py-12 md:py-16 transition-colors duration-300 scroll-mt-[76px]">
        <section className="max-w-7xl mx-auto px-6 w-full text-center">
          <FadeUp delay={0}>
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">Platform Value</span>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3" style={{ letterSpacing: "-0.02em" }}>
              Platform Benefits
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-secondary mt-3 mb-8 max-w-md mx-auto font-semibold">
              Enjoy 100% free access to all core features for our launching year. No subscriptions required.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeUp delay={0.1}>
              <div className="p-8 bg-brand-card border border-brand-border rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6">
                  <Sparkles className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-brand-text font-display">Free Forever (First Year)</h3>
                <p className="text-xs sm:text-sm text-brand-text-secondary mt-3 leading-relaxed">
                  Join during our initial release period and secure a full year of open library access completely free of charge. No hidden fees or plans.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.16}>
              <div className="p-8 bg-brand-card border border-brand-border rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-brand-success mb-6">
                  <BookOpen className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-brand-text font-display">Unlimited Reading</h3>
                <p className="text-xs sm:text-sm text-brand-text-secondary mt-3 leading-relaxed">
                  Read as many books as you want. Explore tech specifications, startup ARR roadmaps, and self-help classics from cover to cover without limits.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.22}>
              <div className="p-8 bg-brand-card border border-brand-border rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6">
                  <Download className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-brand-text font-display">Unlimited Downloads</h3>
                <p className="text-xs sm:text-sm text-brand-text-secondary mt-3 leading-relaxed">
                  Keep your books stored locally. Instantly download PDF and EPUB files to access your reading material on your e-reader, phone, or laptop offline.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.28}>
              <div className="p-8 bg-brand-card border border-brand-border rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6">
                  <BrainCircuit className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-brand-text font-display">Unlimited AI Features</h3>
                <p className="text-xs sm:text-sm text-brand-text-secondary mt-3 leading-relaxed">
                  Enhance your learning. Access floating AI assistants to explain complex lines, generate flashcards, construct study mind maps, and translate blocks.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.34}>
              <div className="p-8 bg-brand-card border border-brand-border rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-6">
                  <Users className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-brand-text font-display">Community Driven</h3>
                <p className="text-xs sm:text-sm text-brand-text-secondary mt-3 leading-relaxed">
                  Connect directly with authors. Rate titles, publish helpful reviews, follow creators, and share curated collections with other readers in real time.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="p-8 bg-brand-card border border-brand-border rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-brand-success mb-6">
                  <BookMarked className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-brand-text font-display">Open Library</h3>
                <p className="text-xs sm:text-sm text-brand-text-secondary mt-3 leading-relaxed">
                  Enjoy clean layouts without visual clutter, banner ads, paywall overlays, or upgrade request warnings. A workspace designed purely for readers.
                </p>
              </div>
            </FadeUp>
          </div>
        </section>
      </div>

      {/* 5. TRENDING CATEGORIES */}
      <div className="bg-brand-bg border-t border-brand-border py-16 md:py-20 scroll-mt-[76px]">
        <section className="max-w-7xl mx-auto px-6 w-full text-center">
          <FadeUp delay={0}>
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase">Explore</span>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-1 mb-8">
              Trending Categories
            </h2>
          </FadeUp>
          <CategoriesSection />
        </section>
      </div>

      {/* 6. BEST SELLERS */}
      <div className="bg-brand-bg border-t border-brand-border py-16 md:py-20 scroll-mt-[76px]">
        <section className="max-w-4xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <FadeUp delay={0}>
                <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase">Popular</span>
              </FadeUp>
              <FadeUp delay={0.05}>
                <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-1">
                  Popular Books
                </h2>
              </FadeUp>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setStartIndex(prev => Math.max(0, prev - 3))}
                disabled={startIndex === 0}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-bg-secondary border border-brand-border text-brand-text hover:bg-brand-primary hover:text-brand-bg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous best sellers"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setStartIndex(prev => Math.min(bestSellers.length - 3, prev + 3))}
                disabled={startIndex + 3 >= bestSellers.length}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-bg-secondary border border-brand-border text-brand-text hover:bg-brand-primary hover:text-brand-bg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next best sellers"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="border border-brand-border rounded-brand-card shadow-brand overflow-hidden bg-brand-card p-2 flex flex-col gap-1.5 text-left">
            <AnimatePresence mode="wait">
              <motion.div 
                key={startIndex}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { 
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  },
                  exit: { opacity: 0 }
                }}
                className="flex flex-col gap-1.5"
              >
                {bestSellers.slice(startIndex, startIndex + 3).map((book, idx) => {
                  const rank = startIndex + idx + 1;
                  return (
                    <motion.div 
                      key={book.id}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        visible: { 
                          opacity: 1, 
                          x: 0, 
                          transition: { 
                            duration: 0.4, 
                            ease: [0.16, 1, 0.3, 1],
                            delay: idx * 0.05
                          } 
                        },
                        exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
                      }}
                      className="flex items-center justify-between p-4 border-b border-brand-border last:border-0 hover:bg-brand-bg-secondary rounded-[12px] transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-[20px] font-bold text-brand-text font-mono w-8 text-right shrink-0">
                          {rank.toString().padStart(2, "0")}
                        </span>
                        
                        <Link to={`/book/${book.slug}`} className="shrink-0">
                          <div className="h-16 w-12 bg-brand-bg-secondary border border-brand-border rounded-[8px] overflow-hidden shadow-sm">
                            <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                          </div>
                        </Link>
 
                        <div className="min-w-0 text-left">
                          <Link to={`/book/${book.slug}`} className="hover:text-brand-accent transition-colors">
                            <h4 className="text-sm font-bold text-brand-text leading-snug truncate font-display">{book.title}</h4>
                          </Link>
                          <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold truncate">by {book.authorName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 font-sans">
                        <span className="text-[10px] font-bold text-brand-success bg-brand-success/15 px-2.5 py-0.5 rounded-full select-none uppercase font-mono">
                          Free Access
                        </span>
                      </div>

                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* 7. TESTIMONIALS */}
      <div className="bg-brand-bg-secondary border-t border-brand-border py-16 md:py-20 transition-colors duration-300 scroll-mt-[76px]">
        <section className="max-w-7xl mx-auto px-6 w-full text-center select-none">
          <FadeUp delay={0}>
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">Wall of Love</span>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3 mb-12">
              What Readers Say
            </h2>
          </FadeUp>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <FadeUp delay={0.1} className="flex">
              <div className="bg-brand-card border border-brand-border rounded-brand-card p-6 shadow-brand flex flex-col justify-between w-full hover:shadow-brand-hover hover:-translate-y-1 transition-all duration-300 group">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-brand-success bg-brand-success/10 px-2.5 py-0.5 rounded-full select-none">
                      Verified Reader
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed italic mb-6">
                    "Designing for Scale is an absolute masterpiece. The chapters on database sharding and caching saved our startup weeks of trial and error. EBOOKVALA's reader interface is also incredibly smooth."
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80" alt="Prince" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-text leading-none">Prince Gajera</h5>
                    <p className="text-[10px] text-brand-text-secondary mt-1.5 font-semibold">Software Engineer • Rajkot</p>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.18} className="flex">
              <div className="bg-brand-card border border-brand-border rounded-brand-card p-6 shadow-brand flex flex-col justify-between w-full hover:shadow-brand-hover hover:-translate-y-1 transition-all duration-300 group">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-brand-success bg-brand-success/10 px-2.5 py-0.5 rounded-full select-none">
                      Author Creator
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed italic mb-6">
                    "As an independent author, EBOOKVALA makes it incredibly simple to publish and distribute digital editions. The interface feels premium, fast, and the reading analytics help me understand reader engagement."
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" alt="Amara" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-text leading-none">Amara Dev</h5>
                    <p className="text-[10px] text-brand-text-secondary mt-1.5 font-semibold">Technical Author • Bengaluru</p>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.26} className="flex">
              <div className="bg-brand-card border border-brand-border rounded-brand-card p-6 shadow-brand flex flex-col justify-between w-full hover:shadow-brand-hover hover:-translate-y-1 transition-all duration-300 group">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-brand-success bg-brand-success/10 px-2.5 py-0.5 rounded-full select-none">
                      Active Reader
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed italic mb-6">
                    "The curated selection on EBOOKVALA is incredible. Instead of digging through thousands of low-quality files, I get access to high-quality, beautifully typeset guides on SaaS, design system architectures, and startup logic."
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="Rohan" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-text leading-none">Rohan Mehta</h5>
                    <p className="text-[10px] text-brand-text-secondary mt-1.5 font-semibold">Founder, SaaS Lab • Mumbai</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>
      </div>

      {/* 8. NEWSLETTER JOIN */}
      <div className="bg-brand-bg border-t border-brand-border py-10 md:py-12 scroll-mt-[76px]">
        <section className="max-w-4xl mx-auto px-6 w-full select-none text-center">
          <FadeUp delay={0.1}>
            <div className="bg-brand-card border border-brand-border rounded-[28px] py-8 px-6 md:py-10 md:px-12 text-center flex flex-col items-center gap-4 shadow-brand relative overflow-hidden">
              <div className="h-12 w-12 rounded-full bg-brand-bg-secondary border border-brand-border text-brand-text flex items-center justify-center shadow-sm">
                <Mail className="h-5 w-5" />
              </div>

              <div className="max-w-md">
                <h3 className="text-2xl sm:text-3xl font-display font-black text-brand-text leading-tight">
                  Get updates on new books.
                </h3>
                <p className="text-xs text-brand-text-secondary mt-2 leading-relaxed font-semibold">
                  Curated summaries of India's best tech and business titles added to the open library. Zero spam.
                </p>
              </div>

              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-brand-bg border border-brand-border px-5 py-3 text-xs sm:text-sm rounded-[16px] text-brand-text placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent transition-all font-semibold"
                  />
                  <Button type="submit" variant="primary" className="rounded-full h-11 px-6 text-xs font-bold shrink-0">
                    Subscribe
                  </Button>
                </form>
              ) : (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xs font-bold text-brand-success bg-brand-success/10 px-4 py-2.5 rounded-full flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Thanks for subscribing! Check your inbox soon.
                </motion.div>
              )}

            </div>
          </FadeUp>
        </section>
      </div>

    </div>
  );
};

export default Landing;
