import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Compass, Trophy, Star } from "lucide-react";
import { Button } from "../components/ui/Button";

export const OurMission = () => {
  const milestones = [
    {
      quarter: "Q1 2026",
      title: "Core Infrastructure & Open Library",
      desc: "Launched EBOOKVALA with 10,000+ curated developer guides and business playbooks. Established a 100% ad-free experience."
    },
    {
      quarter: "Q2 2026",
      title: "Interactive AI Learning Canvas",
      desc: "Released inline AI tutor prompts, chapter summary Outlines, and revision Flashcards built directly into the digital reader."
    },
    {
      quarter: "Q3 2026",
      title: "Social Study Rooms & Shared Annotations",
      desc: "Enabling readers to share highlights, outline public study roadmaps, and write detailed book reviews in real time."
    },
    {
      quarter: "Q4 2026",
      title: "Self-Publishing Engine v2",
      desc: "Empowering authors with high-fidelity ePUB rendering, analytics pipelines, and optional reader support channels."
    }
  ];

  return (
    <div className="bg-brand-bg min-h-screen py-10 md:py-14 select-none text-left transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Page Hero */}
        <div className="mb-12 text-center md:text-left">
          <span className="text-[10px] font-mono text-brand-accent font-bold tracking-widest uppercase mb-3 block">
            Our Mission
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-brand-text leading-[1.1] tracking-tight">
            Curating knowledge, <br />protecting your focus.
          </h1>
          <p className="text-base sm:text-lg text-brand-text-secondary mt-6 leading-relaxed max-w-2xl font-normal">
            EBOOKVALA was founded on a simple conviction: the best tech and business guides deserve a beautiful, open sanctuary where readers can focus without paywalls, noisy ads, or sign-up tricks.
          </p>
        </div>

        {/* Narrative Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16 border-y border-brand-border py-12">
          
          <div className="flex flex-col gap-3.5">
            <div className="h-10 w-10 rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-bold font-display text-brand-text">Why We Exist</h3>
            <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed font-normal">
              Modern self-directed learning is broken. Search results are bloated with SEO-optimized clickbait, content farms, and aggressive monthly paywalls. Finding a high-quality, comprehensive reference document requires fighting popups and cookies. EBOOKVALA exists to clear the noise and provide a quiet space where you can read, learn, and grow at your own pace.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="h-10 w-10 rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
              <Trophy className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-bold font-display text-brand-text">Where We're Headed</h3>
            <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed font-normal">
              We are building the world's most trusted open-source platform for engineering documentation, SaaS strategies, and cognitive science books. EBOOKVALA isn't just about host files; it's about context. We are integrating advanced visual outlining tools, spaced repetition algorithms, and offline-first interfaces to turn reading into permanent retention.
            </p>
          </div>

        </div>

        {/* Roadmap / Milestones */}
        <div className="mb-16">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-8 font-mono">Platform Roadmap</h3>
          <div className="relative pl-6 border-l border-brand-border flex flex-col gap-10">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="relative group text-left">
                {/* Timeline node */}
                <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-brand-border bg-brand-bg group-hover:border-brand-accent transition-colors duration-300 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-border group-hover:bg-brand-accent transition-colors duration-300" />
                </div>
                
                <span className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-widest">
                  {milestone.quarter}
                </span>
                <h4 className="text-sm font-bold text-brand-text mt-1">{milestone.title}</h4>
                <p className="text-xs sm:text-sm text-brand-text-secondary mt-2 leading-relaxed font-normal max-w-xl">
                  {milestone.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="border border-brand-border rounded-brand-card p-8 md:p-12 bg-brand-bg-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-brand-text mb-2">Support our open-library vision</h3>
            <p className="text-sm text-brand-text-secondary leading-relaxed font-normal">
              Browse our catalog of developer-focused ebooks and SaaS guides. Start reading for free today.
            </p>
          </div>
          <div className="flex gap-3 shrink-0 w-full sm:w-auto">
            <Link to="/marketplace" className="flex-grow sm:flex-initial">
              <Button variant="primary" className="h-11 w-full px-6 text-xs font-bold rounded-full flex items-center justify-center gap-2 shadow-sm">
                Browse Library
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OurMission;
