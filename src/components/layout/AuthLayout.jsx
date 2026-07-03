import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Download, Sparkles, BookOpen } from "lucide-react";

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-brand-bg select-none transition-colors duration-300">
      
      {/* Left side: Premium Brand Editorial */}
      <div className="hidden md:flex md:w-1/2 bg-brand-bg-secondary border-r border-brand-border flex-col justify-between p-12 lg:p-16 text-left">
        <Link to="/" className="text-xl font-display font-black tracking-tight text-brand-text">
          EBOOKVALA
        </Link>

        <div className="max-w-md my-auto flex flex-col gap-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[9px] font-bold tracking-widest uppercase w-fit">
            <Sparkles className="h-3 w-3" /> 100% Free Open Library
          </span>
          <h1 className="text-4xl lg:text-5xl font-display font-black text-brand-text leading-tight">
            Read the minds <br />
            of the masters.
          </h1>
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            EBOOKVALA offers a premium digital sanctuary for voracious readers and an open, clutter-free publishing canvas for independent authors.
          </p>

          {/* Left Column Trust Badges */}
          <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-brand-border">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-brand-text">4.9/5 Rated by 50,000+ Readers</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-brand-text">
              <BookOpen className="h-4.5 w-4.5 text-brand-accent shrink-0" />
              <span>Unlimited Digital Reading & Study Analytics</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-brand-text">
              <Download className="h-4.5 w-4.5 text-brand-success shrink-0" />
              <span>Instant Local Downloads & Lifetime Access</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-brand-text-secondary/70 font-semibold font-mono uppercase tracking-wider">
          © {new Date().getFullYear()} EBOOKVALA. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Right side: Form container */}
      <div className="flex-1 flex flex-col justify-center bg-brand-bg px-6 py-12 md:px-12 lg:px-24 xl:px-32 relative">
        {/* Mobile Header */}
        <div className="absolute top-8 left-6 md:hidden">
          <Link to="/" className="text-lg font-display font-black tracking-tight text-brand-text">
            EBOOKVALA
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-sm mx-auto"
        >
          {children}
        </motion.div>
      </div>

    </div>
  );
};

export default AuthLayout;
