import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  ArrowRight, Star, Mail, ChevronLeft, ChevronRight,
  ShieldCheck, BookOpen, Download, BrainCircuit, Users, BookMarked, Sparkles
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

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-brand-card border border-brand-border rounded-[18px] sm:rounded-brand-card p-3.5 sm:p-6 shadow-brand flex flex-col justify-between w-full shrink-0 text-left select-none group transition-all duration-300 hover:shadow-brand-hover h-full">
      <div>
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <div className="flex gap-0.5">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-3 sm:h-3.5 w-3 sm:w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-brand-success bg-brand-success/10 px-2 sm:px-2.5 py-0.5 rounded-full select-none">
            {testimonial.badge}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-brand-text-secondary leading-relaxed italic mb-3 sm:mb-6 line-clamp-3 sm:line-clamp-4 min-h-[54px] sm:h-[72px]">
          "{testimonial.quote}"
        </p>
      </div>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0">
          <img src={testimonial.image} alt={testimonial.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h5 className="text-[11px] sm:text-xs font-bold text-brand-text leading-none truncate">{testimonial.name}</h5>
          <p className="text-[9px] sm:text-[10px] text-brand-text-secondary mt-1 font-semibold truncate">{testimonial.role} • {testimonial.location}</p>
        </div>
      </div>
    </div>
  );
};

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

  const [testimonialPage, setTestimonialPage] = useState(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(true);
  const totalTestimonialPages = Math.ceil(testimonialsData.length / 2); // 5 pages (10 items, 2 per view)

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const allBooks = await dbService.getBooks();
      const published = allBooks.filter(b => b.status === "published");
      
      setFeaturedBooks(published.filter(b => b.isFeatured));

      // Recently added (sorted by date or ID descending)
      const sortedByDate = [...published].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
      setRecentlyAdded(sortedByDate);
    };
    fetchData();
  }, []);

  // --------------------------------------------------------------------------
  // Point 4: Recently Added Books Carousel Scroll & State
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Point 6: Testimonials Auto-Advance (Every 2s, pauses on user interaction)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isAutoAdvancing) return;
    const timer = setInterval(() => {
      setTestimonialPage((prev) => (prev + 1) % totalTestimonialPages);
    }, 2000);
    return () => clearInterval(timer);
  }, [isAutoAdvancing, totalTestimonialPages]);

  const handleTestimonialNav = (direction) => {
    setIsAutoAdvancing(false);
    if (direction === "next") {
      setTestimonialPage((prev) => (prev + 1) % totalTestimonialPages);
    } else if (direction === "prev") {
      setTestimonialPage((prev) => (prev - 1 + totalTestimonialPages) % totalTestimonialPages);
    } else if (typeof direction === "number") {
      setTestimonialPage(direction);
    }

    // Resume auto-advance after 4 seconds of inactivity
    setTimeout(() => setIsAutoAdvancing(true), 4000);
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
      await addDoc(collection(db, "subscribers"), {
        email: subscriberEmail,
        subscribedAt: serverTimestamp()
      });
    } catch (firestoreErr) {
      console.warn("Firestore subscription save failed (non-blocking):", firestoreErr);
    }

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
      
      {/* 1. PREMIUM HERO SECTION (Fixed scroll overlap with scroll-mt and relative z-0) */}
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
          
          {/* Point 3: Hero CTA Buttons — Inline side-by-side on mobile and desktop */}
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
          <div className="w-full mt-6 py-6 border-t border-brand-border grid grid-cols-2 gap-y-4 gap-x-6 sm:flex sm:flex-wrap sm:items-center sm:gap-6 lg:gap-8 select-none">
            {/* Item 1: Rating */}
            <div className="flex flex-col justify-center gap-1.5 text-left">
              <div className="flex gap-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-bold text-brand-text text-[11px] lg:text-xs leading-none">4.9/5 Rating</p>
            </div>

            <div className="hidden sm:block h-6 w-[1px] bg-brand-border shrink-0" />

            {/* Item 2: Readers */}
            <div className="text-[11px] lg:text-xs leading-snug text-left">
              <p className="font-bold text-brand-text">
                <AnimatedCounter value="50000" />+ Readers
              </p>
              <p className="text-brand-text-secondary">Active Community</p>
            </div>

            <div className="hidden sm:block h-6 w-[1px] bg-brand-border shrink-0" />

            {/* Item 3: eBooks */}
            <div className="text-[11px] lg:text-xs leading-snug text-left">
              <p className="font-bold text-brand-text">
                <AnimatedCounter value="10000" />+ eBooks
              </p>
              <p className="text-brand-text-secondary">Free Access</p>
            </div>

            <div className="hidden sm:block h-6 w-[1px] bg-brand-border shrink-0" />

            {/* Item 4: Guarantee */}
            <div className="text-[11px] lg:text-xs leading-snug text-left">
              <p className="font-bold text-brand-text">
                <AnimatedCounter value="100" />% Free
              </p>
              <p className="text-brand-text-secondary">Forever Guarantee</p>
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

      {/* 2. Point 4: RECENTLY ADDED BOOKS WITH CAROUSEL ARROWS & SPACING */}
      {recentlyAdded.length > 0 && (
        <div className="bg-brand-bg-secondary border-t border-brand-border py-10 md:py-14 transition-colors duration-300 scroll-mt-[76px] relative">
          <div className="max-w-7xl mx-auto px-6 w-full text-left relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">New Arrivals</span>
                <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3 tracking-tight">Recently Added Books</h2>
              </div>
              
              {/* Carousel Navigation Arrows */}
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
            
            {/* Scrollable Row with increased card breathing room */}
            <div 
              ref={recentlyAddedRef}
              onScroll={updateRecentlyScrollState}
              className="flex overflow-x-auto pb-4 gap-6 sm:gap-8 lg:gap-10 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6 select-none"
            >
              {recentlyAdded.map((book) => (
                <div key={book.id} className="snap-start shrink-0 w-[240px] sm:w-[270px] md:w-[290px] p-0.5">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Point 5: PLATFORM BENEFITS SECTION — 2-COLUMN GRID + COMPACT CARDS */}
      <div className="bg-brand-bg border-t border-brand-border pt-10 md:pt-14 pb-12 md:pb-16 transition-colors duration-300 scroll-mt-[76px]">
        <section className="max-w-7xl mx-auto px-6 w-full text-center">
          <FadeUp delay={0}>
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">Platform Value</span>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text mt-3 tracking-tight">
              Platform Benefits
            </h2>
            <p className="text-xs sm:text-base text-brand-text-secondary mt-2.5 mb-8 sm:mb-12 max-w-md mx-auto font-normal leading-relaxed">
              Enjoy 100% free access to all core features for our launching year. No subscriptions required.
            </p>
          </FadeUp>

          {/* 2-Column Grid on Mobile (<768px), 3-Column on Desktop (>=768px) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
            <FadeUp delay={0.1} className="h-full">
              <div className="min-h-[190px] sm:h-[250px] p-3.5 sm:p-6 bg-brand-card border border-brand-border rounded-[18px] sm:rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-start">
                <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-2.5 sm:mb-4 shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-base font-bold text-brand-text font-display shrink-0 leading-tight">Free Forever</h3>
                <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-1 sm:mt-2.5 leading-normal sm:leading-relaxed line-clamp-3 sm:line-clamp-4">
                  Join during our release period and secure open library access completely free of charge. No hidden fees.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.16} className="h-full">
              <div className="min-h-[190px] sm:h-[250px] p-3.5 sm:p-6 bg-brand-card border border-brand-border rounded-[18px] sm:rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-start">
                <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-brand-success mb-2.5 sm:mb-4 shrink-0">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-base font-bold text-brand-text font-display shrink-0 leading-tight">Unlimited Reading</h3>
                <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-1 sm:mt-2.5 leading-normal sm:leading-relaxed line-clamp-3 sm:line-clamp-4">
                  Read as many books as you want. Explore tech specifications, startup ARR roadmaps, and self-help classics.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.22} className="h-full">
              <div className="min-h-[190px] sm:h-[250px] p-3.5 sm:p-6 bg-brand-card border border-brand-border rounded-[18px] sm:rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-start">
                <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-2.5 sm:mb-4 shrink-0">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-base font-bold text-brand-text font-display shrink-0 leading-tight">Unlimited Downloads</h3>
                <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-1 sm:mt-2.5 leading-normal sm:leading-relaxed line-clamp-3 sm:line-clamp-4">
                  Keep your books stored locally. Instantly download PDF and EPUB files to access your reading material offline.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.28} className="h-full">
              <div className="min-h-[190px] sm:h-[250px] p-3.5 sm:p-6 bg-brand-card border border-brand-border rounded-[18px] sm:rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-start">
                <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-2.5 sm:mb-4 shrink-0">
                  <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-base font-bold text-brand-text font-display shrink-0 leading-tight">AI Assistant</h3>
                <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-1 sm:mt-2.5 leading-normal sm:leading-relaxed line-clamp-3 sm:line-clamp-4">
                  Enhance your learning. Access floating AI assistants to explain complex lines, generate flashcards, and mind maps.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.34} className="h-full">
              <div className="min-h-[190px] sm:h-[250px] p-3.5 sm:p-6 bg-brand-card border border-brand-border rounded-[18px] sm:rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-start">
                <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-2.5 sm:mb-4 shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-base font-bold text-brand-text font-display shrink-0 leading-tight">Community Driven</h3>
                <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-1 sm:mt-2.5 leading-normal sm:leading-relaxed line-clamp-3 sm:line-clamp-4">
                  Connect directly with authors. Rate titles, publish helpful reviews, follow creators, and share curated collections.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.4} className="h-full">
              <div className="min-h-[190px] sm:h-[250px] p-3.5 sm:p-6 bg-brand-card border border-brand-border rounded-[18px] sm:rounded-brand-card shadow-brand text-left hover:shadow-brand-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-start">
                <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-brand-success mb-2.5 sm:mb-4 shrink-0">
                  <BookMarked className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-base font-bold text-brand-text font-display shrink-0 leading-tight">Open Library</h3>
                <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-1 sm:mt-2.5 leading-normal sm:leading-relaxed line-clamp-3 sm:line-clamp-4">
                  Enjoy clean layouts without visual clutter, banner ads, or paywall overlays. Designed purely for readers.
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

      {/* 7. Point 6: WHAT READERS SAY — 2 CARDS PER VIEW + 2s AUTO-ADVANCE + ARROWS */}
      <div className="bg-brand-bg-secondary border-t border-brand-border py-10 md:py-14 transition-colors duration-300 scroll-mt-[76px]">
        <section className="max-w-7xl mx-auto px-6 w-full text-center select-none">
          <FadeUp delay={0}>
            <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 px-3 py-1 rounded-full">Wall of Love</span>
          </FadeUp>
          <FadeUp delay={0.05}>
            <div className="flex items-center justify-between mt-3 mb-8">
              <h2 className="text-3xl sm:text-[42px] font-display font-black text-brand-text tracking-tight text-left">
                What Readers Say
              </h2>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestimonialNav("prev")}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-brand-border/80 bg-brand-card/90 shadow-sm flex items-center justify-center text-brand-text hover:bg-brand-card hover:scale-105 transition-all duration-200 cursor-pointer"
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleTestimonialNav("next")}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-brand-border/80 bg-brand-card/90 shadow-sm flex items-center justify-center text-brand-text hover:bg-brand-card hover:scale-105 transition-all duration-200 cursor-pointer"
                  aria-label="Next testimonials"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </FadeUp>
          
          {/* 2-Card View Container with Smooth AnimatePresence Slide/Fade */}
          <div className="relative overflow-hidden w-full py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="grid grid-cols-2 gap-3 sm:gap-6 w-full"
              >
                {testimonialsData
                  .slice(testimonialPage * 2, testimonialPage * 2 + 2)
                  .map((t, idx) => (
                    <TestimonialCard key={idx} testimonial={t} />
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Page Indicators (Dots) */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {[...Array(totalTestimonialPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleTestimonialNav(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  testimonialPage === idx ? "w-6 bg-brand-accent" : "w-2 bg-brand-border/80 hover:bg-brand-text-secondary"
                }`}
                aria-label={`Go to testimonial page ${idx + 1}`}
              />
            ))}
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
