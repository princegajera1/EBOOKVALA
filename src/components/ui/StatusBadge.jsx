import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const StatusBadge = ({ status, className }) => {
  const styles = {
    draft: "bg-gray-100 text-gray-700 border border-gray-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200/50",
    published: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    rejected: "bg-red-50 text-red-700 border border-red-200/50"
  };

  const labels = {
    draft: "Draft",
    pending: "Pending",
    published: "Published",
    rejected: "Rejected"
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-3 py-1 text-xs font-bold tracking-tight rounded-full select-none capitalize",
          styles[status] || styles.draft,
          className
        )
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
