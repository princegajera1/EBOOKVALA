import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Feather, Globe, Brain, UserCheck, Palette, TrendingUp, ArrowRight 
} from "lucide-react";
import { dbService } from "../../services/db";

export const BENTO_CATEGORIES = [
  {
    id: "fiction",
    title: "Fiction",
    slug: "Fiction",
    description: "Immersive stories, novels, sci-fi, fantasy, and narrative prose.",
    icon: Feather,
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  },
  {
    id: "non-fiction",
    title: "Non-Fiction",
    slug: "Non-Fiction",
    description: "Science, technology, philosophy, history, and real-world knowledge.",
    icon: Globe,
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  },
  {
    id: "self-help",
    title: "Self Help",
    slug: "Self-Help",
    description: "Building habits, high performance, focus, productivity, and mindset.",
    icon: Brain,
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  },
  {
    id: "biography",
    title: "Biography",
    slug: "Biography",
    description: "Inspiring life stories of visionary leaders, founders, and icons.",
    icon: UserCheck,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  },
  {
    id: "comic",
    title: "Comic",
    slug: "Comic",
    description: "Graphic novels, manga, illustrated stories, and visual art.",
    icon: Palette,
    gradient: "from-pink-500/10 via-pink-500/5 to-transparent",
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20"
  },
  {
    id: "business-finance",
    title: "Business & Finance",
    slug: "Business",
    description: "Wealth creation, entrepreneurship, investing, strategy, and leadership.",
    icon: TrendingUp,
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
  }
];

export const BentoCategoriesSection = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const books = await dbService.getBooks();
        const published = books.filter(b => b.status === "published");
        
        const categoryMap = {
          "fiction": 0,
          "non-fiction": 0,
          "self-help": 0,
          "biography": 0,
          "comic": 0,
          "business-finance": 0
        };

        // Calculate 100% REAL live count of published books in database
        published.forEach(book => {
          const rawCats = Array.isArray(book.categories) 
            ? book.categories 
            : (book.category ? [book.category] : []);
          const bookCats = rawCats.map(c => (c || "").toString().toLowerCase());

          BENTO_CATEGORIES.forEach(cat => {
            const catTitle = cat.title.toLowerCase();
            const catSlug = cat.slug.toLowerCase();
            
            const isMatch = bookCats.some(c => {
              if (c === catTitle || c === catSlug) return true;
              if (cat.id === "fiction" && (c.includes("fiction") && !c.includes("non"))) return true;
              if (cat.id === "non-fiction" && (c.includes("non-fiction") || c.includes("tech") || c.includes("design") || c.includes("science"))) return true;
              if (cat.id === "self-help" && (c.includes("self") || c.includes("productivity") || c.includes("mind"))) return true;
              if (cat.id === "biography" && (c.includes("bio") || c.includes("autobio") || c.includes("history"))) return true;
              if (cat.id === "comic" && (c.includes("comic") || c.includes("manga") || c.includes("graphic"))) return true;
              if (cat.id === "business-finance" && (c.includes("business") || c.includes("finance") || c.includes("startups"))) return true;
              return false;
            });

            if (isMatch) {
              categoryMap[cat.id] = (categoryMap[cat.id] || 0) + 1;
            }
          });
        });

        setCounts(categoryMap);
      } catch (err) {
        console.warn("Error calculating dynamic category counts:", err);
      }
    };

    fetchCategoryCounts();
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 select-none text-left">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 border border-brand-accent/20 px-3.5 py-1.5 rounded-full inline-block">
          CURATED LIBRARY
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-brand-text mt-4 tracking-tight">
          Explore EbookVala Categories
        </h2>
        <p className="text-xs sm:text-base text-brand-text-secondary mt-3 font-normal leading-relaxed">
          Handpicked collections structured for deep learning, professional growth, and personal mastery.
        </p>
      </div>

      {/* Responsive Bento Grid: 3 columns on mobile, tablet & desktop */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-6">
        {BENTO_CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const count = counts[cat.id] !== undefined ? counts[cat.id] : 0;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/marketplace?category=${encodeURIComponent(cat.slug)}`)}
              className="relative group bg-brand-card border border-brand-border rounded-[18px] sm:rounded-[24px] p-2.5 sm:p-6 shadow-brand hover:shadow-brand-hover hover:border-brand-accent/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              {/* Subtle Dotted Background Texture */}
              <div 
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none" 
                style={{
                  backgroundImage: `radial-gradient(var(--text) 1px, transparent 1px)`,
                  backgroundSize: "16px 16px"
                }}
              />

              {/* Top Header: Icon & eBook Count Badge */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between z-10 mb-2 sm:mb-5 gap-1.5 sm:gap-3">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-brand-bg-secondary border border-brand-border flex items-center justify-center text-brand-accent group-hover:scale-105 group-hover:border-brand-accent/40 transition-all duration-300 shadow-sm shrink-0">
                  <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <span className={`text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border shadow-sm shrink-0 whitespace-nowrap ${cat.badgeColor}`}>
                  {count} <span className="hidden sm:inline">eBooks</span>
                </span>
              </div>

              {/* Title & Short Description */}
              <div className="z-10 flex-1 flex flex-col justify-start">
                <h3 className="text-xs sm:text-lg font-bold text-brand-text group-hover:text-brand-accent transition-colors font-display tracking-tight leading-snug">
                  {cat.title}
                </h3>
                <p className="text-[10px] sm:text-sm text-brand-text-secondary mt-1 sm:mt-2 leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
                  {cat.description}
                </p>
              </div>

              {/* Bottom Link */}
              <div className="z-10 pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-brand-border/60 flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-brand-accent group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Explore <span className="hidden sm:inline">Books</span>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>

              {/* Soft Gradient Glow at Bottom */}
              <div className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t ${cat.gradient} pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default BentoCategoriesSection;
