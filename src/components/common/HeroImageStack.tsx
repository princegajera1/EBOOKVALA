import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import local photography assets
import lifestyleImg from "../../assets/hero/lifestyle.png";
import dramaticImg from "../../assets/hero/dramatic.png";
import atmosphericImg from "../../assets/hero/atmospheric.png";

// Interface for stack images
export interface ImageItem {
  id: string | number;
  url: string;
  alt?: string;
  tagLeft?: string;
  tagRight?: string;
}

export interface HeroImageStackProps {
  images?: ImageItem[];
}

const defaultImages: ImageItem[] = [
  {
    id: "lifestyle",
    url: lifestyleImg,
    alt: "Cozy reading lifestyle",
    tagLeft: "EPUB · FREE",
    tagRight: "★ 4.9"
  },
  {
    id: "dramatic",
    url: dramaticImg,
    alt: "Dramatic fanning book pages",
    tagLeft: "PDF · OPEN",
    tagRight: "NEW"
  },
  {
    id: "atmospheric",
    url: atmosphericImg,
    alt: "Atmospheric library bookshelves",
    tagLeft: "STUDY · AI",
    tagRight: "BEST"
  }
];

export const HeroImageStack: React.FC<HeroImageStackProps> = ({ images = defaultImages }) => {
  // State containing the sorted deck of cards (bottom-to-top rendering index order)
  const [deck, setDeck] = useState<ImageItem[]>(() => [...images]);
  
  // Track the card ID that just cycled from top to bottom
  const [prevTopId, setPrevTopId] = useState<string | number | null>(null);

  // Hover and 3D tilt tracking states
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Generate fixed random rotations once per card ID to keep layouts clean and stable
  const rotations = useMemo(() => {
    const rotMap: Record<string | number, number> = {};
    images.forEach((img) => {
      // Rotation value between -8 and +8 degrees
      rotMap[img.id] = Math.random() * 16 - 8;
    });
    return rotMap;
  }, [images]);

  // Cycle function to move the top card to the bottom of the deck
  const cycleDeck = useCallback(() => {
    setDeck((prevDeck) => {
      const nextDeck = [...prevDeck];
      const topCard = nextDeck.pop(); // Remove top card (last element in rendering order)
      if (topCard) {
        nextDeck.unshift(topCard); // Prepend to the bottom
        setPrevTopId(topCard.id); // Mark it as cycled
      }
      return nextDeck;
    });
  }, []);

  // Autoplay interval manager (3 seconds cycle, loops infinitely)
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      cycleDeck();
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, cycleDeck]);

  // Handle 3D tilt mouse movement calculations
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Normalize coordinates to values between -10 and +10 degrees
    const rotateX = ((yc - y) / yc) * 10;
    const rotateY = ((x - xc) / xc) * 10;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative w-full max-w-[240px] h-[360px] sm:max-w-[280px] sm:h-[420px] lg:max-w-[320px] lg:h-[480px] flex items-center justify-center select-none overflow-visible"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background glow matching the brand's blue accent color */}
      <div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full bg-brand-accent/10 blur-3xl z-0 pointer-events-none" />

      {/* Render the deck stack */}
      <AnimatePresence mode="popLayout">
        {deck.map((card, index) => {
          const isTop = index === deck.length - 1;
          const isCycling = card.id === prevTopId;
          const isInteractive = isTop && !isCycling;
          const rotationBase = rotations[card.id] || 0;

          // Target animation values based on card index/depth
          let animateProps: any = {
            scale: 0.82 + index * 0.045,
            y: (deck.length - 1 - index) * 12,
            x: (deck.length - 1 - index) * 6,
            opacity: 0.55 + index * 0.1125,
            rotateZ: rotationBase,
            rotateX: 0,
            rotateY: 0,
            zIndex: index
          };

          // Apple-style transition curve for general deck layout updates
          let transitionProps: any = {
            type: "tween",
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
          };

          // Override animations for the top card currently being hovered
          if (isTop && isHovered) {
            animateProps = {
              scale: 1.03, // Slight interactive scale hint on hover
              y: -5,
              x: 0,
              opacity: 1,
              rotateZ: rotationBase,
              rotateX: tilt.x,
              rotateY: tilt.y,
              zIndex: 15
            };
            transitionProps = {
              type: "spring",
              stiffness: 300,
              damping: 20
            };
          }

          // Override animations for the card cycling from top to bottom
          if (isCycling) {
            animateProps = {
              // Lift upward, scale up slightly, then settle to bottom index coordinates
              y: [0, -130, 48],
              x: [0, -10, 24],
              scale: [1, 1.03, 0.82],
              opacity: [1, 0.35, 0.55],
              rotateZ: [rotationBase, rotationBase + 8, rotationBase],
              rotateX: 0,
              rotateY: 0,
              zIndex: [10, 10, 0] // Keep high zIndex during initial lift, then drop
            };
            transitionProps = {
              duration: 0.5,
              times: [0, 0.4, 1],
              ease: [0.22, 1, 0.36, 1]
            };
          }

          return (
            <motion.div
              key={card.id}
              animate={animateProps}
              transition={transitionProps}
              style={{
                transformStyle: "preserve-3d",
              }}
              className={`absolute inset-0 rounded-[20px] overflow-hidden bg-brand-card border border-brand-border/40 select-none shadow-[0_20px_40px_rgba(0,0,0,0.18),_0_5px_15px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/50 ${
                isInteractive ? "cursor-pointer" : "pointer-events-none"
              }`}
              tabIndex={isInteractive ? 0 : -1}
              onClick={isInteractive ? cycleDeck : undefined}
              onKeyDown={isInteractive ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  cycleDeck();
                }
              } : undefined}
              // Remove cycle identifier once the animation completes
              onAnimationComplete={() => {
                if (isCycling) {
                  setPrevTopId(null);
                }
              }}
            >
              {/* Card visual glares & overlays */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none z-10" />
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/15 to-transparent z-10" />
              
              {/* PicSpot Glassmorphic Tag Overlays */}
              {card.tagLeft && (
                <div className="absolute top-3.5 left-3.5 z-20 backdrop-blur-md bg-black/45 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-[6px] uppercase tracking-wider select-none leading-none shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                  {card.tagLeft}
                </div>
              )}
              {card.tagRight && (
                <div className="absolute top-3.5 right-3.5 z-20 backdrop-blur-md bg-brand-accent/25 border border-brand-accent/30 text-brand-accent font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase select-none leading-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  {card.tagRight}
                </div>
              )}

              <img 
                src={card.url} 
                alt={card.alt || `Card ${card.id}`}
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default HeroImageStack;
