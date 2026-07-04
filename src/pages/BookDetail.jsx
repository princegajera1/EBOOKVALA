import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, Heart, Eye, Check, Download, BookOpen, Share2, 
  BrainCircuit, Award, ChevronRight, MessageSquare, ShieldCheck, 
  HelpCircle, ChevronDown, RefreshCw, Compass
} from "lucide-react";
import { dbService } from "../services/db";
import { useWishlist } from "../hooks/useWishlist";
import { useApp } from "../store/AppContext";
import { BookPreview } from "../components/book/BookPreview";
import { Button } from "../components/ui/Button";
import { toast } from "react-hot-toast";

// Seed flashcards template
const MOCK_FLASHCARDS = [
  { id: 1, q: "What is the core framework proposed in this book?", a: "Iterative optimization through micro-metrics and user feedback loops." },
  { id: 2, q: "What is the single biggest failure point discussed?", a: "Scaling the infrastructure prematurely before finding market-fit or styling consistency." },
  { id: 3, q: "How can readers immediately apply the concepts?", a: "Set up baseline analytics dashboards, follow design-system rules, and conduct value-based research." },
  { id: 4, q: "What role does EBOOKVALA's AI feature play?", a: "Instantly explains complex chapters, generates summaries, and formats questions into test preps." }
];

export const BookDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user, isAuthenticated, updateProfile } = useApp();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [author, setAuthor] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Tabs state: info | summary | flashcards | mindmap
  const [activeDetailTab, setActiveDetailTab] = useState("info");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [flippedCardId, setFlippedCardId] = useState(null);

  useEffect(() => {
    const loadBookData = async () => {
      setLoading(true);
      try {
        const foundBook = await dbService.getBookBySlug(slug);
        if (!foundBook) {
          setBook(null);
          setLoading(false);
          return;
        }
        setBook(foundBook);

        // Fetch review details
        const bookReviews = await dbService.getReviewsByBookId(foundBook.id);
        setReviews(bookReviews);

        // Fetch author profile
        const bookAuthor = await dbService.getAuthorById(foundBook.authorId);
        setAuthor(bookAuthor);

        // Fetch related books
        const allBooks = await dbService.getBooks();
        const related = allBooks.filter(
          (b) =>
            b.id !== foundBook.id &&
            b.status === "published" &&
            b.categories.some((cat) => foundBook.categories.includes(cat))
        );
        setRelatedBooks(related.slice(0, 3));
      } catch (err) {
        console.error("Error loading book detail:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBookData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-accent animate-spin" />
          <p className="text-xs font-bold text-brand-text-secondary">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center select-none text-center px-6">
        <div>
          <h2 className="text-2xl font-display font-black text-brand-text">Book Not Found</h2>
          <p className="text-xs text-brand-text-secondary mt-2">The book you are looking for does not exist or was removed.</p>
          <Link to="/marketplace" className="inline-block mt-6">
            <Button variant="primary">Back to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPurchased = user?.purchasedBooks?.includes(book.id) || user?.role === "admin";
  const wishlisted = isWishlisted(book.id);

  const handleAddToLibrary = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const toastId = toast.loading("Adding to your library...");
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
      toast.success(`${book.title} added to your library! 📖`, { id: toastId });
      // Update local profile purchasedBooks immediately
      const currentPurchased = user.purchasedBooks || [];
      if (!currentPurchased.includes(book.id)) {
        await updateProfile({
          purchasedBooks: [...currentPurchased, book.id]
        });
      }
    } catch (err) {
      toast.error("Failed to add book to library.", { id: toastId });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("eBook link copied to clipboard!");
  };

  return (
    <div className="bg-brand-bg min-h-screen py-10 md:py-14 pb-24 md:pb-14 select-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* 2-COLUMN HERO VIEW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Sticky Cover, Preview Options */}
          <div className="md:col-span-5 flex flex-col gap-6 items-center md:items-start md:sticky md:top-28">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[2/3] bg-brand-card border border-brand-border shadow-brand rounded-[20px] overflow-hidden group">
              <img 
                src={book.coverURL} 
                alt={book.title} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute top-4 left-4 bg-brand-accent text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full px-3 py-1 shadow-sm">
                FREE LIBRARY
              </div>
            </div>

            {/* Actions Panel */}
            <div className="w-full max-w-[320px] sm:max-w-[360px] flex flex-col gap-3 mt-2">
              <Button 
                onClick={() => setIsPreviewOpen(true)} 
                variant="outline" 
                className="w-full h-12 rounded-full border-brand-border text-brand-text font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-bg-secondary"
              >
                <BookOpen className="h-4 w-4 text-brand-accent" />
                Preview Sample
              </Button>
              
              {isPurchased && (
                <a href={book.pdfURL} download={`${book.slug}.pdf`} className="w-full">
                  <Button variant="primary" className="w-full h-12 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-sm">
                    <Download className="h-4 w-4" />
                    Download PDF ({book.fileSize || "12MB"})
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Title, Quick Specs, Free Actions */}
          <div className="md:col-span-7 flex flex-col gap-8 text-left">
            <div>
              {/* Category Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {book.categories.map((cat, idx) => (
                  <span key={idx} className="bg-brand-accent/10 text-brand-accent text-[9px] font-extrabold tracking-wider uppercase rounded-full px-3 py-1">
                    {cat}
                  </span>
                ))}
                {book.aiDescription && (
                  <span className="bg-brand-success/10 text-brand-success text-[9px] font-extrabold tracking-wider uppercase rounded-full px-3 py-1 flex items-center gap-1">
                    <BrainCircuit className="h-3.5 w-3.5" /> AI Enhanced
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-display font-black text-brand-text leading-tight">
                {book.title}
              </h1>
              <p className="text-base sm:text-lg text-brand-text-secondary mt-2 leading-relaxed">
                {book.subtitle}
              </p>

              {/* Author Info */}
              <p className="text-xs text-brand-text-secondary mt-4">
                by{" "}
                <Link to={`/marketplace?author=${encodeURIComponent(book.authorName)}`} className="text-brand-text font-bold hover:underline">
                  {book.authorName}
                </Link>
              </p>

              {/* Ratings Summary */}
              {book.rating > 0 ? (
                <div className="flex items-center gap-2 mt-4 select-none">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.round(book.rating) 
                            ? "fill-amber-400 text-amber-400" 
                            : "text-brand-border"
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-brand-text mt-0.5">{book.rating}</span>
                  <span className="text-xs text-brand-text-secondary mt-0.5">({reviews.length} Reviews)</span>
                </div>
              ) : (
                <p className="text-xs text-brand-text-secondary italic mt-4">No reviews yet • Read and rate first!</p>
              )}
            </div>

            <div className="h-px bg-brand-border" />

            {/* CTAs & Free Indicator */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-left">
                <span className="text-2xl font-mono font-black text-brand-success">Free Forever</span>
                <span className="text-xs text-brand-text-secondary font-medium">(First Year Launch Offer)</span>
              </div>

              {!isPurchased ? (
                <div className="flex flex-wrap sm:flex-nowrap gap-3 mt-1">
                  <Button 
                    onClick={handleAddToLibrary}
                    variant="primary" 
                    className="flex-grow h-13 rounded-full font-bold text-sm shadow-sm"
                  >
                    Add to My Library
                  </Button>

                  <Button
                    onClick={() => toggleWishlist(book.id)}
                    variant="secondary"
                    className="h-13 w-13 rounded-full p-0 shrink-0 border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-red-500"
                    aria-label="Wishlist"
                  >
                    <Heart className={`h-4.5 w-4.5 ${wishlisted ? "fill-red-500 text-red-500 border-red-500" : ""}`} />
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="secondary"
                    className="h-13 w-13 rounded-full p-0 shrink-0 border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text"
                    aria-label="Share link"
                  >
                    <Share2 className="h-4.5 w-4.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="bg-brand-success/10 border border-brand-success/20 rounded-[16px] p-4 flex items-center gap-3">
                    <div className="h-8.5 w-8.5 rounded-full bg-brand-success text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-text">Book Saved in Library</p>
                      <p className="text-[10px] text-brand-text-secondary mt-0.5">Read online or download the PDF file to study offline.</p>
                    </div>
                  </div>
                  
                  <Link to={`/read/${book.slug || book.id}`} className="w-full">
                    <Button variant="primary" className="w-full h-13 rounded-full font-bold text-sm bg-brand-success text-white shadow-sm flex items-center justify-center gap-2">
                      <BookOpen className="h-4.5 w-4.5" />
                      Read eBook Online
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="h-px bg-brand-border" />

            {/* Description Synopsis */}
            <div>
              <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3 font-mono">Book Synopsis</h4>
              <div className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed space-y-4 font-normal">
                <p className={isDescriptionExpanded ? "" : "line-clamp-3"}>
                  {book.description}
                </p>
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-xs font-bold text-brand-text hover:underline cursor-pointer mt-1.5 block"
                >
                  {isDescriptionExpanded ? "Read Less" : "Read More"}
                </button>
              </div>
            </div>

            {/* Specifications Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-semibold text-brand-text">
              <div className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-brand-success" strokeWidth={3} />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-brand-success" strokeWidth={3} />
                <span>AI Explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-brand-success" strokeWidth={3} />
                <span>Study Mind Maps</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-brand-success" strokeWidth={3} />
                <span>PDF/EPUB formats</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. PREMIUM MULTI-TAB STUDY INTERFACE */}
        <div className="mt-20 lg:mt-24">
          <div className="flex border-b border-brand-border overflow-x-auto no-scrollbar gap-6 sm:gap-10 pb-px mb-8 font-display select-none">
            {[
              { id: "info", label: "Product & Reviews", count: reviews.length },
              { id: "summary", label: "AI Chapters Outline" },
              { id: "flashcards", label: "Interactive Flashcards" },
              { id: "mindmap", label: "Dynamic Mind Map" }
            ].map((tab) => {
              const isActive = activeDetailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`pb-4 text-sm font-bold relative transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive ? "text-brand-text" : "text-brand-text-secondary hover:text-brand-text"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-bg-secondary text-brand-text-secondary border border-brand-border">
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="activeDetailIndicator"
                      className="absolute bottom-0 left-0 w-full h-[2.5px] bg-brand-accent rounded-full" 
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-left">
            {/* TAB 1: PRODUCT INFO & REVIEWS */}
            {activeDetailTab === "info" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Details list */}
                <div className="lg:col-span-7 flex flex-col gap-10">
                  <div className="border border-brand-border rounded-brand-card bg-brand-card overflow-hidden shadow-brand">
                    <table className="w-full text-xs text-left text-brand-text-secondary">
                      <tbody>
                        {[
                          { label: "Publisher", val: book.publisher || "Ebookvala Press" },
                          { label: "Edition", val: book.edition || "1st Edition" },
                          { label: "Pages", val: `${book.pages} pages` },
                          { label: "Language", val: book.language || "English" },
                          { label: "Format", val: book.format?.join(", ") || "PDF, EPUB" },
                          { label: "ISBN", val: book.isbn || "978-3-16-148410-0" },
                        ].map((row, idx) => (
                          <tr key={idx} className="border-b border-brand-border last:border-0 hover:bg-brand-bg-secondary transition-colors">
                            <td className="p-4 font-bold text-brand-text w-1/3 border-r border-brand-border">{row.label}</td>
                            <td className="p-4 font-mono font-medium">{row.val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Reviews block */}
                  <div>
                    <h3 className="text-lg font-bold text-brand-text mb-4">Customer Reviews</h3>
                    {reviews.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {reviews.map((rev) => (
                          <div key={rev.id} className="border border-brand-border bg-brand-card rounded-brand-card p-5 shadow-brand flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center font-bold text-xs text-brand-text uppercase">
                                  {rev.readerName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-brand-text leading-none">{rev.readerName}</h5>
                                  <div className="flex gap-0.5 mt-1.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-brand-border"}`} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-brand-text-secondary/70">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-brand-text-secondary leading-relaxed font-normal">{rev.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-brand-text-secondary italic">No reviews yet.</p>
                    )}
                  </div>
                </div>

                {/* Right col: Author Profile */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                  {author && (
                    <div className="bg-brand-card border border-brand-border rounded-brand-card p-6 shadow-brand select-none text-left">
                      <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4 font-mono">About the Author</h4>
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="h-13 w-13 rounded-full border border-brand-border overflow-hidden bg-brand-bg-secondary shrink-0">
                          <img src={author.photoURL} alt={author.displayName} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h5 className="font-display font-bold text-brand-text leading-none">{author.displayName}</h5>
                          <p className="text-[10px] text-brand-text-secondary mt-1.5 font-mono">{author.followers.length} Followers</p>
                        </div>
                      </div>
                      <p className="text-xs text-brand-text-secondary leading-relaxed mb-5 font-normal">{author.bio}</p>
                      <Button 
                        onClick={() => navigate(`/marketplace?author=${encodeURIComponent(author.displayName)}`)}
                        variant="secondary" 
                        size="sm" 
                        className="w-full rounded-full text-xs h-10 border-brand-border hover:bg-brand-bg-secondary"
                      >
                        View Profile
                      </Button>
                    </div>
                  )}

                  {/* Related Books */}
                  {relatedBooks.length > 0 && (
                    <div className="select-none text-left">
                      <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4 font-mono">Related Books</h4>
                      <div className="flex flex-col gap-3.5">
                        {relatedBooks.map((rel) => (
                          <Link 
                            key={rel.id} 
                            to={`/book/${rel.slug || rel.id}`} 
                            className="flex gap-4 p-3.5 border border-brand-border rounded-[16px] bg-brand-card hover:shadow-brand hover:-translate-y-0.5 transition-all duration-300 group"
                          >
                            <div className="h-16 w-12 bg-brand-bg-secondary border border-brand-border rounded-[8px] overflow-hidden shrink-0 shadow-sm">
                              <img src={rel.coverURL} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-grow flex flex-col justify-between py-0.5 text-left">
                              <div>
                                <h5 className="text-xs font-bold text-brand-text group-hover:text-brand-accent transition-colors truncate">{rel.title}</h5>
                                <p className="text-[10px] text-brand-text-secondary mt-0.5 truncate">by {rel.authorName}</p>
                              </div>
                              <span className="text-[10px] font-bold text-brand-success uppercase tracking-wider font-mono">Free</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: AI SUMMARY CHAPTERS */}
            {activeDetailTab === "summary" && (
              <div className="bg-brand-card border border-brand-border rounded-brand-card p-6 md:p-8 shadow-brand max-w-4xl">
                <div className="flex items-center gap-2 mb-6">
                  <BrainCircuit className="h-5 w-5 text-brand-accent animate-pulse" />
                  <h3 className="text-lg font-bold text-brand-text font-display">AI Chapter Takeaways</h3>
                </div>
                
                <div className="flex flex-col gap-5">
                  {[
                    { ch: "Chapter 1: Understanding Key Foundations", details: "Establishes structural hierarchies, font scaling rules, and defining proper constraints. Explains why clarity precedes ornamentation." },
                    { ch: "Chapter 2: Optimization and Execution Tiers", details: "Details how to configure value matrices, streamline workflows, and prevent premature scaling bottlenecks." },
                    { ch: "Chapter 3: Cognitive Styling & Interactions", details: "Covers the visual hierarchy of buttons, creating custom hover triggers, spring transitions, and building micro animations." },
                    { ch: "Chapter 4: Implementation and Launch Schedules", details: "Focuses on deploying, setting up structured automated testing, tracking streaked stats, and publishing with clear visual consistency." },
                  ].map((chapter, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-2xl bg-brand-bg-secondary border border-brand-border hover:border-brand-accent/30 transition-all">
                      <div className="h-8.5 w-8.5 rounded-full bg-brand-accent/10 border border-brand-accent/25 text-brand-accent flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-brand-text font-display">{chapter.ch}</h4>
                        <p className="text-xs text-brand-text-secondary mt-1.5 leading-relaxed">{chapter.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: INTERACTIVE FLASHCARDS */}
            {activeDetailTab === "flashcards" && (
              <div className="max-w-4xl select-none">
                <p className="text-xs text-brand-text-secondary mb-6 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" /> Tap any flashcard to flip it and reveal the study answers!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {MOCK_FLASHCARDS.map((card) => {
                    const isFlipped = flippedCardId === card.id;
                    return (
                      <div 
                        key={card.id}
                        onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                        className="h-44 w-full cursor-pointer relative"
                        style={{ perspective: "1000px" }}
                      >
                        <motion.div
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 15 }}
                          className="w-full h-full relative rounded-brand-card shadow-brand border border-brand-border bg-brand-card transition-all"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Front Side */}
                          <div 
                            className="absolute inset-0 p-5 flex flex-col justify-between"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider font-mono">Question {card.id}</span>
                            <p className="text-xs sm:text-sm font-bold text-brand-text leading-snug">{card.q}</p>
                            <span className="text-[9px] font-bold text-brand-text-secondary flex items-center gap-1 self-end uppercase">Tap to Flip ↻</span>
                          </div>

                          {/* Back Side */}
                          <div 
                            className="absolute inset-0 p-5 flex flex-col justify-between bg-brand-bg-secondary rounded-brand-card"
                            style={{ 
                              backfaceVisibility: "hidden", 
                              transform: "rotateY(180deg)" 
                            }}
                          >
                            <span className="text-[10px] font-bold text-brand-success uppercase tracking-wider font-mono">Core Answer</span>
                            <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">{card.a}</p>
                            <span className="text-[9px] font-bold text-brand-accent flex items-center gap-1 self-end uppercase">Back ↺</span>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: DYNAMIC MIND MAP */}
            {activeDetailTab === "mindmap" && (
              <div className="bg-brand-card border border-brand-border rounded-brand-card p-6 md:p-10 shadow-brand overflow-x-auto no-scrollbar max-w-4xl text-center select-none">
                <div className="flex items-center gap-2 mb-8 justify-center">
                  <Award className="h-5 w-5 text-brand-accent" />
                  <h3 className="text-lg font-bold text-brand-text font-display">Concept Visual Map</h3>
                </div>

                <div className="flex flex-col items-center gap-6 min-w-[500px] py-4">
                  {/* Root Node */}
                  <div className="px-5 py-3 rounded-full bg-brand-accent text-white font-bold text-xs sm:text-sm shadow-md border-2 border-brand-accent flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5" />
                    <span>{book.title}</span>
                  </div>

                  {/* Vert Line */}
                  <div className="w-0.5 h-6 bg-brand-border" />

                  {/* Branches Row */}
                  <div className="grid grid-cols-3 gap-6 w-full items-start relative">
                    {/* Horizontal Connector Line */}
                    <div className="absolute top-0 left-[16.6%] right-[16.6%] h-0.5 bg-brand-border z-0" />

                    {[
                      {
                        title: "1. Core Framework",
                        sub: ["Foundational Metrics", "Visual Constraints", "Dynamic Guidelines"]
                      },
                      {
                        title: "2. Execution & Scaling",
                        sub: ["Early Bottlenecks", "Deployment Grids", "Value Experimenting"]
                      },
                      {
                        title: "3. Interactive Design",
                        sub: ["Micro Animations", "Framer Physics", "Aesthetic Polish"]
                      }
                    ].map((branch, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-3 relative z-10">
                        {/* vertical connector for each branch */}
                        <div className="w-0.5 h-4 bg-brand-border" />
                        
                        {/* Branch Node */}
                        <div className="px-4 py-2 rounded-2xl bg-brand-bg-secondary border border-brand-border text-brand-text font-bold text-[11px] sm:text-xs">
                          {branch.title}
                        </div>
                        
                        <div className="w-0.5 h-3 bg-brand-border" />

                        {/* Child Nodes */}
                        <div className="flex flex-col gap-2 w-full">
                          {branch.sub.map((subItem, sIdx) => (
                            <div 
                              key={sIdx}
                              className="px-3 py-1.5 rounded-xl border border-brand-border bg-brand-card hover:border-brand-accent/20 text-brand-text-secondary text-[10px] font-semibold text-center hover:scale-102 transition-all"
                            >
                              {subItem}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW SAMPLE MODAL */}
        <BookPreview 
          book={book} 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
          onBuyNow={() => {
            setIsPreviewOpen(false);
            handleAddToLibrary();
          }}
        />

      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-card/90 backdrop-blur-md border-t border-brand-border p-4 flex items-center justify-between gap-4 shadow-brand select-none">
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-mono text-brand-text-secondary uppercase">Price</span>
          <span className="text-xs font-bold text-brand-success uppercase">Free Forever</span>
        </div>
        
        {isPurchased ? (
          <div className="flex gap-2 flex-grow max-w-[200px] justify-end">
            <a href={book.pdfURL} download={`${book.slug}.pdf`} className="w-full">
              <Button size="sm" variant="primary" className="w-full h-10 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active-tap">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </a>
          </div>
        ) : (
          <Button 
            onClick={handleAddToLibrary}
            size="sm"
            variant="primary" 
            className="flex-grow max-w-[200px] h-10 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active-tap"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Add to Library
          </Button>
        )}
      </div>

    </div>
  );
};

export default BookDetail;
