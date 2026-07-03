import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { dbService } from "../../services/db";
import { toast } from "react-hot-toast";

// High-quality placeholder author to ensure we always have at least 4 cards
const PLACEHOLDER_AUTHORS = [
  {
    uid: "placeholder-1",
    displayName: "Dr. Kabir Sharma",
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Dr. Kabir Sharma is a cognitive scientist and author who writes extensively on mindfulness, focus, and peak cognitive performance in the digital era.",
    specialty: "Self-Help & Mindset",
    followersCount: "1.8K",
    booksCount: 5,
    isVerified: true
  }
];

export const AuthorsSection = () => {
  const [authors, setAuthors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthors = async () => {
      const allAuthors = await dbService.getAuthors();
      
      // Map specialties based on seeded authors
      const mappedAuthors = allAuthors.map(author => {
        let specialty = "Writing & Tech";
        if (author.uid === "author-1") specialty = "Software Engineering";
        if (author.uid === "author-2") specialty = "Business & Strategy";
        if (author.uid === "author-3") specialty = "Mindfulness & Wellness";
        
        // Format followers and books counts
        const followersCount = author.followers.length >= 1000 
          ? `${(author.followers.length / 1000).toFixed(1)}K`
          : `${author.followers.length}`;
        
        return {
          ...author,
          specialty,
          followersCount,
          booksCount: author.uid === "author-1" ? 5 : author.uid === "author-2" ? 3 : 3
        };
      });

      // If we have less than 4, pad with placeholder authors
      let finalAuthors = [...mappedAuthors];
      if (finalAuthors.length < 4) {
        const needed = 4 - finalAuthors.length;
        finalAuthors = [...finalAuthors, ...PLACEHOLDER_AUTHORS.slice(0, needed)];
      }

      setAuthors(finalAuthors);
    };
    fetchAuthors();
  }, []);

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
      {authors.map((author, idx) => (
        <motion.div
          key={author.uid}
          custom={idx}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          whileHover={{ 
            y: -6, 
            borderColor: "#000000", 
            boxShadow: "var(--shadow-brand-hover)" 
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-white border border-[#E5E7EB] rounded-brand-card p-6 flex flex-col items-center justify-between text-center group transition-all duration-250 shadow-brand"
        >
          <div className="flex flex-col items-center w-full">
            {/* Avatar: 80px circle, border: 2px solid black/5 */}
            <div className="relative h-20 w-20 mb-3">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-[#F8FAFC] border border-[#E5E7EB]">
                <img 
                  src={author.photoURL} 
                  alt={author.displayName} 
                  className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-250" 
                />
              </div>
              {author.isVerified && (
                <div className="absolute bottom-0 right-0 z-10 bg-black text-white rounded-full h-5 w-5 border-2 border-white shadow-sm flex items-center justify-center select-none">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                </div>
              )}
            </div>

            {/* Author Name */}
            <h4 className="font-display font-bold text-[17px] text-black leading-tight mt-3 text-center">
              {author.displayName}
            </h4>

            {/* Specialty Badge */}
            <div className="mt-2.5">
              <span className="inline-block bg-[#F8FAFC] border border-[#E5E7EB] text-black rounded-full px-3.5 py-1 text-[11px] font-bold tracking-tight select-none">
                {author.specialty}
              </span>
            </div>

            {/* Stats row */}
            <div className="text-[11px] text-gray-400 font-mono font-semibold mt-2.5 select-none">
              {author.followersCount} Followers &bull; {author.booksCount} Books
            </div>

            {/* Divider */}
            <div className="w-full border-t border-[#F1F5F9] my-4" />

            {/* Bio */}
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 text-center max-w-[220px] font-normal">
              {author.bio}
            </p>
          </div>

          {/* Button row */}
          <div className="mt-5 w-full flex items-center justify-between gap-4 select-none">
            <button 
              className="w-[48%] h-9 bg-black text-white hover:bg-zinc-900 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                toast.success(`Following ${author.displayName}`);
              }}
            >
              Follow
            </button>
            <Link 
              to={`/marketplace?author=${encodeURIComponent(author.displayName)}`}
              className="text-black text-xs font-bold hover:underline cursor-pointer w-[48%] text-center"
              onClick={(e) => e.stopPropagation()}
            >
              View Books
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AuthorsSection;
