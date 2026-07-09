import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Search, SlidersHorizontal, Grid, List, RefreshCw, 
  Trash2, Tag, ShieldCheck, Star, Sparkles, Clock, X, HelpCircle, ArrowRight
} from "lucide-react";
import { dbService } from "../services/db";
import { BookGrid } from "../components/book/BookGrid";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { BookCardSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { Modal } from "../components/ui/Modal";
import { SearchBox } from "../components/ui/SearchBox";

export const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("category") ? [searchParams.get("category")] : []
  );
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("best-selling");
  const [view, setView] = useState("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Search History & AutoSuggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState(
    JSON.parse(localStorage.getItem("eb_search_history")) || []
  );

  const searchContainerRef = useRef(null);

  // Sync Category from search queries
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategories([cat]);
  }, [searchParams]);

  // Click outside suggestions
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch published books
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await dbService.getBooks();
        // Normalize all book objects to ensure arrays are always arrays
        const normalized = data.map(b => ({
          ...b,
          categories: Array.isArray(b.categories) ? b.categories : [],
          tags: Array.isArray(b.tags) ? b.tags : [],
          format: Array.isArray(b.format) ? b.format : [],
          subtitle: b.subtitle || "",
          authorName: b.authorName || "",
          title: b.title || "",
        }));
        const published = normalized.filter((b) => b.status === "published");
        setBooks(published);
        setFilteredBooks(published);
      } catch (err) {
        console.error("Error loading books:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  // Filtering + Sorting Pipeline
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      try {
        let result = [...books];

        // Category filter
        if (selectedCategories.length > 0) {
          result = result.filter(book => 
            (book.categories || []).some(cat => selectedCategories.includes(cat))
          );
        }

        // Language filter
        if (selectedLanguages.length > 0) {
          result = result.filter(book => selectedLanguages.includes(book.language));
        }

        // Rating filter
        if (minRating > 0) {
          result = result.filter(book => (book.rating || 0) >= minRating);
        }

        // Format filter
        if (selectedFormats.length > 0) {
          result = result.filter(book => 
            (book.format || []).some(f => selectedFormats.includes(f))
          );
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          result = result.filter(book => 
            (book.title || "").toLowerCase().includes(query) ||
            (book.subtitle || "").toLowerCase().includes(query) ||
            (book.authorName || "").toLowerCase().includes(query) ||
            (book.tags || []).some(t => (t || "").toLowerCase().includes(query))
          );
        }

        // Sorting
        if (sortBy === "newest") {
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === "best-selling") {
          result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        } else if (sortBy === "top-rated") {
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setFilteredBooks(result);
        setVisibleCount(8);
      } catch (filterErr) {
        console.error("Filter pipeline error:", filterErr);
        setFilteredBooks(books);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [books, selectedCategories, selectedLanguages, minRating, selectedFormats, searchQuery, sortBy]);

  // Suggestions handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const matches = books
      .filter(b => b.title.toLowerCase().includes(query) || b.authorName.toLowerCase().includes(query))
      .slice(0, 5);
    setSuggestions(matches);
  }, [searchQuery, books]);

  const saveSearchQuery = (query) => {
    if (!query.trim()) return;
    let history = JSON.parse(localStorage.getItem("eb_search_history")) || [];
    history = history.filter(q => q !== query);
    history.unshift(query);
    history = history.slice(0, 5);
    setSearchHistory(history);
    localStorage.setItem("eb_search_history", JSON.stringify(history));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
    saveSearchQuery(title);
    setShowSuggestions(false);
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    localStorage.removeItem("eb_search_history");
    setSearchHistory([]);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleLanguageToggle = (lang) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleFormatToggle = (fmt) => {
    setSelectedFormats(prev => 
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedLanguages([]);
    setMinRating(0);
    setSelectedFormats([]);
    setSearchQuery("");
    setSortBy("best-selling");
    setSearchParams({});
  };

  const activeFiltersCount = selectedCategories.length + selectedLanguages.length + (minRating > 0 ? 1 : 0) + selectedFormats.length;

  const FiltersContent = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-accent" />
          <span className="text-sm font-bold text-brand-text">Library Filters</span>
        </div>
        <button 
          onClick={handleClearAll}
          className="text-xs font-semibold text-brand-text-secondary hover:text-brand-text transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div>
        <h5 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3 font-mono">Categories</h5>
        <div className="flex flex-col gap-2.5">
          {["Technology", "Business", "Self-Help", "Fiction", "Romance", "Design"].map((cat) => (
            <label key={cat} className="flex items-center gap-3 text-xs text-brand-text-secondary hover:text-brand-text cursor-pointer font-medium transition-colors">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
                className="rounded border-brand-border text-brand-accent focus:ring-brand-accent/15 h-4 w-4 cursor-pointer accent-brand-accent"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h5 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3 font-mono">Language</h5>
        <div className="flex flex-col gap-2.5">
          {["English", "Hindi"].map((lang) => (
            <label key={lang} className="flex items-center gap-3 text-xs text-brand-text-secondary hover:text-brand-text cursor-pointer font-medium transition-colors">
              <input
                type="checkbox"
                checked={selectedLanguages.includes(lang)}
                onChange={() => handleLanguageToggle(lang)}
                className="rounded border-brand-border text-brand-accent focus:ring-brand-accent/15 h-4 w-4 cursor-pointer accent-brand-accent"
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div>
        <h5 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3 font-mono">Minimum Rating</h5>
        <div className="flex flex-col gap-2.5">
          {[4, 3].map((stars) => (
            <label key={stars} className="flex items-center gap-3 text-xs text-brand-text-secondary hover:text-brand-text cursor-pointer font-medium transition-colors">
              <input
                type="radio"
                name="rating-filter"
                checked={minRating === stars}
                onChange={() => setMinRating(stars)}
                className="border-brand-border text-brand-accent focus:ring-brand-accent/15 h-4 w-4 cursor-pointer accent-brand-accent"
              />
              <span className="flex items-center gap-1">
                {stars}★ &amp; above
              </span>
            </label>
          ))}
          <label className="flex items-center gap-3 text-xs text-brand-text-secondary hover:text-brand-text cursor-pointer font-medium transition-colors">
            <input
              type="radio"
              name="rating-filter"
              checked={minRating === 0}
              onChange={() => setMinRating(0)}
              className="border-brand-border text-brand-accent focus:ring-brand-accent/15 h-4 w-4 cursor-pointer accent-brand-accent"
            />
            <span>Any rating</span>
          </label>
        </div>
      </div>

      {/* Format */}
      <div>
        <h5 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3 font-mono">Formats Available</h5>
        <div className="flex flex-col gap-2.5">
          {["PDF", "EPUB"].map((fmt) => (
            <label key={fmt} className="flex items-center gap-3 text-xs text-brand-text-secondary hover:text-brand-text cursor-pointer font-medium transition-colors">
              <input
                type="checkbox"
                checked={selectedFormats.includes(fmt)}
                onChange={() => handleFormatToggle(fmt)}
                className="rounded border-brand-border text-brand-accent focus:ring-brand-accent/15 h-4 w-4 cursor-pointer accent-brand-accent"
              />
              <span>{fmt} Files</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 relative select-none">
      
      {/* Page Hero Header */}
      <div className="text-left mb-10 pb-8 border-b border-brand-border">
        <span className="text-[10px] font-mono text-brand-accent font-bold tracking-widest uppercase mb-3 block">
          Digital Catalog
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-black text-brand-text tracking-tight">
          Explore Library
        </h1>
        <p className="text-sm text-brand-text-secondary mt-2 max-w-xl font-normal leading-relaxed">
          Access our open digital library of premium developer editions, SaaS design architectures, and founder-focused self-help books. 100% free forever for the first year.
        </p>
      </div>
      {/* Mobile-Native Swipeable Category chips */}
      <div className="lg:hidden w-full overflow-x-auto flex gap-2 pb-4 mb-3 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6 select-none">
        {["Technology", "Business", "Self-Help", "Fiction", "Romance", "Design"].map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => handleCategoryToggle(cat)}
              className={`snap-center shrink-0 text-xs font-bold px-4 py-2 rounded-full border transition-all active-tap cursor-pointer ${
                isSelected 
                  ? "bg-brand-primary text-brand-bg border-brand-primary" 
                  : "bg-brand-card text-brand-text-secondary border-brand-border hover:border-brand-text"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* LEFT SIDEBAR FILTERS (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-3 bg-brand-card border border-brand-border rounded-brand-card p-6 sticky top-24 shadow-brand select-none text-left">
          <FiltersContent />
        </aside>

        {/* MAIN CONTENT AREA */}
        <section className="lg:col-span-9 flex flex-col gap-6">
          
          {/* Top Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-brand-card border border-brand-border rounded-brand-card p-4 shadow-brand select-none text-left">
            
            {/* Instant Search Bar */}
            <div ref={searchContainerRef} className="relative flex-grow max-w-md">
              <SearchBox
                size="md"
                placeholder="Search by title, author, or tags..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                onClear={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                onSubmit={(e) => { e.preventDefault(); saveSearchQuery(searchQuery); setShowSuggestions(false); }}
                shortcutHint={false}
                aria-label="Search the library"
                showSuggestions={showSuggestions && (searchQuery.trim().length > 0 || searchHistory.length > 0)}
                suggestions={
                  <div className="select-none">
                    {/* Search History */}
                    {searchHistory.length > 0 && !searchQuery.trim() && (
                      <div className="mb-1">
                        <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Recent Searches</span>
                          <button onClick={clearHistory} className="hover:text-brand-text transition-colors cursor-pointer font-mono text-[9px]">Clear</button>
                        </div>
                        {searchHistory.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleHistoryClick(q)}
                            className="w-full text-left px-3 py-2 text-xs text-brand-text hover:bg-brand-bg-secondary rounded-xl transition-colors cursor-pointer truncate font-medium block"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    {suggestions.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-brand-accent" /> Suggested eBooks
                        </div>
                        {suggestions.map((book) => (
                          <button
                            key={book.id}
                            onClick={() => handleSuggestionClick(book.title)}
                            className="w-full text-left px-3 py-2 text-xs text-brand-text hover:bg-brand-bg-secondary rounded-xl transition-colors cursor-pointer flex items-center justify-between font-medium"
                          >
                            <span className="truncate">{book.title}</span>
                            <span className="text-[9px] text-brand-text-secondary/70 shrink-0 ml-2">by {book.authorName}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchQuery.trim() && suggestions.length === 0 && (
                      <div className="px-3 py-3 text-xs text-brand-text-secondary italic text-center">
                        No matching titles found.
                      </div>
                    )}
                  </div>
                }
              />
            </div>

            {/* Sorting and view options */}
            <div className="flex items-center justify-between sm:justify-end gap-3 select-none w-full sm:w-auto">
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 bg-brand-bg-secondary border border-brand-border text-brand-text text-xs rounded-full py-2 px-4 focus:outline-none cursor-pointer font-bold active-tap"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="h-4.5 w-4.5 rounded-full bg-brand-accent text-white text-[9.5px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-brand-bg-secondary border border-brand-border text-brand-text text-xs rounded-full py-2 px-4 focus:outline-none focus:border-brand-accent cursor-pointer font-bold"
                >
                  <option value="best-selling">Popularity</option>
                  <option value="newest">Newest Releases</option>
                  <option value="top-rated">Top Rated</option>
                </select>

                {/* View options */}
                <div className="flex items-center border border-brand-border rounded-full p-0.5 bg-brand-bg-secondary">
                  <button
                    onClick={() => setView("grid")}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      view === "grid" ? "bg-brand-card text-brand-accent shadow-sm" : "text-brand-text-secondary hover:text-brand-text"
                    }`}
                    aria-label="Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      view === "list" ? "bg-brand-card text-brand-accent shadow-sm" : "text-brand-text-secondary hover:text-brand-text"
                    }`}
                    aria-label="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Active Filters list */}
          {(selectedCategories.length > 0 || selectedLanguages.length > 0 || minRating > 0 || selectedFormats.length > 0 || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider font-mono mr-1">Active:</span>
              {selectedCategories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[11px] font-bold px-2.5 py-0.5 rounded-full select-none">
                  {cat}
                  <button onClick={() => handleCategoryToggle(cat)} className="hover:text-brand-text-secondary transition-colors cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {selectedLanguages.map(lang => (
                <span key={lang} className="inline-flex items-center gap-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-text text-[11px] font-bold px-2.5 py-0.5 rounded-full select-none">
                  {lang}
                  <button onClick={() => handleLanguageToggle(lang)} className="hover:text-brand-accent transition-colors cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 text-amber-500 text-[11px] font-bold px-2.5 py-0.5 rounded-full select-none">
                  {minRating}★ &amp; above
                  <button onClick={() => setMinRating(0)} className="hover:text-brand-accent transition-colors cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedFormats.map(fmt => (
                <span key={fmt} className="inline-flex items-center gap-1 bg-brand-bg-secondary border border-brand-border text-brand-text text-[11px] font-bold px-2.5 py-0.5 rounded-full select-none">
                  {fmt}
                  <button onClick={() => handleFormatToggle(fmt)} className="hover:text-brand-accent transition-colors cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-brand-bg-secondary border border-brand-border text-brand-text text-[11px] font-bold px-2.5 py-0.5 rounded-full select-none">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-brand-accent transition-colors cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button onClick={handleClearAll} className="text-[10px] font-bold text-brand-text-secondary hover:text-brand-text hover:underline transition-colors ml-1 cursor-pointer">
                Clear all
              </button>
            </div>
          )}

          {/* Book grid/list container */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredBooks.length > 0 ? (
            <>
              <BookGrid books={filteredBooks.slice(0, visibleCount)} view={view} />
              
              {visibleCount < filteredBooks.length && (
                <div className="flex justify-center mt-10">
                  <Button 
                    onClick={() => setVisibleCount(prev => prev + 8)} 
                    variant="secondary" 
                    className="h-11 px-8 rounded-full text-xs font-bold border-brand-border bg-brand-bg-secondary hover:bg-brand-bg text-brand-text flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    Load More eBooks
                    <ArrowRight className="h-4 w-4 text-brand-accent" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState 
              title="No matching eBooks found"
              description="Adjust your filters, search criteria, or category selection to find what you're looking for."
              actionLabel="Reset All Filters"
              onAction={handleClearAll}
            />
          )}

        </section>

      </div>

      {/* Mobile-Native Bottom Sheet Filters Drawer */}
      <Modal
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        title="Filter Library"
        className="max-w-md"
      >
        <div className="pb-6">
          <FiltersContent />
          <Button 
            onClick={() => setIsMobileFiltersOpen(false)}
            variant="primary" 
            className="w-full h-12 rounded-full text-xs font-bold mt-8 shadow-sm"
          >
            Apply Filters
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default Marketplace;
