import React from "react";
import { motion } from "framer-motion";
import { BookCard } from "./BookCard";
import { BookCardSkeleton } from "../ui/Skeleton";

export const BookGrid = ({ 
  books = [], 
  loading = false, 
  view = "grid", 
  skeletonCount = 8 
}) => {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  if (loading) {
    return (
      <div className={
        view === "list"
          ? "flex flex-col gap-6"
          : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      }>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          view === "list" ? (
            <div key={i} className="h-48 bg-brand-bg-secondary/40 border border-brand-border rounded-brand animate-pulse" />
          ) : (
            <BookCardSkeleton key={i} />
          )
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return null; // Parent page should handle empty state using <EmptyState />
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={
        view === "list"
          ? "flex flex-col gap-6"
          : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      }
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} view={view} />
      ))}
    </motion.div>
  );
};

export default BookGrid;
