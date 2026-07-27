import React from "react";
import { Trophy, Award, Star, Flame, Users, CheckCircle2, Lock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ProgressBar } from "../../../components/ui/ProgressBar";

export const AchievementsCenter = ({ user, books = [], followers = [], reviews = [] }) => {
  // Compute metrics
  const totalPublished = books.filter(b => b.status === "published").length;
  const totalSales = books.reduce((sum, b) => sum + (b.salesCount || 0), 0);
  const totalDownloads = books.reduce((sum, b) => sum + (b.downloadCount || 0), 0);
  const totalViews = books.reduce((sum, b) => sum + (b.viewCount || 0), 0);
  const totalReviewsCount = reviews.length;
  const avgRating = books.length > 0 ? (books.reduce((s, b) => s + (b.rating || 4.5), 0) / books.length).toFixed(1) : 4.8;

  // Author XP Formula
  const xp = totalPublished * 100 + totalSales * 20 + totalDownloads * 5 + totalReviewsCount * 15;
  const level = Math.floor(xp / 500) + 1;
  const xpForNextLevel = level * 500;
  const currentLevelXp = xp % 500;

  const BADGES = [
    {
      id: "first_publish",
      title: "Debut Author",
      description: "Publish your 1st eBook on EbookVala",
      icon: BookOpenIcon,
      unlocked: totalPublished >= 1,
      progress: Math.min(100, (totalPublished / 1) * 100)
    },
    {
      id: "prolific_writer",
      title: "Prolific Creator",
      description: "Publish 5 or more eBooks",
      icon: Trophy,
      unlocked: totalPublished >= 5,
      progress: Math.min(100, (totalPublished / 5) * 100)
    },
    {
      id: "bestseller_100",
      title: "Century Sales",
      description: "Achieve 100 total book sales",
      icon: Flame,
      unlocked: totalSales >= 100,
      progress: Math.min(100, (totalSales / 100) * 100)
    },
    {
      id: "readers_1000",
      title: "1,000 Readers Milestone",
      description: "Reach 1,000 total book downloads",
      icon: Users,
      unlocked: totalDownloads >= 1000,
      progress: Math.min(100, (totalDownloads / 1000) * 100)
    },
    {
      id: "top_rated",
      title: "5-Star Excellence",
      description: "Maintain an average book rating above 4.5",
      icon: Star,
      unlocked: Number(avgRating) >= 4.5 && totalReviewsCount >= 5,
      progress: Math.min(100, (Number(avgRating) / 5) * 100)
    },
    {
      id: "verified_author",
      title: "Verified Pro Creator",
      description: "Earn verified creator status badge",
      icon: Award,
      unlocked: user?.isVerified || false,
      progress: user?.isVerified ? 100 : 50
    }
  ];

  return (
    <div className="space-y-8">
      {/* Level & XP Header */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-900 font-display font-black text-2xl">
              L{level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-black text-brand-text">Level {level} Author</h2>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {xp} XP Earned
                </span>
              </div>
              <p className="text-xs text-brand-text-secondary mt-1">
                Keep publishing, gaining readers, and earning 5-star reviews to level up!
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-brand-text-secondary">Level Progress</span>
              <span className="text-amber-400">{currentLevelXp} / 500 XP</span>
            </div>
            <ProgressBar value={(currentLevelXp / 500) * 100} color="amber" />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-display font-black text-brand-text flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          Author Milestones & Badges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`bg-[#161618] border rounded-2xl p-5 relative overflow-hidden transition-all ${
                  b.unlocked 
                    ? "border-amber-500/40 shadow-md shadow-amber-500/5" 
                    : "border-brand-border/40 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${b.unlocked ? "bg-amber-500/15 text-amber-400" : "bg-[#222226] text-brand-text-secondary"}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {b.unlocked ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-brand-text-secondary bg-[#222226] px-2 py-0.5 rounded border border-brand-border/40 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Locked
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <h4 className="text-sm font-bold text-brand-text">{b.title}</h4>
                  <p className="text-xs text-brand-text-secondary leading-relaxed">{b.description}</p>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-brand-text-secondary">
                    <span>Progress</span>
                    <span>{Math.round(b.progress)}%</span>
                  </div>
                  <ProgressBar value={b.progress} color={b.unlocked ? "amber" : "blue"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const BookOpenIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);
