import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ShieldCheck, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { Button } from "../ui/Button";
import { toast } from "react-hot-toast";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export const Footer = () => {
  const [openSection, setOpenSection] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

    // 2. Dispatch welcome email securely
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
      toast.success("Thank you for joining our weekly digest! ✉️");
    } catch (err) {
      console.error("Newsletter subscription mail dispatch error:", err);
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  return (
    <footer className="relative bg-brand-bg-secondary select-none text-left transition-colors duration-300">
      {/* Subtle Gradient Top Border Line (blue -> purple -> orange) */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#F59E0B]" />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        
        {/* 4 Columns Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-brand-border">
          
          {/* Column 1: Brand Logo + Description + Digest Signup (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 group select-none hover:cursor-pointer focus-visible:outline-none shrink-0">
              <img 
                src="/logo.png" 
                alt="EbookVala Logo" 
                className="h-10 w-10 object-contain drop-shadow-[0_2px_10px_rgba(59,130,246,0.3)] transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-2xl font-display font-extrabold tracking-tight">
                  <span className="text-brand-text">Ebook</span>
                  <span className="text-[#3B82F6]">Vala</span>
                </span>
                <span className="text-xs font-medium text-brand-text-secondary/80 tracking-wide font-sans mt-0.5">
                  Next-Gen Marketplace
                </span>
              </div>
            </Link>

            <p className="text-xs text-brand-text-secondary leading-relaxed max-w-sm">
              EbookVala is the next-generation eBook marketplace empowering over 50,000+ readers with AI-assisted reading, instant summaries, and seamless cloud synchronization across India.
            </p>

            {/* Weekly Digest Email Input */}
            <div className="mt-2" id="digest">
              <p className="text-[11px] font-bold text-brand-text uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-brand-accent" /> Join Weekly Digest
              </p>
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-sm">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email address for weekly digest"
                    placeholder="Enter your email" 
                    className="flex-grow bg-brand-bg-secondary border border-brand-border rounded-full py-2 px-4 text-xs focus:outline-none focus:bg-brand-bg focus:border-brand-accent text-brand-text font-medium transition-all"
                  />
                  <Button type="submit" variant="primary" className="h-9 px-5 text-xs font-bold shrink-0 shadow-sm rounded-full">
                    Join
                  </Button>
                </form>
              ) : (
                <p className="text-xs font-bold text-brand-success flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> You're subscribed to Weekly Digest!
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Navigation (2 or 3 cols) */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <button 
              onClick={() => toggleSection("navigation")}
              className="w-full md:pointer-events-none flex items-center justify-between text-left font-bold text-brand-text tracking-wider uppercase font-mono text-xs cursor-pointer focus:outline-none"
            >
              <span>Navigation</span>
              <span className="md:hidden">
                {openSection === "navigation" ? <ChevronUp className="h-4 w-4 text-brand-text-secondary" /> : <ChevronDown className="h-4 w-4 text-brand-text-secondary" />}
              </span>
            </button>
            <ul className={`flex flex-col gap-2.5 text-xs text-brand-text-secondary font-medium mt-1 md:mt-0 transition-all ${
              openSection === "navigation" ? "block" : "hidden md:flex"
            }`}>
              <li><Link to="/" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Home</Link></li>
              <li><Link to="/marketplace" className="hover:text-brand-accent transition-colors block py-1 md:py-0">eBooks Store</Link></li>
              <li><Link to="/marketplace?tab=categories" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Categories</Link></li>
              <li><Link to="/marketplace" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Trending Books</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Pricing Tiers</Link></li>
              <li><Link to="/register?role=author" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Publish with Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources & Support (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <button 
              onClick={() => toggleSection("resources")}
              className="w-full md:pointer-events-none flex items-center justify-between text-left font-bold text-brand-text tracking-wider uppercase font-mono text-xs cursor-pointer focus:outline-none"
            >
              <span>Resources & Support</span>
              <span className="md:hidden">
                {openSection === "resources" ? <ChevronUp className="h-4 w-4 text-brand-text-secondary" /> : <ChevronDown className="h-4 w-4 text-brand-text-secondary" />}
              </span>
            </button>
            <ul className={`flex flex-col gap-2.5 text-xs text-brand-text-secondary font-medium mt-1 md:mt-0 transition-all ${
              openSection === "resources" ? "block" : "hidden md:flex"
            }`}>
              <li><Link to="/faq" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Help Center & FAQ</Link></li>
              <li><Link to="/contact?subject=bug" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Report a Bug</Link></li>
              <li><Link to="/contact?subject=feedback" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Give Feedback</Link></li>
              <li className="flex items-center gap-1.5 py-1 md:py-0 text-emerald-500 font-semibold">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                System Status
              </li>
              <li><a href="#digest" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Weekly Digest</a></li>
              <li><Link to="/about#careers" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Careers</Link></li>
              <li><Link to="/about#press" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Press Kit</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal & Governance (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <button 
              onClick={() => toggleSection("legal")}
              className="w-full md:pointer-events-none flex items-center justify-between text-left font-bold text-brand-text tracking-wider uppercase font-mono text-xs cursor-pointer focus:outline-none"
            >
              <span>Legal & Governance</span>
              <span className="md:hidden">
                {openSection === "legal" ? <ChevronUp className="h-4 w-4 text-brand-text-secondary" /> : <ChevronDown className="h-4 w-4 text-brand-text-secondary" />}
              </span>
            </button>
            <ul className={`flex flex-col gap-2.5 text-xs text-brand-text-secondary font-medium mt-1 md:mt-0 transition-all ${
              openSection === "legal" ? "block" : "hidden md:flex"
            }`}>
              <li><Link to="/privacy" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Privacy Policy</Link></li>
              <li><Link to="/privacy#cookies" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Cookie Policy</Link></li>
              <li><Link to="/terms#disclaimer" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Disclaimer</Link></li>
              <li>
                <Link to="/terms#dmca" className="text-red-500 font-bold hover:underline transition-colors block py-1 md:py-0">
                  DMCA Takedown
                </Link>
              </li>
              <li><Link to="/terms" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Terms of Service</Link></li>
              <li><Link to="/terms#refund" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Refund Policy</Link></li>
              <li><Link to="/terms#copyright" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Copyright Policy</Link></li>
              <li><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors block py-1 md:py-0">HTML Sitemap</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Quick Links Right Aligned */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-[11px] text-brand-text-secondary font-medium">
          <p className="text-center md:text-left leading-relaxed">
            © {new Date().getFullYear()} EbookVala Inc. All rights reserved. Built with Next.js 15 & Neon PostgreSQL.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end">
            <Link to="/privacy" className="hover:text-brand-text transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-brand-text transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/terms#refund" className="hover:text-brand-text transition-colors">Refunds</Link>
            <span>•</span>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-brand-text transition-colors">Sitemap</a>
            <span>•</span>
            <button 
              onClick={handleScrollToTop}
              className="flex items-center gap-1 text-brand-accent font-bold hover:underline cursor-pointer ml-1"
            >
              <ArrowUp className="h-3 w-3" /> Back to top
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
