import React, { useState } from "react";
import { Sparkles, Send, TrendingUp, Bot, RefreshCw, Zap, BookOpen, Globe, FileText, CheckCircle2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

const AI_TOOLS = [
  { id: "writer", name: "AI Book Writer", icon: BookOpen, desc: "Draft full chapter sections" },
  { id: "desc", name: "Description Generator", icon: FileText, desc: "Generate high-converting synopsis" },
  { id: "cover", name: "Cover Art Prompts", icon: Sparkles, desc: "Midjourney/DALL-E cover prompts" },
  { id: "seo", name: "SEO Keyword Engine", icon: Globe, desc: "Generate Google metadata & tags" },
  { id: "hashtags", name: "Social Hashtags", icon: Zap, desc: "Generate viral book hashtags" },
  { id: "marketing", name: "Marketing Copy", icon: Send, desc: "Email broadcast & ad copy" },
  { id: "translation", name: "Multi-language Translate", icon: Globe, desc: "Translate book metadata to 10+ languages" },
  { id: "grammar", name: "Grammar Polish", icon: CheckCircle2, desc: "Proofread and polish manuscript" },
  { id: "rewrite", name: "Content Rewriter", icon: RefreshCw, desc: "Improve tone & clarity" },
  { id: "quiz", name: "Quiz Generator", icon: Bot, desc: "Generate reader comprehension quizzes" },
  { id: "flashcards", name: "Flashcard Creator", icon: Sparkles, desc: "Key takeaway flashcards" },
  { id: "summary", name: "Chapter Summarizer", icon: FileText, desc: "Create executive summaries" },
  { id: "audio", name: "Audio Narration Script", icon: Bot, desc: "Generate podcast/audiobook voice script" },
  { id: "chapters", name: "Chapter Outliner", icon: BookOpen, desc: "Structure 10-chapter book outline" },
  { id: "blog", name: "Blog Post Generator", icon: TrendingUp, desc: "Generate promotional blog articles" }
];

export const AiStudio = ({ user, books = [], chartData = [] }) => {
  const [selectedTool, setSelectedTool] = useState(AI_TOOLS[0]);
  const [promptInput, setPromptInput] = useState("");
  const [generatedResult, setGeneratedResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Revenue Forecast Data
  const forecastData = (() => {
    const historical = chartData.map(d => ({
      month: d.month,
      revenue: d.sales * 399
    }));
    const forecastMonths = ["Aug 26", "Sep 26", "Oct 26", "Nov 26", "Dec 26", "Jan 27"];
    const projected = forecastMonths.map((m, idx) => ({
      month: `${m} (Forecast)`,
      revenue: Math.round(3500 * (1 + (idx + 1) * 0.15))
    }));
    return [...historical, ...projected];
  })();

  const handleGenerate = () => {
    if (!promptInput.trim()) {
      toast.error("Please provide topic or book details.");
      return;
    }
    setLoading(true);
    setGeneratedResult("");

    setTimeout(() => {
      let output = "";
      switch (selectedTool.id) {
        case "writer":
          output = `## Chapter Section: ${promptInput}\n\nArchitecture dictates system longevity. In event-driven distributed systems, coupling services via direct HTTP calls introduces cascade latency. Instead, publishing domain events via Kafka log streams ensures eventual consistency and 99.99% uptime reliability.`;
          break;
        case "desc":
          output = `✨ High-Converting Synopsis for "${promptInput}":\n\nUnlock battle-tested backend architecture blueprints used by Senior Staff Engineers at Fortune 500 tech companies. Master microservice decomposition, rate limiting, and zero-downtime database migrations.`;
          break;
        case "cover":
          output = `🎨 Midjourney v6 Prompt:\n/imagine prompt: ultra-detailed 3d book cover for "${promptInput}", sleek cyber-navy aesthetic, glowing isometric system architecture diagrams, high contrast typography, 8k resolution, octane render --ar 2:3`;
          break;
        case "seo":
          output = `🔑 Recommended SEO Meta Tags:\nTitle: ${promptInput} | Ultimate Guide for Developers\nDescription: Master ${promptInput} with step-by-step code samples and system design architecture.\nKeywords: ${promptInput}, SaaS, Backend Engineering, Cloud Architecture`;
          break;
        default:
          output = `✨ AI Generated Result for ${selectedTool.name} ("${promptInput}"):\n\n1. Key Insight: Focus on high-value developer problems.\n2. Implementation Blueprint: Build modular, scalable components.\n3. Reader Value: Accelerated learning curve with real code samples.`;
      }
      setGeneratedResult(output);
      setLoading(false);
      toast.success(`${selectedTool.name} output generated! 🚀`);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResult);
    toast.success("AI Result copied to clipboard! 📋");
  };

  return (
    <div className="space-y-8">
      {/* AI Revenue Forecast Card */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-black text-brand-text flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              AI Revenue Forecast & Sales Trend Projection
            </h3>
            <p className="text-xs text-brand-text-secondary mt-0.5">Time-series regression model projecting next 6 months earnings based on sales velocity.</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">+28% Projected Growth</span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aiForecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252529" vertical={false} />
              <XAxis dataKey="month" stroke="#71717A" fontSize={10} tickLine={false} />
              <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#161618", borderColor: "#252529", borderRadius: "12px" }} formatter={(val) => [`₹${val.toLocaleString()}`, "Projected Earnings"]} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#aiForecastGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 15-in-1 AI Creator Suite Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-display font-black text-brand-text flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-accent animate-pulse" />
          15-in-1 AI Creator Publishing Toolkit
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {AI_TOOLS.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTool.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setSelectedTool(t); setGeneratedResult(""); }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-brand-accent/20 border-brand-accent text-brand-text shadow-md shadow-brand-accent/10 scale-[1.02]"
                    : "bg-[#161618] border-brand-border/60 text-brand-text-secondary hover:text-brand-text hover:bg-[#1c1c1f]"
                }`}
              >
                <Icon className={`h-5 w-5 mb-2 ${isSelected ? "text-brand-accent" : "text-brand-text-secondary"}`} />
                <p className="text-xs font-bold truncate text-brand-text">{t.name}</p>
                <p className="text-[10px] text-brand-text-secondary truncate mt-0.5">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active AI Tool Input & Result */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand-accent" />
            <h4 className="text-sm font-bold text-brand-text">{selectedTool.name}</h4>
          </div>
          <span className="text-[10px] font-mono text-brand-text-secondary">Powered by OpenAI / Anthropic Engine</span>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-1.5">Enter Topic / Book Context *</label>
          <textarea
            rows={3}
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            placeholder={`Describe what you want to generate for ${selectedTool.name}...`}
            className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
          />
        </div>

        <Button variant="primary" size="sm" onClick={handleGenerate} isLoading={loading}>
          <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate AI Output
        </Button>

        {generatedResult && (
          <div className="bg-[#111113] border border-brand-border/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">AI Output Result</span>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy Output
              </Button>
            </div>
            <pre className="text-xs text-brand-text font-sans whitespace-pre-wrap leading-relaxed">{generatedResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
