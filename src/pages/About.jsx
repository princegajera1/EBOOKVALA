import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, HeartHandshake, Eye } from "lucide-react";
import { Button } from "../components/ui/Button";
import princeAvatar from "../assets/testimonials/prince.png";
import amaraAvatar from "../assets/testimonials/amara.png";

export const About = () => {
  const values = [
    {
      title: "Focus Over Noise",
      desc: "Reading requires absolute presence. EBOOKVALA has no display banner ads, no cookie-cutter clickbait popups, and no aggressive upgrade banners.",
      icon: Eye
    },
    {
      title: "AI as a Companion, Not a Writer",
      desc: "We don't support AI-generated content spam. Our AI tools—like inline tutor lookups and dynamic study flashcards—are built to help you digest books, not automate writing.",
      icon: Sparkles
    },
    {
      title: "Clean Typography & Layouts",
      desc: "A book shouldn't look like a cluttered spreadsheet. We invest heavy engineering effort into beautiful web typesets, dark modes, and high-fidelity rendering.",
      icon: Shield
    },
    {
      title: "Open Access Guarantee",
      desc: "Knowledge should be accessible. EBOOKVALA is committed to keeping its core library 100% free with open downloads and direct community reviews.",
      icon: HeartHandshake
    }
  ];

  const team = [
    {
      name: "Prince Gajera",
      role: "Founder & Lead Architect",
      quote: "I built EBOOKVALA out of frustration. I wanted a modern reader that wasn't bloated with popups and allowed clean ePUB formatting.",
      image: princeAvatar
    },
    {
      name: "Prince Bhanderi",
      role: "Social Media Executive",
      quote: "Amplifying our message and growing the EBOOKVALA community. I focus on keeping our social presence clean, helpful, and engaging across all platforms, connecting curious minds with high-fidelity knowledge.",
      image: amaraAvatar
    }
  ];

  return (
    <div className="bg-brand-bg min-h-screen py-10 md:py-14 select-none text-left transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header Hero Section */}
        <div className="mb-12 md:mb-16">
          <span className="text-[10px] font-mono text-brand-accent font-bold tracking-widest uppercase mb-3 block">
            Our Story & Values
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-brand-text leading-[1.1] tracking-tight">
            We build digital sanctuaries for people who love technical depth.
          </h1>
          <p className="text-base sm:text-lg text-brand-text-secondary mt-6 leading-relaxed max-w-3xl font-normal">
            EBOOKVALA isn't another generic digital bookstore. We are a team of software engineers, creators, and voracious readers building an open digital library that respects your focus.
          </p>
        </div>

        {/* Story Section: Problem -> Insight -> Solution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-16 md:mb-20 border-y border-brand-border py-12">
          
          {/* Narrative (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6 text-left">
            <h2 className="text-xl font-bold font-display text-brand-text">How EBOOKVALA Was Sparked</h2>
            
            <div className="space-y-4 text-xs sm:text-sm text-brand-text-secondary leading-relaxed font-normal">
              <p>
                <strong className="text-brand-text font-bold block mb-1">The Friction (Problem)</strong>
                Finding high-quality technical guides online has become painful. Popular digital libraries are cluttered with intrusive banner advertisements, cookie-cutter popups, or aggressive paywall redirections. Getting a clean layout for offline reading requires jumping through hoops.
              </p>
              
              <p>
                <strong className="text-brand-text font-bold block mb-1">The Spark (Insight)</strong>
                Deep reading requires uninterrupted space. A web-based reader shouldn't feel like a social feed designed to steal your attention. It should behave like a piece of quiet hardware—loading quickly, rendering sharp typography, and keeping distractions at zero.
              </p>
              
              <p>
                <strong className="text-brand-text font-bold block mb-1">The Sanctuary (Solution)</strong>
                We built EBOOKVALA. A premium, 100% free open-access digital library. We curate the best titles in SaaS, database architectures, user experience design, and self-mastery, offering high-fidelity offline PDF downloads and intelligent in-reader AI tools to help you review, memorize, and outline as you learn.
              </p>
            </div>
          </div>

          {/* Quick Stats Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-6 bg-brand-bg-secondary p-8 rounded-brand-card border border-brand-border shadow-sm">
            <div>
              <p className="text-3xl sm:text-4xl font-mono font-bold text-brand-text">10,000+</p>
              <p className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider mt-1">eBooks Cataloged</p>
            </div>
            <div className="h-[1px] bg-brand-border" />
            <div>
              <p className="text-3xl sm:text-4xl font-mono font-bold text-brand-text">50,000+</p>
              <p className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider mt-1">Active Readers</p>
            </div>
            <div className="h-[1px] bg-brand-border" />
            <div>
              <p className="text-3xl sm:text-4xl font-mono font-bold text-brand-text">100%</p>
              <p className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider mt-1">Free & Ad-Free</p>
            </div>
          </div>
          
        </div>

        {/* Company Values */}
        <div className="mb-16 md:mb-20">
          <h2 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-8 font-mono">Company Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="flex gap-4 p-6 bg-brand-card border border-brand-border rounded-brand-card shadow-brand hover:shadow-brand-hover transition-all duration-300">
                  <div className="h-10 w-10 rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">{val.title}</h3>
                    <p className="text-xs sm:text-sm text-brand-text-secondary mt-2 leading-relaxed font-normal">{val.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16 md:mb-20">
          <h2 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-8 font-mono">Behind the Code</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 bg-brand-card border border-brand-border rounded-brand-card shadow-brand">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-brand-border shrink-0 bg-brand-bg-secondary">
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-sm font-bold text-brand-text">{member.name}</h3>
                  <p className="text-[10px] text-brand-accent font-bold mt-1 uppercase tracking-wider">{member.role}</p>
                  <p className="text-xs text-brand-text-secondary mt-3 leading-relaxed italic font-normal">
                    "{member.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="border border-brand-border rounded-brand-card p-8 md:p-12 bg-brand-bg-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-brand-text mb-2">Ready to explore EBOOKVALA?</h3>
            <p className="text-sm text-brand-text-secondary leading-relaxed font-normal">
              Check out our complete, ad-free library of premium digital guides across engineering, product design, and business logic.
            </p>
          </div>
          <div className="flex gap-3 shrink-0 w-full sm:w-auto">
            <Link to="/marketplace" className="flex-1 sm:flex-initial">
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

export default About;
