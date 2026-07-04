import React from "react";
import { motion } from "framer-motion";

const defaultBooks = [
  {
    id: 1,
    title: "Designing for Scale",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=280&h=420&fit=crop"
  }
];

export const HeroVisualV4 = ({ books = defaultBooks }) => {
  return (
    <div className="relative w-full max-w-[480px] h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center select-none overflow-visible">
      
      {/* Animated glowing backdrop circles matching the accent color (#007AFF) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full bg-brand-accent/20 blur-[60px] z-0 pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.1, 0.18, 0.1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] rounded-full bg-indigo-500/20 blur-[50px] z-0 pointer-events-none"
      />

      {/* Main Single Large Premium Book Cover */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ 
          opacity: 1, 
          y: [-10, 10, -10], // Elegant floating animation
          scale: 1 
        }}
        whileHover={{
          scale: 1.04,
          transition: { duration: 0.3 }
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          default: { duration: 0.8, ease: "easeOut" }
        }}
        className="relative w-[230px] sm:w-[270px] aspect-[2/3] rounded-[20px] overflow-hidden border border-brand-border/60 bg-brand-card shadow-brand-hover cursor-pointer z-10"
      >
        {/* Book cover graphic with shine & book spine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/10 pointer-events-none z-20" />
        
        {/* Left Book Spine vertical shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/30 to-transparent z-20" />
        <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/15 z-20" />

        {/* Screen/Paper Glare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10" />

        <img 
          src={books[0].cover} 
          alt={books[0].title} 
          className="w-full h-full object-cover select-none"
        />
      </motion.div>
    </div>
  );
};

export default HeroVisualV4;
