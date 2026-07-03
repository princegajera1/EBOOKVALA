import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  isLoading = false,
  children, 
  ...props 
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center font-sans font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";
  
  const variants = {
    primary: "bg-black text-white hover:bg-zinc-900 border border-black shadow-sm",
    secondary: "bg-white text-black border border-black hover:bg-zinc-50",
    outline: "bg-white text-black border border-black hover:bg-zinc-50",
    ghost: "bg-transparent text-black hover:bg-zinc-100/70",
    danger: "bg-red-600 text-white hover:bg-red-750 border border-red-600"
  };
  
  const sizes = {
    sm: "h-9 px-4 text-xs rounded-brand-btn",
    md: "h-11 px-6 text-sm rounded-brand-btn",
    lg: "h-13 px-8 text-base rounded-brand-btn",
    icon: "h-11 w-11 rounded-brand-btn"
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="mr-2 h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";
export default Button;
