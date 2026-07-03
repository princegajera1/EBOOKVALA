import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  showLabel = false, 
  size = "md",
  className 
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const heightStyles = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };

  return (
    <div className={twMerge("w-full flex flex-col gap-1.5", className)}>
      <div className={twMerge("w-full bg-brand-bg-secondary border border-brand-border/50 rounded-full overflow-hidden", heightStyles[size])}>
        <div
          className="bg-brand-primary h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel ? (
        <div className="flex justify-between text-xs font-mono text-brand-text-secondary">
          <span>{value} of {max} pages</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      ) : null}
    </div>
  );
};

export default ProgressBar;
