import React from "react";
import { motion } from "framer-motion";
import { Users, Star, MessageSquare, Heart, Award, ArrowUpRight } from "lucide-react";

export const Community = ({ user }) => {
  // Mock community activities
  const reviews = [
    { id: 1, user: "Rohan Patel", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rohan", book: "Designing for Scale", rating: 5, time: "2 hours ago", content: "Absolutely wonderful read on scalability patterns. Helped me optimize my team's cloud infrastructure!" },
    { id: 2, user: "Amara Singh", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Amara", book: "Atmospheric Layers", rating: 4, time: "1 day ago", content: "A beautifully written descriptive piece on layers and modern styling frameworks. High fidelity layout advice!" }
  ];

  // Leaderboard of readers
  const leaders = [
    { rank: 1, name: "Prince Gajera", books: 42, hours: 120, photo: "https://api.dicebear.com/7.x/initials/svg?seed=Prince" },
    { rank: 2, name: "Rohan Gupta", books: 38, hours: 104, photo: "https://api.dicebear.com/7.x/initials/svg?seed=Rohan" },
    { rank: 3, name: "Amara Singh", books: 31, hours: 88, photo: "https://api.dicebear.com/7.x/initials/svg?seed=Amara" }
  ];

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text">Community Hub</h1>
        <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">
          Explore global reviews, discussions, and see top readers on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Discussion / Reviews Feed (Left 2 columns) */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border/70 rounded-[24px] p-6 shadow-brand flex flex-col gap-5">
          <div className="border-b border-brand-border/45 pb-3">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Recent Reviews</h3>
          </div>

          <div className="flex flex-col gap-4">
            {reviews.map((rev) => (
              <div 
                key={rev.id} 
                className="group flex flex-col gap-3 p-4 rounded-[18px] border border-brand-border/60 hover:border-brand-accent/25 bg-brand-bg-secondary/15 hover:bg-[#1a1a1c]/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-9 w-9 bg-brand-card border border-brand-border/60 rounded-full overflow-hidden shrink-0">
                      <img src={rev.avatar} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-brand-text truncate leading-tight">{rev.user}</h4>
                      <p className="text-[9px] text-brand-text-secondary mt-0.5 font-mono uppercase tracking-wider font-bold">reviewed: "{rev.book}"</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[9px] text-brand-text-secondary">
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold"><Star className="h-3.5 w-3.5 fill-amber-500" /> {rev.rating.toFixed(1)}</span>
                    <span className="font-semibold text-[8px] uppercase tracking-widest mt-0.5">{rev.time}</span>
                  </div>
                </div>

                <p className="text-[11px] text-brand-text-secondary/90 leading-relaxed font-semibold">
                  "{rev.content}"
                </p>

                <div className="flex items-center gap-4 text-[9px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest mt-2 border-t border-brand-border/30 pt-2.5">
                  <button className="flex items-center gap-1 hover:text-brand-accent transition-colors cursor-pointer"><Heart className="h-3.5 w-3.5" /> Like</button>
                  <button className="flex items-center gap-1 hover:text-brand-accent transition-colors cursor-pointer"><MessageSquare className="h-3.5 w-3.5" /> Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reader Leaderboard (Right 1 column) */}
        <div className="bg-brand-card/40 backdrop-blur-md border border-brand-border/60 rounded-[24px] p-6 shadow-brand flex flex-col justify-between gap-5 h-full">
          <div>
            <div className="flex items-center gap-2 border-b border-brand-border/45 pb-2">
              <Users className="h-4.5 w-4.5 text-brand-accent shrink-0 animate-pulse" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Reader Leaderboard</h3>
            </div>
            
            <div className="flex flex-col gap-3.5 mt-5">
              {leaders.map((l) => (
                <div 
                  key={l.rank} 
                  className="flex items-center justify-between p-2.5 rounded-[16px] bg-brand-bg-secondary/40 border border-brand-border/40 hover:border-brand-accent/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono font-black text-brand-text-secondary w-4.5 text-center">{l.rank}</span>
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-brand-card border border-brand-border shrink-0">
                      <img src={l.photo} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-brand-text truncate leading-tight">{l.name}</h4>
                      <p className="text-[9px] text-brand-text-secondary mt-0.5 font-semibold font-mono uppercase">{l.books} Books completed</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end text-brand-accent">
                    <Award className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-bg-secondary/40 border border-brand-border/40 p-3 rounded-[16px] text-left">
            <p className="text-[10px] font-bold text-brand-text flex items-center gap-1 justify-between">
              <span>Weekly Reading Challenge</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-brand-accent" />
            </p>
            <p className="text-[9px] text-brand-text-secondary mt-1 leading-relaxed">
              Read 5 hours this week to earn the "Book Scholar" badge and boost your global leaderboard rank!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
