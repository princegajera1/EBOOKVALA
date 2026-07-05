import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, BookOpen } from "lucide-react";
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

  const totalPages = 24; // Simulated preview length
  const maxAllowedPage = 15;
  const chapters = generateChapters(book);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
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
        <div className="flex flex-col gap-6">
          <span className="text-brand-accent text-xs font-mono tracking-widest uppercase">EBOOKVALA Preview</span>
          <h2 className="text-3xl font-display font-bold text-brand-text leading-tight">{chap.title}</h2>
          <div className="h-px bg-brand-border/60 my-2" />
          <p className="text-brand-text leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-brand-accent first-letter:float-left first-letter:mr-3 first-letter:line-height-[0.8]">
            {chap.content}
          </p>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-6">
          <span className="text-brand-text-secondary text-xs font-mono uppercase">{chap.title.split(":")[0]}</span>
          <p className="text-brand-text leading-relaxed">
            {chap.content.repeat(2)}
          </p>
          <p className="text-brand-text leading-relaxed mt-4">
            Further, building scaling systems requires strict adherence to architectural principles: separation of concerns, decoupling of services via asynchronous message passing, and defensive caching.
          </p>
        </div>
      );
    }
  };

  const isLocked = page > maxAllowedPage;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[4px] p-0 sm:p-4 ${isFullscreen ? "sm:p-0" : ""}`}>
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`bg-brand-bg border border-brand-border flex flex-col w-full h-full shadow-brand sm:rounded-brand overflow-hidden transition-all duration-300 ${
              isFullscreen ? "max-w-none h-screen rounded-none border-none" : "max-w-5xl h-[92vh]"
            }`}
          >
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border select-none">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-display font-bold text-brand-text truncate max-w-[200px] sm:max-w-xs">
                  Preview: {book?.title}
                </h3>
                <span className="text-[10px] font-semibold text-brand-accent bg-brand-accent/10 px-2.5 py-0.5 rounded-full">
                  First 15 Pages
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleZoomOut} 
                  disabled={zoom <= 80}
                  className="p-2 rounded-full hover:bg-brand-bg-secondary text-brand-text-secondary disabled:opacity-30 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono font-bold text-brand-text-secondary min-w-[36px] text-center">
                  {zoom}%
                </span>
                <button 
                  onClick={handleZoomIn} 
                  disabled={zoom >= 150}
                  className="p-2 rounded-full hover:bg-brand-bg-secondary text-brand-text-secondary disabled:opacity-30 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                
                <div className="w-px h-4 bg-brand-border mx-2 hidden sm:block" />
                
                <button 
                  onClick={toggleFullscreen} 
                  className="p-2 rounded-full hover:bg-brand-bg-secondary text-brand-text-secondary hidden sm:block cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-full hover:bg-brand-bg-secondary text-brand-text-secondary cursor-pointer"
                  title="Close"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Reading Pages Area */}
            <div className="flex-grow overflow-y-auto p-6 md:p-12 flex justify-center bg-brand-bg-secondary/40 relative">
              
              <div 
                className="bg-brand-card border border-brand-border rounded-brand-card shadow-brand p-8 md:p-12 w-full max-w-2xl min-h-[500px] flex flex-col justify-between relative transition-all duration-200"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
              >
                {isLocked ? (
                  /* Locked State Overlay */
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-brand-bg/85 backdrop-blur-md p-8 text-center animate-fade-in">
                    <div className="h-14 w-14 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent flex items-center justify-center mb-6 shadow-sm">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-brand-text mb-2">
                      Preview Limit Reached
                    </h3>
                    <p className="text-sm text-brand-text-secondary max-w-xs mb-8 leading-relaxed font-semibold">
                      You've read the first 15 pages. Add this eBook to your library to unlock the remaining chapters.
                    </p>
                    <div className="flex flex-col gap-3 w-full max-w-[240px]">
                      <Button onClick={onBuyNow} variant="primary" className="w-full font-bold text-xs h-11 rounded-full shadow-sm">
                        Add to My Library (Free)
                      </Button>
                      <button onClick={() => setPage(15)} className="text-xs text-brand-text-secondary hover:text-brand-text underline cursor-pointer">
                        Back to Page 15
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Render Simulated Book Page Text */}
                <div className={`flex-1 flex flex-col justify-center ${isLocked ? "blur-[6px] select-none" : ""}`}>
                  {getPageContent(page)}
                </div>

                {/* Footer of Page */}
                <div className="flex items-center justify-between text-[11px] font-mono text-brand-text-secondary mt-8 border-t border-brand-border/30 pt-4 select-none">
                  <span>EBOOKVALA</span>
                  <span>Page {page} of {totalPages}</span>
                </div>
              </div>

              {/* Next Page Arrow */}
              <button 
                onClick={handleNext} 
                className="absolute right-4 z-10 p-3 rounded-full bg-brand-bg border border-brand-border/80 shadow-md hover:shadow-lg text-brand-text cursor-pointer transition-all"
                style={{ top: "45%" }}
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="px-6 py-4 border-t border-brand-border flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between bg-brand-bg select-none">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-brand-text-secondary">Progress</span>
                <div className="w-48 bg-brand-bg-secondary border border-brand-border h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-accent h-full rounded-full transition-all" 
                    style={{ width: `${(Math.min(page, maxAllowedPage) / totalPages) * 100}%` }} 
                  />
                </div>
                <span className="text-[11px] font-mono text-brand-text-secondary">{page}/{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-xs font-medium text-brand-text-secondary hover:text-brand-text disabled:opacity-30 cursor-pointer"
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
                        className={`h-7 w-7 rounded-full text-xs font-mono flex items-center justify-center transition-all cursor-pointer ${
                          page === pageNum 
                            ? "bg-brand-accent text-white" 
                            : "hover:bg-brand-bg-secondary text-brand-text-secondary"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="h-7 w-7 flex items-end justify-center text-brand-text-secondary">...</span>}
                </div>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-xs font-medium text-brand-accent hover:text-brand-accent/85 cursor-pointer"
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
};

export default BookPreview;
