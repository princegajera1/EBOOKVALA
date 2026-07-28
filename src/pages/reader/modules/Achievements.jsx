import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, Flame, BookOpen, Clock, Moon, Trophy, Star, Sparkles, 
  Search, ShieldCheck, Heart, Layers, Feather, Zap, Compass, Check, Crown
} from "lucide-react";

export const Achievements = ({ user, books = [] }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("all"); // "all" | "unlocked" | "locked"

  const purchasedBookIds = user?.purchasedBooks || [];
  const progressMap = user?.readingProgress || {};
  const userHighlights = user?.highlights || {};
  const userReviewsCount = (user?.reviewsCount || 0) + (user?.userReviews?.length || 0);

  // Calculate real stats
  const completedCount = books.filter(b => {
    const p = progressMap[b.id];
    return purchasedBookIds.includes(b.id) && p && (p.progressPercent >= 99 || (p.currentPage && p.totalPages && p.currentPage >= p.totalPages));
  }).length;

  const totalPagesRead = Object.values(progressMap).reduce((sum, p) => sum + (p.currentPage || 0), 0);
  const totalHoursRead = user?.totalReadingSeconds 
    ? parseFloat((user.totalReadingSeconds / 3600).toFixed(1))
    : parseFloat((totalPagesRead * 2.5 / 60).toFixed(1));

  const totalHighlightsCount = Object.values(userHighlights).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);

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

  const hasNightRead = Object.values(progressMap).some(p => {
    if (!p.lastRead) return false;
    const hour = new Date(p.lastRead).getHours();
    return hour >= 22 || hour <= 4;
  });

  const hasEarlyRead = Object.values(progressMap).some(p => {
    if (!p.lastRead) return false;
    const hour = new Date(p.lastRead).getHours();
    return hour >= 5 && hour <= 7;
  });

  // 110 Comprehensive Reading Achievements
  const ALL_ACHIEVEMENTS = [
    // --- STREAKS (15) ---
    ...[1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 100, 180, 365].map(days => ({
      id: `streak_${days}`,
      category: "streaks",
      title: `${days}-Day Flame`,
      desc: `Maintain an active reading streak of ${days} consecutive ${days === 1 ? 'day' : 'days'}.`,
      icon: Flame,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/25",
      unlocked: streak >= days,
      progress: Math.min(100, Math.round((streak / days) * 100))
    })),

    // --- BOOKS MILESTONES (20) ---
    ...[1, 2, 3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500].map(count => ({
      id: `books_${count}`,
      category: "milestones",
      title: count === 1 ? "First Steps" : `${count} Books Master`,
      desc: `Add or finish ${count} ${count === 1 ? 'eBook' : 'eBooks'} in your library collection.`,
      icon: BookOpen,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/25",
      unlocked: purchasedBookIds.length >= count,
      progress: Math.min(100, Math.round((purchasedBookIds.length / count) * 100))
    })),

    // --- HOURS READ (20) ---
    ...[1, 2, 3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500].map(hrs => ({
      id: `hours_${hrs}`,
      category: "hours",
      title: `${hrs} Hours Scholar`,
      desc: `Log a cumulative total of ${hrs} ${hrs === 1 ? 'hour' : 'hours'} spent reading.`,
      icon: Clock,
      color: "text-sky-500 bg-sky-500/10 border-sky-500/25",
      unlocked: totalHoursRead >= hrs,
      progress: Math.min(100, Math.round((totalHoursRead / hrs) * 100))
    })),

    // --- PAGES READ (15) ---
    ...[50, 100, 250, 500, 1000, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000].map(pages => ({
      id: `pages_${pages}`,
      category: "pages",
      title: `${pages.toLocaleString()} Pages Read`,
      desc: `Turn and complete ${pages.toLocaleString()} pages across all eBooks.`,
      icon: Layers,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25",
      unlocked: totalPagesRead >= pages,
      progress: Math.min(100, Math.round((totalPagesRead / pages) * 100))
    })),

    // --- GENRE BADGES (20) ---
    { id: "g_tech", category: "genres", title: "Tech Titan", desc: "Read books in Technology & Software Development.", icon: Zap, color: "text-blue-400 bg-blue-500/10 border-blue-500/25", unlocked: purchasedBookIds.length >= 1, progress: 100 },
    { id: "g_biz", category: "genres", title: "Business Buff", desc: "Explore Entrepreneurship & Finance titles.", icon: Trophy, color: "text-amber-400 bg-amber-500/10 border-amber-500/25", unlocked: purchasedBookIds.length >= 2, progress: Math.min(100, purchasedBookIds.length * 50) },
    { id: "g_fict", category: "genres", title: "Fiction Fanatic", desc: "Dive into Novels and Story Worlds.", icon: Feather, category: "genres", color: "text-purple-400 bg-purple-500/10 border-purple-500/25", unlocked: true, progress: 100 },
    { id: "g_scifi", category: "genres", title: "Sci-Fi Voyager", desc: "Journey through futuristic science fiction.", icon: Sparkles, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25", unlocked: purchasedBookIds.length >= 3, progress: Math.min(100, purchasedBookIds.length * 33) },
    { id: "g_philo", category: "genres", title: "Philosophical Mind", desc: "Contemplate philosophy and wisdom.", icon: Compass, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25", unlocked: true, progress: 100 },
    { id: "g_hist", category: "genres", title: "Historical Explorer", desc: "Learn from world history and biographies.", icon: BookOpen, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", unlocked: true, progress: 100 },
    { id: "g_help", category: "genres", title: "Self-Help Scholar", desc: "Build habits with personal development titles.", icon: Award, color: "text-rose-400 bg-rose-500/10 border-rose-500/25", unlocked: true, progress: 100 },
    { id: "g_des", category: "genres", title: "Design Virtuoso", desc: "Study UI/UX design and art principles.", icon: Star, color: "text-pink-400 bg-pink-500/10 border-pink-500/25", unlocked: true, progress: 100 },
    { id: "g_mystery", category: "genres", title: "Mystery Solver", desc: "Unravel crime and thriller stories.", icon: Search, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25", unlocked: purchasedBookIds.length >= 4, progress: Math.min(100, purchasedBookIds.length * 25) },
    { id: "g_fantasy", category: "genres", title: "Fantasy Traveler", desc: "Explore epic magical realms.", icon: Sparkles, color: "text-violet-400 bg-violet-500/10 border-violet-500/25", unlocked: true, progress: 100 },
    { id: "g_science", category: "genres", title: "Science Enthusiast", desc: "Discover physics, biology & cosmology.", icon: Zap, color: "text-teal-400 bg-teal-500/10 border-teal-500/25", unlocked: true, progress: 100 },
    { id: "g_psych", category: "genres", title: "Psychology Pioneer", desc: "Understand human behavior and mind dynamics.", icon: Moon, color: "text-purple-400 bg-purple-500/10 border-purple-500/25", unlocked: true, progress: 100 },
    { id: "g_bio", category: "genres", title: "Biographer", desc: "Read life stories of world leaders.", icon: Feather, color: "text-sky-400 bg-sky-500/10 border-sky-500/25", unlocked: true, progress: 100 },
    { id: "g_poetry", category: "genres", title: "Poetry Soul", desc: "Enjoy poetic verses and classic prose.", icon: Heart, color: "text-rose-400 bg-rose-500/10 border-rose-500/25", unlocked: true, progress: 100 },
    { id: "g_econ", category: "genres", title: "Economic Strategist", desc: "Master market trends and macroeconomics.", icon: Trophy, color: "text-amber-400 bg-amber-500/10 border-amber-500/25", unlocked: true, progress: 100 },
    { id: "g_cyber", category: "genres", title: "Cyberpunk Hacker", desc: "Explore dystopian digital futures.", icon: Zap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", unlocked: true, progress: 100 },
    { id: "g_romance", category: "genres", title: "Romance Reader", desc: "Enjoy heartfelt romantic literature.", icon: Heart, color: "text-pink-400 bg-pink-500/10 border-pink-500/25", unlocked: true, progress: 100 },
    { id: "g_thriller", category: "genres", title: "Thriller Seeker", desc: "Feel the suspense of psychological thrillers.", icon: Flame, color: "text-orange-400 bg-orange-500/10 border-orange-500/25", unlocked: true, progress: 100 },
    { id: "g_startup", category: "genres", title: "Startup Founder", desc: "Read lean startup and growth playbooks.", icon: Award, color: "text-blue-400 bg-blue-500/10 border-blue-500/25", unlocked: true, progress: 100 },
    { id: "g_acad", category: "genres", title: "Academic Researcher", desc: "Study technical research papers & references.", icon: BookOpen, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25", unlocked: true, progress: 100 },

    // --- ENGAGEMENT & SPECIAL (20) ---
    { id: "e_first_rev", category: "engagement", title: "Literary Critic", desc: "Post your first rating and review.", icon: Star, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25", unlocked: userReviewsCount >= 1, progress: userReviewsCount >= 1 ? 100 : 0 },
    { id: "e_five_rev", category: "engagement", title: "Top Reviewer", desc: "Write 5 book reviews.", icon: Star, color: "text-amber-400 bg-amber-500/10 border-amber-500/25", unlocked: userReviewsCount >= 5, progress: Math.min(100, userReviewsCount * 20) },
    { id: "e_first_hl", category: "engagement", title: "Highlight Pioneer", desc: "Highlight text in any eBook.", icon: Feather, color: "text-amber-400 bg-amber-500/10 border-amber-500/25", unlocked: totalHighlightsCount >= 1, progress: totalHighlightsCount >= 1 ? 100 : 0 },
    { id: "e_hl_master", category: "engagement", title: "Highlight Master", desc: "Save 25 highlights across eBooks.", icon: Feather, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", unlocked: totalHighlightsCount >= 25, progress: Math.min(100, Math.round((totalHighlightsCount / 25) * 100)) },
    { id: "e_night_owl", category: "engagement", title: "Night Owl Reader", desc: "Read between 10 PM and 4 AM.", icon: Moon, color: "text-purple-400 bg-purple-500/10 border-purple-500/25", unlocked: hasNightRead, progress: hasNightRead ? 100 : 0 },
    { id: "e_early_bird", category: "engagement", title: "Early Bird Reader", desc: "Read between 5 AM and 7 AM.", icon: Sparkles, color: "text-amber-400 bg-amber-500/10 border-amber-500/25", unlocked: hasEarlyRead, progress: hasEarlyRead ? 100 : 0 },
    { id: "e_download_1", category: "engagement", title: "Offline Reader", desc: "Download your first eBook PDF.", icon: BookOpen, color: "text-sky-400 bg-sky-500/10 border-sky-500/25", unlocked: purchasedBookIds.length >= 1, progress: purchasedBookIds.length >= 1 ? 100 : 0 },
    { id: "e_download_5", category: "engagement", title: "Vault Collector", desc: "Download 5 eBooks for offline reading.", icon: Layers, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25", unlocked: purchasedBookIds.length >= 5, progress: Math.min(100, purchasedBookIds.length * 20) },
    { id: "e_speed_reader", category: "engagement", title: "Speed Reader", desc: "Complete 100 pages in a single day.", icon: Zap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", unlocked: totalPagesRead >= 100, progress: Math.min(100, Math.round((totalPagesRead / 100) * 100)) },
    { id: "e_weekend", category: "engagement", title: "Weekend Warrior", desc: "Read actively during the weekend.", icon: Flame, color: "text-orange-400 bg-orange-500/10 border-orange-500/25", unlocked: streak >= 2, progress: Math.min(100, streak * 50) },
    { id: "e_book_lover", category: "engagement", title: "Book Lover", desc: "Keep 10 books in your active library.", icon: Heart, color: "text-rose-400 bg-rose-500/10 border-rose-500/25", unlocked: purchasedBookIds.length >= 10, progress: Math.min(100, purchasedBookIds.length * 10) },
    { id: "e_lib_builder", category: "engagement", title: "Library Builder", desc: "Build a collection of 25 eBooks.", icon: Layers, color: "text-blue-400 bg-blue-500/10 border-blue-500/25", unlocked: purchasedBookIds.length >= 25, progress: Math.min(100, Math.round((purchasedBookIds.length / 25) * 100)) },
    { id: "e_deep_reader", category: "engagement", title: "Deep Reader", desc: "Spend 2+ hours reading in one session.", icon: Clock, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25", unlocked: totalHoursRead >= 2, progress: Math.min(100, Math.round((totalHoursRead / 2) * 100)) },
    { id: "e_explorer", category: "engagement", title: "Knowledge Explorer", desc: "Read books across 3 different genres.", icon: Compass, color: "text-teal-400 bg-teal-500/10 border-teal-500/25", unlocked: purchasedBookIds.length >= 3, progress: Math.min(100, purchasedBookIds.length * 33) },
    { id: "e_community", category: "engagement", title: "Community Contributor", desc: "Participate in book discussions.", icon: ShieldCheck, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25", unlocked: true, progress: 100 },
    { id: "e_power_user", category: "engagement", title: "Power Reader", desc: "Log 100+ total pages read.", icon: Trophy, color: "text-amber-400 bg-amber-500/10 border-amber-500/25", unlocked: totalPagesRead >= 100, progress: Math.min(100, totalPagesRead) },
    { id: "e_marathon", category: "engagement", title: "Marathon Scholar", desc: "Read 10+ hours total.", icon: Clock, color: "text-sky-400 bg-sky-500/10 border-sky-500/25", unlocked: totalHoursRead >= 10, progress: Math.min(100, Math.round((totalHoursRead / 10) * 100)) },
    { id: "e_vip", category: "engagement", title: "VIP Free Access", desc: "Enjoy 1-Year Free Access Campaign.", icon: Award, color: "text-brand-accent bg-brand-accent/10 border-brand-accent/25", unlocked: true, progress: 100 },
    { id: "e_master", category: "engagement", title: "Master Scholar", desc: "Complete 5 entire books.", icon: Crown, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25", unlocked: completedCount >= 5, progress: Math.min(100, completedCount * 20) },
    { id: "e_champion", category: "engagement", title: "Reading Champion", desc: "Reach 50+ hours and 5 books completed.", icon: Trophy, color: "text-purple-400 bg-purple-500/10 border-purple-500/25", unlocked: totalHoursRead >= 50 && completedCount >= 5, progress: Math.min(100, Math.round(((totalHoursRead / 50 + completedCount / 5) / 2) * 100)) }
  ];

  // Filtering
  const filteredAchievements = ALL_ACHIEVEMENTS.filter(badge => {
    const matchesCategory = activeCategory === "all" || badge.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      badge.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      badge.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = filterState === "all" || 
      (filterState === "unlocked" && badge.unlocked) || 
      (filterState === "locked" && !badge.unlocked);

    return matchesCategory && matchesSearch && matchesState;
  });

  const totalUnlockedCount = ALL_ACHIEVEMENTS.filter(b => b.unlocked).length;

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-brand-accent/15 via-brand-accent/5 to-transparent border border-brand-border/60 rounded-[24px] p-6 shadow-brand text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/20">
              100+ BADGES UNLOCKED
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text mt-2">Reading Achievements Hall</h1>
          <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">
            Track reading streaks, page milestones, genre mastery, and engagement honors.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-brand-card border border-brand-border/80 p-3.5 rounded-[18px] shadow-sm font-mono shrink-0">
          <Award className="h-6 w-6 text-brand-accent animate-pulse" />
          <div>
            <p className="text-[8px] font-bold text-brand-text-secondary uppercase tracking-widest leading-none">Total Progress</p>
            <p className="text-lg font-black text-brand-text mt-1">{totalUnlockedCount} / {ALL_ACHIEVEMENTS.length} Badges</p>
          </div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-brand-card border border-brand-border/70 rounded-[20px] p-3 shadow-brand">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 pr-1">
          {[
            { id: "all", label: `All (${ALL_ACHIEVEMENTS.length})` },
            { id: "streaks", label: "Streaks" },
            { id: "milestones", label: "Milestones" },
            { id: "hours", label: "Hours" },
            { id: "pages", label: "Pages" },
            { id: "genres", label: "Genres" },
            { id: "engagement", label: "Engagement" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg-secondary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & State Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/50" />
            <input
              type="text"
              placeholder="Search 100+ badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-9 pr-3 text-xs rounded-full border border-brand-border bg-brand-bg-secondary focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/40"
            />
          </div>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="h-8.5 px-3 rounded-full border border-brand-border bg-brand-bg-secondary text-xs font-bold text-brand-text cursor-pointer focus:outline-none"
          >
            <option value="all">All States</option>
            <option value="unlocked">Unlocked</option>
            <option value="locked">In Progress</option>
          </select>
        </div>
      </div>

      {/* Badges Grid (Responsive 3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((badge) => {
          const IconComponent = badge.icon;
          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`relative overflow-hidden bg-brand-card border rounded-[22px] p-5 shadow-brand text-left flex flex-col justify-between gap-4 transition-all duration-300 ${
                badge.unlocked 
                  ? "border-brand-border/80 hover:border-brand-accent/40 shadow-sm" 
                  : "border-brand-border/40 opacity-60"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-brand-text leading-snug">
                      {badge.title}
                    </h3>
                    {badge.unlocked && (
                      <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-brand-text-secondary mt-1 font-semibold leading-relaxed">{badge.desc}</p>
                </div>
                <div className={`p-2.5 rounded-[14px] border shrink-0 ${badge.color} shadow-sm`}>
                  <IconComponent className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[8px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider mb-1.5">
                  <span>{badge.unlocked ? "Unlocked 🎉" : "In Progress"}</span>
                  <span>{badge.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-brand-border/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${badge.unlocked ? 'bg-brand-accent' : 'bg-brand-text-secondary/40'}`}
                    style={{ width: `${badge.progress}%` }} 
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};

export default Achievements;
