import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowUpDown, BookOpen, Bookmark, Star, AlertCircle, ShoppingBag, Eye, Heart } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";

export const Library = ({ user, books = [], onTabChange }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastRead"); // lastRead | title | progress

  // Find user's purchased books
  const purchasedIds = user?.purchasedBooks || [];
  const myBooks = books.filter(b => purchasedIds.includes(b.id));
  const progressMap = user?.readingProgress || {};

  // Sort and filter
  const filteredBooks = myBooks.filter(b => {
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || 
           (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
           (b.authorName && b.authorName.toLowerCase().includes(q));
  }).sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "progress") {
      const progA = progressMap[a.id] ? (progressMap[a.id].currentPage / (progressMap[a.id].totalPages || 100)) : 0;
      const progB = progressMap[b.id] ? (progressMap[b.id].currentPage / (progressMap[b.id].totalPages || 100)) : 0;
      return progB - progA;
    }
    // Default lastRead
    const timeA = progressMap[a.id]?.lastRead ? new Date(progressMap[a.id].lastRead).getTime() : 0;
    const timeB = progressMap[b.id]?.lastRead ? new Date(progressMap[b.id].lastRead).getTime() : 0;
    return timeB - timeA;
  });

  // Hot recommendations (trending books to show when library is empty or as recommendations at the bottom)
  const trendingBooks = books.filter(b => b.status === "published").slice(0, 3);

  // Toggle favorite / wishlist handler
  const handleWishlistToggle = async (bookId, isFav) => {
    const currentWishlist = user?.wishlist || [];
    let updatedWishlist;
    if (isFav) {
      updatedWishlist = currentWishlist.filter(id => id !== bookId);
    } else {
      updatedWishlist = [...currentWishlist, bookId];
    }
    // Let's call updateProfile to persist wishlist
    // Note: in parent component, this is wired via context
  };

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* Header and description */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text">My Library</h1>
          <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">
            All your purchased books, summaries, and reading progress.
          </p>
        </div>
      </div>

      {myBooks.length > 0 && (
        <>
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-brand-card border border-brand-border/60 p-3 rounded-[20px] shadow-sm">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary opacity-60" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border/60 pl-10 pr-4 py-2 text-[11px] rounded-full focus:outline-none focus:border-brand-accent placeholder:text-brand-text-secondary/50 text-brand-text font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto font-mono text-[9px] font-bold text-brand-text-secondary uppercase">
              <ArrowUpDown className="h-4 w-4 text-brand-text-secondary shrink-0" />
              <span>Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-brand-bg border border-brand-border/60 px-3 py-1.5 text-[10px] rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold cursor-pointer"
              >
                <option value="lastRead">Recent Activity</option>
                <option value="title">Book Title (A-Z)</option>
                <option value="progress">Reading Progress</option>
              </select>
            </div>
          </div>

          {/* Book Catalog Grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const prog = progressMap[book.id] || { currentPage: 0, totalPages: 100 };
                const pct = Math.round((prog.currentPage / (prog.totalPages || 100)) * 100);
                const isFavorite = user?.wishlist?.includes(book.id);

                return (
                  <motion.div
                    key={book.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="group relative overflow-hidden bg-brand-card border border-brand-border/60 hover:border-brand-accent/30 rounded-[22px] p-4 shadow-brand hover:shadow-brand-hover flex flex-col justify-between gap-4 select-none cursor-pointer text-left"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="h-28 w-19 bg-[#161616] border border-brand-border/60 rounded-[8px] overflow-hidden shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-103 group-hover:shadow-md">
                        <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                      </div>
                      
                      <div className="flex-grow min-w-0 flex flex-col justify-between h-28">
                        <div>
                          <h3 className="text-xs font-bold text-brand-text group-hover:text-brand-accent transition-colors duration-200 truncate leading-snug">{book.title}</h3>
                          <p className="text-[10px] text-brand-text-secondary mt-0.5 font-semibold truncate">by {book.authorName || "Unknown"}</p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-2 font-mono text-[9px] text-brand-text-secondary">
                          <span className="bg-brand-bg-secondary px-2 py-0.5 rounded border border-brand-border/50 uppercase tracking-wider">{book.language || "English"}</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold"><Star className="h-3 w-3 fill-amber-500" /> {book.rating ? book.rating.toFixed(1) : "—"}</span>
                        </div>

                        {/* Progress */}
                        <div className="mt-auto">
                          <div className="flex justify-between text-[9px] font-mono font-bold text-brand-text-secondary mb-1">
                            <span>{pct}% Read</span>
                            <span>{prog.currentPage}/{prog.totalPages || 100} Pages</span>
                          </div>
                          <div className="h-1 w-full bg-brand-border/40 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-accent rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-brand-border/40 pt-3 mt-1">
                      <span className="text-[9px] font-mono text-brand-text-secondary font-semibold">
                        Reads: {book.readCount || 0} times
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => navigate(`/read/${book.slug || book.id}`)}
                          className="rounded-full text-[10px] font-bold h-8 px-3.5 bg-brand-accent shadow-sm flex items-center gap-1 hover:scale-102"
                        >
                          <BookOpen className="h-3.5 w-3.5" /> Read
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-brand-border/60 rounded-[20px] bg-brand-card p-6 select-none">
              <AlertCircle className="mx-auto h-8 w-8 text-brand-text-secondary opacity-60 mb-2" />
              <p className="text-xs font-bold text-brand-text">No matching books found</p>
              <p className="text-[10px] text-brand-text-secondary mt-1">Try adjusting your search filters or text query.</p>
              <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4 rounded-full text-[10px] font-bold h-8.5 px-4">
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* 4. CLEAN EMPTY STATE (When reader owns 0 books) */}
      {myBooks.length === 0 && (
        <div className="text-center py-16 border border-dashed border-brand-border/60 rounded-[24px] bg-brand-card p-8 select-none flex flex-col items-center max-w-md mx-auto shadow-brand">
          <BookOpen className="mx-auto h-9 w-9 text-brand-text-secondary opacity-60 mb-2 animate-pulse" />
          <h3 className="text-xs font-bold text-brand-text tracking-tight font-display uppercase">No Books In Your Library</h3>
          <p className="text-[11px] text-brand-text-secondary mt-1.5 font-medium leading-relaxed">
            Books you purchase or add to your collection will appear here for easy reading.
          </p>
          <Button onClick={() => navigate("/marketplace")} className="mt-5 rounded-full text-[10px] font-bold h-8.5 px-4 bg-brand-accent shadow-sm">
            Discover eBooks
          </Button>
        </div>
      )}

    </div>
  );
};
