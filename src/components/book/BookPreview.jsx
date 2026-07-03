import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, BookOpen } from "lucide-react";
import { Button } from "../ui/Button";

// Sample premium content to make the preview look extremely realistic and editorial
const MOCK_CHAPTERS = [
  { title: "Chapter 1: The Architecture of Scale", content: "Systems architecture is the art of defining the structure, behavior, and more views of a system. Scaling is not about adding more servers; it is about building systems that can handle growth gracefully. To build a system that scales, one must understand the bottleneck. Bottlenecks can occur at the database level, the network level, or the application level. In this chapter, we will explore the core concepts of high availability, horizontal scaling, and fault tolerance." },
  { title: "1.1 High Availability and Redundancy", content: "High availability (HA) refers to a system that is continuously operational for a desirably long length of time. Redundancy is the duplication of critical components of a system with the intention of increasing reliability. By introducing redundancy, we ensure that if a single node fails, the traffic is seamlessly rerouted to a healthy node. We will examine active-passive and active-active configurations, and discuss how load balancers detect failures." },
  { title: "1.2 Database Sharding", content: "As your user base grows, a single database node will eventually become the primary bottleneck. Sharding is a method for distributing a single dataset across multiple databases. Each shard is a separate database that contains a subset of the data. Sharding can be based on a hash of the user ID, geographical location, or range-based partitioning. We will walk through the complexities of cross-shard joins and transaction management." },
  { title: "Chapter 2: The SaaS Distribution Engine", content: "If you build it, they will not come. Distribution is the single most important factor in the success of a SaaS business. Many founders focus solely on product engineering, neglecting the growth loops and acquisition channels that drive ARR. In this chapter, we will explore the mechanics of Product-Led Growth (PLG), customer acquisition costs (CAC), and lifetime value (LTV)." },
  { title: "2.1 Product-Led Growth (PLG)", content: "Product-Led Growth is a business methodology in which user acquisition, expansion, conversion, and retention are all driven primarily by the product itself. It creates an efficient growth loop: a user signs up, experiences the 'Aha!' moment, shares the product, and invites other users. We will analyze the onboarding flows of Stripe and Linear, and learn how to optimize the time-to-value." },
  { title: "2.2 Optimizing UI Visual Layouts", content: "Visual engineering is not a superficial overlay; it is a dynamic communication layer. By aligning your application with a strict design system—whether that is typography ratios, margins, or padding—you ensure that your experience scales in tandem with the value you deliver. We will look at visual hierarchy, modern color harmony grids, and how to execute spring transitions." }
];

export const BookPreview = ({ book, isOpen, onClose, onBuyNow }) => {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalPages = 24; // Simulated preview length
  const maxAllowedPage = 15;

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
    const chapterIdx = Math.floor((pageNum - 1) / 3) % MOCK_CHAPTERS.length;
    const chap = MOCK_CHAPTERS[chapterIdx];
    
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
                  Preview: {book.title}
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
