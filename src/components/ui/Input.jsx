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
            "flex w-full bg-white border border-brand-input-border px-4 py-3 text-sm rounded-brand-input transition-all placeholder:text-brand-text-secondary/50 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-50 text-black",
            error && "border-red-500 focus:ring-red-500/10 focus:border-red-500",
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
