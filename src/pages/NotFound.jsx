import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, HelpCircle } from "lucide-react";
import { Button } from "../components/ui/Button";

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-6 text-center select-none bg-brand-bg transition-colors duration-300">
      <div className="max-w-md flex flex-col items-center gap-6">
        
        {/* Simple visual design badge */}
        <div className="text-8xl font-display font-black text-brand-accent/20 tracking-widest relative select-none">
          404
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold tracking-normal text-brand-text">
            Lost in the Stacks
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed font-normal">
            The page or digital book you are trying to read has either wandered to a different shelf, changed its title, or was never cataloged.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full h-11 px-8 rounded-full text-xs font-bold shadow-sm">
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center gap-4 text-xs font-bold text-brand-text-secondary">
            <Link to="/marketplace" className="hover:text-brand-accent flex items-center gap-1.5 transition-colors">
              <BookOpen className="h-3.5 w-3.5" />
              Explore Library
            </Link>
            <span className="text-brand-border">|</span>
            <Link to="/help" className="hover:text-brand-accent flex items-center gap-1.5 transition-colors">
              <HelpCircle className="h-3.5 w-3.5" />
              Help Center
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
