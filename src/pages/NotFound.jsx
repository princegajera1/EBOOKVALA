import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";

export const NotFound = () => {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-6 text-center select-none">
      <div className="max-w-md flex flex-col items-center gap-6">
        
        <div className="h-16 w-16 rounded-full bg-brand-bg-secondary border border-brand-border text-brand-text-secondary/80 flex items-center justify-center shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div>
          <h1 className="text-4xl font-display font-black text-brand-text">404</h1>
          <h2 className="text-lg font-bold text-brand-text mt-2">Page Not Found</h2>
          <p className="text-sm text-brand-text-secondary mt-3 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <Link to="/marketplace">
          <Button variant="primary" size="md">
            Return to Marketplace
          </Button>
        </Link>

      </div>
    </div>
  );
};

export default NotFound;
