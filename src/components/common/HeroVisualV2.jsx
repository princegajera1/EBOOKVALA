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
  },
  {
    id: 4,
    title: "Atomic Habits",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=280&h=420&fit=crop&crop=center"
  }
];

export const HeroVisualV2 = ({ books = defaultBooks }) => {
  return (
    <div className="relative w-full max-w-[480px] h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center select-none overflow-visible">
      {/* Glow effect */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-3xl z-0 pointer-events-none" />

      {/* Grid of fanned book covers */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Book 1: Top-Left (Smaller, tilted) */}
        <motion.div
          initial={{ opacity: 0, x: -140, y: -90, rotate: -12, scale: 0.8 }}
          animate={{ opacity: 0.85, x: -120, y: -70, rotate: -8, scale: 0.85 }}
          whileHover={{ scale: 0.95, rotate: -2, zIndex: 30, transition: { duration: 0.2 } }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-[120px] sm:w-[150px] aspect-[2/3] rounded-xl overflow-hidden border border-brand-border bg-brand-card shadow-brand cursor-pointer z-10"
        >
          <img src={books[1].cover} alt={books[1].title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Book 2: Bottom-Left (Medium, tilted) */}
        <motion.div
          initial={{ opacity: 0, x: -130, y: 70, rotate: 6, scale: 0.8 }}
          animate={{ opacity: 0.9, x: -100, y: 60, rotate: 4, scale: 0.9 }}
          whileHover={{ scale: 1.0, rotate: 0, zIndex: 30, transition: { duration: 0.2 } }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="absolute w-[130px] sm:w-[160px] aspect-[2/3] rounded-xl overflow-hidden border border-brand-border bg-brand-card shadow-brand cursor-pointer z-10"
        >
          <img src={books[2].cover} alt={books[2].title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Book 3: Top-Right (Medium, tilted) */}
        <motion.div
          initial={{ opacity: 0, x: 120, y: -80, rotate: 10, scale: 0.8 }}
          animate={{ opacity: 0.9, x: 90, y: -50, rotate: 6, scale: 0.9 }}
          whileHover={{ scale: 1.0, rotate: 0, zIndex: 30, transition: { duration: 0.2 } }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="absolute w-[130px] sm:w-[160px] aspect-[2/3] rounded-xl overflow-hidden border border-brand-border bg-brand-card shadow-brand cursor-pointer z-10"
        >
          <img src={books[3].cover} alt={books[3].title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Book 4: Center-Right / Foreground (Main, larger, slightly tilted, prominent shadow) */}
        <motion.div
          initial={{ opacity: 0, x: 20, y: 10, rotate: -4, scale: 0.95 }}
          animate={{ opacity: 1, x: 10, y: 10, rotate: -2, scale: 1 }}
          whileHover={{ scale: 1.05, rotate: 0, zIndex: 30, transition: { duration: 0.2 } }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="absolute w-[160px] sm:w-[200px] aspect-[2/3] rounded-2xl overflow-hidden border border-brand-border bg-brand-card shadow-brand-hover cursor-pointer z-20"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/5 pointer-events-none z-10" />
          <img src={books[0].cover} alt={books[0].title} className="w-full h-full object-cover" />
        </motion.div>

      </div>
    </div>
  );
};

export default HeroVisualV2;
