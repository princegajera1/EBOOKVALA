import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, Briefcase, Brain, Feather, Heart, Compass } from "lucide-react";

export const CategoriesSection = () => {
  const navigate = useNavigate();

  const categories = [
    { label: "Technology", icon: Cpu, bookCount: "240 Books" },
    { label: "Business", icon: Briefcase, bookCount: "180 Books" },
    { label: "Self-Help", icon: Brain, bookCount: "150 Books" },
    { label: "Fiction", icon: Feather, bookCount: "120 Books" },
    { label: "Romance", icon: Heart, bookCount: "95 Books" },
    { label: "Design", icon: Compass, bookCount: "110 Books" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: index * 0.05, 
        duration: 0.25, 
        ease: "easeInOut" 
      }
    })
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 w-full select-none">
      {categories.map((cat, idx) => {
        const Icon = cat.icon;
        return (
          <motion.button
            key={idx}
            custom={idx}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            whileHover={{ 
              y: -4, 
              borderColor: "#000000",
              boxShadow: "var(--shadow-brand-hover)"
            }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={() => navigate(`/marketplace?category=${encodeURIComponent(cat.label)}`)}
            className="flex flex-col items-center justify-center py-8 px-5 bg-white border border-[#E5E7EB] rounded-brand-card shadow-brand transition-all duration-250 cursor-pointer group w-full"
          >
            {/* Icon Container - 56x56px, circular, soft gray bg */}
            <div className="w-14 h-14 rounded-full bg-[#F8FAFC] flex items-center justify-center mb-1 shrink-0 group-hover:scale-105 transition-transform duration-250">
              <Icon className="h-5.5 w-5.5 text-black" strokeWidth={2} />
            </div>
            
            {/* Category Label */}
            <span className="text-[15px] font-semibold text-black mt-4 text-center tracking-tight">
              {cat.label}
            </span>

            {/* Book Count */}
            <span className="text-xs text-gray-400 mt-1 text-center font-medium">
              {cat.bookCount}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoriesSection;
