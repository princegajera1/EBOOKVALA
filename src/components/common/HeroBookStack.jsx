import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const defaultHeroBooks = [
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
  },
  {
    id: 5,
    title: "Think Again",
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=280&h=420&fit=crop&crop=center"
  }
];

const positions = [
  { rotate: -18, x: -110, y: 30, scale: 0.78, opacity: 0.45 },
  { rotate: -9,  x: -55,  y: 12, scale: 0.87, opacity: 0.68 },
  { rotate: -1,  x: 0,    y: 0,  scale: 1.00, opacity: 1.00 },
  { rotate: 9,   x: 55,   y: 12, scale: 0.87, opacity: 0.68 },
  { rotate: 18,  x: 110,  y: 30, scale: 0.78, opacity: 0.45 },
];

export const HeroBookStack = ({ books = defaultHeroBooks, sizeClass = "h-[360px] sm:h-[440px] lg:h-[520px]" }) => {
  const [activeIdx, setActiveIdx] = useState(2);
  const containerRef = useRef(null);

  // Scroll Parallax Effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={`relative flex items-center justify-center overflow-visible select-none scale-85 sm:scale-95 lg:scale-100 transition-transform ${sizeClass}`}
    >
      {/* Dynamic blurred backdrop glow */}
      <div className="absolute h-[340px] w-[340px] rounded-full bg-brand-accent/5 z-0 blur-2xl pointer-events-none" />
      
      {/* Floating Wrapper */}
      <motion.div 
        style={{ y: yParallax }}
        className="relative w-[210px] h-[315px] z-10"
      >
        {books.map((book, idx) => {
          const posIdx = (idx - activeIdx + 2 + 5) % 5;
          const pos = positions[posIdx];
          const zIndex = posIdx === 2 ? 5 : (posIdx === 1 || posIdx === 3 ? 3 : 1);
          const isActive = posIdx === 2;

          return (
            <motion.div
              key={book.id}
              onClick={() => setActiveIdx(idx)}
              animate={{ 
                opacity: pos.opacity, 
                x: pos.x, 
                rotate: pos.rotate, 
                scale: pos.scale,
                // Gentle infinite floating effect nested in active state
                y: isActive ? [pos.y, pos.y - 8, pos.y] : pos.y
              }}
              transition={{
                y: { 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "easeInOut"
                },
                default: { 
                  type: "spring", 
                  stiffness: 160, 
                  damping: 22
                }
              }}
              className="absolute inset-0 cursor-pointer origin-bottom"
              style={{ zIndex }}
            >
              <div 
                className={`w-[210px] aspect-[2/3] transition-all duration-300 relative ${
                  isActive 
                    ? "shadow-brand-hover border-[6px] border-zinc-950 bg-zinc-900 rounded-[22px] scale-103" 
                    : "shadow-brand border border-brand-border rounded-[18px] bg-brand-card hover:border-brand-border/80"
                } overflow-hidden`}
              >
                {isActive && (
                  <>
                    {/* Tablet Bezel details: Top Camera Dot */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-zinc-800/80 z-20" />
                    {/* Glossy screen glare reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10" />
                  </>
                )}
                
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover select-none"
                  loading="lazy"
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default HeroBookStack;
