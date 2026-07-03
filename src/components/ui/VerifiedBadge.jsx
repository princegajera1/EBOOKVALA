import React from "react";
import { Check } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const VerifiedBadge = ({ className, size = 14 }) => {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center bg-brand-primary text-white rounded-full p-0.5 shadow-sm select-none",
          className
        )
      )}
      title="Verified Author"
    >
      <Check strokeWidth={3} className="h-3 w-3" style={{ width: size, height: size }} />
    </span>
  );
};

export default VerifiedBadge;
