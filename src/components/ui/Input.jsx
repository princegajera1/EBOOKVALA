import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Input = React.forwardRef(({ 
  className, 
  type = "text", 
  label, 
  error, 
  ...props 
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {label ? (
        <label className="text-xs font-semibold text-brand-text-secondary select-none">
          {label}
        </label>
      ) : null}
      <input
        type={type}
        className={twMerge(
          clsx(
            "flex w-full bg-brand-bg-secondary border border-brand-input-border px-4 py-2.5 text-xs sm:text-sm rounded-brand-input transition-all placeholder:text-brand-text-secondary/50 focus:outline-none focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 disabled:cursor-not-allowed disabled:opacity-50 text-brand-text font-medium",
            error && "border-brand-danger focus:ring-brand-danger/10 focus:border-brand-danger",
            className
          )
        )}
        ref={ref}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-500 font-medium animate-fade-in">
          {error}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
