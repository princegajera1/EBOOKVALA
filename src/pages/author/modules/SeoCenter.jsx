import React, { useState, useEffect } from "react";
import { 
  Globe, Search, Sparkles, BookOpen, CheckCircle, 
  AlertCircle, ShieldCheck, RefreshCw, Code
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { toast } from "react-hot-toast";

export const SeoCenter = ({ books = [] }) => {
  const [selectedBookId, setSelectedBookId] = useState("");
  
  // SEO Configuration State
  const [focusKeywords, setFocusKeywords] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [isSitemap, setIsSitemap] = useState(true);
  const [robotsDirective, setRobotsDirective] = useState("index, follow");

  // Dynamically calculated score
  const [seoScore, setSeoScore] = useState(0);

  // Set default book selection
  useEffect(() => {
    if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0].id);
    }
  }, [books, selectedBookId]);

  const selectedBook = books.find(b => b.id === selectedBookId);

  // Load SEO configs
  useEffect(() => {
    if (selectedBook) {
      setCustomSlug(selectedBook.slug || selectedBook.id);
      setFocusKeywords("ebook, publishing, " + selectedBook.title.toLowerCase());
      setMetaDescription(selectedBook.description?.slice(0, 155) || `Read ${selectedBook.title} on EBOOKVALA. ${selectedBook.subtitle || ""}`);
      setOgImageUrl(selectedBook.coverURL || "");
    }
  }, [selectedBookId]);

  // Calculate SEO score in real time
  useEffect(() => {
    let score = 30; // base score
    if (customSlug.length > 3) score += 15;
    if (focusKeywords.split(",").length >= 3) score += 15;
    if (metaDescription.length >= 100 && metaDescription.length <= 160) score += 20;
    if (ogImageUrl.startsWith("http")) score += 10;
    if (robotsDirective === "index, follow") score += 10;
    setSeoScore(Math.min(score, 100));
  }, [customSlug, focusKeywords, metaDescription, ogImageUrl, robotsDirective]);

  const handleSaveSeo = () => {
    toast.success("SEO Meta Configurations updated! 🔍");
  };

  const handleAutoOptimize = () => {
    if (!selectedBook) return;
    const toastId = toast.loading("Generating optimized metadata with AI...");
    setTimeout(() => {
      setFocusKeywords(`ebook, ${selectedBook.categories[0] || "books"}, ${selectedBook.title.toLowerCase().split(" ").join(", ")}`);
      setCustomSlug(selectedBook.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
      setMetaDescription(`Download and read ${selectedBook.title} by ${selectedBook.authorName} on EBOOKVALA. ${selectedBook.subtitle || selectedBook.description.slice(0, 80)}`);
      toast.success("AI SEO Optimization Applied! ✨", { id: toastId });
    }, 1500);
  };

  // Structured Schema data JSON-LD generator
  const generatedSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Book",
    "name": selectedBook?.title || "eBook Title",
    "author": {
      "@type": "Person",
      "name": selectedBook?.authorName || "Author Name"
    },
    "description": metaDescription,
    "url": `https://ebookvala-lts4-black.vercel.app/book/${customSlug}`,
    "image": ogImageUrl,
    "publisher": {
      "@type": "Organization",
      "name": "EBOOKVALA",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ebookvala-lts4-black.vercel.app/logo.png"
      }
    }
  }, null, 2);

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-brand-text">SEO Center</h1>
          <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
            Optimize search engine crawling metadata, analyze score, preview Google SERP snippet, and generate JSON-LD schema.
          </p>
        </div>

        {/* Selected Book Dropdown */}
        <div className="flex items-center gap-2 select-none">
          <BookOpen className="h-4 w-4 text-brand-accent shrink-0" />
          <select 
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="bg-brand-card border border-brand-border px-3 py-1.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
          >
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-brand-border rounded-[20px] bg-brand-card p-6 select-none font-display">
          <AlertCircle className="mx-auto h-9 w-9 text-brand-text-secondary opacity-60 mb-3" />
          <h3 className="text-sm font-bold text-brand-text">No Books Available</h3>
          <p className="text-xs text-brand-text-secondary mt-1">Please create an eBook project first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
          
          {/* Form Settings */}
          <div className="lg:col-span-2 flex flex-col gap-5 bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
              <span className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Meta Configurations</span>
              <button 
                onClick={handleAutoOptimize}
                className="text-xs font-bold text-brand-accent hover:opacity-80 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Auto Optimize with AI
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="SEO Target Keywords" 
                placeholder="e.g. tech, product, react"
                value={focusKeywords}
                onChange={(e) => setFocusKeywords(e.target.value)}
              />
              <Input 
                label="Custom URL Slug" 
                placeholder="e.g. designing-for-scale"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-brand-text-secondary">
                <label>Meta Description</label>
                <span className={`font-mono text-[10px] ${
                  metaDescription.length >= 100 && metaDescription.length <= 160 ? "text-brand-success" : "text-amber-500"
                }`}>
                  {metaDescription.length}/160 chars
                </span>
              </div>
              <textarea 
                rows={3}
                placeholder="Brief summary of book for search result listings (120-160 characters)"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-[14px] p-3 text-sm focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/45"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="OpenGraph (OG) Image URL" 
                placeholder="URL to social sharing cover banner"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
              />
              
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-brand-text-secondary">Twitter Card Layout</label>
                <select
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value)}
                  className="bg-brand-bg border border-brand-border px-4 py-2.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
                >
                  <option value="summary">Summary Card (Small image)</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="app">App Card</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-border/40 pt-4">
              <div className="flex items-center justify-between p-3 bg-brand-bg-secondary/40 border border-brand-border rounded-[16px]">
                <div className="text-left">
                  <p className="text-xs font-bold text-brand-text">Index in Sitemap</p>
                  <p className="text-[10px] text-brand-text-secondary mt-0.5">Include this page in automatic indexing xml sitemaps.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={isSitemap}
                  onChange={(e) => setIsSitemap(e.target.checked)}
                  className="h-4 w-4 accent-brand-accent cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-brand-text-secondary">Robots.txt Crawl Directive</label>
                <select
                  value={robotsDirective}
                  onChange={(e) => setRobotsDirective(e.target.value)}
                  className="bg-brand-bg border border-brand-border px-4 py-2.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
                >
                  <option value="index, follow">Index, Follow (Standard SEO)</option>
                  <option value="noindex, nofollow">Noindex, Nofollow (Private)</option>
                  <option value="noindex, follow">Noindex, Follow (Hidden lists)</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSaveSeo} variant="primary" className="rounded-full text-xs font-bold h-11 w-full sm:w-fit px-6 shadow-sm mt-2">
              Save SEO Settings
            </Button>
          </div>

          {/* SEO Score & Google Snippet Previews */}
          <div className="flex flex-col gap-5">
            
            {/* Score circle */}
            <div className="bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm text-center flex flex-col items-center gap-3">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-1.5 w-full">
                SEO Audit Score
              </h3>
              
              <div className="relative h-28 w-28 flex items-center justify-center mt-2">
                {/* Simulated circle border loading */}
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
                    strokeDashoffset={2 * Math.PI * 48 * (1 - seoScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black font-mono text-brand-text">{seoScore}</span>
                  <span className="text-[9px] font-mono text-brand-text-secondary uppercase font-bold">Audit Rating</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-brand-text-secondary mt-2">
                {seoScore >= 80 ? (
                  <CheckCircle className="h-4 w-4 text-brand-success shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <span className="font-semibold text-left">
                  {seoScore >= 80 ? "Metadata optimized for Google search index." : "Add keywords and descriptions to improve listing."}
                </span>
              </div>
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm text-left flex flex-col gap-3">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2 w-full flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-brand-accent" /> Google Search Preview
              </h3>
              
              <div className="p-4 bg-white text-slate-800 rounded-[16px] border border-slate-200 shadow-sm font-sans flex flex-col gap-1 text-[13px] leading-tight">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 select-none">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>https://ebookvala.app/book/{customSlug || "slug"}</span>
                </div>
                <h4 className="text-indigo-800 text-[17px] font-medium hover:underline cursor-pointer leading-snug line-clamp-1">
                  {selectedBook?.title || "eBook Title"} | EBOOKVALA
                </h4>
                <p className="text-slate-600 text-[12px] leading-normal line-clamp-2 mt-1">
                  {metaDescription || "No meta description provided yet. Google will automatically select text from the file contents."}
                </p>
              </div>
            </div>

            {/* Schema.org Block */}
            <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm text-left flex flex-col gap-3">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2 w-full flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-brand-accent" /> Schema JSON-LD Structured Data
              </h3>
              <pre className="bg-[#121214] text-zinc-400 p-3 rounded-[12px] border border-zinc-800/80 text-[9px] font-mono overflow-auto max-h-[160px] scrollbar-thin">
                {generatedSchema}
              </pre>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
export default SeoCenter;
