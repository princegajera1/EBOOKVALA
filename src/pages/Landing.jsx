import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  ArrowRight, Star, Mail, ChevronLeft, ChevronRight, 
  ShieldCheck, Search, BookOpen, Download, BrainCircuit, Users, BookMarked, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { SearchBox } from "../components/ui/SearchBox";
import { dbService } from "../services/db";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CategoriesSection } from "../components/sections/CategoriesSection";
import { FadeUp } from "../components/common/FadeUp";
import { BookCard } from "../components/book/BookCard";
import { HeroImageStack } from "../components/common/HeroImageStack";
import { Marquee } from "../components/ui/marquee";
import princeAvatar from "../assets/testimonials/prince.png";
import amaraAvatar from "../assets/testimonials/amara.png";
import rohanAvatar from "../assets/testimonials/rohan.png";

const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

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

const testimonialsData = [
  {
    name: "Prince Gajera",
    role: "Software Engineer",
    location: "Ahmedabad",
    image: princeAvatar,
    rating: 5,
    badge: "Verified Reader",
    quote: "Designing for Scale is an absolute masterpiece. The chapters on database sharding and caching saved our startup weeks of trial and error. EBOOKVALA's reader interface is also incredibly smooth."
  },
  {
    name: "Amara Dev",
    role: "Technical Author",
    location: "Bengaluru",
    image: amaraAvatar,
    rating: 5,
    badge: "Author Creator",
    quote: "As an independent author, EBOOKVALA makes it incredibly simple to publish and distribute digital editions. The interface feels premium, fast, and the reading analytics help me understand reader engagement."
  },
  {
    name: "Rohan Mehta",
    role: "Founder, SaaS Lab",
    location: "Mumbai",
    image: rohanAvatar,
    rating: 5,
    badge: "Active Reader",
    quote: "The curated selection on EBOOKVALA is incredible. Instead of digging through thousands of low-quality files, I get access to high-quality, beautifully typeset guides on SaaS, design system architectures, and startup logic."
  },
  {
    name: "Priya Sharma",
    role: "Product Designer",
    location: "Pune",
    image: "https://randomuser.me/api/portraits/women/49.jpg",
    rating: 5,
    badge: "Active Reader",
    quote: "The visual mind maps and outline generation on this platform are game-changers for visual learners. I can dissect complex design system guides in half the time compared to standard PDFs."
  },
  {
    name: "Aarav Patel",
    role: "Full Stack Dev",
    location: "Vadodara",
    image: "https://randomuser.me/api/portraits/men/35.jpg",
    rating: 5,
    badge: "Verified Reader",
    quote: "I was skeptical about another free eBook site, but EBOOKVALA delivers a truly premium experience. Zero ads, instant downloads, and the inline AI study assistant is shockingly good at explaining code snippets."
  },
  {
    name: "Ananya Iyer",
    role: "CS Student",
    location: "Chennai",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    badge: "Active Reader",
    quote: "Finding high-quality, up-to-date tech guides for my university projects used to be a hassle. EBOOKVALA's curated tech library and flashcards feature helped me ace my database systems finals!"
  },
  {
    name: "Vikram Singh",
    role: "SaaS Founder",
    location: "Hyderabad",
    image: "https://randomuser.me/api/portraits/men/68.jpg",
    rating: 5,
    badge: "Verified Reader",
    quote: "EBOOKVALA's selection of business playbooks is outstanding. The platform has helped my core team align on growth frameworks, and the mobile reading experience is incredibly clean during my daily commutes."
  },
  {
    name: "Neha Gupta",
    role: "Technical Writer",
    location: "Noida",
    image: "https://randomuser.me/api/portraits/women/62.jpg",
    rating: 5,
    badge: "Author Creator",
    quote: "The uploading pipeline for authors is so intuitive. Supreme support, quick review times, and the analytics dashboard gives me deep insights into how readers interact with my tech guides."
  },
  {
    name: "Kabir Malhotra",
    role: "Backend Architect",
    location: "Delhi",
    image: "https://randomuser.me/api/portraits/men/83.jpg",
    rating: 5,
    badge: "Verified Reader",
    quote: "I love the clean, distraction-free reading canvas. The dark mode theme is easy on the eyes during late-night coding sessions, and the search indexing is blazing fast."
  },
  {
    name: "Meera Nair",
    role: "UX Researcher",
    location: "Kochi",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
    badge: "Active Reader",
    quote: "The attention to typography and interface layout on EBOOKVALA is impressive. It makes reading dense software architecture papers a joy rather than a chore."
  }
];


export const Landing = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  
  const [startIndex, setStartIndex] = useState(0);
  
  const carouselRef = useRef(null);
  const navigate = useNavigate();

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
      navigate(`/search?q=${encodeURIComponent(heroSearchQuery.trim())}`);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const subscriberEmail = email.trim().toLowerCase();
    if (!subscriberEmail) return;

    // 1. Try to save subscriber to Firestore (non-blocking)
    try {
      await addDoc(collection(db, "subscribers"), {
        email: subscriberEmail,
        subscribedAt: serverTimestamp()
      });
    } catch (firestoreErr) {
      console.warn("Firestore subscription save failed (non-blocking):", firestoreErr);
    }

    // 2. Dispatch welcome email securely (blocking success/error)
    try {
      const emailRes = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "newsletter",
          email: subscriberEmail
        })
      });

      if (!emailRes.ok) {
        throw new Error("Email service failed");
      }

      setSubscribed(true);
      setEmail("");
      toast.success("Thank you for joining our community! 📖");
    } catch (err) {
      console.error("Newsletter subscription mail dispatch error:", err);
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  return (
    <div className="flex flex-col select-none bg-brand-bg transition-colors duration-300">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-4 pb-6 lg:pt-6 lg:pb-8 scroll-mt-20 overflow-hidden">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col gap-5 text-left z-10"
        >

          <h1 
            className="text-4xl sm:text-6xl lg:text-[70px] font-display font-black text-brand-text leading-[1.05] tracking-tight"
          >
            The <span className="text-brand-accent">Future of Reading</span> <br className="hidden sm:inline" />
            Starts Here.
          </h1>
          
          <p className="text-base sm:text-lg font-medium text-brand-text-secondary leading-relaxed max-w-xl">
            Discover free ebooks, AI-powered learning, smart summaries, quizzes, flashcards, and everything you need to learn faster.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-1">
            <Link to="/marketplace">
              <Button variant="primary" size="lg" className="font-bold h-12 px-6 rounded-full border-brand-border text-white">
                Browse Library
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register?role=author">
              <Button variant="ghost" size="lg" className="font-bold h-12 px-6 rounded-full text-brand-text hover:bg-brand-bg-secondary">
                Publish a Book
              </Button>
            </Link>
          </div>

          {/* Embedded Hero Search */}
          <div className="w-full max-w-lg mt-1">
            <SearchBox
              size="lg"
              showButton
              buttonLabel="Search"
              placeholder="Search tech, design, business books..."
              value={heroSearchQuery}
              onChange={(e) => setHeroSearchQuery(e.target.value)}
              onSubmit={handleHeroSearch}
              onClear={() => setHeroSearchQuery("")}
              aria-label="Search hero"
            />
          </div>

          {/* Stat Numbers */}
          <div className="w-full mt-6 py-6 border-t border-brand-border flex flex-wrap gap-6 lg:gap-8 items-center select-none">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-[11px] lg:text-xs leading-snug">
                <p className="font-bold text-brand-text">4.9/5 Rating</p>
                <p className="text-brand-text-secondary">
                  <AnimatedCounter value="50000" />+ Readers
                </p>
              </div>
            </div>
            
            <div className="hidden sm:block h-6 w-[1px] bg-brand-border" />
            
            <div className="text-[11px] lg:text-xs leading-snug text-center flex-1 sm:flex-none">
              <p className="font-bold text-brand-text">
                <AnimatedCounter value="10000" />+ eBooks
              </p>
              <p className="text-brand-text-secondary">Free Access</p>
            </div>
            
            <div className="hidden sm:block h-6 w-[1px] bg-brand-border" />
            
            <div className="text-[11px] lg:text-xs leading-snug text-center flex-1 sm:flex-none">
              <p className="font-bold text-brand-text">
                <AnimatedCounter value="100" />% Free Forever
              </p>
              <p className="text-brand-text-secondary">First Year Guarantee</p>
            </div>
          </div>
        </motion.div>

        {/* Right Floating Mockups Stack */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 overflow-visible flex items-center justify-center z-10"
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

      {/* 2. RECENTLY ADDED */}
      {recentlyAdded.length > 0 && (
        <div className="bg-brand-bg-secondary border-t border-brand-border py-10 md:py-14 transition-colors duration-300 scroll-mt-[76px]">
          <div className="max-w-7xl mx-auto px-6 w-full text-left">
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">New Arrivals</span>
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3 mb-8 tracking-tight">Recently Added Books</h2>
            
            <div className="flex md:grid overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 gap-6 sm:gap-8 grid-cols-2 md:grid-cols-4 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6 md:mx-0 md:px-0 select-none">
              {recentlyAdded.map((book) => (
                <div key={book.id} className="snap-center shrink-0 w-[240px] sm:w-[280px] md:w-auto">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. VALUE PROPOSITION GRID (Replaces PricingSection) */}
      <div className="bg-brand-bg border-t border-brand-border pt-10 md:pt-14 pb-12 md:pb-16 transition-colors duration-300 scroll-mt-[76px]">
        <section className="max-w-7xl mx-auto px-6 w-full text-center">
          <FadeUp delay={0}>
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">Platform Value</span>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3 tracking-tight">
              Platform Benefits
            </h2>
            <p className="text-sm sm:text-base text-brand-text-secondary mt-3 mb-12 max-w-md mx-auto font-normal leading-relaxed">
              Enjoy 100% free access to all core features for our launching year. No subscriptions required.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
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
      <div className="bg-brand-bg border-t border-brand-border py-10 md:py-14 scroll-mt-[76px]">
        <section className="max-w-7xl mx-auto px-6 w-full text-center">
          <FadeUp delay={0}>
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">Explore</span>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3 mb-12 tracking-tight">
              Trending Categories
            </h2>
          </FadeUp>
          <CategoriesSection />
        </section>
      </div>

      {/* 6. BEST SELLERS */}
      <div className="bg-brand-bg border-t border-brand-border py-10 md:py-14 scroll-mt-[76px]">
        <section className="max-w-4xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <FadeUp delay={0}>
                <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">Popular</span>
              </FadeUp>
              <FadeUp delay={0.05}>
                <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3 tracking-tight">
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
                        
                        <Link to={`/book/${book.slug || book.id}`} className="shrink-0">
                          <div className="h-16 w-12 bg-brand-bg-secondary border border-brand-border rounded-[8px] overflow-hidden shadow-sm">
                            <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                          </div>
                        </Link>
 
                        <div className="min-w-0 text-left">
                          <Link to={`/book/${book.slug || book.id}`} className="hover:text-brand-accent transition-colors">
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
      <div className="bg-brand-bg-secondary border-t border-brand-border py-10 md:py-14 transition-colors duration-300 scroll-mt-[76px]">
        <section className="max-w-7xl mx-auto px-6 w-full text-center select-none">
          <FadeUp delay={0}>
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">Wall of Love</span>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3 mb-12 tracking-tight">
              What Readers Say
            </h2>
          </FadeUp>
          
          <div className="relative w-full overflow-hidden py-4 flex flex-col gap-6">
            {/* Left and Right Fade-out Gradient Overlays */}
            <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-brand-bg-secondary to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-brand-bg-secondary to-transparent z-10 pointer-events-none" />
            
            {/* Row 1: Left to right (Standard) */}
            <Marquee pauseOnHover className="py-2" repeat={5}>
              {testimonialsData.slice(0, 5).map((t, idx) => (
                <div key={idx} className="bg-brand-card border border-brand-border rounded-brand-card p-6 shadow-brand flex flex-col justify-between w-80 md:w-[360px] shrink-0 text-left select-none group transition-all duration-300 hover:shadow-brand-hover">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-brand-success bg-brand-success/10 px-2.5 py-0.5 rounded-full select-none">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed italic mb-6">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0">
                      <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-brand-text leading-none">{t.name}</h5>
                      <p className="text-[10px] text-brand-text-secondary mt-1.5 font-semibold">{t.role} • {t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Marquee>

            {/* Row 2: Right to left (Reverse) */}
            <Marquee reverse pauseOnHover className="py-2" repeat={5}>
              {testimonialsData.slice(5, 10).map((t, idx) => (
                <div key={idx} className="bg-brand-card border border-brand-border rounded-brand-card p-6 shadow-brand flex flex-col justify-between w-80 md:w-[360px] shrink-0 text-left select-none group transition-all duration-300 hover:shadow-brand-hover">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-brand-success bg-brand-success/10 px-2.5 py-0.5 rounded-full select-none">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed italic mb-6">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0">
                      <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-brand-text leading-none">{t.name}</h5>
                      <p className="text-[10px] text-brand-text-secondary mt-1.5 font-semibold">{t.role} • {t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </section>
      </div>

      {/* CONFIDENT FINAL CTA SECTION */}
      <div className="bg-brand-bg border-t border-brand-border py-10 md:py-14 scroll-mt-[76px]">
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

      {/* 8. NEWSLETTER JOIN */}
      <div className="bg-brand-bg-secondary border-t border-brand-border py-10 md:py-14 scroll-mt-[76px]">
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
