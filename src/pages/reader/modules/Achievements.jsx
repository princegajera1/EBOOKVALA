import React from "react";
import { motion } from "framer-motion";
import { Award, Flame, BookOpen, Clock, Moon, Trophy, Star } from "lucide-react";

export const Achievements = ({ user, books = [] }) => {
  const purchasedBookIds = user?.purchasedBooks || [];
  const progressMap = user?.readingProgress || {};

  // Calculate real stats
  const completedCount = books.filter(b => {
    const p = progressMap[b.id];
    return purchasedBookIds.includes(b.id) && p && p.currentPage >= p.totalPages;
  }).length;

  const totalPagesRead = Object.values(progressMap).reduce((sum, p) => sum + (p.currentPage || 0), 0);
  const totalHoursRead = parseFloat((totalPagesRead * 2.5 / 60).toFixed(1));

  // Streak algorithm
  const calculateStreak = () => {
    const readDates = Object.values(progressMap)
      .map(p => p.lastRead ? p.lastRead.split("T")[0] : null)
      .filter(Boolean);
    if (readDates.length === 0) return 0;
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

  // Night reader evaluation (if lastRead hour is >= 22 or <= 4)
  const hasNightRead = Object.values(progressMap).some(p => {
    if (!p.lastRead) return false;
    const hour = new Date(p.lastRead).getHours();
    return hour >= 22 || hour <= 4;
  });

  const badges = [
    { 
      id: "streak", 
      title: "Consistence Flame", 
      desc: "Reach a 5-day active reading streak.", 
      icon: Flame, 
      color: "text-amber-500 bg-amber-500/10 border-amber-500/25",
      unlocked: streak >= 5,
      progress: Math.min(100, Math.round((streak / 5) * 100))
    },
    { 
      id: "first_book", 
      title: "First Inception", 
      desc: "Add and start your very first eBook.", 
      icon: BookOpen, 
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/25",
      unlocked: purchasedBookIds.length >= 1,
      progress: purchasedBookIds.length >= 1 ? 100 : 0
    },
    { 
      id: "night_owl", 
      title: "Night Owl Reader", 
      desc: "Read for 30+ minutes past midnight.", 
      icon: Moon, 
      color: "text-purple-500 bg-purple-500/10 border-purple-500/25",
      unlocked: hasNightRead,
      progress: hasNightRead ? 100 : 0
    },
    { 
      id: "book_lover", 
      title: "Elite Book Lover", 
      desc: "Add 10 or more books to your collection.", 
      icon: Trophy, 
      color: "text-rose-500 bg-rose-500/10 border-rose-500/25",
      unlocked: purchasedBookIds.length >= 10,
      progress: Math.min(100, Math.round((purchasedBookIds.length / 10) * 100))
    },
    { 
      id: "critic", 
      title: "Literary Critic", 
      desc: "Post a rating and review for any book.", 
      icon: Star, 
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/25",
      unlocked: completedCount >= 1, // Unlock if they finished at least one
      progress: completedCount >= 1 ? 100 : 0
    },
    { 
      id: "scholar", 
      title: "Knowledge Master", 
      desc: "Spend a total of 50+ hours reading.", 
      icon: Clock, 
      color: "text-blue-500 bg-blue-500/10 border-blue-500/25",
      unlocked: totalHoursRead >= 50,
      progress: Math.min(100, Math.round((totalHoursRead / 50) * 100))
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* Header with summary card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-brand-accent/15 via-brand-accent/5 to-transparent border border-brand-border/60 rounded-[24px] p-6 shadow-brand text-left">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text">Reading Achievements</h1>
          <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">
            Track your milestones and unlock premium reading badges.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-brand-card border border-brand-border/80 p-3 rounded-[16px] shadow-sm font-mono shrink-0">
          <Award className="h-5 w-5 text-brand-accent animate-pulse" />
          <div>
            <p className="text-[8px] font-bold text-brand-text-secondary uppercase tracking-widest leading-none">Completed</p>
            <p className="text-sm font-black text-brand-text mt-1">{unlockedCount}/{badges.length} Unlocked</p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => {
          const IconComponent = badge.icon;
          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`relative overflow-hidden bg-brand-card border rounded-[22px] p-5 shadow-brand text-left flex flex-col justify-between gap-4 transition-all duration-300 ${
                badge.unlocked 
                  ? "border-brand-border/60 hover:border-brand-accent/30" 
                  : "border-brand-border/40 opacity-50"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xs font-bold text-brand-text flex items-center gap-1.5 leading-snug">
                    {badge.title}
                  </h3>
                  <p className="text-[10px] text-brand-text-secondary mt-1 font-semibold leading-relaxed">{badge.desc}</p>
                </div>
                <div className={`p-2.5 rounded-[12px] border shrink-0 ${badge.color} transition-transform duration-300`}>
                  <IconComponent className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[8px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider mb-1.5">
                  <span>{badge.unlocked ? "Unlocked" : "In Progress"}</span>
                  <span>{badge.progress}%</span>
                </div>
                <div className="h-1 w-full bg-brand-border/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${badge.unlocked ? 'bg-brand-accent' : 'bg-brand-text-secondary/55'}`}
                    style={{ width: `${badge.progress}%` }} 
                  />
                </div>
              </div>

              {/* Glowing unlock banner */}
              {badge.unlocked && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-accent/25 to-transparent"></div>
              )}
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
