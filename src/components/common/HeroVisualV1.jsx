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

export const HeroVisualV1 = ({ books = defaultBooks }) => {
  return (
    <div className="relative w-full max-w-[480px] h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center select-none overflow-visible">
      {/* Background glow matching the brand's blue accent color */}
      <div className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full bg-brand-accent/10 blur-3xl z-0 pointer-events-none" />

      {/* Floating secondary book - Left (blurred, rotated) */}
      <motion.div
        initial={{ opacity: 0, x: -100, rotate: -22, scale: 0.8 }}
        animate={{ 
          opacity: 0.35, 
          x: -120, 
          rotate: -15, 
          scale: 0.85,
          y: [-5, 5, -5] 
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          default: { duration: 0.8, ease: "easeOut" }
        }}
        className="absolute left-1/2 -translate-x-1/2 w-[160px] sm:w-[190px] aspect-[2/3] rounded-[14px] overflow-hidden border border-brand-border/40 shadow-brand filter blur-[2px] z-10 origin-bottom"
      >
        <img src={books[1].cover} alt={books[1].title} className="w-full h-full object-cover" />
      </motion.div>

      {/* Floating secondary book - Right (blurred, rotated) */}
      <motion.div
        initial={{ opacity: 0, x: 100, rotate: 22, scale: 0.8 }}
        animate={{ 
          opacity: 0.35, 
          x: 120, 
          rotate: 15, 
          scale: 0.85,
          y: [5, -5, 5] 
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          default: { duration: 0.8, ease: "easeOut" }
        }}
        className="absolute left-1/2 -translate-x-1/2 w-[160px] sm:w-[190px] aspect-[2/3] rounded-[14px] overflow-hidden border border-brand-border/40 shadow-brand filter blur-[2px] z-10 origin-bottom"
      >
        <img src={books[2].cover} alt={books[2].title} className="w-full h-full object-cover" />
      </motion.div>

      {/* Main Front Device Mockup (Sharp, clear, floating) */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: [-8, 8, -8],
          scale: 1 
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          default: { duration: 0.8, ease: "easeOut", delay: 0.1 }
        }}
        className="relative w-[210px] sm:w-[250px] aspect-[2/3] rounded-[24px] p-2 sm:p-2.5 bg-zinc-950 border-[5px] sm:border-[6px] border-zinc-900 shadow-brand-hover z-20"
      >
        {/* Device elements */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-zinc-800/80 z-30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-20 rounded-[18px]" />

        {/* Screen Content (Main book cover) */}
        <div className="w-full h-full rounded-[16px] sm:rounded-[18px] overflow-hidden relative bg-zinc-900">
          <img 
            src={books[0].cover} 
            alt={books[0].title} 
            className="w-full h-full object-cover select-none"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroVisualV1;
