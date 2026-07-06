import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Maximize2, Minimize2, BookOpen, X, Sun, Moon
} from "lucide-react";
import { Button } from "../ui/Button";

// Dynamically generate chapters based on the book properties so every book has a unique preview
const generateChapters = (book) => {
  const title = book?.title || "eBook";
  const subtitle = book?.subtitle || "Exploring the architecture and design patterns.";
  const description = book?.description || "A premium digital publication.";
  
  return [
    { 
      title: `Chapter 1: The Foundations of ${title}`, 
      content: `${description} By exploring the core structures and concepts within ${title}, readers gain direct, actionable insights into modern execution styles. In this chapter, we outline the primary methodologies, scoping mechanics, and strategic approaches.` 
    },
    { 
      title: `1.1 Core Principles of ${title}`, 
      content: `The baseline configurations of ${title} require strict validation. By decoupling dependencies and maintaining structured schemas, we command high performance. Let us examine how developers can analyze the parameters, define value matrices, and configure system metrics for ${title}.` 
    },
    { 
      title: `1.2 Advanced Techniques`, 
      content: `As we expand on the themes in ${title}, visual and architectural optimization keeps systems resilient. Spacing layouts, corner radiuses, and spring physics transitions combine to elevate the final product. We will discuss specific examples and deployment templates.` 
    },
    { 
      title: `Chapter 2: Scaling ${title}`, 
      content: `Scaling ${title} is both a mathematical science and an art form. In this chapter, we explore how PLG growth loops, acquisition tiers, and performance metrics are adjusted. We trace time-to-value optimization and visual hierarchy rules.` 
    },
    { 
      title: `2.1 Growth & Acceleration`, 
      content: `Acceleration loops within ${title} capitalize on user acquisition loops and retention strategies. Seamless onboarding flows reduce time-to-value friction. We will analyze conversion strategies and design user experience frameworks.` 
    },
    { 
      title: `2.2 Visual and Technical Execution`, 
      content: `${subtitle} Implementing premium layouts command spatial depth and micro-animations. Generous white space prevents visual fatigue, creating a conversation with the user. We finalize this preview with a checklist for building high-quality platforms.` 
    }
  ];
};

export const BookPreview = ({ book, isOpen, onClose, onBuyNow }) => {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingTheme, setReadingTheme] = useState("sepia"); // sepia | light | dark

  const totalPages = 24; // Simulated preview length
  const maxAllowedPage = 15;
  const chapters = generateChapters(book);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleZoomIn = () => {
    if (zoom < 150) setZoom(zoom + 10);
  };

  const handleZoomOut = () => {
    if (zoom > 80) setZoom(zoom - 10);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getPageContent = (pageNum) => {
    const chapterIdx = Math.floor((pageNum - 1) / 3) % chapters.length;
    const chap = chapters[chapterIdx];
    
    if ((pageNum - 1) % 3 === 0) {
      return (
        <div className="flex flex-col gap-6 text-left">
          <span className="text-brand-accent text-[11px] font-mono font-bold tracking-widest uppercase">
            EBOOKVALA PREVIEW
          </span>
          <h2 className="text-3xl font-display font-black leading-tight tracking-tight mt-1">
            {chap.title}
          </h2>
          <div className="h-0.5 bg-current opacity-10 my-1" />
          <p className="font-serif text-[15px] sm:text-[17px] leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1">
            {chap.content}
          </p>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-6 text-left">
          <span className="opacity-60 text-[10px] font-mono uppercase tracking-wider">
            {chap.title.split(":")[0]}
          </span>
          <p className="font-serif text-[15px] sm:text-[16px] leading-relaxed">
            {chap.content.repeat(2)}
          </p>
          <p className="font-serif text-[15px] sm:text-[16px] leading-relaxed mt-2 opacity-95">
            Further, building scaling systems requires strict adherence to architectural principles: separation of concerns, decoupling of services via asynchronous message passing, and defensive caching.
          </p>
        </div>
      );
    }
  };

  const isLocked = page > maxAllowedPage;

  // Theme styling definitions
  const themeClasses = {
    light: {
      workspace: "bg-slate-100/90 text-slate-800",
      toolbar: "bg-white border-slate-200 text-slate-800",
      page: "bg-white text-slate-900 border-slate-200/60 shadow-lg",
      pageFooter: "border-slate-100 text-slate-400",
      btnHover: "hover:bg-slate-100 text-slate-600",
      divider: "bg-slate-200"
    },
    sepia: {
      workspace: "bg-[#EFE5D3]/90 text-[#433422]",
      toolbar: "bg-[#FAF4EB] border-[#E6DCC8] text-[#433422]",
      page: "bg-[#FCF9F2] text-[#433422] border-[#E8DFC8] shadow-[0_12px_28px_-6px_rgba(67,52,34,0.12)]",
      pageFooter: "border-[#F0E6D2] text-[#8E7E6A]",
      btnHover: "hover:bg-[#EFE5D3] text-[#433422]",
      divider: "bg-[#E8DFC8]"
    },
    dark: {
      workspace: "bg-[#09090B]/95 text-zinc-400",
      toolbar: "bg-[#18181B] border-zinc-800 text-zinc-100",
      page: "bg-[#121214] text-zinc-100 border-zinc-800/80 shadow-[0_12px_36px_rgba(0,0,0,0.5)]",
      pageFooter: "border-zinc-800/40 text-zinc-600",
      btnHover: "hover:bg-zinc-800 text-zinc-300",
      divider: "bg-zinc-800"
    }
  };

  const currentTheme = themeClasses[readingTheme];

  const modalElement = (
    <AnimatePresence>
      {isOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-[6px] p-0 sm:p-4 select-none">
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col w-full h-full shadow-2xl sm:rounded-[24px] overflow-hidden transition-all duration-300 ${currentTheme.workspace} ${
              isFullscreen ? "max-w-none h-screen rounded-none border-none" : "max-w-5xl h-[92vh] border border-current/10"
            }`}
          >
            
            {/* Top Toolbar */}
            <div className={`flex items-center justify-between px-6 py-3.5 border-b select-none shrink-0 ${currentTheme.toolbar}`}>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-brand-accent hidden sm:block" />
                <div className="flex flex-col text-left">
                  <h3 className="text-sm font-display font-black truncate max-w-[150px] sm:max-w-xs leading-tight">
                    {book?.title}
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-brand-accent tracking-wider uppercase mt-0.5">
                    Free Preview
                  </span>
                </div>
              </div>

              {/* Theme selectors in Toolbar */}
              <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-full border border-current/5">
                {["light", "sepia", "dark"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setReadingTheme(t)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      readingTheme === t 
                        ? "bg-brand-accent text-white shadow-sm" 
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleZoomOut} 
                  disabled={zoom <= 80}
                  className={`p-2 rounded-full disabled:opacity-30 cursor-pointer transition-all ${currentTheme.btnHover}`}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono font-bold min-w-[36px] text-center">
                  {zoom}%
                </span>
                <button 
                  onClick={handleZoomIn} 
                  disabled={zoom >= 150}
                  className={`p-2 rounded-full disabled:opacity-30 cursor-pointer transition-all ${currentTheme.btnHover}`}
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                
                <div className={`w-px h-4 mx-2 hidden sm:block ${currentTheme.divider}`} />
                
                <button 
                  onClick={toggleFullscreen} 
                  className={`p-2 rounded-full hidden sm:block cursor-pointer transition-all ${currentTheme.btnHover}`}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button 
                  onClick={onClose} 
                  className={`p-2 rounded-full cursor-pointer transition-all ${currentTheme.btnHover}`}
                  title="Close Preview"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
 
            {/* Reading Pages Area */}
            <div className="flex-grow overflow-auto p-4 md:p-10 flex justify-center items-start bg-black/5 dark:bg-black/10 relative">
              
              <div 
                className={`w-full max-w-2xl min-h-[620px] rounded-[16px] border p-8 md:p-14 flex flex-col justify-between relative transition-all duration-200 ${currentTheme.page}`}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
              >
                {isLocked ? (
                  /* Locked State Overlay */
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 text-white rounded-[16px] p-8 text-center animate-fade-in">
                    <div className="h-14 w-14 rounded-full bg-brand-accent/10 border border-brand-accent/25 text-brand-accent flex items-center justify-center mb-5 shadow-sm">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-display font-black mb-2">
                      Preview Limit Reached
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mb-8 leading-relaxed font-semibold">
                      You've read the first 15 pages of this preview edition. Add this eBook to your library to unlock the remaining chapters.
                    </p>
                    <div className="flex flex-col gap-3 w-full max-w-[220px]">
                      <Button onClick={onBuyNow} variant="primary" className="w-full font-bold text-xs h-11 rounded-full shadow-sm">
                        Add to My Library (Free)
                      </Button>
                      <button onClick={() => setPage(15)} className="text-xs text-zinc-500 hover:text-white underline cursor-pointer font-bold">
                        Back to Page 15
                      </button>
                    </div>
                  </div>
                ) : null}
 
                {/* Book Spine / Shadow Page Fold Vibe */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 to-transparent pointer-events-none rounded-l-[16px]" />
 
                {/* Render Simulated Book Page Text */}
                <div className={`flex-grow flex flex-col justify-center ${isLocked ? "blur-[6px] select-none" : ""}`}>
                  {getPageContent(page)}
                </div>
 
                {/* Footer of Page */}
                <div className={`flex items-center justify-between text-[10px] font-mono mt-8 border-t pt-4 select-none ${currentTheme.pageFooter}`}>
                  <span className="font-bold tracking-wider">EBOOKVALA</span>
                  <span>Page {page} of {totalPages}</span>
                </div>
              </div>
 
              {/* Next Page Arrow (Floating helper) */}
              {!isLocked && page < totalPages && (
                <button 
                  onClick={handleNext} 
                  className={`absolute right-6 z-10 p-3 rounded-full border shadow-md hover:shadow-lg cursor-pointer transition-all ${currentTheme.toolbar}`}
                  style={{ top: "45%" }}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
 
            {/* Bottom Navigation Bar */}
            <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between select-none shrink-0 ${currentTheme.toolbar}`}>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Progress</span>
                <div className="w-48 bg-black/10 dark:bg-white/10 border border-current/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-accent h-full rounded-full transition-all" 
                    style={{ width: `${(Math.min(page, maxAllowedPage) / totalPages) * 100}%` }} 
                  />
                </div>
                <span className="text-[10px] font-mono font-bold opacity-75">{page}/{totalPages}</span>
              </div>
 
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={page === 1}
                  className="px-4 py-2 text-xs font-bold disabled:opacity-30 cursor-pointer"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-7.5 w-7.5 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                          page === pageNum 
                            ? "bg-brand-accent text-white shadow-sm" 
                            : `hover:bg-black/5 dark:hover:bg-white/5`
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="h-7.5 w-7.5 flex items-end justify-center opacity-50 text-xs">...</span>}
                </div>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-xs font-bold text-brand-accent hover:text-brand-accent/80 cursor-pointer animate-pulse"
                >
                  Next
                </button>
              </div>
            </div>
 
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalElement, document.body);
};

export default BookPreview;
