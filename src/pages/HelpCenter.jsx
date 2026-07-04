import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, User, PenTool, Search, ArrowRight, Download, Award, ShieldCheck, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/Button";
import { SearchBox } from "../components/ui/SearchBox";

const topics = [
  { 
    title: "Getting Started", 
    desc: "Learn how to create a reader account, navigate categories, and build your digital library.", 
    icon: BookOpen,
    faqs: [
      {
        q: "How do I create a free account?",
        a: "Click 'Start Free' or 'Log In' in the top navbar, fill in your profile name, email, and choose a password. Account verification takes less than 30 seconds."
      },
      {
        q: "What devices are supported?",
        a: "EBOOKVALA works on any modern browser. You can access it on smartphones, tablets, Kindles, iPads, laptops, and desktop computers. Your reading progress syncs automatically."
      },
      {
        q: "Is there a reading limit?",
        a: "No! You can add unlimited ebooks to your shelf and download as many PDF files as you like. There are no download limits during our open library year."
      }
    ]
  },
  { 
    title: "Reading & Library Tools", 
    desc: "Guides for using the e-reader, setting themes, highlighting text, and offline reading options.", 
    icon: ShieldCheck,
    faqs: [
      {
        q: "How does the inline AI Tutor work?",
        a: "While reading inside our e-reader, double-click or select any paragraph. A prompt will appear allowing you to invoke the AI Tutor to explain complex code, summarize passages, or translate text blocks instantly."
      },
      {
        q: "Where do I find my downloaded PDFs?",
        a: "Go to your Reader Dashboard, look at your active shelves, and click 'Download PDF' underneath any book card. The high-quality PDF will save directly to your local downloads folder."
      },
      {
        q: "Can I customize the reading interface?",
        a: "Yes. Our e-reader supports sepia, dark mode, light mode, font size sizing adjustments, and line height settings to optimize your cognitive focus."
      }
    ]
  },
  { 
    title: "My Account & Settings", 
    desc: "Manage profile settings, display names, email verification, and security tokens.", 
    icon: User,
    faqs: [
      {
        q: "How do I update my profile details?",
        a: "Navigate to your Dashboard, click on Account settings, and update your public display name, email preferences, or author bio."
      },
      {
        q: "I forgot my password, how do I reset it?",
        a: "On the Login page, click the 'Forgot Password' link, enter your email address, and we will send you a secure validation link to create a new password instantly."
      }
    ]
  },
  { 
    title: "Publishing as Author", 
    desc: "Guides for writers uploading digital files, customizing metadata, and tracking reading metrics.", 
    icon: PenTool,
    faqs: [
      {
        q: "How do I register as an Author?",
        a: "Go to the Registration page and select the 'Publish a Book' option or sign up with the role set to 'Author'. Once logged in, your Dashboard will adapt into the Author publishing panel."
      },
      {
        q: "What analytics do you offer authors?",
        a: "We offer real-time analytics including: total views, unique reader downloads, reading session durations, category engagement metrics, and community ratings."
      },
      {
        q: "What format requirements do you enforce?",
        a: "We currently support high-quality PDF and EPUB files. We recommend optimizing file sizes below 15MB for fast mobile loading."
      }
    ]
  }
];

export const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null); // format: "categoryIdx-faqIdx"

  const toggleFaq = (key) => {
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  const filteredTopics = topics.map((topic, catIdx) => {
    const matchesTopic = 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.desc.toLowerCase().includes(searchQuery.toLowerCase());

    const filteredFaqs = topic.faqs.filter(
      (faq) =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchesTopic || filteredFaqs.length > 0) {
      return { ...topic, catIdx, faqs: filteredFaqs.length > 0 ? filteredFaqs : topic.faqs };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="bg-brand-bg min-h-screen py-10 md:py-14 select-none text-left transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header Hero */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-mono text-brand-accent font-bold tracking-widest uppercase mb-3 block">
            Customer Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-brand-text leading-tight tracking-tight">
            How can we help?
          </h1>
          <p className="text-sm text-brand-text-secondary mt-2 leading-relaxed max-w-lg mx-auto font-normal">
            Search our knowledge base, explore categories, or review answers to frequently asked questions about EBOOKVALA.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mt-8">
            <SearchBox
              size="md"
              placeholder="Search help topics, guides, articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              onSubmit={(e) => e.preventDefault()}
              shortcutHint={false}
              aria-label="Search help center"
            />
          </div>
        </div>

        {/* Topics & Expandable Accordion Grid */}
        <div className="grid grid-cols-1 gap-8 mb-16">
          {filteredTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <div 
                key={topic.catIdx} 
                className="bg-brand-card border border-brand-border rounded-brand-card p-6 md:p-8 shadow-brand text-left"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3.5 mb-6 text-brand-text pb-4 border-b border-brand-border/60">
                  <div className="h-11 w-11 rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display">{topic.title}</h3>
                    <p className="text-xs text-brand-text-secondary mt-0.5 font-normal">{topic.desc}</p>
                  </div>
                </div>

                {/* Expandable Accordion List */}
                <div className="flex flex-col gap-3">
                  {topic.faqs.map((faq, faqIdx) => {
                    const faqKey = `${topic.catIdx}-${faqIdx}`;
                    const isExpanded = expandedFaq === faqKey;
                    return (
                      <div 
                        key={faqIdx}
                        className="border border-brand-border rounded-xl bg-brand-bg-secondary/40 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(faqKey)}
                          className="w-full flex items-center justify-between p-4 text-xs sm:text-sm font-bold text-brand-text hover:text-brand-accent text-left transition-colors cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-brand-accent transform rotate-180 transition-transform" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-brand-text-secondary transition-transform" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 text-xs sm:text-sm text-brand-text-secondary leading-relaxed font-normal border-t border-brand-border/40 pt-3 bg-brand-card select-text">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Popular Quick Guides */}
        <div className="mb-16 md:mb-20">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-6 font-mono">Popular Guides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "Export to e-readers", desc: "Read your free digital books on any e-reader or Kindle device.", icon: Download },
              { title: "Understand user analytics", desc: "Learn how eBook downloads and reader reach metrics are structured.", icon: Award },
              { title: "Account verifications", desc: "Set up passwords, update bios, and run email verification checks.", icon: User },
            ].map((guide, idx) => {
              const GuideIcon = guide.icon;
              return (
                <div key={idx} className="border border-brand-border rounded-[20px] p-6 bg-brand-card shadow-brand text-left">
                  <GuideIcon className="h-5 w-5 text-brand-accent mb-3" />
                  <h4 className="text-xs font-bold text-brand-text mb-1.5">{guide.title}</h4>
                  <p className="text-xs text-brand-text-secondary leading-relaxed font-normal">{guide.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Ticket CTA */}
        <div className="border border-brand-border rounded-brand-card p-8 md:p-12 bg-brand-bg-secondary flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-brand-text mb-2">Still need help?</h3>
            <p className="text-sm text-brand-text-secondary leading-relaxed font-normal">
              If our FAQ lists don't resolve your question, please submit a customer ticket directly to EBOOKVALA support.
            </p>
          </div>
          <Link to="/contact">
            <Button variant="primary" className="h-11 px-6 text-xs font-bold rounded-full flex items-center gap-2 shrink-0 shadow-sm">
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default HelpCenter;
