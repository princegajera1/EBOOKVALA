import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, ShieldCheck, Heart, BookOpen, Users, Compass, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";

export const About = () => {
  const stats = [
    { label: "Active Readers", value: "50K+" },
    { label: "Curated eBooks", value: "10K+" },
    { label: "Independent Authors", value: "400+" },
    { label: "Total Downloads", value: "100K+" },
  ];

  const values = [
    { 
      title: "Reader-First Experience", 
      desc: "A distraction-free reading experience crafted with modern design and crisp typography.",
      icon: BookOpen 
    },
    { 
      title: "Author Empowerment", 
      desc: "Providing writers with a high-performance publishing engine, transparent reading analytics, and shared community reviews.",
      icon: Users 
    },
    { 
      title: "100% Free Open Access", 
      desc: "An open digital library with no paywall overlays, subscriptions, or checkout fees.",
      icon: ShieldCheck 
    },
  ];

  return (
    <div className="bg-white min-h-screen py-16 select-none text-left">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Typographic Hero */}
        <div className="mb-16">
          <span className="text-[10px] font-mono text-gray-400 font-bold tracking-widest uppercase mb-3 block">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-black leading-[1.1] tracking-tight">
            EBOOKVALA is a quiet sanctuary for voracious readers.
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mt-6 leading-relaxed max-w-2xl">
            We believe that great books deserve a beautiful space. EBOOKVALA was founded to bridge the gap between brilliant independent authors and passionate readers looking for premium digital editions.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-[#E5E7EB] py-10 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <p className="text-3xl sm:text-4xl font-mono font-bold text-black">{stat.value}</p>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="flex-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-brand-card p-8">
            <h3 className="text-lg font-bold text-black mb-3">Our Mission</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              To empower creators by providing them with the tools, distribution, and fair revenue shares they need to make a living from their writing, while giving readers an unparalleled digital reading experience.
            </p>
          </div>
          <div className="flex-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-brand-card p-8">
            <h3 className="text-lg font-bold text-black mb-3">Our Vision</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              To become the world's most trusted and beautiful independent digital bookstore, where quality triumphs over quantity and every book is treated as a masterpiece.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-8">Company Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-black shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-black">{val.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="border border-[#E5E7EB] rounded-brand-card p-8 md:p-12 bg-[#F8FAFC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-black mb-2">Ready to start reading?</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Explore our curated library of premium eBooks across tech, business, design, and self-help.
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="primary" className="h-11 px-6 text-xs font-bold rounded-full flex items-center gap-2 shrink-0">
              Browse Books
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default About;
