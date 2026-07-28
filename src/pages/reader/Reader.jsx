import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Settings, Maximize, Minimize, Bookmark, 
  Highlighter, PenTool, BrainCircuit, Volume2, VolumeX, Languages, 
  HelpCircle, Send, Sparkles, LogOut, ArrowLeft, RefreshCw, FileText, 
  BookOpen, Download, List, Trash2, Copy, Check, Palette
} from "lucide-react";
import { dbService } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { toast } from "react-hot-toast";

// Palette of 6 vibrant highlight colors
export const HIGHLIGHT_COLORS = [
  { id: "yellow", name: "Yellow", bg: "bg-yellow-300/80 dark:bg-yellow-400/40 text-slate-900 dark:text-slate-100", dot: "bg-yellow-400", hex: "#FDE047" },
  { id: "green", name: "Green", bg: "bg-emerald-300/80 dark:bg-emerald-400/40 text-slate-900 dark:text-slate-100", dot: "bg-emerald-400", hex: "#86EFAC" },
  { id: "blue", name: "Blue", bg: "bg-sky-300/80 dark:bg-sky-400/40 text-slate-900 dark:text-slate-100", dot: "bg-sky-400", hex: "#7DD3FC" },
  { id: "pink", name: "Pink", bg: "bg-pink-300/80 dark:bg-pink-400/40 text-slate-900 dark:text-slate-100", dot: "bg-pink-400", hex: "#F472B6" },
  { id: "purple", name: "Purple", bg: "bg-purple-300/80 dark:bg-purple-400/40 text-slate-900 dark:text-slate-100", dot: "bg-purple-400", hex: "#C084FC" },
  { id: "orange", name: "Orange", bg: "bg-orange-300/80 dark:bg-orange-400/40 text-slate-900 dark:text-slate-100", dot: "bg-orange-400", hex: "#FDBA74" }
];

// Generates page-by-page content matching PDF View and interactive eBook mode
const generateBookChapters = (bookData) => {
  if (bookData?.chapters && Array.isArray(bookData.chapters) && bookData.chapters.length > 0) {
    return bookData.chapters.map((ch, idx) => ({
      id: ch.id || `ch-${idx + 1}`,
      chapter: ch.chapter || ch.title || `Page ${idx + 1}`,
      content: ch.content || (Array.isArray(ch.paragraphs) ? ch.paragraphs.join("\n\n") : ch.text || ""),
      paragraphs: Array.isArray(ch.paragraphs) ? ch.paragraphs : (ch.content ? ch.content.split("\n\n") : []),
      pageNumber: ch.pageNumber || idx + 1
    }));
  }

  if (bookData?.extractedPages && Array.isArray(bookData.extractedPages) && bookData.extractedPages.length > 0) {
    return bookData.extractedPages.map((pgText, idx) => ({
      id: `page-${idx + 1}`,
      chapter: `Page ${idx + 1}`,
      content: pgText,
      paragraphs: typeof pgText === "string" ? pgText.split("\n\n") : [String(pgText)],
      pageNumber: idx + 1
    }));
  }

  const title = bookData?.title || "eBook";
  const subtitle = bookData?.subtitle || bookData?.aiDescription || "";
  const description = bookData?.description || "Explore core concepts, strategies, and principles.";
  const totalBookPages = bookData?.pages || 24;

  const chaptersList = [];
  const numPages = Math.max(totalBookPages, 4);

  for (let i = 1; i <= numPages; i++) {
    let pTitle = `Page ${i}`;
    let pContent = "";

    if (i === 1) {
      pTitle = `Page 1 — ${title}`;
      pContent = `Welcome to "${title}". ${subtitle ? subtitle + "\n\n" : ""}${description}\n\nThis section establishes the overarching framework and primary objectives of the publication. Select any text on this page to highlight with 6 colors or add notes.`;
    } else if (i === 2) {
      pTitle = `Page 2 — Chapter 1: Foundations`;
      pContent = `In this section of "${title}", we explore baseline principles, system rules, and design methodologies.\n\nMaintaining decoupled structures ensures maximum resilience and scalability under high load.`;
    } else if (i === 3) {
      pTitle = `Page 3 — 1.1 Core Architecture`;
      pContent = `Architectural optimization in "${title}" relies on clear patterns, strict data typing, and micro-metric analysis.\n\nBy establishing predictable execution pipelines, systems remain performant and maintainable.`;
    } else if (i === 4) {
      pTitle = `Page 4 — 1.2 Execution & Strategy`;
      pContent = `Practical execution requires strategic alignment and continuous user feedback. Apply the concepts introduced in "${title}" to build high-performance products.`;
    } else {
      const chapNum = Math.floor((i - 1) / 3) + 1;
      const secNum = ((i - 1) % 3) + 1;
      pTitle = `Page ${i} — Chapter ${chapNum}.${secNum}`;
      pContent = `Continued discussion and analysis for "${title}" (Page ${i} of ${numPages}).\n\nReviewing key domain concepts, advanced patterns, and actionable takeaways for Chapter ${chapNum}.${secNum}.`;
    }

    chaptersList.push({
      id: `ch-${i}`,
      chapter: pTitle,
      content: pContent,
      paragraphs: pContent.split("\n\n"),
      pageNumber: i
    });
  }

  return chaptersList;
};

export const Reader = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("text"); // "text" | "pdf"
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  // Reader Settings
  const [readerTheme, setReaderTheme] = useState("sepia"); // "light" | "dark" | "sepia"
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("sans");
  const [lineHeight, setLineHeight] = useState("relaxed");
  const [marginSize, setMarginSize] = useState("normal");
  
  // Reading States
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Multi-Color Highlights State
  const [highlights, setHighlights] = useState([]); // [{ id, text, colorId, chapter }]
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [selectedText, setSelectedText] = useState("");
  const [showColorPalette, setShowColorPalette] = useState(false);

  // Drawers & Modals
  const [showTocDrawer, setShowTocDrawer] = useState(false);
  const [showHighlightsDrawer, setShowHighlightsDrawer] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // AI Assistant Messages
  const [aiMessages, setAiMessages] = useState([
    { sender: "ai", text: "Hello! I am your AI Reading Tutor. Select any text to highlight or ask for an instant explanation!" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechUtteranceRef = useRef(null);

  // Fetch Book Data
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
        setChapters(generateBookChapters(found));

        const fileUrl = found.pdfURL || found.pdf_url;
        const isCapacitorNative = Boolean(window.Capacitor?.isNativePlatform?.());
        if (!fileUrl || fileUrl.trim() === "" || isCapacitorNative) {
          setViewMode("text");
        } else {
          setViewMode("pdf");
        }

        // Load saved highlights from user profile
        if (user?.readingHighlights?.[found.id]) {
          setHighlights(user.readingHighlights[found.id]);
        }

        // Increment read count
        dbService.updateBook(found.id, { readCount: (found.readCount || 0) + 1 });
      } catch (err) {
        console.error("Reader load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug, user]);

  // Handle PDF Viewport Timeout Error Fallback
  useEffect(() => {
    if (viewMode === "pdf") {
      setPdfLoading(true);
      setPdfError(false);
      const timer = setTimeout(() => {
        if (window.Capacitor?.isNativePlatform?.()) {
          setPdfLoading(false);
          setPdfError(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  // Keyboard Shortcuts
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
          document.exitFullscreen?.();
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentChapterIdx, chapters, isFullscreen]);

  // Handle Text Selection
  const handleTextSelection = () => {
    const sel = window.getSelection().toString();
    if (sel && sel.trim().length > 2) {
      setSelectedText(sel.trim());
      setShowColorPalette(true);
    }
  };

  // Add Multi-Color Highlight
  const addHighlightWithColor = async (colorId) => {
    if (!selectedText) return;

    const newHighlight = {
      id: Date.now(),
      text: selectedText,
      colorId,
      chapter: chapters[currentChapterIdx]?.chapter || "Book Selection",
      createdAt: new Date().toISOString()
    };

    const updated = [newHighlight, ...highlights];
    setHighlights(updated);
    setSelectedText("");
    setShowColorPalette(false);

    toast.success(`Text highlighted in ${colorId.toUpperCase()}! 🖍️`);

    // Sync to user profile in Firestore
    if (user && book) {
      try {
        const userHighlights = user.readingHighlights || {};
        userHighlights[book.id] = updated;
        await updateProfile({ readingHighlights: userHighlights });
      } catch (e) {
        console.warn("Failed to sync highlights:", e);
      }
    }
  };

  // Remove Highlight
  const removeHighlight = async (highlightId) => {
    const updated = highlights.filter(h => h.id !== highlightId);
    setHighlights(updated);
    toast.success("Highlight removed.");

    if (user && book) {
      try {
        const userHighlights = user.readingHighlights || {};
        userHighlights[book.id] = updated;
        await updateProfile({ readingHighlights: userHighlights });
      } catch (e) {
        console.warn("Failed to sync highlights update:", e);
      }
    }
  };

  // Turn Page / Chapter Change
  const handlePageTurn = async (newIdx) => {
    if (newIdx < 0 || newIdx >= chapters.length) return;
    setCurrentChapterIdx(newIdx);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    if (user && book) {
      const updatedProgress = { ...(user.readingProgress || {}) };
      updatedProgress[book.id] = {
        currentPage: newIdx + 1,
        totalPages: chapters.length,
        lastRead: new Date().toISOString()
      };
      try {
        await dbService.saveReadingProgress(user.uid, book.id, progData);
        const userProgress = user.readingProgress || {};
        userProgress[book.id] = progData;
        await updateProfile({ readingProgress: userProgress });
      } catch (err) {
        console.warn("Failed to sync reading progress:", err);
      }
    }
  };

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

  // Text to Speech Toggle
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const currentCh = chapters[currentChapterIdx];
      const fullText = currentCh ? currentCh.paragraphs.join(" ") : book?.description || "";
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.onend = () => setIsSpeaking(false);
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.success("Reading chapter aloud... 🔊");
    }
  };

  // AI Assistant Chat
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
        reply = `✨ AI Summary: In ${chapters[currentChapterIdx]?.chapter || "this section"}, the author explores baseline design rules, cognitive load reduction, and dynamic visual alignment.`;
      } else {
        reply = `I've analyzed your prompt for "${book?.title}". The text emphasizes optimizing loading speeds, scaling micro-interactions, and prioritizing reader clarity.`;
      }
      setAiMessages(prev => [...prev, { sender: "ai", text: reply }]);
      setAiLoading(false);
    }, 1000);
  };

  const handleAiExplainHighlight = () => {
    if (!selectedText) return;
    setShowAiPanel(true);
    setAiMessages(prev => [...prev, { sender: "user", text: `Explain this selection: "${selectedText}"` }]);
    setAiLoading(true);

    setTimeout(() => {
      const reply = `✨ AI Explanation: "${selectedText}" highlights how consistent design tokens and typography reduce reader fatigue.`;
      setAiMessages(prev => [...prev, { sender: "ai", text: reply }]);
      setAiLoading(false);
      setSelectedText("");
      setShowColorPalette(false);
    }, 1000);
  };

  const handleDownloadBook = async () => {
    if (!book) return;
    const pdfUrl = book.pdfURL || book.pdf_url;
    if (!pdfUrl) {
      toast.error("No PDF document available for download.");
      return;
    }
    await dbService.incrementBookDownloads(book.id);
    toast.success("Starting download...");
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", `${book.title}.pdf`);
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !book) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center select-none text-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-accent animate-spin" />
          <p className="text-xs font-bold text-brand-text-secondary">Opening reader workspace...</p>
        </div>
      </div>
    );
  }

  // Reader Background Styling Themes
  const bgStyles = {
    light: "bg-white text-slate-900 border-slate-200",
    dark: "bg-[#0F172A] text-slate-100 border-slate-800",
    sepia: "bg-[#FBF0D9] text-[#433422] border-[#EADCC2]"
  };

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
    <div className={`min-h-screen flex flex-col justify-between transition-all duration-300 ${bgStyles[readerTheme]} select-text`}>
      
      {/* Top Header Control Bar */}
      <header className="h-16 border-b border-inherit px-4 sm:px-6 flex items-center justify-between select-none backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h4 className="text-xs font-bold truncate max-w-[150px] sm:max-w-sm font-display">{book.title}</h4>
            <p className="text-[10px] opacity-75 font-semibold mt-0.5">{chapters[currentChapterIdx]?.chapter}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          {/* Table of Contents Drawer Trigger */}
          <button
            onClick={() => setShowTocDrawer(!showTocDrawer)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Table of Contents"
          >
            <List className="h-4.5 w-4.5" />
          </button>

          {/* Highlights & Notes Drawer Trigger */}
          <button
            onClick={() => setShowHighlightsDrawer(!showHighlightsDrawer)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer relative"
            title="Saved Highlights & Notes"
          >
            <Highlighter className="h-4.5 w-4.5 text-amber-500" />
            {highlights.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-brand-accent text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                {highlights.length}
              </span>
            )}
          </button>

          {/* Audio Narration TTS */}
          <button
            onClick={toggleSpeech}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isSpeaking ? "bg-amber-500/20 text-amber-500 animate-pulse" : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            title={isSpeaking ? "Stop Narration" : "Read Aloud"}
          >
            {isSpeaking ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
          </button>

          {/* AI Tutor Toggle */}
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              showAiPanel ? "bg-brand-accent/20 text-brand-accent" : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            title="AI Reading Tutor"
          >
            <BrainCircuit className="h-4.5 w-4.5" />
          </button>

          {/* Reader Configs Dropdown */}
          {viewMode === "text" && (
            <div className="relative">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Reader Typography & Theme Settings"
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
                      className="absolute right-0 mt-2.5 w-64 z-50 bg-brand-card border border-brand-border rounded-2xl shadow-brand-hover p-4 text-brand-text flex flex-col gap-4 text-left"
                    >
                      <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider font-mono">Reader Configurations</p>
                      
                      {/* Theme Selector */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold">Background Theme</span>
                        <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold">
                          {["light", "sepia", "dark"].map((t) => (
                            <button
                              key={t}
                              onClick={() => setReaderTheme(t)}
                              className={`py-1.5 rounded-xl border capitalize cursor-pointer ${
                                readerTheme === t 
                                  ? "border-brand-accent bg-brand-accent/15 text-brand-accent font-bold" 
                                  : "border-brand-border hover:bg-brand-bg-secondary"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Selector */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold">Typography Font</span>
                        <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold">
                          {["sans", "serif", "mono"].map((f) => (
                            <button
                              key={f}
                              onClick={() => setFontFamily(f)}
                              className={`py-1.5 rounded-xl border capitalize cursor-pointer ${
                                fontFamily === f 
                                  ? "border-brand-accent bg-brand-accent/15 text-brand-accent font-bold" 
                                  : "border-brand-border hover:bg-brand-bg-secondary"
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Size Selector */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold">Font Size</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                            className="w-7 h-7 rounded-lg border border-brand-border flex items-center justify-center font-bold text-xs hover:bg-brand-bg-secondary cursor-pointer"
                          >
                            A-
                          </button>
                          <span className="text-xs font-mono font-bold">{fontSize}px</span>
                          <button 
                            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                            className="w-7 h-7 rounded-lg border border-brand-border flex items-center justify-center font-bold text-xs hover:bg-brand-bg-secondary cursor-pointer"
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

          {/* Download Button */}
          {book && (book.pdfURL || book.pdf_url) && (
            <button
              onClick={handleDownloadBook}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-accent/10 hover:bg-brand-accent/25 border border-brand-accent/20 text-brand-accent transition-all cursor-pointer flex items-center gap-1.5"
              title="Download PDF File"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Fullscreen Toggle"
          >
            <Maximize className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main className="flex-grow flex relative items-stretch">
        
        {/* Multi-Color Floating Highlighter Toolbar */}
        <AnimatePresence>
          {selectedText && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-brand-card/95 backdrop-blur-lg border border-brand-border/80 rounded-full p-2 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex items-center gap-2 select-none"
            >
              <div className="flex items-center gap-1.5 px-2 border-r border-brand-border">
                <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase">Highlight:</span>
                {HIGHLIGHT_COLORS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => addHighlightWithColor(col.id)}
                    className={`h-6 w-6 rounded-full ${col.dot} border-2 border-white/40 hover:scale-125 transition-transform cursor-pointer shadow-sm`}
                    title={`Highlight in ${col.name}`}
                  />
                ))}
              </div>

              <button
                onClick={handleAiExplainHighlight}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-brand-accent text-white hover:opacity-90 flex items-center gap-1 cursor-pointer"
              >
                <BrainCircuit className="h-3.5 w-3.5" /> AI Explain
              </button>

              <button
                onClick={() => setSelectedText("")}
                className="p-1 rounded-full text-brand-text-secondary hover:bg-brand-bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF / eBook Text Viewport */}
        {viewMode === "pdf" ? (
          (() => {
            const rawPdfUrl = book?.pdfURL || book?.pdf_url;
            const isPdfValid = rawPdfUrl && rawPdfUrl.trim() !== "";
            
            if (!isPdfValid || pdfError) {
              return (
                <div className="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 bg-brand-bg-secondary text-brand-text select-none text-center animate-fade-in w-full">
                  <div className="max-w-md w-full p-8 rounded-[28px] border border-brand-border bg-brand-card shadow-brand flex flex-col items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-brand-accent/10 border border-brand-accent/25 text-brand-accent flex items-center justify-center shadow-sm">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-display font-black text-brand-text">
                      {!isPdfValid ? "No PDF File Uploaded" : "PDF Preview Unavailable"}
                    </h3>
                    <p className="text-xs text-brand-text-secondary leading-relaxed max-w-xs">
                      Switch to Text Reader mode to read formatted text with AI tutor and multi-color highlighters!
                    </p>
                    <Button 
                      onClick={() => setViewMode("text")} 
                      variant="primary" 
                      className="w-full rounded-full text-xs font-bold h-10 shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Switch to Text Reader
                    </Button>
                  </div>
                </div>
              );
            }

            let fullPdfUrl = rawPdfUrl;
            if (rawPdfUrl.startsWith("/")) {
              fullPdfUrl = window.location.origin + rawPdfUrl;
            }
            
            const pdfPageHash = `#page=${currentChapterIdx + 1}`;
            let iframeSrc = fullPdfUrl;
            if ((fullPdfUrl.startsWith("http://") || fullPdfUrl.startsWith("https://")) && !fullPdfUrl.includes(window.location.hostname)) {
              iframeSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(fullPdfUrl)}&embedded=true${pdfPageHash}`;
            } else {
              iframeSrc = `${fullPdfUrl}${pdfPageHash}`;
            }

            return (
              <div className="flex-grow relative bg-brand-bg-secondary flex flex-col items-stretch justify-center overflow-hidden w-full">
                {pdfLoading && (
                  <div className="absolute inset-0 z-10 bg-brand-card/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-brand-text select-none">
                    <RefreshCw className="h-7 w-7 text-brand-accent animate-spin" />
                    <p className="text-xs font-bold text-brand-text-secondary">Loading PDF document...</p>
                  </div>
                )}
                <iframe 
                  key={`pdf-frame-page-${currentChapterIdx + 1}`}
                  src={iframeSrc} 
                  className="w-full h-full flex-grow border-none" 
                  title={book.title}
                  style={{ minHeight: "calc(100vh - 128px)" }}
                  onLoad={() => setPdfLoading(false)}
                  onError={() => {
                    setPdfLoading(false);
                    setPdfError(true);
                  }}
                />
              </div>
            );
          })()
        ) : (
          /* Interactive eBook Mode Text Viewport */
          <div 
            className="flex-grow overflow-y-auto py-10 sm:py-14 flex justify-center w-full min-h-[calc(100vh-128px)]"
            onMouseUp={handleTextSelection}
          >
            <div className={`${margins[marginSize]} w-full flex flex-col gap-6 text-left`}>
              
              {/* Chapter Header */}
              <div className="border-b border-inherit pb-4 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60">
                  Chapter {currentChapterIdx + 1} of {chapters.length}
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight mt-1">
                  {chapters[currentChapterIdx]?.chapter}
                </h2>
              </div>
              
              {/* Paragraph Content */}
              <div className={`flex flex-col gap-6 ${fontFamilies[fontFamily]} ${lineHeights[lineHeight]}`} style={{ fontSize: `${fontSize}px` }}>
                {(() => {
                  const currentCh = chapters[currentChapterIdx];
                  const paras = currentCh?.paragraphs && currentCh.paragraphs.length > 0
                    ? currentCh.paragraphs
                    : (currentCh?.content ? currentCh.content.split("\n\n") : []);

                  return paras.map((pText, pIdx) => (
                    <p key={pIdx} className="indent-4 text-justify font-medium opacity-95 relative leading-relaxed">
                      {pText}
                    </p>
                  ));
                })()}
              </div>

              {/* Render Saved Highlights in this chapter */}
              {highlights.length > 0 && (
                <div className="mt-8 pt-6 border-t border-inherit">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider mb-3 opacity-70 flex items-center gap-1.5">
                    <Highlighter className="h-3.5 w-3.5 text-amber-500" /> Color Highlights in Chapter
                  </h4>
                  <div className="space-y-2">
                    {highlights.map((h) => {
                      const colorObj = HIGHLIGHT_COLORS.find(c => c.id === h.colorId) || HIGHLIGHT_COLORS[0];
                      return (
                        <div key={h.id} className={`p-3 rounded-xl ${colorObj.bg} text-xs font-medium flex items-start justify-between gap-3 shadow-sm`}>
                          <span>"{h.text}"</span>
                          <button onClick={() => removeHighlight(h.id)} className="text-slate-700 hover:text-red-600 font-bold shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table of Contents Drawer */}
        <AnimatePresence>
          {showTocDrawer && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed left-0 top-16 bottom-16 w-72 bg-brand-card border-r border-brand-border shadow-brand-hover z-40 flex flex-col justify-between text-left p-4 select-none"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-3">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-brand-text">Table of Contents</h4>
                  <button onClick={() => setShowTocDrawer(false)} className="text-brand-text-secondary hover:text-brand-text">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {chapters.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        handlePageTurn(idx);
                        setShowTocDrawer(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        currentChapterIdx === idx
                          ? "bg-brand-accent text-white font-bold"
                          : "text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg-secondary"
                      }`}
                    >
                      {ch.chapter}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Highlights & Notes Drawer */}
        <AnimatePresence>
          {showHighlightsDrawer && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-16 bottom-16 w-80 bg-brand-card border-l border-brand-border shadow-brand-hover z-40 flex flex-col justify-between text-left p-4 select-none"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-3">
                  <div className="flex items-center gap-2">
                    <Highlighter className="h-4 w-4 text-amber-500" />
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-brand-text">Saved Color Highlights ({highlights.length})</h4>
                  </div>
                  <button onClick={() => setShowHighlightsDrawer(false)} className="text-brand-text-secondary hover:text-brand-text">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {highlights.length === 0 ? (
                  <p className="text-xs text-brand-text-secondary text-center py-8">No text highlighted yet. Select any text in eBook Mode to highlight with 6 colors!</p>
                ) : (
                  <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
                    {highlights.map((h) => {
                      const colorObj = HIGHLIGHT_COLORS.find(c => c.id === h.colorId) || HIGHLIGHT_COLORS[0];
                      return (
                        <div key={h.id} className={`p-3 rounded-xl ${colorObj.bg} text-xs font-medium relative group shadow-sm`}>
                          <p className="pr-6">"{h.text}"</p>
                          <span className="text-[9px] opacity-75 block mt-1 font-mono">{h.chapter}</span>
                          <button
                            onClick={() => removeHighlight(h.id)}
                            className="absolute top-2 right-2 p-1 text-slate-700 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Tutor Chat Drawer */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-80 border-l border-inherit bg-brand-card flex flex-col justify-between shadow-brand-hover relative z-35"
            >
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

      {/* Bottom Progress Navigation bar (rendered in both PDF and eBook text modes for page position parity) */}
      <footer className="h-16 border-t border-inherit px-6 flex items-center justify-between select-none backdrop-blur-md sticky bottom-0 z-30">
        <button
          onClick={() => handlePageTurn(currentChapterIdx - 1)}
          disabled={currentChapterIdx === 0}
          className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Previous Page</span>
        </button>

        <span className="text-xs font-mono font-bold opacity-80">
          Page {currentChapterIdx + 1} of {chapters.length}
        </span>

        <button
          onClick={() => handlePageTurn(currentChapterIdx + 1)}
          disabled={currentChapterIdx >= chapters.length - 1}
          className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Next Page</span>
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </footer>

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
