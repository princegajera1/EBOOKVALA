import React from "react";
import { motion } from "framer-motion";

const defaultBooks = [
  {
    id: 1,
    title: "Designing for Scale",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=280&h=420&fit=crop"
  },
  {
    id: 2,
    title: "Zero to $10M ARR",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=280&h=420&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "The Minimalist UI",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=280&h=420&fit=crop&crop=center"
  }
];

export const HeroVisualV5 = ({ books = defaultBooks }) => {
  return (
    <div className="relative w-full max-w-[480px] h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center select-none overflow-visible">
      {/* Background radial glow */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-3xl z-0 pointer-events-none" />

      {/* Floating Background book - Top Left */}
      <motion.div
        animate={{ 
          y: [-6, 6, -6],
          rotate: [-4, -2, -4]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-4 w-[100px] sm:w-[120px] aspect-[2/3] rounded-lg overflow-hidden border border-brand-border/40 shadow-brand opacity-30 z-10 filter blur-[0.5px]"
      >
        <img src={books[1].cover} alt={books[1].title} className="w-full h-full object-cover" />
      </motion.div>

      {/* Floating Background book - Bottom Right */}
      <motion.div
        animate={{ 
          y: [6, -6, 6],
          rotate: [6, 4, 6]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-4 w-[100px] sm:w-[120px] aspect-[2/3] rounded-lg overflow-hidden border border-brand-border/40 shadow-brand opacity-30 z-10 filter blur-[0.5px]"
      >
        <img src={books[2].cover} alt={books[2].title} className="w-full h-full object-cover" />
      </motion.div>

      {/* Center Open Book Element */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-[280px] sm:w-[340px] h-[190px] sm:h-[230px] z-20 flex justify-center items-center"
        style={{ perspective: "1000px" }}
      >
        
        {/* Underlay shadow for open book */}
        <div className="absolute bottom-[-15px] w-[90%] h-[15px] bg-black/30 rounded-full blur-[10px] z-0" />

        {/* The Open Book Base Structure */}
        <div className="relative w-full h-full bg-brand-card border border-brand-border rounded-[12px] flex shadow-brand-hover overflow-hidden z-10">
          
          {/* Left Page */}
          <div className="w-1/2 h-full bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-r border-zinc-200/50 dark:border-zinc-700/50 p-4 sm:p-5 flex flex-col justify-between text-left">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-3/4 bg-brand-accent/25 rounded-md" />
              <div className="h-2 w-full bg-brand-text-secondary/20 rounded-md" />
              <div className="h-2 w-full bg-brand-text-secondary/20 rounded-md" />
              <div className="h-2 w-5/6 bg-brand-text-secondary/20 rounded-md" />
              <div className="h-2 w-full bg-brand-text-secondary/20 rounded-md" />
            </div>
            <div className="h-1.5 w-1/4 bg-brand-text-secondary/35 rounded-md" />
          </div>

          {/* Right Page */}
          <div className="w-1/2 h-full bg-gradient-to-l from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-4 sm:p-5 flex flex-col justify-between text-left">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-1/2 bg-brand-success/20 rounded-md" />
              <div className="h-2 w-full bg-brand-text-secondary/20 rounded-md" />
              <div className="h-2 w-5/6 bg-brand-text-secondary/20 rounded-md" />
              <div className="h-2 w-full bg-brand-text-secondary/20 rounded-md" />
              <div className="h-2 w-2/3 bg-brand-text-secondary/20 rounded-md" />
            </div>
            <div className="h-1.5 w-1/4 bg-brand-text-secondary/35 rounded-md align-self-end ml-auto" />
          </div>

          {/* Spine Divider Shadow overlay */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-black/15 via-transparent to-black/15 pointer-events-none z-30" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-brand-border/40 z-30" />
        </div>

        {/* Flipping Page (3D Animated Page Sheet) */}
        <motion.div
          animate={{
            rotateY: [0, -180, -180, 0, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.45, 0.5, 0.95, 1]
          }}
          className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-zinc-100 to-zinc-200 dark:from-zinc-850 dark:to-zinc-800 border-l border-zinc-200/50 dark:border-zinc-700/50 p-4 sm:p-5 flex flex-col justify-between shadow-lg origin-left z-20"
          style={{ 
            backfaceVisibility: "hidden",
            transformStyle: "preserve-3d"
          }}
        >
          <div className="flex flex-col gap-2 text-left" style={{ transform: "rotateY(0deg)" }}>
            <div className="h-3 w-1/3 bg-brand-accent/20 rounded-md" />
            <div className="h-2 w-full bg-brand-text-secondary/25 rounded-md" />
            <div className="h-2 w-full bg-brand-text-secondary/25 rounded-md" />
            <div className="h-2 w-4/5 bg-brand-text-secondary/25 rounded-md" />
          </div>
          <div className="h-1.5 w-1/4 bg-brand-text-secondary/30 rounded-md ml-auto" />
        </motion.div>

        {/* Back face of flipping page (to render content when flipped to left side) */}
        <motion.div
          animate={{
            rotateY: [180, 0, 0, 180, 180]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.45, 0.5, 0.95, 1]
          }}
          className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-850 dark:to-zinc-800 border-r border-zinc-200/50 dark:border-zinc-700/50 p-4 sm:p-5 flex flex-col justify-between shadow-lg origin-right z-20"
          style={{ 
            backfaceVisibility: "hidden",
            transformStyle: "preserve-3d"
          }}
        >
          <div className="flex flex-col gap-2 text-left" style={{ transform: "rotateY(180deg)" }}>
            <div className="h-3 w-1/2 bg-indigo-500/20 rounded-md" />
            <div className="h-2 w-full bg-brand-text-secondary/25 rounded-md" />
            <div className="h-2 w-5/6 bg-brand-text-secondary/25 rounded-md" />
            <div className="h-2 w-full bg-brand-text-secondary/25 rounded-md" />
          </div>
          <div className="h-1.5 w-1/4 bg-brand-text-secondary/30 rounded-md" />
        </motion.div>

      </motion.div>
    </div>
  );
};

export default HeroVisualV5;
