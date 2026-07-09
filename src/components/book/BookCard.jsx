import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Eye, Check, Clock, BookOpen, Globe, BrainCircuit } from "lucide-react";
import { useWishlist } from "../../hooks/useWishlist";
import { useApp } from "../../store/AppContext";
import { BookPreview } from "./BookPreview";
import { Button } from "../ui/Button";
import { toast } from "react-hot-toast";
import { dbService } from "../../services/db";

// Helper to get high-quality seed author avatars
const getAuthorAvatar = (authorId) => {
  if (authorId === "author-1") return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80";
  if (authorId === "author-2") return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80";
  if (authorId === "author-3") return "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&h=80&q=80";
  return `https://api.dicebear.com/7.x/initials/svg?seed=${authorId || "Author"}`;
};

const isAuthorVerified = (authorId) => {
  return authorId === "author-1" || authorId === "author-2";
};

const getDifficulty = (pages) => {
  if (!pages) return "Beginner";
  if (pages > 300) return "Advanced";
  if (pages > 150) return "Intermediate";
  return "Beginner";
};

export const BookCard = ({ book, view = "grid" }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useApp();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  
  const navigate = useNavigate();
  const wishlisted = isWishlisted(book.id);
  const difficulty = getDifficulty(book.pages);
  const isAdded = user?.purchasedBooks?.includes(book.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(book.id);
  };

  const handlePreviewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewOpen(true);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await dbService.createOrder({
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.coverURL,
        readerId: user.uid,
        amount: 0,
        paymentId: `free-${Date.now().toString().slice(-6)}`,
        paymentGateway: "Free Library"
      });
      toast.success(`${book.title} added to your library! 📖`);
      // Force page state update
      navigate("/dashboard?tab=home");
    } catch (err) {
      toast.error("Failed to add book to library.");
    }
  };

  // 3D tilt tracking and keyboard accessibility states/handlers
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10; // Max 10 deg
    const rotateX = (0.5 - (y / rect.height)) * 10;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleKeyDown = (e) => {
    if (
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "A" ||
      e.target.closest("button") ||
      e.target.closest("a")
    ) {
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/book/${book.slug || book.id}`);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.25, ease: "easeInOut" }
    }
  };

  // 1. LIST VIEW CARD
  if (view === "list") {
    return (
      <>
        <motion.div
          variants={cardVariants}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          whileHover={{ y: -6, boxShadow: "var(--shadow-brand-hover)" }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="flex flex-col sm:flex-row gap-6 p-5 bg-brand-card border border-brand-border rounded-brand-card shadow-brand focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:outline-none transition-all duration-300 group relative text-left"
        >
          {/* Cover */}
          <Link to={`/book/${book.slug || book.id}`} className="shrink-0">
            <div className="relative aspect-[2/3] w-32 sm:w-40 bg-brand-bg border border-brand-border rounded-brand-img overflow-hidden shadow-sm">
              <img
                src={book.coverURL}
                alt={`Cover of the book ${book.title}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-brand-accent mb-1 bg-brand-accent/10 px-2 py-0.5 rounded-full">
                  {(book.categories && book.categories[0]) || "eBook"}
                </span>
                
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistClick}
                  className="p-2 rounded-full border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-red-500 transition-all cursor-pointer shadow-sm"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500 border-red-500" : ""}`} />
                </button>
              </div>
              
              <Link to={`/book/${book.slug || book.id}`} className="hover:text-brand-accent transition-colors">
                <h4 className="text-[20px] font-display font-bold text-brand-text leading-snug line-clamp-2">
                  {book.title}
                </h4>
              </Link>

              {/* Author & Verification */}
              <div className="flex items-center gap-2 mt-2 select-none">
                <div className="h-5 w-5 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary">
                  <img src={getAuthorAvatar(book.authorId)} alt={`Avatar of ${book.authorName}`} decoding="async" className="h-full w-full object-cover" />
                </div>
                <p className="text-[12px] text-brand-text-secondary flex items-center gap-1">
                  by <span className="font-semibold text-brand-text">{book.authorName}</span>
                  {isAuthorVerified(book.authorId) && (
                    <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-brand-primary text-brand-bg text-[8px] font-bold">
                      <Check className="h-2 w-2" strokeWidth={4} />
                    </span>
                  )}
                </p>
              </div>

              {/* Rating & Reading Details */}
              <div className="flex flex-wrap items-center gap-3.5 mt-3 select-none text-[11px] text-brand-text-secondary font-medium">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-brand-text">{book.rating || "New"}</span>
                  {book.reviewCount > 0 && <span>({book.reviewCount})</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{book.readingTimeMinutes || book.pages} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{difficulty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{book.language || "English"}</span>
                </div>
              </div>

              <p className="text-[13px] text-brand-text-secondary mt-3.5 line-clamp-2 leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Price & Action Row */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-border/60">
              <span className="text-xs font-bold text-brand-success bg-brand-success/15 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                Free Forever
              </span>

              <div className="flex items-center gap-2">
                {book && (book.pdfURL || book.pdf_url) && (
                  <Button 
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        await dbService.incrementBookDownloads(book.id);
                        toast.success("Starting download...");
                        const link = document.createElement("a");
                        link.href = book.pdfURL || book.pdf_url;
                        link.setAttribute("download", `${book.title}.pdf`);
                        link.target = "_blank";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      } catch (err) {
                        console.error("Error triggering download:", err);
                        toast.error("Failed to download.");
                      }
                    }}
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 text-xs font-bold rounded-full text-brand-accent border-brand-accent/20 hover:bg-brand-accent/5 hover:border-brand-accent/30"
                  >
                    Download
                  </Button>
                )}
                <Button 
                  onClick={handlePreviewClick}
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-4 text-xs font-bold rounded-full"
                >
                  Preview
                </Button>
                <Link to={`/read/${book.slug || book.id}`}>
                   <Button 
                     variant="primary" 
                     size="sm" 
                     className="h-9 px-4 text-xs font-bold rounded-full bg-brand-success/15 text-brand-success hover:bg-brand-success/25 border-transparent"
                   >
                     Read Now
                   </Button>
                 </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preview Modal */}
        <BookPreview 
          book={book} 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
        />
      </>
    );
  }

  // 2. DEFAULT GRID VIEW CARD
  return (
    <>
      <motion.div
        variants={cardVariants}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        animate={{
          opacity: 1,
          rotateX: isHovered ? tilt.x : 0,
          rotateY: isHovered ? tilt.y : 0,
          transformPerspective: 1000,
          y: isHovered ? -6 : 0,
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="flex flex-col bg-brand-card rounded-brand-card border border-brand-border shadow-brand focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:outline-none transition-all duration-300 group overflow-hidden relative cursor-pointer text-left h-full"
      >
        {/* Cover Image Container */}
        <Link to={`/book/${book.slug || book.id}`} className="relative aspect-[3/4] w-full bg-brand-bg overflow-hidden select-none block">
          <img
            src={book.coverURL}
            alt={`Cover of the book ${book.title}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 rounded-t-brand-card"
          />
          
          {/* Heart Button Overlay */}
          <motion.button
            onClick={handleWishlistClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-brand-card/90 backdrop-blur-md shadow-sm text-brand-text-secondary hover:text-red-500 transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 z-10"
            aria-label="Toggle wishlist"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500 border-red-500" : ""}`} />
          </motion.button>

          {/* AI Info Badge Toggle */}
          {book.aiDescription && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAiSummary(!showAiSummary);
              }}
              className="absolute top-3 left-3 p-2 rounded-full bg-brand-accent/90 backdrop-blur-md shadow-sm text-white hover:bg-brand-accent transition-all z-10"
              title="Show AI Summary"
            >
              <BrainCircuit className="h-4 w-4 animate-pulse" />
            </button>
          )}



          {/* AI description card reveal */}
          <AnimatePresence>
            {showAiSummary && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                className="absolute inset-0 bg-brand-card/95 backdrop-blur-md p-4 flex flex-col justify-between z-20 text-left"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-brand-accent flex items-center gap-1">
                    <BrainCircuit className="h-3.5 w-3.5" /> AI Enhanced
                  </span>
                  <p className="text-[11px] text-brand-text font-medium leading-relaxed">
                    {book.aiDescription}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full text-xs font-bold" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAiSummary(false);
                  }}
                >
                  Close Summary
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Card Body */}
        <div className="p-3 flex-grow flex flex-col justify-between gap-1.5 text-left">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="inline-block text-[9px] font-extrabold tracking-wider uppercase text-brand-accent">
                {(book.categories && book.categories[0]) || "eBook"}
              </span>
              <span className="text-[9px] font-bold text-brand-text-secondary uppercase">
                {book.language || "English"}
              </span>
            </div>
            
            <Link to={`/book/${book.slug || book.id}`} className="hover:text-brand-accent transition-colors block">
              <h4 className="text-sm font-bold text-brand-text leading-snug line-clamp-2 h-9 font-display">
                {book.title}
              </h4>
            </Link>
            
            {/* Author Row */}
            <div className="flex items-center gap-2 mt-2 select-none">
              <div className="h-4.5 w-4.5 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0">
                <img src={getAuthorAvatar(book.authorId)} alt={`Avatar of ${book.authorName}`} decoding="async" className="h-full w-full object-cover" />
              </div>
              <p className="text-[11px] text-brand-text-secondary truncate flex items-center gap-1">
                by <span className="font-semibold text-brand-text">{book.authorName}</span>
                {isAuthorVerified(book.authorId) && (
                  <span className="inline-flex items-center justify-center h-3 w-3 rounded-full bg-brand-primary text-brand-bg text-[7px] font-bold shrink-0">
                    <Check className="h-2 w-2" strokeWidth={4} />
                  </span>
                )}
              </p>
            </div>

            {/* Badges / Rating Row */}
            <div className="flex items-center gap-2.5 mt-2.5 select-none text-[10px] text-brand-text-secondary font-medium">
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-bold text-brand-text">{book.rating || "New"}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                <span>{book.readingTimeMinutes || book.pages}m</span>
              </div>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-brand-bg-secondary font-semibold text-brand-text">{difficulty}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between mt-1 pt-3 border-t border-brand-border/60">
            <span className="text-[11px] font-bold text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-full">
              Free
            </span>
            
            {book && (book.pdfURL || book.pdf_url) && (
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    await dbService.incrementBookDownloads(book.id);
                    toast.success("Starting download...");
                    const link = document.createElement("a");
                    link.href = book.pdfURL || book.pdf_url;
                    link.setAttribute("download", `${book.title}.pdf`);
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (err) {
                    console.error("Error triggering download:", err);
                    toast.error("Failed to download.");
                  }
                }}
                className="text-xs text-brand-accent hover:underline font-bold font-sans cursor-pointer py-1 px-2 rounded-md hover:bg-brand-accent/5 transition-colors"
                title="Download eBook PDF"
              >
                Download
              </button>
            )}

            <Link to={`/read/${book.slug || book.id}`}>
              <button
                className="text-xs text-brand-success hover:underline font-bold font-sans cursor-pointer py-1 px-2 rounded-md hover:bg-brand-success/5 transition-colors"
              >
                Read Now
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <BookPreview 
        book={book} 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
    </>
  );
};

export default BookCard;
