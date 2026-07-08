import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, BookOpen, AlertCircle, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export const Wishlist = ({ user, books = [], onUpdateWishlist }) => {
  const navigate = useNavigate();

  // Find wishlisted books
  const wishlistIds = user?.wishlist || [];
  const wishlistedBooks = books.filter(b => wishlistIds.includes(b.id));

  const handleRemove = async (e, bookId) => {
    e.stopPropagation();
    const updatedWishlist = wishlistIds.filter(id => id !== bookId);
    if (onUpdateWishlist) {
      await onUpdateWishlist(updatedWishlist);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text">My Wishlist</h1>
        <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">
          Your bookmarked and loved eBooks. Track updates or get them to read.
        </p>
      </div>

      {wishlistedBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistedBooks.map((book) => {
            const isOwned = user?.purchasedBooks?.includes(book.id);

            return (
              <motion.div
                key={book.id}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="group relative overflow-hidden bg-brand-card border border-brand-border/60 hover:border-brand-accent/30 rounded-[22px] p-4 shadow-brand hover:shadow-brand-hover flex flex-col justify-between gap-4 cursor-pointer text-left"
                onClick={() => navigate(`/book/${book.slug || book.id}`)}
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
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold"><Star className="h-3 w-3 fill-amber-500 animate-pulse" /> {book.rating ? book.rating.toFixed(1) : "—"}</span>
                    </div>

                    <div className="text-[10px] font-mono font-bold text-brand-accent uppercase mt-auto">
                      {isOwned ? "Owned • Ready to read" : `Price: ₹${book.price || 299}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-brand-border/45 pt-3 mt-1">
                  <button 
                    onClick={(e) => handleRemove(e, book.id)}
                    className="p-2 rounded-full border border-brand-border hover:bg-brand-danger/10 hover:text-brand-danger hover:border-brand-danger/30 text-brand-text-secondary transition-all cursor-pointer shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  
                  <div>
                    {isOwned ? (
                      <Button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/read/${book.slug || book.id}`); }}
                        className="rounded-full text-[10px] font-bold h-8 px-3.5 bg-brand-accent shadow-sm flex items-center gap-1 hover:scale-102 cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" /> Read
                      </Button>
                    ) : (
                      <Button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/book/${book.slug || book.id}`); }}
                        className="rounded-full text-[10px] font-bold h-8 px-3.5 bg-brand-accent shadow-sm flex items-center gap-1 hover:scale-102 cursor-pointer"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> View Details
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-brand-border/60 rounded-[24px] bg-brand-card p-6 select-none max-w-md mx-auto">
          <Heart className="mx-auto h-9 w-9 text-brand-text-secondary opacity-60 mb-2 animate-pulse" />
          <h3 className="text-xs font-bold text-brand-text tracking-tight font-display uppercase">Wishlist is Empty</h3>
          <p className="text-[10px] text-brand-text-secondary mt-1 max-w-sm font-medium">
            You haven't bookmarked any books yet. Keep track of interesting reads here.
          </p>
          <Button onClick={() => navigate("/marketplace")} className="mt-5 rounded-full text-[10px] font-bold h-8.5 px-4 bg-brand-accent shadow-sm">
            Discover eBooks
          </Button>
        </div>
      )}

    </div>
  );
};
