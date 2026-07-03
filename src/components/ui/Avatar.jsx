import React, { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Avatar = ({ src, alt = "", name = "", size = "md", className }) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return "";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const sizes = {
    sm: "h-8 w-8 text-xs rounded-full",
    md: "h-11 w-11 text-sm rounded-full",
    lg: "h-16 w-16 text-lg rounded-full",
    xl: "h-24 w-24 text-2xl rounded-full",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "relative flex shrink-0 overflow-hidden items-center justify-center font-sans font-medium select-none bg-brand-bg-secondary border border-brand-border/60 text-brand-text-secondary",
          sizes[size],
          className
        )
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setHasError(true)}
          loading="lazy"
          className="h-full w-full object-cover animate-fade-in"
        />
      ) : (
        <span className="font-mono tracking-wider">
          {getInitials(name) || "?"}
        </span>
      )}
    </div>
  );
};

export default Avatar;
