import React, { useState } from "react";
import { 
  BarChart2, BookOpen, Download, Bookmark, Users, Star,
  TrendingUp, Clock, Globe, ArrowUpRight, Monitor, Smartphone, Tablet
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Simulated analytics data structures
const DOWNLOADS_TREND_DATA = {
  weekly: [
    { label: "Mon", downloads: 24, reads: 42 },
    { label: "Tue", downloads: 35, reads: 58 },
    { label: "Wed", downloads: 48, reads: 76 },
    { label: "Thu", downloads: 42, reads: 69 },
    { label: "Fri", downloads: 55, reads: 88 },
    { label: "Sat", downloads: 68, reads: 104 },
    { label: "Sun", downloads: 59, reads: 94 }
  ],
  monthly: [
    { label: "W1", downloads: 145, reads: 230 },
    { label: "W2", downloads: 180, reads: 290 },
    { label: "W3", downloads: 210, reads: 340 },
    { label: "W4", downloads: 245, reads: 398 }
  ],
  yearly: [
    { label: "Jan", downloads: 450, reads: 720 },
    { label: "Feb", downloads: 520, reads: 840 },
    { label: "Mar", downloads: 680, reads: 1100 },
    { label: "Apr", downloads: 740, reads: 1250 },
    { label: "May", downloads: 890, reads: 1480 },
    { label: "Jun", downloads: 980, reads: 1650 },
    { label: "Jul", downloads: 1100, reads: 1890 },
    { label: "Aug", downloads: 1050, reads: 1820 },
    { label: "Sep", downloads: 1200, reads: 2100 },
    { label: "Oct", downloads: 1350, reads: 2400 },
    { label: "Nov", downloads: 1420, reads: 2650 },
    { label: "Dec", downloads: 1600, reads: 3100 }
  ]
};

const POPULAR_CHAPTERS = [
  { id: 1, title: "Chapter 1: The Baseline Foundations", words: 1240, reads: 412, avgTime: "4.5m" },
  { id: 2, title: "Preface & Intro", words: 580, reads: 388, avgTime: "2.1m" },
  { id: 3, title: "Chapter 2: Core Architectures", words: 1980, reads: 290, avgTime: "6.8m" },
  { id: 4, title: "Visual Diagrams Pack", words: 240, reads: 180, avgTime: "1.5m" },
  { id: 5, title: "Comparative Data Matrix", words: 890, reads: 120, avgTime: "3.2m" }
];

const DEVICE_SHARE = [
  { name: "Mobile", value: 64, color: "#7C3AED", icon: Smartphone },
  { name: "Desktop", value: 30, color: "#10B981", icon: Monitor },
  { name: "Tablet", value: 6, color: "#F59E0B", icon: Tablet }
];

const TRAFFIC_SOURCES = [
  { name: "Google Search", visits: 1420, percentage: 48 },
  { name: "Direct Library", visits: 890, percentage: 30 },
  { name: "Social Media", visits: 380, percentage: 13 },
  { name: "Referrals & Blogs", visits: 270, percentage: 9 }
];

const TOP_COUNTRIES = [
  { country: "India", code: "IN", downloads: 1250, percentage: 42 },
  { country: "United States", code: "US", downloads: 740, percentage: 25 },
  { country: "United Kingdom", code: "GB", downloads: 350, percentage: 12 },
  { country: "Canada", code: "CA", downloads: 240, percentage: 8 },
  { country: "Australia", code: "AU", downloads: 180, percentage: 6 }
];

export const Analytics = () => {
  const [timeframe, setTimeframe] = useState("monthly"); // weekly | monthly | yearly

  const chartData = DOWNLOADS_TREND_DATA[timeframe] || DOWNLOADS_TREND_DATA.monthly;

  return (
    <div className="flex flex-col gap-6 text-left select-none font-display">
      
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-brand-text">Analytics Insights</h1>
          <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
            Track reading behavior, traffic sources, chapter completions, and downloads trends.
          </p>
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center bg-brand-card border border-brand-border rounded-full p-1 text-xs font-bold font-mono">
          {["weekly", "monthly", "yearly"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 rounded-full capitalize transition-all cursor-pointer ${
                timeframe === t 
                  ? "bg-brand-accent text-white" 
                  : "text-brand-text-secondary hover:text-brand-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Downloads */}
        <div className="p-5 bg-brand-card border border-brand-border rounded-[20px] shadow-sm flex flex-col gap-1 text-left relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono">Total Downloads</span>
            <div className="h-7 w-7 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
              <Download className="h-3.5 w-3.5" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-brand-text mt-2 font-mono">1,824</h2>
          <div className="flex items-center gap-1 text-[9px] font-bold text-brand-success mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        {/* KPI 2: Reads */}
        <div className="p-5 bg-brand-card border border-brand-border rounded-[20px] shadow-sm flex flex-col gap-1 text-left relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono">Total Reads</span>
            <div className="h-7 w-7 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-brand-text mt-2 font-mono">3,120</h2>
          <div className="flex items-center gap-1 text-[9px] font-bold text-brand-success mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>+18.9% vs last month</span>
          </div>
        </div>

        {/* KPI 3: Bookmarks */}
        <div className="p-5 bg-brand-card border border-brand-border rounded-[20px] shadow-sm flex flex-col gap-1 text-left relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono">Bookmarks</span>
            <div className="h-7 w-7 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
              <Bookmark className="h-3.5 w-3.5" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-brand-text mt-2 font-mono">486</h2>
          <div className="flex items-center gap-1 text-[9px] font-bold text-brand-success mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>+8.4% vs last month</span>
          </div>
        </div>

        {/* KPI 4: Followers */}
        <div className="p-5 bg-brand-card border border-brand-border rounded-[20px] shadow-sm flex flex-col gap-1 text-left relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono">Followers</span>
            <div className="h-7 w-7 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-brand-text mt-2 font-mono">680</h2>
          <div className="flex items-center gap-1 text-[9px] font-bold text-brand-success mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>+24.1% vs last month</span>
          </div>
        </div>

      </div>

      {/* Main Charts & Completion Rates Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Trend Area Chart (Left 2 columns) */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
            <span className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Reading Trends</span>
            <span className="text-[10px] font-bold text-brand-text-secondary font-mono">Units: Downloads & Reads</span>
          </div>
          
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" opacity={0.3} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fill: "var(--brand-text-secondary)" }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fill: "var(--brand-text-secondary)" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--brand-card)", 
                    borderColor: "var(--brand-border)",
                    borderRadius: "12px",
                    color: "var(--brand-text)",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)"
                  }} 
                />
                <Area type="monotone" dataKey="downloads" stroke="var(--color-brand-accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDownloads)" name="Downloads" />
                <Area type="monotone" dataKey="reads" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReads)" name="Reads" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Gauge (Right 1 column) */}
        <div className="bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-center gap-4">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border/60 pb-2 w-full">
            Reader Engagement
          </h3>

          <div className="flex flex-col items-center gap-4">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="var(--brand-border)" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  stroke="var(--color-brand-accent)" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - 68 / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black font-mono text-brand-text">68%</span>
                <span className="text-[8px] font-mono text-brand-text-secondary uppercase font-bold">Avg Progress</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1 text-center">
              <span className="text-xs font-bold text-brand-text">Completion Rate</span>
              <span className="text-[10px] text-brand-text-secondary max-w-xs font-semibold leading-relaxed">
                Percentage of readers who complete the final chapters of your published books.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 p-3.5 bg-brand-bg-secondary/40 border border-brand-border rounded-[16px] text-left">
            <Clock className="h-4.5 w-4.5 text-brand-accent shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-brand-text leading-none">Average Reading Time</p>
              <p className="text-xs font-mono font-black text-brand-text mt-1">12m 45s</p>
            </div>
          </div>
        </div>

      </div>

      {/* Chapters & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Popular Chapters Table (Left 2 cols) */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm overflow-x-auto">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border/60 pb-2.5 w-full flex items-center gap-1.5">
            Popular Chapters
          </h3>

          <table className="w-full text-left text-xs border-collapse mt-4">
            <thead>
              <tr className="border-b border-brand-border/60 text-brand-text-secondary font-bold uppercase tracking-wider font-mono text-[9px]">
                <th className="py-2.5">Chapter Title</th>
                <th className="py-2.5 text-right">Words</th>
                <th className="py-2.5 text-right">Reads</th>
                <th className="py-2.5 text-right">Avg Read Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30 font-semibold text-brand-text-secondary">
              {POPULAR_CHAPTERS.map((ch) => (
                <tr key={ch.id} className="hover:bg-brand-bg-secondary/10">
                  <td className="py-3 text-brand-text font-bold truncate max-w-[200px]">{ch.title}</td>
                  <td className="py-3 text-right font-mono">{ch.words}</td>
                  <td className="py-3 text-right font-mono text-brand-text">{ch.reads}</td>
                  <td className="py-3 text-right font-mono">{ch.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Demographics & Traffic Devices Share (Right 1 col) */}
        <div className="flex flex-col gap-6">
          
          {/* Traffic Sources */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border/60 pb-2">Traffic Sources</h4>
            <div className="flex flex-col gap-3 mt-1.5">
              {TRAFFIC_SOURCES.map((source) => (
                <div key={source.name} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-brand-text-secondary">
                    <span className="text-brand-text">{source.name}</span>
                    <span className="font-mono">{source.visits} ({source.percentage}%)</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-brand-bg border border-brand-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-accent rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Demographics */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border/60 pb-2">Devices Distribution</h4>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {DEVICE_SHARE.map((dev) => {
                const Icon = dev.icon;
                return (
                  <div key={dev.name} className="p-3 bg-brand-bg-secondary/40 border border-brand-border rounded-xl text-center flex flex-col items-center gap-1.5">
                    <Icon className="h-4.5 w-4.5 text-brand-text-secondary" style={{ color: dev.color }} />
                    <p className="text-[9px] font-bold text-brand-text-secondary uppercase tracking-wider leading-none">{dev.name}</p>
                    <p className="text-sm font-black font-mono text-brand-text mt-0.5 leading-none">{dev.value}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border/60 pb-2">Top Countries</h4>
            <div className="flex flex-col gap-2.5 mt-1">
              {TOP_COUNTRIES.map((c) => (
                <div key={c.country} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono text-brand-text bg-brand-bg-secondary border border-brand-border px-1.5 py-0.5 rounded uppercase">
                      {c.code}
                    </span>
                    <span className="text-brand-text font-bold">{c.country}</span>
                  </div>
                  <span className="text-brand-text-secondary font-mono">{c.downloads} ({c.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Analytics;
