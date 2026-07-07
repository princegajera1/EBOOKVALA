import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Settings, Maximize, Minimize, Bookmark, 
  Highlighter, PenTool, BrainCircuit, Volume2, VolumeX, Languages, 
  HelpCircle, Send, Sparkles, LogOut, ArrowLeft, RefreshCw, FileText, BookOpen
} from "lucide-react";
import { dbService } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { toast } from "react-hot-toast";

// Generates mock book contents for immersive reading
const generateMockContent = (title) => [
  {
    chapter: "Chapter 1: The Baseline Foundations",
    paragraphs: [
      `In the architectural design of modern applications, baseline foundations dictate longevity. Whether configuring structural margins or managing load balancing grids, every minor detail influences user engagement. When we think of ${title || "EBOOKVALA"}, the goal remains simple: construct interfaces that look premium, feel cohesive, and prioritize clarity.`,
      `We start by aligning visual tokens. A design system is not a collection of arbitrary color palettes; it is a strict layout blueprint. We define primary colors (like Deep Navy #0F172A) and accent tones (like Royal Blue #2563EB) to command attention without inducing visual fatigue. By establishing consistent corner radiuses and soft elevation shadows, we create spatial depth.`,
      `Cognitive load is the ultimate enemy. A cluttered screen creates friction, forcing users to exit. That is why premium digital spaces utilize generous white space. Spacing allows content to breathe, directing focus to critical components. We will examine how spacing grids, typeset line-heights, and font scaling systems combine to form the core minimalism styles.`
    ]
  },
  {
    chapter: "Chapter 2: Optimization and Scaling Tiers",
    paragraphs: [
      `Scaling is a mathematical art. Developers often fail not because their code is incorrect, but because they scaled the system prematurely. In this chapter, we outline the parameters of customer acquisition systems, grandfathering tiers, and value metric tracking.`,
      `For any SaaS engine, alignment between pricing and value metrics ensures smooth expansion revenue. However, for open-library platforms, the challenge shifts from transaction processing to loading performance. Optimization rules (like lazy loading, font optimization, and code splitting) keep the Largest Contentful Paint (LCP) under 2 seconds.`,
      `We must also design error-recovery states. When a network request fails, presenting a raw system error ruins user trust. EBOOKVALA handles this with custom visual illustrations, friendly instructions, and a single-click recovery CTA.`
    ]
  },
  {
    chapter: "Chapter 3: Interactive Micro-Animations",
    paragraphs: [
      `Static applications feel dead. Adding micro-interactions—like subtle button ripples, springy card zooms, and smooth page slides—brings a product to life. We utilize Framer Motion spring physics to simulate realistic physical weight.`,
      `Let us examine how hover states transform user delight. When a user hovers over a Book Card, the card lifts slightly while the cover zooms in by 3-5%. Concurrently, quick actions (like adding to bookmarks or previewing chapters) fade in. This is not visual clutter; it is a visual conversation.`,
      `We will also analyze text customization. Giving readers control over their environment (adjusting font size, background sepia mode, line spacing) is a hallmark of top-tier product design. It shows consideration for accessibility (WCAG AA compliance) and reading longevity.`
    ]
  }
];

export const Reader = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("pdf"); // default to pdf mode

  // Reader Settings
  const [readerTheme, setReaderTheme] = useState("sepia"); // light | dark | sepia
  const [fontSize, setFontSize] = useState(16); // in px
  const [fontFamily, setFontFamily] = useState("sans"); // serif | sans | mono
  const [lineHeight, setLineHeight] = useState("relaxed"); // snug | normal | relaxed
  const [marginSize, setMarginSize] = useState("normal"); // compact | normal | wide
  
  // Reading States
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  
  // Custom Notes state
  const [newNoteText, setNewNoteText] = useState("");
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);

  // Settings dropdown state
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Floating AI Panel
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: "ai", text: "Hello! I am your AI Reading Companion. Highlight any text to ask for an explanation, or ask me questions about this chapter!" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechUtteranceRef = useRef(null);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const found = await dbService.getBookBySlug(slug);
        if (!found) {
          toast.error("eBook not found");
          navigate("/dashboard");
          return;
        }
        setBook(found);
        setChapters(generateMockContent(found.title));
        
        const fileUrl = found.pdfURL || found.pdf_url;
        if (!fileUrl || fileUrl.trim() === "") {
          setViewMode("text");
        } else {
          setViewMode("pdf");
        }
        
        // Increment live read count in Firestore
        dbService.updateBook(found.id, { readCount: (found.readCount || 0) + 1 });
        
        // Load initial progress
        if (user?.readingProgress?.[found.id]) {
          const savedCh = user.readingProgress[found.id].currentPage - 1;
          if (savedCh >= 0 && savedCh < 3) {
            setCurrentChapterIdx(savedCh);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug, user]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" && currentChapterIdx < chapters.length - 1) {
        handlePageTurn(currentChapterIdx + 1);
      }
      if (e.key === "ArrowLeft" && currentChapterIdx > 0) {
        handlePageTurn(currentChapterIdx - 1);
      }
      if (e.key === "Escape") {
        if (isFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentChapterIdx, chapters]);

  // Page Turn & Progress Save
  const handlePageTurn = async (newIdx) => {
    setCurrentChapterIdx(newIdx);
    setFlippedCardId(null);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    // Save progress
    if (user && book) {
      const updatedProgress = { ...user.readingProgress };
      updatedProgress[book.id] = {
        currentPage: newIdx + 1,
        totalPages: chapters.length,
        lastRead: new Date().toISOString()
      };
      await updateProfile({ readingProgress: updatedProgress });
    }
  };

  const [flippedCardId, setFlippedCardId] = useState(null);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Text Selection / Highlight Handler
  const handleTextSelection = () => {
    const sel = window.getSelection().toString();
    if (sel && sel.trim().length > 3) {
      setSelectedText(sel);
    }
  };

  const addHighlight = () => {
    if (!selectedText) return;
    if (highlights.includes(selectedText)) {
      toast.error("Text is already highlighted");
      return;
    }
    setHighlights([...highlights, selectedText]);
    toast.success("Text highlighted! 🖍️");
    setSelectedText("");
  };

  const addNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setNotes([...notes, { id: Date.now(), text: newNoteText, ch: chapters[currentChapterIdx].chapter }]);
    setNewNoteText("");
    toast.success("Note saved! 📝");
  };

  // Text to Speech
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const fullText = chapters[currentChapterIdx].paragraphs.join(" ");
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.onend = () => setIsSpeaking(false);
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.success("Reading chapter aloud... 🔊");
    }
  };

  // AI Assistant Chat Simulation
  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    
    const userMsg = aiInput;
    setAiMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setAiInput("");
    setAiLoading(true);

    setTimeout(() => {
      let reply = "";
      if (userMsg.toLowerCase().includes("explain") || userMsg.toLowerCase().includes("summarize")) {
        reply = `✨ AI Analysis: In ${chapters[currentChapterIdx].chapter}, the author explores core layout principles and highlights how cognitive load can be optimized using clean variables and typography consistency.`;
      } else {
        reply = `I've analyzed your question relative to ${book.title}. The text suggests prioritizing responsive design layout rules, maintaining vertical spacing hierarchies, and building micro animations.`;
      }
      setAiMessages(prev => [...prev, { sender: "ai", text: reply }]);
      setAiLoading(false);
    }, 1200);
  };

  const handleAiExplainHighlight = () => {
    if (!selectedText) return;
    setShowAiPanel(true);
    setAiMessages(prev => [...prev, { sender: "user", text: `Explain this highlighted text: "${selectedText}"` }]);
    setAiLoading(true);

    setTimeout(() => {
      const reply = `✨ AI Explanation: The highlighted text emphasizes how structural system parameters (like borders, spacing ratios, and theme colors) must remain fully consistent. This creates a state of visual calm and minimizes user checkout friction.`;
      setAiMessages(prev => [...prev, { sender: "ai", text: reply }]);
      setAiLoading(false);
      setSelectedText("");
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center select-none text-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-accent animate-spin" />
          <p className="text-xs font-bold text-brand-text-secondary">Opening reader workspace...</p>
        </div>
      </div>
    );
  }

  // Reader Background Styling Map
  const bgStyles = {
    light: "bg-white text-slate-900 border-slate-200",
    dark: "bg-slate-950 text-slate-100 border-slate-800",
    sepia: "bg-[#F4ECD8] text-[#5C4033] border-[#E4DCD0]"
  };

  const activeThemeClass = bgStyles[readerTheme];

  const fontFamilies = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono"
  };

  const lineHeights = {
    snug: "leading-snug",
    normal: "leading-normal",
    relaxed: "leading-relaxed"
  };

  const margins = {
    compact: "max-w-2xl px-6",
    normal: "max-w-3xl px-8",
    wide: "max-w-4xl px-12"
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-all duration-300 ${activeThemeClass} select-text`}>
      
      {/* Top Header Control Bar */}
      <header className="h-16 border-b border-inherit px-6 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h4 className="text-xs font-bold truncate max-w-[200px] sm:max-w-sm font-display">{book.title}</h4>
            <p className="text-[10px] opacity-70 mt-0.5">{chapters[currentChapterIdx]?.chapter}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle PDF/Text view modes */}
          {book && (
            <button
              onClick={() => setViewMode(prev => prev === "pdf" ? "text" : "pdf")}
              className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold text-brand-text"
              title={viewMode === "pdf" ? "Switch to Reflowable Text Mode" : "Switch to PDF Book Mode"}
            >
              {viewMode === "pdf" ? <BookOpen className="h-4.5 w-4.5 text-brand-accent animate-pulse" /> : <FileText className="h-4.5 w-4.5" />}
              <span className="hidden md:inline">{viewMode === "pdf" ? "Read Text" : "View PDF"}</span>
            </button>
          )}

          {/* Audio controls */}
          {viewMode === "text" && (
            <button
              onClick={toggleSpeech}
              className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              title="Read Chapter Aloud"
            >
              {isSpeaking ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>
          )}

          {/* AI Helper Toggle */}
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`p-2 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
              showAiPanel ? "bg-brand-accent/20 text-brand-accent" : "hover:bg-black/5"
            }`}
            title="AI Reading Companion"
          >
            <BrainCircuit className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Reader settings dropdown */}
          {viewMode === "text" && (
            <div className="relative">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                title="Reader Configurations"
              >
                <Settings className="h-4.5 w-4.5" />
              </button>

              <AnimatePresence>
                {showSettingsDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSettingsDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-64 z-50 bg-brand-card border border-brand-border rounded-brand-card shadow-brand-hover p-4 text-brand-text flex flex-col gap-4 text-left"
                    >
                      <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider font-mono">Reader Settings</p>
                      
                      {/* Theme selector */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold">Theme background</span>
                        <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold">
                          {["light", "sepia", "dark"].map((t) => (
                            <button
                              key={t}
                              onClick={() => setReaderTheme(t)}
                              className={`py-1.5 rounded-lg border capitalize cursor-pointer ${
                                readerTheme === t 
                                  ? "border-brand-accent bg-brand-bg-secondary text-brand-accent" 
                                  : "border-brand-border hover:bg-brand-bg-secondary"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font selector */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold">Typography Scale</span>
                        <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold">
                          {["sans", "serif", "mono"].map((f) => (
                            <button
                              key={f}
                              onClick={() => setFontFamily(f)}
                              className={`py-1.5 rounded-lg border capitalize cursor-pointer ${
                                fontFamily === f 
                                  ? "border-brand-accent bg-brand-bg-secondary text-brand-accent" 
                                  : "border-brand-border hover:bg-brand-bg-secondary"
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Size selector */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold">Text Size</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                            className="w-7 h-7 rounded border border-brand-border flex items-center justify-center font-bold text-xs hover:bg-brand-bg-secondary cursor-pointer"
                          >
                            A-
                          </button>
                          <span className="text-xs font-mono font-bold">{fontSize}px</span>
                          <button 
                            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                            className="w-7 h-7 rounded border border-brand-border flex items-center justify-center font-bold text-xs hover:bg-brand-bg-secondary cursor-pointer"
                          >
                            A+
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            title="Fullscreen Toggle"
          >
            <Maximize className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main className="flex-grow flex relative items-stretch">
        
        {/* Floating Quick Action Widget for Selected Text */}
        <AnimatePresence>
          {selectedText && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-brand-card border border-brand-border rounded-full p-1.5 shadow-brand-hover flex items-center gap-1"
            >
              <button
                onClick={addHighlight}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 flex items-center gap-1 cursor-pointer"
              >
                <Highlighter className="h-3.5 w-3.5" /> Highlight
              </button>
              <button
                onClick={handleAiExplainHighlight}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/25 hover:bg-brand-accent/20 flex items-center gap-1 cursor-pointer"
              >
                <BrainCircuit className="h-3.5 w-3.5" /> AI Explain
              </button>
              <button
                onClick={() => setSelectedText("")}
                className="p-1.5 rounded-full hover:bg-brand-bg-secondary text-brand-text-secondary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF / Text Viewport */}
        {viewMode === "pdf" ? (
          (() => {
            const pdfUrl = book?.pdfURL || book?.pdf_url;
            const isPdfValid = pdfUrl && pdfUrl.trim() !== "";
            
            if (!isPdfValid) {
              return (
                <div className="flex-grow flex flex-col items-center justify-center p-8 bg-brand-bg-secondary text-brand-text select-none text-center">
                  <div className="max-w-md p-8 rounded-[24px] border border-brand-border bg-brand-card shadow-brand flex flex-col items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-brand-danger/10 border border-brand-danger/25 text-brand-danger flex items-center justify-center shadow-sm">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-display font-black">File not available</h3>
                    <p className="text-xs text-brand-text-secondary leading-relaxed max-w-xs">
                      This eBook does not have a PDF document uploaded. Switch to <strong>Text Mode</strong> to read the text preview instead!
                    </p>
                    <Button onClick={() => setViewMode("text")} variant="primary" className="rounded-full text-xs font-bold px-6 h-10 shadow-sm mt-2">
                      Switch to Text Mode
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div className="flex-grow relative bg-[#2a2a2e] flex items-stretch">
                <iframe 
                  src={pdfUrl} 
                  className="w-full border-none" 
                  title={book.title}
                  style={{ minHeight: "calc(100vh - 64px)" }}
                />
              </div>
            );
          })()
        ) : (
          /* Text viewport */
          <div 
            className="flex-grow overflow-y-auto py-12 flex justify-center"
            onMouseUp={handleTextSelection}
          >
            <div className={`${margins[marginSize]} w-full flex flex-col gap-6 text-left`}>
              <h2 className="text-2xl font-display font-black tracking-tight mb-4 border-b border-inherit pb-4">
                {chapters[currentChapterIdx]?.chapter}
              </h2>
              
              <div className={`flex flex-col gap-5 ${fontFamilies[fontFamily]} ${lineHeights[lineHeight]}`} style={{ fontSize: `${fontSize}px` }}>
                {chapters[currentChapterIdx]?.paragraphs.map((para, pIdx) => (
                  <p key={pIdx} className="indent-4 text-justify font-medium leading-relaxed opacity-90">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Tutor Chat Sidebar Drawer */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-80 border-l border-inherit bg-brand-card flex flex-col justify-between shadow-brand-hover relative z-35"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-brand-border flex items-center justify-between select-none">
                <div className="flex items-center gap-2 text-brand-text">
                  <BrainCircuit className="h-4.5 w-4.5 text-brand-accent animate-pulse" />
                  <span className="text-xs font-bold">AI Reading Tutor</span>
                </div>
                <button
                  onClick={() => setShowAiPanel(false)}
                  className="p-1 rounded-full text-brand-text-secondary hover:bg-brand-bg-secondary"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 text-xs leading-relaxed">
                {aiMessages.map((msg, mIdx) => (
                  <div 
                    key={mIdx}
                    className={`p-3 rounded-2xl max-w-[85%] text-left ${
                      msg.sender === "ai" 
                        ? "bg-brand-bg-secondary text-brand-text border border-brand-border self-start rounded-tl-sm" 
                        : "bg-brand-accent text-white self-end rounded-tr-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {aiLoading && (
                  <div className="p-3 rounded-2xl bg-brand-bg-secondary border border-brand-border self-start rounded-tl-sm flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendAiMessage} className="p-3 border-t border-brand-border flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-1 bg-brand-bg border border-brand-border px-3.5 py-2 text-xs rounded-full focus:outline-none focus:border-brand-accent placeholder:text-brand-text-secondary/50 text-brand-text"
                />
                <button
                  type="submit"
                  className="p-2 bg-brand-accent text-white rounded-full hover:scale-105 transition-transform"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Progress Navigation bar */}
      {viewMode === "text" && (
        <footer className="h-16 border-t border-inherit px-6 flex items-center justify-between select-none">
          <button
            onClick={() => handlePageTurn(currentChapterIdx - 1)}
            disabled={currentChapterIdx === 0}
            className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>Previous Chapter</span>
          </button>

          <span className="text-xs font-mono font-bold opacity-80">
            Chapter {currentChapterIdx + 1} of {chapters.length}
          </span>

          <button
            onClick={() => handlePageTurn(currentChapterIdx + 1)}
            disabled={currentChapterIdx === chapters.length - 1}
            className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Next Chapter</span>
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </footer>
      )}

    </div>
  );
};

const X = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default Reader;
