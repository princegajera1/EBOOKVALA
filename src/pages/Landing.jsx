import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  ArrowRight, Star, Mail, ChevronLeft, ChevronRight,
  ShieldCheck, BookOpen, Download, BrainCircuit, Users, BookMarked, Sparkles,
  Flame, Globe, Trophy, Smartphone, BarChart3
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { SearchBox } from "../components/ui/SearchBox";
import { dbService } from "../services/db";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { BentoCategoriesSection } from "../components/sections/BentoCategoriesSection";
import { PricingSection } from "../components/sections/PricingSection";
import { FadeUp } from "../components/common/FadeUp";
import { BookCard } from "../components/book/BookCard";
import { HeroImageStack } from "../components/common/HeroImageStack";
import { toast } from "react-hot-toast";
import princeAvatar from "../assets/testimonials/prince.png";
import amaraAvatar from "../assets/testimonials/amara.png";
import rohanAvatar from "../assets/testimonials/rohan.png";

const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const end = parseInt(value.replace(/,/g, ""), 10);
    if (isNaN(end)) return;
    
    const totalFrames = Math.round(duration * 60);
    let frame = 0;
    
    const countUp = () => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.round(easeProgress * end);
      
      setCount(currentCount);
      
      if (frame < totalFrames) {
        requestAnimationFrame(countUp);
      } else {
        setCount(end);
      }
    };
    
    requestAnimationFrame(countUp);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const PLATFORM_BENEFITS = [
  {
    title: "Offline Reading",
    description: "Download your entire library to read anywhere, anytime without requiring an internet connection.",
    icon: Download,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  },
  {
    title: "Reading Streak",
    description: "Track daily reading goals and maintain your momentum with habit-building streak trackers.",
    icon: Flame,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  },
  {
    title: "Smart Bookmarks",
    description: "Save important pages with quick visual tabs and category tags for easy reference.",
    icon: BookMarked,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  },
  {
    title: "Multi-Color Highlights",
    description: "Organize key quotes using customizable highlight colors and instant filter views.",
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20"
  },
  {
    title: "Instant AI Translator",
    description: "Translate highlighted paragraphs into 30+ languages in real-time with high accuracy.",
    icon: Globe,
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
  },
  {
    title: "Reading Achievements",
    description: "Unlock milestones, earn reading badges, and celebrate completed books.",
    icon: Trophy,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  },
  {
    title: "Multi-Device Sync",
    description: "Seamlessly switch from laptop browser to phone app without losing your exact reading position.",
    icon: Smartphone,
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
  },
  {
    title: "Reading Analytics",
    description: "Visualize your reading speed, total minutes read, finished chapters, and monthly trends.",
    icon: BarChart3,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20"
  }
];
export const Landing = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  
  // Carousel states
  const recentlyAddedRef = useRef(null);
  const [canScrollLeftRecently, setCanScrollLeftRecently] = useState(false);
  const [canScrollRightRecently, setCanScrollRightRecently] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const allBooks = await dbService.getBooks();
      const published = allBooks.filter(b => b.status === "published");
      
      setFeaturedBooks(published.filter(b => b.isFeatured));

      const sortedByDate = [...published].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
      setRecentlyAdded(sortedByDate);
    };
    fetchData();
  }, []);

  const updateRecentlyScrollState = () => {
    if (recentlyAddedRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = recentlyAddedRef.current;
      setCanScrollLeftRecently(scrollLeft > 10);
      setCanScrollRightRecently(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleRecentlyScroll = (direction) => {
    if (recentlyAddedRef.current) {
      const scrollAmount = 320;
      recentlyAddedRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth"
      });
      setTimeout(updateRecentlyScrollState, 350);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearchQuery.trim())}`);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const subscriberEmail = email.trim().toLowerCase();
    if (!subscriberEmail) return;

    try {
      const res = await dbService.subscribeNewsletter(subscriberEmail);
      setSubscribed(true);
      setEmail("");
      toast.success(res.message || "Thank you for joining our community! 📖");
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      toast.error(err.message || "Failed to subscribe. Please try again.");
    }
  };

  return (
    <div className="flex flex-col select-none bg-brand-bg transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8 sm:pt-10 pb-6 lg:pt-8 lg:pb-8 scroll-mt-28 overflow-hidden z-0">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col gap-5 text-left z-10"
        >

          <h1 
            className="text-3xl sm:text-5xl lg:text-[64px] font-display font-black text-brand-text leading-[1.08] tracking-tight"
          >
            The <span className="text-brand-accent">Future of Reading</span> <br className="hidden sm:inline" />
            Starts Here.
          </h1>
          
          <p className="text-sm sm:text-base lg:text-lg font-medium text-brand-text-secondary leading-relaxed max-w-xl">
            Discover free ebooks, AI-powered learning, smart summaries, quizzes, flashcards, and everything you need to learn faster.
          </p>
          
          {/* Hero CTA Buttons */}
          <div className="flex flex-row items-center gap-2.5 sm:gap-3 mt-1 w-full max-w-md">
            <Link to="/marketplace" className="flex-1">
              <Button variant="primary" size="lg" className="font-bold h-11 sm:h-12 px-3 sm:px-6 text-xs sm:text-sm rounded-full w-full justify-center whitespace-nowrap">
                Browse Library
                <ArrowRight className="ml-1.5 h-3.5 sm:h-4 w-3.5 sm:w-4 shrink-0" />
              </Button>
            </Link>
            <Link to="/register?role=author" className="flex-1">
              <Button variant="ghost" size="lg" className="font-bold h-11 sm:h-12 px-3 sm:px-6 text-xs sm:text-sm rounded-full text-brand-text hover:bg-brand-bg-secondary w-full justify-center border border-brand-border whitespace-nowrap">
                Publish a Book
              </Button>
            </Link>
          </div>

          {/* SECTION 1: REDESIGNED STATS BAR WITH DESCRIPTIONS (Image 1 Specs) */}
          <div className="w-full mt-8 pt-6 border-t border-brand-border grid grid-cols-2 md:grid-cols-4 gap-6 select-none bg-brand-card/40 p-4 sm:p-6 rounded-[20px] border border-brand-border/60">
            {/* Item 1: eBooks */}
            <div className="flex flex-col text-left">
              <span className="text-2xl sm:text-3xl font-montserrat font-black text-brand-text tracking-tight">
                <AnimatedCounter value="10000" />+
              </span>
              <span className="text-xs font-montserrat font-bold text-brand-text/90 mt-1">
                Premium eBooks
              </span>
              <span className="text-[10.5px] text-brand-text-secondary mt-0.5 leading-snug font-sans">
                Curated technical, self-help & business books
              </span>
            </div>

            {/* Item 2: Readers */}
            <div className="flex flex-col text-left">
              <span className="text-2xl sm:text-3xl font-montserrat font-black text-brand-text tracking-tight">
                <AnimatedCounter value="50000" />+
              </span>
              <span className="text-xs font-montserrat font-bold text-brand-text/90 mt-1">
                Happy Readers
              </span>
              <span className="text-[10.5px] text-brand-text-secondary mt-0.5 leading-snug font-sans">
                Active readers learning across India
              </span>
            </div>

            {/* Item 3: Rating */}
            <div className="flex flex-col text-left">
              <span className="text-2xl sm:text-3xl font-montserrat font-black text-brand-text tracking-tight flex items-center gap-1.5">
                4.9/5 <span className="text-amber-400 text-xl">⭐</span>
              </span>
              <span className="text-xs font-montserrat font-bold text-brand-text/90 mt-1">
                User Rating
              </span>
              <span className="text-[10.5px] text-brand-text-secondary mt-0.5 leading-snug font-sans">
                Verified feedback from community readers
              </span>
            </div>

            {/* Item 4: AI Powered */}
            <div className="flex flex-col text-left">
              <span className="text-2xl sm:text-3xl font-montserrat font-black tracking-tight text-[#A855F7]">
                AI Powered
              </span>
              <span className="text-xs font-montserrat font-bold text-brand-text/90 mt-1">
                Smart Learning
              </span>
              <span className="text-[10.5px] text-brand-text-secondary mt-0.5 leading-snug font-sans">
                Instant chapter summaries & AI reader assistance
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Floating Mockups Stack */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 overflow-visible hidden lg:flex items-center justify-center z-10"
        >
          <HeroImageStack />
        </motion.div>

      </section>

      {/* Stripe-style Trust Bar */}
      <div className="w-full bg-brand-bg border-t border-b border-brand-border py-8 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center gap-6 md:gap-8 text-brand-text-secondary">
            {[
              { icon: ShieldCheck, label: "Secure Payments" },
              { icon: Download, label: "Instant Download" },
              { icon: Sparkles, label: "Lifetime Access" },
              { icon: BookOpen, label: "High Quality Books" },
              { icon: Users, label: "Thousands of Readers" }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-2.5 min-w-[150px] md:min-w-0 flex-1 md:flex-none justify-center md:justify-start">
                  <div className="h-8 w-8 rounded-lg bg-brand-accent/5 border border-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-brand-text/80 tracking-tight whitespace-nowrap">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: BENTO CATEGORIES SECTION (6 Curated Categories Only) */}
      <div className="bg-brand-bg-secondary border-t border-brand-border py-10 md:py-14 scroll-mt-[76px]">
        <BentoCategoriesSection />
      </div>

      {/* RECENTLY ADDED BOOKS */}
      {recentlyAdded.length > 0 && (
        <div className="bg-brand-bg border-t border-brand-border py-10 md:py-14 transition-colors duration-300 scroll-mt-[76px] relative">
          <div className="max-w-7xl mx-auto px-6 w-full text-left relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">New Arrivals</span>
                <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3 tracking-tight">Recently Added Books</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRecentlyScroll("prev")}
                  disabled={!canScrollLeftRecently}
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-brand-border/80 bg-brand-card/90 shadow-sm flex items-center justify-center text-brand-text transition-all duration-200 cursor-pointer ${
                    !canScrollLeftRecently ? "opacity-30 cursor-not-allowed" : "hover:bg-brand-card hover:scale-105"
                  }`}
                  aria-label="Previous books"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleRecentlyScroll("next")}
                  disabled={!canScrollRightRecently}
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-brand-border/80 bg-brand-card/90 shadow-sm flex items-center justify-center text-brand-text transition-all duration-200 cursor-pointer ${
                    !canScrollRightRecently ? "opacity-30 cursor-not-allowed" : "hover:bg-brand-card hover:scale-105"
                  }`}
                  aria-label="Next books"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div 
              ref={recentlyAddedRef}
              onScroll={updateRecentlyScrollState}
              className="flex overflow-x-auto pb-4 gap-3 sm:gap-6 lg:gap-8 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6 select-none"
            >
              {recentlyAdded.map((book) => (
                <div key={book.id} className="snap-start shrink-0 w-[calc(33.333%-8px)] min-w-[105px] max-w-[280px] sm:w-[220px] md:w-[260px] p-0.5">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PLATFORM BENEFITS (8 FEATURE CARDS) */}
      <div className="bg-brand-bg-secondary border-t border-brand-border pt-12 md:pt-16 pb-14 md:pb-20 transition-colors duration-300 scroll-mt-[76px]">
        <section className="max-w-7xl mx-auto px-6 w-full text-center">
          <FadeUp delay={0}>
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 border border-brand-accent/20 px-3.5 py-1.5 rounded-full inline-block">
              PLATFORM VALUE
            </span>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-4 tracking-tight">
              Platform Benefits
            </h2>
            <p className="text-xs sm:text-base text-brand-text-secondary mt-2.5 mb-10 sm:mb-12 max-w-xl mx-auto font-normal leading-relaxed">
              Supercharge your reading workflow with cutting-edge tools built for curious minds.
            </p>
          </FadeUp>

          {/* 8 Cards Grid: 3 columns on mobile & tablet, 4 columns on desktop (lg) */}
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {PLATFORM_BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <FadeUp key={idx} delay={idx * 0.05} className="h-full">
                  <Link to="/reader" className="block h-full focus:outline-none">
                    <div className="h-full p-2.5 sm:p-4 md:p-5 bg-brand-card border border-brand-border rounded-[18px] sm:rounded-[22px] shadow-sm text-left hover:bg-brand-card/90 hover:border-brand-border hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-start group">
                      <div className={`h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl border flex items-center justify-center mb-2 sm:mb-4 shrink-0 shadow-sm ${benefit.color}`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <h3 className="text-xs sm:text-base font-bold text-brand-text font-display shrink-0 leading-tight group-hover:text-brand-text transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-1 sm:mt-1.5 leading-relaxed line-clamp-3 sm:line-clamp-none">
                        {benefit.description}
                      </p>
                    </div>
                  </Link>
                </FadeUp>
              );
            })}
          </div>
        </section>
      </div>

      {/* SECTION 4: PRICING SECTION (5 Tiers) */}
      <div className="bg-brand-bg border-t border-brand-border py-12 md:py-16 scroll-mt-[76px]">
        <PricingSection />
      </div>

      {/* FINAL CTA SECTION */}
      <div className="bg-brand-bg-secondary border-t border-brand-border py-12 md:py-16 scroll-mt-[76px]">
        <section className="max-w-4xl mx-auto px-6 w-full text-center">
          <FadeUp delay={0.1}>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-brand-text leading-tight tracking-tight">
              Start Reading India's Best Tech & Business Guides Today.
            </h2>
            <p className="text-sm sm:text-base text-brand-text-secondary mt-4 mb-8 max-w-xl mx-auto font-normal leading-relaxed">
              Join thousands of learners in an open library with visual mind maps, flashcards, and dedicated AI study buddies. Completely free for our launching year.
            </p>
            <Link to="/marketplace" className="inline-block">
              <Button variant="primary" size="lg" className="font-bold h-12 px-8 rounded-full shadow-brand hover:shadow-brand-hover">
                Browse Library
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </FadeUp>
        </section>
      </div>

      {/* NEWSLETTER JOIN */}
      <div className="bg-brand-bg border-t border-brand-border py-12 md:py-16 scroll-mt-[76px]">
        <section className="max-w-4xl mx-auto px-6 w-full select-none text-center">
          <FadeUp delay={0.1}>
            <div className="bg-brand-card border border-brand-border rounded-[28px] py-10 px-6 md:py-14 md:px-12 text-center flex flex-col items-center gap-4 shadow-brand relative overflow-hidden">
              <div className="h-12 w-12 rounded-full bg-brand-bg-secondary border border-brand-border text-brand-text flex items-center justify-center shadow-sm">
                <Mail className="h-5 w-5" />
              </div>

              <div className="max-w-md">
                <h3 className="text-2xl sm:text-3xl font-display font-black text-brand-text leading-tight tracking-tight">
                  Get updates on new books.
                </h3>
                <p className="text-sm text-brand-text-secondary mt-2 leading-relaxed font-normal">
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
