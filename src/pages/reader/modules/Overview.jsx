import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, BookOpen, Clock, Layers, Flame, Play, Calendar } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export const Overview = ({ user, books = [] }) => {
  const navigate = useNavigate();

  // Find purchased books
  const purchasedBookIds = user?.purchasedBooks || [];
  const myBooks = books.filter(b => purchasedBookIds.includes(b.id));

  // Determine active book (continue reading) from reading progress
  const progressMap = user?.readingProgress || {};
  let activeBook = null;
  let activeProgress = null;

  // Find the most recently read book
  let latestReadTime = 0;
  myBooks.forEach(b => {
    const prog = progressMap[b.id];
    if (prog && prog.lastRead) {
      const time = new Date(prog.lastRead).getTime();
      if (time > latestReadTime) {
        latestReadTime = time;
        activeBook = b;
        activeProgress = prog;
      }
    }
  });

  // Fallback active book if progress is empty but reader has books
  if (!activeBook && myBooks.length > 0) {
    activeBook = myBooks[0];
    activeProgress = { currentPage: 1, totalPages: 100, lastRead: new Date().toISOString() };
  }

  // Derive stats
  const completedBooksCount = myBooks.filter(b => {
    const p = progressMap[b.id];
    return p && p.currentPage >= p.totalPages;
  }).length;

  const totalPagesRead = Object.values(progressMap).reduce((sum, p) => sum + (p.currentPage || 0), 0);
  const totalHoursRead = (totalPagesRead * 2.5 / 60).toFixed(1); // Mins per page = 2.5

  // Calculate real active streak from reading progress timestamps
  const calculateStreak = () => {
    const readDates = Object.values(progressMap)
      .map(p => p.lastRead ? p.lastRead.split("T")[0] : null)
      .filter(Boolean);
    
    if (readDates.length === 0) return 0;
    
    // Sort unique dates descending
    const uniqueDates = [...new Set(readDates)].sort((a, b) => new Date(b) - new Date(a));
    
    let currentStreak = 0;
    let today = new Date();
    today.setHours(0,0,0,0);
    
    let expectedDate = new Date(today);
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = uniqueDates[i];
      const d = new Date(dateStr);
      d.setHours(0,0,0,0);
      
      const diffTime = expectedDate - d;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (diffDays === 1) {
        currentStreak++;
        expectedDate = d;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak || 1;
  };

  const streak = calculateStreak();
  const streakGoal = 10;
  const streakPercent = Math.min(100, (streak / streakGoal) * 100);

  // Heatmap: Map real dates read
  const getHeatmapData = () => {
    const today = new Date();
    const dates = [];
    const readDates = Object.values(progressMap)
      .map(p => p.lastRead ? p.lastRead.split("T")[0] : null)
      .filter(Boolean);
    const readSet = new Set(readDates);

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const hasRead = readSet.has(dateStr);
      dates.push({
        date: dateStr,
        level: hasRead ? 3 : 0
      });
    }
    return dates;
  };

  const heatmap = getHeatmapData();

  const quote = "The more that you read, the more things you will know. The more that you learn, the more places you'll go. — Dr. Seuss";

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* 1. COMPACT HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-accent/15 via-brand-accent/5 to-transparent border border-brand-border/60 rounded-[24px] p-6 flex flex-col justify-between h-[160px] shadow-brand">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/8 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16"></div>
        
        <div className="flex justify-between items-start z-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text tracking-tight flex items-center gap-2">
              Good morning, {user?.displayName || user?.name || "Reader"}
            </h1>
            <p className="text-[11px] text-brand-text-secondary mt-1 max-w-lg italic font-medium">
              "{quote}"
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/25 px-3 py-1 rounded-full shadow-sm">
            <Flame className="h-4.5 w-4.5 text-brand-accent fill-brand-accent animate-pulse" />
            <span className="text-[11px] font-bold font-mono text-brand-accent">{streak} Days Streak</span>
          </div>
        </div>

        {/* Goal Indicator */}
        <div className="z-10 mt-auto">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider mb-1.5">
            <span>Monthly Reading Goal</span>
            <span>{streak}/{streakGoal} days completed</span>
          </div>
          <div className="h-2 w-full bg-brand-border/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${streakPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-brand-accent to-brand-accent/70 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Continue Reading Card */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border/70 rounded-[24px] p-6 shadow-brand flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="flex justify-between items-start border-b border-brand-border/45 pb-3">
            <div>
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Continue Reading</h3>
              <p className="text-[10px] text-brand-text-secondary mt-0.5 font-semibold">Pick up right where you left off.</p>
            </div>
            {activeProgress?.lastRead && (
              <span className="text-[9px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider">
                Last read: {new Date(activeProgress.lastRead).toLocaleDateString()}
              </span>
            )}
          </div>

          {activeBook ? (
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-stretch flex-grow">
              <div className="h-32 w-22 bg-[#161616] border border-brand-border/60 rounded-[10px] overflow-hidden shrink-0 shadow-brand hover:scale-102 transition-transform duration-300">
                <img src={activeBook.coverURL} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-between flex-grow text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-black text-brand-text leading-tight">{activeBook.title}</h4>
                  <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">by {activeBook.authorName || "Unknown Author"}</p>
                </div>
                
                {/* Progress bar */}
                <div className="my-3 sm:my-0">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-brand-text-secondary mb-1.5">
                    <span>Progress: {Math.round((activeProgress.currentPage / (activeProgress.totalPages || 100)) * 100)}%</span>
                    <span>Page {activeProgress.currentPage} of {activeProgress.totalPages || 100}</span>
                  </div>
                  <div className="h-1.5 w-full bg-brand-border/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-accent rounded-full" 
                      style={{ width: `${Math.min(100, (activeProgress.currentPage / (activeProgress.totalPages || 100)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto">
                  <span className="text-[10px] text-brand-text-secondary font-semibold font-mono">
                    Estimated remaining: {Math.max(1, Math.round(((activeProgress.totalPages || 100) - activeProgress.currentPage) * 2))} mins
                  </span>
                  <Button 
                    onClick={() => navigate(`/read/${activeBook.slug || activeBook.id}`)}
                    className="rounded-full text-[11px] font-bold h-9 px-4.5 bg-brand-accent hover:scale-[1.02] shadow-sm flex items-center gap-1.5 select-none shrink-0 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Resume Reading
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <BookOpen className="h-8 w-8 text-brand-text-secondary opacity-65 mb-2" />
              <p className="text-xs font-bold text-brand-text">No active books</p>
              <p className="text-[10px] text-brand-text-secondary mt-1">Visit the marketplace to find your next read.</p>
              <Button onClick={() => navigate("/marketplace")} variant="outline" className="mt-4 rounded-full text-[10px] font-bold h-8.5 px-4 cursor-pointer">
                Explore Marketplace
              </Button>
            </div>
          )}
        </div>

        {/* Dynamic Glass Stats Card */}
        <div className="bg-brand-card/40 backdrop-blur-md border border-brand-border/60 rounded-[24px] p-6 shadow-brand text-left flex flex-col justify-between gap-4">
          <div className="border-b border-brand-border/45 pb-2">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Quick Metrics</h3>
          </div>
          
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3 bg-brand-bg-secondary/40 border border-brand-border/40 p-3 rounded-[16px] hover:border-brand-accent/20 transition-all duration-300">
              <div className="p-2 rounded-[10px] border border-emerald-500/25 bg-emerald-500/10 text-emerald-500 shrink-0">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider leading-none">Books Completed</p>
                <p className="text-lg font-mono font-black text-brand-text mt-1">{completedBooksCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-brand-bg-secondary/40 border border-brand-border/40 p-3 rounded-[16px] hover:border-brand-accent/20 transition-all duration-300">
              <div className="p-2 rounded-[10px] border border-indigo-500/25 bg-indigo-500/10 text-indigo-500 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider leading-none">Total Hours Read</p>
                <p className="text-lg font-mono font-black text-brand-text mt-1">{totalHoursRead} hrs</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-brand-bg-secondary/40 border border-brand-border/40 p-3 rounded-[16px] hover:border-brand-accent/20 transition-all duration-300">
              <div className="p-2 rounded-[10px] border border-rose-500/25 bg-rose-500/10 text-rose-500 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider leading-none">Total Pages Read</p>
                <p className="text-lg font-mono font-black text-brand-text mt-1">{totalPagesRead.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. READING HEATMAP / CALENDAR SECTION */}
      <div className="bg-brand-card border border-brand-border/70 rounded-[24px] p-6 shadow-brand text-left">
        <div className="flex justify-between items-center border-b border-brand-border/45 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Reading History</h3>
            <p className="text-[10px] text-brand-text-secondary mt-0.5 font-semibold">Your daily active reading consistency heatmap.</p>
          </div>
          <Calendar className="h-4 w-4 text-brand-text-secondary opacity-60" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-1.5 overflow-x-auto py-2 pr-1 no-scrollbar">
            {heatmap.map((item, i) => {
              const levelColors = [
                "bg-brand-border/30 border border-transparent",
                "bg-brand-accent/10 border border-brand-accent/15",
                "bg-brand-accent/30 border border-brand-accent/25",
                "bg-brand-accent/60 border border-brand-accent/40"
              ];
              return (
                <div 
                  key={i} 
                  title={`Date: ${item.date} - ${item.level === 3 ? 'Read' : 'No activity logged'}`}
                  className={`h-5.5 w-5.5 rounded-[5px] shrink-0 cursor-pointer hover:scale-110 duration-200 transition-transform ${levelColors[item.level]}`}
                />
              );
            })}
          </div>
          <div className="flex justify-end items-center gap-2 text-[8px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest">
            <span>No Activity</span>
            <div className="h-3.5 w-3.5 rounded bg-brand-border/30" />
            <div className="h-3.5 w-3.5 rounded bg-brand-accent/60" />
            <span>Read Books</span>
          </div>
        </div>
      </div>

    </div>
  );
};
