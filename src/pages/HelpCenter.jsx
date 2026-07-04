import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, User, PenTool, Search, ArrowRight, FileText, Download, Award, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";

const topics = [
  { 
    title: "Getting Started", 
    desc: "Learn how to create a reader account, navigate categories, and build your digital library.", 
    icon: BookOpen,
    links: ["Creating an Account", "Supported devices and systems", "Reading streaks and daily achievements"]
  },
  { 
    title: "Reading & Library Tools", 
    desc: "Guides for using the e-reader, setting themes, highlighting text, and offline reading options.", 
    icon: ShieldCheck,
    links: ["How to use the inline AI Tutor", "Customizing themes (Sepia/Dark Mode)", "Downloading PDF files for offline reading"]
  },
  { 
    title: "My Account & Settings", 
    desc: "Manage profile settings, display names, email verification, and security tokens.", 
    icon: User,
    links: ["Updating your profile name", "Resetting a forgotten password", "Setting secure email verifications"]
  },
  { 
    title: "Publishing as Author", 
    desc: "Guides for writers uploading digital files, customizing metadata, and tracking reading metrics.", 
    icon: PenTool,
    links: ["Uploading PDF & EPUB files", "Understanding download analytics", "Creating custom AI outlines"]
  }
];

export const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-brand-bg min-h-screen py-20 md:py-28 select-none text-left transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <span className="text-[10px] font-mono text-brand-text-secondary font-bold tracking-widest uppercase mb-3 block">
            Help Center
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-brand-text leading-tight tracking-tight">
            Knowledge & Support
          </h1>
          <p className="text-sm text-brand-text-secondary mt-2 leading-relaxed max-w-lg mx-auto font-normal">
            Search our guides or browse categories below to find answers to common questions about EBOOKVALA.
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto mt-8">
            <input
              type="text"
              placeholder="Search help topics, guides, articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-bg-secondary border border-brand-border rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:bg-brand-card focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 text-brand-text font-medium transition-all"
            />
            <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-brand-text-secondary/60" />
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 md:mb-24">
          {filteredTopics.map((topic, idx) => {
            const Icon = topic.icon;
            return (
              <div 
                key={idx} 
                className="bg-brand-card border border-brand-border rounded-brand-card p-6 md:p-8 shadow-brand flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4 text-brand-text">
                    <div className="h-11 w-11 rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center shrink-0 shadow-sm">
                      <Icon className="h-5 w-5 text-brand-accent" />
                    </div>
                    <h3 className="text-base font-bold font-display">{topic.title}</h3>
                  </div>
                  
                  <p className="text-sm text-brand-text-secondary leading-relaxed mb-6 font-normal">
                    {topic.desc}
                  </p>

                  <ul className="flex flex-col gap-3.5">
                    {topic.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link 
                          to="/faq" 
                          className="text-xs text-brand-text-secondary hover:text-brand-text font-semibold flex items-center gap-2 group transition-colors"
                        >
                          <FileText className="h-4 w-4 text-brand-text-secondary/55 group-hover:text-brand-accent transition-colors shrink-0" />
                          <span>{link}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-brand-border">
                  <Link 
                    to="/faq" 
                    className="text-xs text-brand-text font-bold flex items-center gap-1 hover:underline"
                  >
                    View all articles
                    <ArrowRight className="h-3.5 w-3.5 text-brand-accent" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Popular Guides */}
        <div className="mb-16 md:mb-24">
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

        {/* Support CTA */}
        <div className="border border-brand-border rounded-brand-card p-8 md:p-12 bg-brand-bg-secondary flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-brand-text mb-2">Can't find what you need?</h3>
            <p className="text-sm text-brand-text-secondary leading-relaxed font-normal">
              If you still have questions or need support, reach out to our customer support team directly.
            </p>
          </div>
          <Link to="/contact">
            <Button variant="primary" className="h-11 px-6 text-xs font-bold rounded-full flex items-center gap-2 shrink-0 shadow-sm">
              Submit a Ticket
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default HelpCenter;
