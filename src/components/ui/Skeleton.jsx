import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(
        "animate-pulse rounded-[12px] bg-slate-200 dark:bg-zinc-800",
        className
      )}
      {...props}
    />
  );
};

export const BookCardSkeleton = () => (
  <div className="flex flex-col gap-3">
    {/* Cover */}
    <Skeleton className="aspect-[2/3] w-full rounded-brand-card" />
    {/* Title */}
    <Skeleton className="h-5 w-3/4" />
    {/* Author */}
    <Skeleton className="h-4 w-1/2" />
    {/* Price & Rating */}
    <div className="flex items-center justify-between mt-1">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/6" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="border-b border-[#F1F5F9] animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="p-4">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export default Skeleton;
