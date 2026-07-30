import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, Flame, BookMarked, Sparkles, Globe, Trophy, 
  Smartphone, BarChart3, ArrowLeft, ArrowRight, CheckCircle2, 
  Play, RefreshCw, Zap, Shield, Star, BookOpen, Layers, Check, Wifi, WifiOff, Volume2, Languages
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { toast } from "react-hot-toast";
import { HIGHLIGHT_COLORS } from "./reader/Reader";

export const FEATURE_DATA = {
  "offline-reading": {
    id: "offline-reading",
    title: "Offline Reading & Local Storage",
    tagline: "Read anywhere, anytime without an active internet connection.",
    icon: Download,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    badge: "PWA Native Storage",
    description: "EBOOKVALA automatically caches your active reading library in IndexedDB and Service Worker caches. Download complete books in one click and enjoy uninterrupted reading offline.",
    liveActionText: "Open Reader in Offline Mode",
    liveActionLink: "/read/designing-for-scale",
    dashboardLink: "/dashboard?tab=downloads"
  },
  "reading-streak": {
    id: "reading-streak",
    title: "Reading Streak & Habit Building",
    tagline: "Build a consistent daily reading habit with milestone tracking.",
    icon: Flame,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    badge: "Habit Tracker",
    description: "Track your active reading streak days, daily reading goal progress, and unlock motivation badges every time you hit new milestones.",
    liveActionText: "View Reading Dashboard & Streaks",
    liveActionLink: "/dashboard?tab=overview",
    dashboardLink: "/dashboard?tab=achievements"
  },
  "smart-bookmarks": {
    id: "smart-bookmarks",
    title: "Smart Bookmarks & Quick Visual Tabs",
    tagline: "Bookmark key pages with instant visual tags and color codes.",
    icon: BookMarked,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    badge: "Visual Tabs",
    description: "Never lose your place. Save important pages, tag specific insights, and organize your study bookmarks across your entire eBook collection.",
    liveActionText: "Open Library Bookmarks",
    liveActionLink: "/dashboard?tab=wishlist",
    dashboardLink: "/read/designing-for-scale"
  },
  "multi-color-highlights": {
    id: "multi-color-highlights",
    title: "10-Color Multi-Color Text Highlighting",
    tagline: "Highlight and categorize quotes using 10 custom vibrant shades.",
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    badge: "10 Colors Palette",
    description: "Highlight text in Yellow, Green, Sky Blue, Pink, Purple, Orange, Cyan, Lime, Rose, and Indigo. Filter highlights by color and export notes instantly.",
    liveActionText: "Try Live Highlighter in Reader",
    liveActionLink: "/read/designing-for-scale",
    dashboardLink: "/dashboard?tab=overview"
  },
  "instant-ai-translator": {
    id: "instant-ai-translator",
    title: "Instant AI Translator (30+ Languages)",
    tagline: "Break language barriers with real-time AI paragraph translation.",
    icon: Globe,
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    badge: "30+ Languages",
    description: "Highlight any complex paragraph or technical section in an eBook and instantly translate it into Hindi, Gujarati, Spanish, French, German, Japanese, and 25+ more languages.",
    liveActionText: "Open eBook Reader with AI Translator",
    liveActionLink: "/read/designing-for-scale",
    dashboardLink: "/marketplace"
  },
  "reading-achievements": {
    id: "reading-achievements",
    title: "Reading Achievements & Milestones",
    tagline: "Unlock achievement badges and celebrate completed eBooks.",
    icon: Trophy,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    badge: "Gamified Badges",
    description: "Earn badges for Night Owl Reading, Speed Reading, Finishing 5 Books, and Maintaining 7-Day Streaks. Compete with fellow readers across India.",
    liveActionText: "View My Achievements & Badges",
    liveActionLink: "/dashboard?tab=achievements",
    dashboardLink: "/dashboard?tab=overview"
  },
  "multi-device-sync": {
    id: "multi-device-sync",
    title: "Multi-Device Real-Time Cloud Sync",
    tagline: "Sync your exact reading position and notes across all your devices.",
    icon: Smartphone,
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    badge: "Cloud Sync Engine",
    description: "Start reading on your laptop, continue on your mobile phone app, and review notes on your tablet. EBOOKVALA keeps page progress, bookmarks, and highlights in sync.",
    liveActionText: "Check Sync & Session Settings",
    liveActionLink: "/dashboard?tab=settings",
    dashboardLink: "/dashboard?tab=overview"
  },
  "reading-analytics": {
    id: "reading-analytics",
    title: "Reading Analytics & Visual Trends",
    tagline: "Visualize reading speed, total minutes read, and weekly trends.",
    icon: BarChart3,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    badge: "Live Metrics",
    description: "Deep-dive into your reading analytics. View words-per-minute speed, total hours spent reading, category distribution, and weekly peak reading hours.",
    liveActionText: "View Live Analytics Dashboard",
    liveActionLink: "/dashboard?tab=overview",
    dashboardLink: "/dashboard?tab=achievements"
  }
};

export const FeatureShowcase = () => {
  const { featureId } = useParams();
  const navigate = useNavigate();

  const feature = FEATURE_DATA[featureId] || FEATURE_DATA["offline-reading"];
  const Icon = feature.icon;

  // Demo interactive states
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [streakCount, setStreakCount] = useState(7);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("yellow");
  const [sampleText, setSampleText] = useState("Designing scalable web applications requires decoupled architecture, micro-services, and resilient databases.");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [translatedResult, setTranslatedResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Translation simulator
  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => {
      if (targetLang === "Hindi") {
        setTranslatedResult("સ્કેલેબલ વેબ એપ્લિકેશન્સ ડિઝાઈન કરવા માટે ડીકપલ્ડ આર્કિટેક્ચર, માઇક્રો-સર્વિસીસ અને સ્થિતિસ્થાપક ડેટાબેઝ જરૂરી છે।");
      } else if (targetLang === "Gujarati") {
        setTranslatedResult("સ્કેલેબલ વેબ એપ્લિકેશન્સ ડિઝાઈન કરવા માટે ડીકપલ્ડ આર્કિટેક્ચર, માઇક્રો-સર્વિસિસ અને રીસિલિયન્ટ ડેટાબેઝ જરૂરી છે.");
      } else if (targetLang === "Spanish") {
        setTranslatedResult("Diseñar aplicaciones web escalables requiere una arquitectura desacoplada, microservicios y bases de datos resilientes.");
      } else if (targetLang === "French") {
        setTranslatedResult("La conception d'applications Web évolutives nécessite une architecture découplée, des microservices et des bases de données résilientes.");
      } else {
        setTranslatedResult(`[Translated to ${targetLang}]: High-scale distributed design principles and data pipeline resilience.`);
      }
      setIsTranslating(false);
      toast.success(`Translated to ${targetLang}! ✨`);
    }, 400);
  };

  const handleCheckIn = () => {
    if (checkedInToday) return;
    setCheckedInToday(true);
    setStreakCount(prev => prev + 1);
    toast.success("🔥 Daily Reading Streak Updated! +1 Day");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:py-14 text-left select-none">
      
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-text-secondary hover:text-brand-accent mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Platform
      </button>

      {/* Header Banner */}
      <div className="bg-brand-card border border-brand-border rounded-[28px] p-6 sm:p-10 shadow-brand mb-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-3xl border flex items-center justify-center shrink-0 shadow-sm ${feature.color}`}>
              <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-1 rounded-full uppercase">
                {feature.badge}
              </span>
              <h1 className="text-2xl sm:text-4xl font-display font-black text-brand-text mt-3 tracking-tight">
                {feature.title}
              </h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary mt-1 font-medium max-w-xl">
                {feature.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button 
              onClick={() => navigate(feature.liveActionLink)}
              variant="primary" 
              className="h-12 px-6 rounded-full font-bold text-xs bg-brand-accent hover:scale-102 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" /> {feature.liveActionText}
            </Button>
            <Button 
              onClick={() => navigate(feature.dashboardLink)}
              variant="outline" 
              className="h-12 px-5 rounded-full font-bold text-xs border-brand-border hover:bg-brand-bg-secondary w-full sm:w-auto justify-center cursor-pointer"
            >
              Dashboard Module
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-[24px] p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold font-display text-brand-text mb-3">Overview & Capabilities</h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed font-normal">
            {feature.description}
          </p>

          {/* Interactive Feature Sandbox */}
          <div className="mt-8 pt-6 border-t border-brand-border">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-accent mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> Interactive Feature Sandbox Demo
            </h3>

            {/* DEMO 1: OFFLINE READING */}
            {feature.id === "offline-reading" && (
              <div className="bg-brand-bg-secondary border border-brand-border/80 rounded-[18px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-text">
                    {isSimulatedOffline ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-emerald-500" />}
                    <span>Connection Status: {isSimulatedOffline ? "Offline Mode (Simulated)" : "Online Sync Active"}</span>
                  </div>
                  <Button 
                    onClick={() => {
                      setIsSimulatedOffline(!isSimulatedOffline);
                      toast(isSimulatedOffline ? "Connected back online 🌐" : "Switched to Offline Mode 📶");
                    }}
                    variant="outline" size="sm" className="h-8 text-[11px] rounded-full"
                  >
                    Toggle Connection
                  </Button>
                </div>
                <div className="p-4 bg-brand-card border border-brand-border rounded-xl text-xs text-brand-text-secondary leading-relaxed">
                  <p className="font-bold text-brand-text mb-1">📖 Cached Offline Book: "Designing for Scale"</p>
                  <p>All chapters, bookmarks, and highlights are stored locally in IndexedDB. You can read without WiFi!</p>
                </div>
              </div>
            )}

            {/* DEMO 2: READING STREAK */}
            {feature.id === "reading-streak" && (
              <div className="bg-brand-bg-secondary border border-brand-border/80 rounded-[18px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <Flame className="h-7 w-7 fill-amber-500 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-black text-brand-text">{streakCount} Days Streak</h4>
                    <p className="text-xs text-brand-text-secondary font-medium">Daily Goal: Read 15 mins today</p>
                  </div>
                </div>
                <Button 
                  onClick={handleCheckIn}
                  disabled={checkedInToday}
                  className={`rounded-full text-xs font-bold h-10 px-5 ${checkedInToday ? "bg-emerald-600 text-white" : "bg-brand-accent text-white"}`}
                >
                  {checkedInToday ? "✓ Goal Achieved Today!" : "Check-in Daily Reading"}
                </Button>
              </div>
            )}

            {/* DEMO 3: SMART BOOKMARKS */}
            {feature.id === "smart-bookmarks" && (
              <div className="bg-brand-bg-secondary border border-brand-border/80 rounded-[18px] p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-brand-text">
                  <span>Saved Bookmarks (3)</span>
                  <span className="text-[10px] text-brand-accent">Auto-synced</span>
                </div>
                <div className="space-y-2">
                  {["Page 12 — Microservice Caching", "Page 45 — Distributed Queues", "Page 88 — Database Sharding"].map((bm, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-brand-card border border-brand-border rounded-xl text-xs text-brand-text font-semibold">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4 text-purple-500" />
                        <span>{bm}</span>
                      </div>
                      <span className="text-[10px] font-mono text-brand-text-secondary bg-brand-bg-secondary px-2 py-0.5 rounded">Jump →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DEMO 4: MULTI COLOR HIGHLIGHTS */}
            {feature.id === "multi-color-highlights" && (
              <div className="bg-brand-bg-secondary border border-brand-border/80 rounded-[18px] p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-text">Select Color:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {HIGHLIGHT_COLORS.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedHighlightColor(c.id)}
                        className={`h-6 w-6 rounded-full transition-transform ${c.dot} ${selectedHighlightColor === c.id ? "scale-125 ring-2 ring-brand-accent" : "hover:scale-110"}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-brand-card border border-brand-border rounded-xl text-xs leading-relaxed text-brand-text">
                  <span>Sample Quote: </span>
                  <mark className={`px-1 rounded ${HIGHLIGHT_COLORS.find(c => c.id === selectedHighlightColor)?.bg || "bg-yellow-300/80 text-slate-900"}`}>
                    "Decoupled architectures provide resilience under high traffic loads."
                  </mark>
                </div>
              </div>
            )}

            {/* DEMO 5: INSTANT AI TRANSLATOR */}
            {feature.id === "instant-ai-translator" && (
              <div className="bg-brand-bg-secondary border border-brand-border/80 rounded-[18px] p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-brand-text">Target Language:</span>
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-brand-card border border-brand-border rounded-lg text-xs font-bold text-brand-text px-3 py-1.5 outline-none"
                  >
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                  </select>
                </div>
                <div className="p-3 bg-brand-card border border-brand-border rounded-xl text-xs text-brand-text-secondary">
                  <p className="font-semibold text-brand-text mb-1">Original English Text:</p>
                  <p>"{sampleText}"</p>
                </div>
                {translatedResult && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-400 font-medium animate-fade-in">
                    <p className="font-bold mb-1">✨ AI Translation ({targetLang}):</p>
                    <p>{translatedResult}</p>
                  </div>
                )}
                <Button onClick={handleTranslate} loading={isTranslating} className="w-full h-9 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-full">
                  Translate Paragraph Now
                </Button>
              </div>
            )}

            {/* DEMO 6: ACHIEVEMENTS */}
            {feature.id === "reading-achievements" && (
              <div className="bg-brand-bg-secondary border border-brand-border/80 rounded-[18px] p-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "First Book Finished", desc: "Read 1st eBook", icon: Trophy, unlocked: true },
                    { title: "7-Day Streak", desc: "Active reader", icon: Flame, unlocked: true },
                    { title: "Night Owl", desc: "Read past midnight", icon: Star, unlocked: true },
                    { title: "Scholar Level 5", desc: "Read 500+ mins", icon: Award, unlocked: false }
                  ].map((ach, i) => (
                    <div key={i} className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${ach.unlocked ? "bg-brand-card border-brand-accent/30 text-brand-text" : "bg-brand-card/40 border-brand-border/50 opacity-50"}`}>
                      <ach.icon className={`h-5 w-5 shrink-0 ${ach.unlocked ? "text-amber-400" : "text-brand-text-secondary"}`} />
                      <div>
                        <p className="font-bold leading-tight">{ach.title}</p>
                        <p className="text-[10px] text-brand-text-secondary">{ach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DEMO 7: MULTI DEVICE SYNC */}
            {feature.id === "multi-device-sync" && (
              <div className="bg-brand-bg-secondary border border-brand-border/80 rounded-[18px] p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-brand-text">
                  <span>Connected Devices (Active Sync)</span>
                  <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-mono"><Check className="h-3 w-3" /> Encrypted</span>
                </div>
                {[
                  { device: "Chrome / Windows 11", status: "Active Now (Page 42)", time: "Just now" },
                  { device: "EBOOKVALA Android App", status: "Synced (Page 42)", time: "2 mins ago" },
                  { device: "Safari / iPadOS", status: "Synced (Page 42)", time: "1 hour ago" }
                ].map((dev, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-brand-card border border-brand-border rounded-xl text-xs text-brand-text">
                    <span className="font-semibold">{dev.device}</span>
                    <span className="text-[10px] font-mono text-brand-accent">{dev.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* DEMO 8: ANALYTICS */}
            {feature.id === "reading-analytics" && (
              <div className="bg-brand-bg-secondary border border-brand-border/80 rounded-[18px] p-5 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-brand-card border border-brand-border rounded-xl">
                  <p className="text-[10px] text-brand-text-secondary font-mono">WPM SPEED</p>
                  <p className="text-lg font-black text-brand-text mt-1">245</p>
                </div>
                <div className="p-3 bg-brand-card border border-brand-border rounded-xl">
                  <p className="text-[10px] text-brand-text-secondary font-mono">HOURS READ</p>
                  <p className="text-lg font-black text-brand-accent mt-1">18.4 hrs</p>
                </div>
                <div className="p-3 bg-brand-card border border-brand-border rounded-xl">
                  <p className="text-[10px] text-brand-text-secondary font-mono">BOOKS DONE</p>
                  <p className="text-lg font-black text-emerald-500 mt-1">4</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights Panel */}
        <div className="space-y-6">
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm text-left">
            <h3 className="text-sm font-bold font-display text-brand-text mb-4">Key Benefits</h3>
            <ul className="space-y-3 text-xs text-brand-text-secondary">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>100% Real-time synchronization backed by Firebase Firestore.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Zero latency local caching for lightning fast performance.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Seamless integration across mobile app and web browser.</span>
              </li>
            </ul>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm text-left">
            <h3 className="text-sm font-bold font-display text-brand-text mb-4">Other Platform Features</h3>
            <div className="space-y-2">
              {Object.values(FEATURE_DATA).filter(f => f.id !== feature.id).slice(0, 4).map((f) => {
                const FIcon = f.icon;
                return (
                  <Link 
                    key={f.id} 
                    to={`/feature/${f.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-brand-border/60 hover:border-brand-accent/40 bg-brand-bg-secondary/50 hover:bg-brand-bg-secondary text-xs text-brand-text font-semibold transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <FIcon className="h-4 w-4 text-brand-accent" />
                      <span>{f.title}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-brand-text-secondary" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FeatureShowcase;
