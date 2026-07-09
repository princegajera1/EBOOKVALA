import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/Button";
import { toast } from "react-hot-toast";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export const Footer = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    if (email) {
      // 1. Try to save subscriber to Firestore (non-blocking)
      try {
        await addDoc(collection(db, "subscribers"), {
          email,
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
            email: email
          })
        });

        if (!emailRes.ok) {
          throw new Error("Email service failed");
        }

        toast.success("Thank you for joining our newsletter! Check your inbox for updates. ✉️");
        e.target.reset();
      } catch (err) {
        console.error("Newsletter subscription mail dispatch error:", err);
        toast.error("Failed to subscribe. Please try again.");
      }
    }
  };

  return (
    <footer className="bg-brand-bg border-t border-brand-border py-12 select-none text-left transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Newsletter Banner at top of footer */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-12 mb-12 border-b border-brand-border">
          <div className="max-w-md text-left">
            <h4 className="text-sm font-bold text-brand-text uppercase tracking-wider font-mono">Newsletter</h4>
            <p className="text-xs text-brand-text-secondary mt-1.5 leading-relaxed">
              Join EBOOKVALA's community to receive updates on newly added open-library books, AI reading analysis, and reader statistics.
            </p>
          </div>
          <div className="w-full max-w-md flex flex-col gap-2">
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
              <input 
                type="email" 
                name="email"
                required
                aria-label="Email address for newsletter"
                placeholder="Enter your email address" 
                className="flex-grow bg-brand-bg-secondary border border-brand-border rounded-full py-2.5 px-4 text-xs focus:outline-none focus:bg-brand-bg focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 text-brand-text font-medium transition-all"
              />
              <Button type="submit" variant="primary" className="h-10 px-6 text-xs font-bold shrink-0 shadow-sm rounded-full">
                Join Community
              </Button>
            </form>
            <p className="text-[10px] text-brand-text-secondary/70 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-success" />
              100% Free platform. No credit cards needed.
            </p>
          </div>
        </div>

        {/* Middle Section: Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 pb-12 border-b border-brand-border">
          
          {/* Brand & Description (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-4 mb-6 md:mb-0">
            <Link to="/" className="text-2xl font-display font-black tracking-tight hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-md">
              <span className="text-white">EBOOK</span>
              <span className="text-[#3B82F6]">VALA</span>
            </Link>
            <p className="text-xs text-brand-text-secondary leading-relaxed max-w-sm">
              Discover 10,000+ open-library, curated eBooks from India's finest authors. 100% Free Forever for the first year. Community-driven, open-source reading.
            </p>
          </div>

          {/* Product (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-2 md:gap-4 border-b border-brand-border md:border-b-0 pb-4 md:pb-0">
            <button 
              onClick={() => toggleSection("product")}
              className="w-full md:pointer-events-none flex items-center justify-between text-left font-bold text-brand-text tracking-wider uppercase font-mono text-xs cursor-pointer focus:outline-none"
            >
              <span>Product</span>
              <span className="md:hidden">
                {openSection === "product" ? <ChevronUp className="h-4 w-4 text-brand-text-secondary" /> : <ChevronDown className="h-4 w-4 text-brand-text-secondary" />}
              </span>
            </button>
            <ul className={`flex flex-col gap-3 text-xs text-brand-text-secondary font-medium mt-2 md:mt-0 transition-all ${
              openSection === "product" ? "block" : "hidden md:flex"
            }`}>
              <li><Link to="/marketplace" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Explore Library</Link></li>
              <li><Link to="/search" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Search Books</Link></li>
            </ul>
          </div>

          {/* Company (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-2 md:gap-4 border-b border-brand-border md:border-b-0 pb-4 md:pb-0">
            <button 
              onClick={() => toggleSection("company")}
              className="w-full md:pointer-events-none flex items-center justify-between text-left font-bold text-brand-text tracking-wider uppercase font-mono text-xs cursor-pointer focus:outline-none"
            >
              <span>Company</span>
              <span className="md:hidden">
                {openSection === "company" ? <ChevronUp className="h-4 w-4 text-brand-text-secondary" /> : <ChevronDown className="h-4 w-4 text-brand-text-secondary" />}
              </span>
            </button>
            <ul className={`flex flex-col gap-3 text-xs text-brand-text-secondary font-medium mt-2 md:mt-0 transition-all ${
              openSection === "company" ? "block" : "hidden md:flex"
            }`}>
              <li><Link to="/about" className="hover:text-brand-accent transition-colors block py-1 md:py-0">About Us</Link></li>
              <li><Link to="/our-mission" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Our Mission</Link></li>
            </ul>
          </div>

          {/* Support (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-2 md:gap-4 border-b border-brand-border md:border-b-0 pb-4 md:pb-0">
            <button 
              onClick={() => toggleSection("support")}
              className="w-full md:pointer-events-none flex items-center justify-between text-left font-bold text-brand-text tracking-wider uppercase font-mono text-xs cursor-pointer focus:outline-none"
            >
              <span>Support</span>
              <span className="md:hidden">
                {openSection === "support" ? <ChevronUp className="h-4 w-4 text-brand-text-secondary" /> : <ChevronDown className="h-4 w-4 text-brand-text-secondary" />}
              </span>
            </button>
            <ul className={`flex flex-col gap-3 text-xs text-brand-text-secondary font-medium mt-2 md:mt-0 transition-all ${
              openSection === "support" ? "block" : "hidden md:flex"
            }`}>
              <li><Link to="/help" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-brand-accent transition-colors block py-1 md:py-0">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-2 md:gap-4 pb-4 md:pb-0">
            <button 
              onClick={() => toggleSection("legal")}
              className="w-full md:pointer-events-none flex items-center justify-between text-left font-bold text-brand-text tracking-wider uppercase font-mono text-xs cursor-pointer focus:outline-none"
            >
              <span>Legal</span>
              <span className="md:hidden">
                {openSection === "legal" ? <ChevronUp className="h-4 w-4 text-brand-text-secondary" /> : <ChevronDown className="h-4 w-4 text-brand-text-secondary" />}
              </span>
            </button>
            <ul className={`flex flex-col gap-3 text-xs text-brand-text-secondary font-medium mt-2 md:mt-0 transition-all ${
              openSection === "legal" ? "block" : "hidden md:flex"
            }`}>
              <li><Link to="/terms" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-accent transition-colors block py-1 md:py-0">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 text-[11px] text-brand-text-secondary font-medium">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>© {new Date().getFullYear()} EBOOKVALA. All rights reserved.</span>
            <span className="hidden sm:inline text-brand-border">•</span>
            <span>Made with ❤️ in India 🇮🇳</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            {/* Social Icons */}
            <div className="flex gap-3 text-brand-text-secondary">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full border border-brand-border hover:border-brand-accent hover:bg-brand-accent/5 hover:text-brand-accent transition-all" aria-label="Twitter">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full border border-brand-border hover:border-brand-accent hover:bg-brand-accent/5 hover:text-brand-accent transition-all" aria-label="LinkedIn">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full border border-brand-border hover:border-brand-accent hover:bg-brand-accent/5 hover:text-brand-accent transition-all" aria-label="GitHub">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>

            {/* Back to top */}
            <button 
              onClick={handleScrollToTop}
              className="flex items-center gap-1 text-brand-text hover:underline cursor-pointer font-bold shrink-0 ml-2 animate-pulse-subtle"
              aria-label="Back to top"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5 text-brand-text-secondary" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
