import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";

const faqData = [
  {
    category: "General",
    questions: [
      {
        q: "What is EBOOKVALA?",
        a: "EBOOKVALA is a premium, 100% free open-access digital library for curated eBooks. We connect passionate readers with top-tier independent authors in tech, business, design, and self-help."
      },
      {
        q: "How do I read books on EBOOKVALA?",
        a: "All books are free. Simply click 'Add to Library' on any book detail page. It will instantly appear in your Reader Dashboard library, where you can read online or download PDF files."
      },
      {
        q: "Can I read on multiple devices?",
        a: "Yes! Since EBOOKVALA is a cloud-based platform, you can log in to your account on any smartphone, tablet, laptop, or desktop and access your library instantly."
      }
    ]
  },
  {
    category: "Reading",
    questions: [
      {
        q: "Is the platform really free?",
        a: "Absolutely. There are no credit card checks, billing setups, subscription tiers, or locked features. EBOOKVALA is 100% free for everyone for the first year launch."
      },
      {
        q: "Can I download files for offline use?",
        a: "Yes, once you add an eBook to your library, direct download links for high-quality PDF formats are unlocked on your downloads dashboard page."
      },
      {
        q: "How do the AI study features work?",
        a: "EBOOKVALA integrates visual concept mind maps, chapter summaries, and interactive revision flashcards. In the e-reader canvas, you can also highlight text to invoke the AI Tutor for inline explanations."
      }
    ]
  },
  {
    category: "Authors",
    questions: [
      {
        q: "How do I publish my eBook on EBOOKVALA?",
        a: "You can register as an Author on our platform. Once verified, you can upload your files, set custom categories and tags, and share your work with our reading community instantly."
      },
      {
        q: "Is there any cost to publish?",
        a: "None. Authors can publish, distribute, and promote their eBooks completely free of charge. You also get detailed reading analytics and reader reach statistics."
      },
      {
        q: "What formats can I upload?",
        a: "We currently support PDF and EPUB files. We recommend uploading both formats to give readers the best possible reading experience across different screen resolutions."
      }
    ]
  }
];

export const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  let faqList = [];
  faqData.forEach((cat) => {
    if (activeCategory === "All" || cat.category === activeCategory) {
      cat.questions.forEach((item) => {
        const matchesSearch = 
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.a.toLowerCase().includes(searchQuery.toLowerCase());
        if (matchesSearch) {
          faqList.push({ ...item, category: cat.category });
        }
      });
    }
  });

  return (
    <div className="bg-brand-bg min-h-screen py-24 select-none text-left transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-mono text-brand-text-secondary font-bold tracking-widest uppercase mb-3 block">
            Frequently Asked Questions
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-brand-text leading-tight tracking-tight">
            How can we help?
          </h1>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mt-6">
            <input
              type="text"
              placeholder="Search FAQ guides, topics, keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-bg-secondary border border-brand-border rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:bg-brand-card focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 text-brand-text font-medium transition-all"
            />
            <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-brand-text-secondary/60" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b border-brand-border pb-4 mb-8 overflow-x-auto no-scrollbar font-display">
          {["All", "General", "Reading", "Authors"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setExpandedIndex(null);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer shrink-0 transition-colors ${
                activeCategory === cat 
                  ? "bg-brand-accent text-white" 
                  : "bg-brand-bg-secondary border border-brand-border text-brand-text-secondary hover:text-brand-text"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions */}
        {faqList.length > 0 ? (
          <div className="flex flex-col gap-3">
            {faqList.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-brand-border bg-brand-card rounded-brand-card overflow-hidden shadow-brand transition-all"
                >
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-brand-text cursor-pointer hover:bg-brand-bg-secondary transition-colors"
                  >
                    <span>{item.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-brand-text shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-brand-text-secondary shrink-0 ml-4" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-brand-text-secondary leading-relaxed font-normal border-t border-brand-border/40 bg-brand-bg-secondary/40">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-brand-border rounded-brand-card text-xs text-brand-text-secondary bg-brand-card font-semibold">
            No matching questions found. Try searching for something else.
          </div>
        )}

        {/* Still Need Help */}
        <div className="border border-brand-border rounded-brand-card p-8 bg-brand-bg-secondary mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-brand-text shrink-0 shadow-sm">
              <MessageSquare className="h-4.5 w-4.5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-text mb-1">Still need help?</h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed font-semibold">
                Can't find the answers you are looking for? Contact support team directly.
              </p>
            </div>
          </div>
          <Link to="/contact">
            <Button variant="primary" className="h-10 px-5 text-xs font-bold rounded-full flex items-center gap-1.5 shrink-0 shadow-sm">
              Contact Support
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
