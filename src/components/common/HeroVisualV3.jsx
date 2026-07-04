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

export const HeroVisualV3 = ({ books = defaultBooks }) => {
  return (
    <div className="relative w-full max-w-[480px] h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center select-none overflow-visible">
      {/* Shadow background */}
      <div className="absolute w-[280px] h-[280px] rounded-full bg-brand-accent/5 blur-3xl z-0 pointer-events-none" />

      {/* Stack Container with 3D Perspective */}
      <div 
        className="relative w-[220px] sm:w-[260px] aspect-[2/3] transition-all duration-500"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        
        {/* Book 1 (Bottom Book) */}
        <motion.div
          initial={{ opacity: 0, y: 120, rotateX: 55, rotateZ: -35, scale: 0.95 }}
          animate={{ opacity: 0.6, y: 80, rotateX: 55, rotateZ: -35, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 rounded-lg overflow-hidden bg-zinc-800 border border-brand-border/30 shadow-2xl origin-center"
          style={{ 
            transformStyle: "preserve-3d",
            boxShadow: "-15px 15px 30px rgba(0,0,0,0.4)"
          }}
        >
          {/* Cover image */}
          <img src={books[2].cover} alt={books[2].title} className="w-full h-full object-cover opacity-80" />
          {/* Fake paper edge */}
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-zinc-300 border-l border-zinc-400" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-zinc-400 border-t border-zinc-500" />
        </motion.div>

        {/* Book 2 (Middle Book) */}
        <motion.div
          initial={{ opacity: 0, y: 80, rotateX: 55, rotateZ: -35, scale: 0.98 }}
          animate={{ opacity: 0.8, y: 40, rotateX: 55, rotateZ: -35, scale: 0.98 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="absolute inset-0 rounded-lg overflow-hidden bg-zinc-900 border border-brand-border/40 shadow-2xl origin-center"
          style={{ 
            transformStyle: "preserve-3d",
            boxShadow: "-20px 20px 35px rgba(0,0,0,0.5)"
          }}
        >
          <img src={books[1].cover} alt={books[1].title} className="w-full h-full object-cover opacity-90" />
          {/* Fake paper edge */}
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-zinc-300 border-l border-zinc-400" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-zinc-400 border-t border-zinc-500" />
        </motion.div>

        {/* Book 3 (Top Book - Main, Floating & Hoverable) */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 55, rotateZ: -35, scale: 1 }}
          animate={{ 
            opacity: 1, 
            y: [0, -6, 0], // Gentle float
            rotateX: 55, 
            rotateZ: -35, 
            scale: 1 
          }}
          whileHover={{
            y: -24,
            scale: 1.03,
            transition: { duration: 0.3, y: { type: "spring", stiffness: 120 } }
          }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            default: { duration: 0.7, ease: "easeOut", delay: 0.2 }
          }}
          className="absolute inset-0 rounded-lg bg-zinc-950 border border-brand-border shadow-2xl cursor-pointer origin-center"
          style={{ 
            transformStyle: "preserve-3d",
            boxShadow: "-30px 30px 50px rgba(0,0,0,0.6)"
          }}
        >
          {/* Front cover glare reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10" />
          
          <img src={books[0].cover} alt={books[0].title} className="w-full h-full object-cover" />

          {/* Realistic 3D Thickness side page edges */}
          {/* Right Edge (Pages) */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-3 bg-zinc-100 border-l border-zinc-300 origin-right"
            style={{ 
              transform: "rotateY(90deg) translateZ(1px)",
              backgroundImage: "linear-gradient(to bottom, #d4d4d8 50%, #e4e4e7 50%)",
              backgroundSize: "100% 2px"
            }} 
          />
          {/* Bottom Edge (Pages) */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-3 bg-zinc-200 border-t border-zinc-300 origin-bottom"
            style={{ 
              transform: "rotateX(-90deg) translateZ(1px)",
              backgroundImage: "linear-gradient(to right, #d4d4d8 50%, #e4e4e7 50%)",
              backgroundSize: "2px 100%"
            }} 
          />
        </motion.div>

      </div>
    </div>
  );
};

export default HeroVisualV3;
