import React, { useState } from "react";
import { 
  Star, Search, Sparkles, AlertTriangle, MessageSquare, ThumbsUp, 
  ThumbsDown, Pin, Heart, Send, Trash2, CheckCircle2, UserPlus, UserCheck
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

// Helper to determine mock sentiment analysis
const getMockSentiment = (text = "", rating = 5) => {
  const lowercaseText = text.toLowerCase();
  if (rating >= 4) {
    return {
      score: "Positive",
      color: "text-brand-success bg-brand-success/15 border-brand-success/20",
      summary: "Highly commends structural design patterns and readability values."
    };
  } else if (rating === 3) {
    return {
      score: "Neutral",
      color: "text-amber-500 bg-amber-500/15 border-amber-500/20",
      summary: "Notes strong introductory material but requests deeper code coverage."
    };
  } else {
    return {
      score: "Negative",
      color: "text-brand-danger bg-brand-danger/15 border-brand-danger/20",
      summary: "Critical of file resolution issues or missing code templates."
    };
  }
};

// Helper to determine mock spam status
const getMockSpamStatus = (text = "") => {
  const lowercaseText = text.toLowerCase();
  if (lowercaseText.includes("earn money") || lowercaseText.includes("click here") || lowercaseText.length < 5) {
    return { isSpam: true, label: "Suspected Spam", color: "text-brand-danger bg-brand-danger/10 border-brand-danger/20" };
  }
  return { isSpam: false, label: "Legit Verified", color: "text-brand-success bg-brand-success/10 border-brand-success/20" };
};

export const ReviewCenter = ({ 
  books = [], 
  reviews = [], 
  onReplyToReview, 
  onDeleteReply, 
  onRefresh 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [bookFilter, setBookFilter] = useState("all");
  
  // Local state extensions for reader interaction
  const [replyInputMap, setReplyInputMap] = useState({});
  const [pinnedReviewIds, setPinnedReviewIds] = useState([]);
  const [heartedReviewIds, setHeartedReviewIds] = useState([]);
  const [followedUserIds, setFollowedUserIds] = useState([]);
  const [reviewReactionCounts, setReviewReactionCounts] = useState({});

  const togglePin = (reviewId) => {
    if (pinnedReviewIds.includes(reviewId)) {
      setPinnedReviewIds(pinnedReviewIds.filter(id => id !== reviewId));
      toast.success("Comment unpinned from review top!");
    } else {
      setPinnedReviewIds([...pinnedReviewIds, reviewId]);
      toast.success("Comment pinned to top of book catalog reviews! 📌");
    }
  };

  const toggleHeart = (reviewId) => {
    if (heartedReviewIds.includes(reviewId)) {
      setHeartedReviewIds(heartedReviewIds.filter(id => id !== reviewId));
    } else {
      setHeartedReviewIds([...heartedReviewIds, reviewId]);
      toast.success("Author hearted reader feedback! 💖");
    }
  };

  const toggleFollowReader = (userId, userName) => {
    if (followedUserIds.includes(userId)) {
      setFollowedUserIds(followedUserIds.filter(id => id !== userId));
      toast.success(`Unfollowed reader ${userName}`);
    } else {
      setFollowedUserIds([...followedUserIds, userId]);
      toast.success(`Following reader ${userName}! 🤝`);
    }
  };

  const handleReaction = (reviewId, type) => {
    const key = `${reviewId}_${type}`;
    const currentCounts = { ...reviewReactionCounts };
    currentCounts[key] = (currentCounts[key] || 0) + 1;
    setReviewReactionCounts(currentCounts);
    toast.success(`Reacted with ${type}!`);
  };

  const handleReplySubmit = async (reviewId) => {
    const text = replyInputMap[reviewId];
    if (!text || !text.trim()) return;
    
    const toastId = toast.loading("Saving author reply...");
    try {
      await onReplyToReview(reviewId, text);
      toast.success("Reply posted successfully! 💬", { id: toastId });
      setReplyInputMap(prev => ({ ...prev, [reviewId]: "" }));
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Failed to post reply.", { id: toastId });
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch = 
      rev.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.bookTitle && rev.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesRating = ratingFilter === "all" || rev.rating === Number(ratingFilter);
    const matchesBook = bookFilter === "all" || rev.bookId === bookFilter;
    
    return matchesSearch && matchesRating && matchesBook;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-display font-black text-brand-text">Review & Reader Center</h1>
        <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
          Moderate review comments, view AI sentiment reports, check spam ratings, and directly engage readers.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-brand-card border border-brand-border rounded-[20px] shadow-sm select-none font-display">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary/50" />
          <input 
            type="text"
            placeholder="Search reviews or books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border pl-10 pr-4 py-2 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/50"
          />
        </div>

        {/* Rating Filter */}
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="bg-brand-bg border border-brand-border px-4 py-2 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars only</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        {/* Book filter */}
        <select
          value={bookFilter}
          onChange={(e) => setBookFilter(e.target.value)}
          className="bg-brand-bg border border-brand-border px-4 py-2 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
        >
          <option value="all">All eBooks</option>
          {books.map(b => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>

      </div>

      {/* Feed list */}
      {filteredReviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredReviews.map((rev) => {
            const sentiment = getMockSentiment(rev.comment, rev.rating);
            const spam = getMockSpamStatus(rev.comment);
            const isPinned = pinnedReviewIds.includes(rev.id);
            const isHearted = heartedReviewIds.includes(rev.id);
            const isFollowingReader = followedUserIds.includes(rev.userId);

            const likes = (rev.likes || 0) + (reviewReactionCounts[`${rev.id}_like`] || 0);
            const dislikes = (rev.dislikes || 0) + (reviewReactionCounts[`${rev.id}_dislike`] || 0);

            return (
              <div 
                key={rev.id}
                className={`p-5 bg-brand-card border rounded-[20px] shadow-sm relative transition-all ${
                  isPinned ? "border-brand-accent/50 bg-brand-accent/5" : "border-brand-border hover:border-brand-border-hover"
                }`}
              >
                
                {/* Pinned Indicator */}
                {isPinned && (
                  <div className="absolute top-4 right-4 bg-brand-accent text-white px-2.5 py-0.5 rounded-full z-10 flex items-center gap-1 select-none text-[9px] font-bold tracking-wider uppercase font-mono shadow-sm">
                    <Pin className="h-2.5 w-2.5 fill-white" /> Pinned
                  </div>
                )}

                {/* Reviewer Bio Row */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border border-brand-border overflow-hidden bg-brand-bg-secondary select-none">
                      <img 
                        src={rev.userPhotoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName)}`} 
                        alt="" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-brand-text font-display leading-tight">{rev.userName}</h4>
                        <span className="text-[10px] text-brand-text-secondary">• Reader</span>
                        
                        {/* Follow CTA */}
                        <button 
                          onClick={() => toggleFollowReader(rev.userId, rev.userName)}
                          className={`text-[9px] font-bold hover:underline flex items-center gap-0.5 cursor-pointer ${
                            isFollowingReader ? "text-brand-success" : "text-brand-accent"
                          }`}
                        >
                          {isFollowingReader ? (
                            <>
                              <UserCheck className="h-3 w-3" /> Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3" /> Follow
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-1 select-none">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${
                                i < rev.rating ? "fill-amber-400 text-amber-400" : "text-brand-border"
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-mono text-brand-text-secondary uppercase">
                          on <strong className="text-brand-text">{rev.bookTitle}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Sentiment Tags */}
                  <div className="flex flex-wrap gap-1.5 select-none mt-1 sm:mt-0 text-[9px] font-bold font-mono uppercase tracking-wider">
                    
                    {/* Sentiment Tag */}
                    <span className={`px-2 py-0.5 rounded border flex items-center gap-1 ${sentiment.color}`}>
                      <Sparkles className="h-2.5 w-2.5" /> Sentiment: {sentiment.score}
                    </span>

                    {/* Spam Tag */}
                    <span className={`px-2 py-0.5 rounded border flex items-center gap-1 ${spam.color}`}>
                      <AlertTriangle className="h-2.5 w-2.5" /> {spam.label}
                    </span>

                    <span className="px-2 py-0.5 bg-brand-bg-secondary border border-brand-border rounded text-brand-text-secondary">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-xs text-brand-text leading-relaxed text-left mt-3.5 italic bg-brand-bg-secondary/25 p-3 rounded-[12px] border border-brand-border/40">
                  "{rev.comment}"
                </p>

                {/* Sentiment Summary */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-brand-text-secondary text-left font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-brand-accent animate-pulse" />
                  <span>AI Insight: {sentiment.summary}</span>
                </div>

                {/* Interaction Row */}
                <div className="mt-4 pt-4 border-t border-brand-border/40 flex flex-wrap justify-between items-center gap-4 select-none">
                  
                  {/* Reaction Buttons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleReaction(rev.id, "like")}
                      className="px-2.5 py-1 rounded-full border border-brand-border text-[10px] font-bold text-brand-text hover:bg-brand-bg-secondary cursor-pointer flex items-center gap-1"
                    >
                      <ThumbsUp className="h-3 w-3" /> {likes}
                    </button>
                    <button 
                      onClick={() => handleReaction(rev.id, "dislike")}
                      className="px-2.5 py-1 rounded-full border border-brand-border text-[10px] font-bold text-brand-text hover:bg-brand-bg-secondary cursor-pointer flex items-center gap-1"
                    >
                      <ThumbsDown className="h-3 w-3" /> {dislikes}
                    </button>
                    <div className="w-px h-3 bg-brand-border mx-1" />
                    
                    {/* Author Heart */}
                    <button 
                      onClick={() => toggleHeart(rev.id)}
                      className={`p-1.5 rounded-full hover:bg-brand-bg-secondary cursor-pointer ${
                        isHearted ? "text-red-500" : "text-brand-text-secondary"
                      }`}
                      title={isHearted ? "Remove heart" : "Heart this comment as author"}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isHearted ? "fill-red-500 text-red-500" : ""}`} />
                    </button>

                    {/* Author Pin */}
                    <button 
                      onClick={() => togglePin(rev.id)}
                      className={`p-1.5 rounded-full hover:bg-brand-bg-secondary cursor-pointer ${
                        isPinned ? "text-brand-accent" : "text-brand-text-secondary"
                      }`}
                      title={isPinned ? "Unpin comment" : "Pin comment to top"}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Replies section toggles */}
                  <div>
                    <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> {rev.authorReply ? "1 Reply" : "0 Replies"}
                    </span>
                  </div>
                </div>

                {/* Reply render or Input */}
                {rev.authorReply ? (
                  <div className="mt-4 p-4 border-l-2 border-brand-accent bg-brand-bg-secondary/40 rounded-r-[12px] flex justify-between items-start">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[9px] font-bold text-brand-accent uppercase tracking-widest font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Author Reply
                      </span>
                      <p className="text-xs text-brand-text italic mt-1 font-medium">"{rev.authorReply}"</p>
                    </div>
                    <button
                      onClick={() => onDeleteReply(rev.id)}
                      className="text-brand-danger hover:bg-brand-danger/10 p-1.5 rounded-full select-none transition-colors cursor-pointer"
                      title="Delete Reply"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-brand-border/40 select-none text-left">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type reply to this reader..."
                        value={replyInputMap[rev.id] || ""}
                        onChange={(e) => setReplyInputMap({ ...replyInputMap, [rev.id]: e.target.value })}
                        className="flex-1 bg-brand-bg border border-brand-border px-4 py-2 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/50"
                      />
                      <Button 
                        onClick={() => handleReplySubmit(rev.id)}
                        disabled={!replyInputMap[rev.id]?.trim()}
                        variant="primary" 
                        size="sm" 
                        className="h-8 px-4 rounded-full text-xs font-bold shrink-0"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-brand-border rounded-[20px] bg-brand-card p-6 select-none font-display">
          <AlertCircle className="mx-auto h-9 w-9 text-brand-text-secondary opacity-60 mb-3" />
          <h3 className="text-sm font-bold text-brand-text">No Reviews Found</h3>
          <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Try adjusting your filters or keyword query.</p>
        </div>
      )}
    </div>
  );
};
export default ReviewCenter;
