import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ChevronDown, Sparkles, ArrowRight, Grid, List, RefreshCw } from "lucide-react";
import { dbService } from "../services/db";
import { BookGrid } from "../components/book/BookGrid";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { BookCardSkeleton } from "../components/ui/Skeleton";

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [books, setBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");
  const [view, setView] = useState("grid");

  // Fetch all published books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const data = await dbService.getBooks();
        const published = data.filter((b) => b.status === "published");
        setBooks(published);
      } catch (err) {
        console.error("Error loading books:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Filter & Sort results when query or books change
  useEffect(() => {
    if (!books.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      try {
        let filtered = [];
        if (query.trim()) {
          const lowerQuery = query.toLowerCase().trim();
          filtered = books.filter(
            (book) =>
              (book.title || "").toLowerCase().includes(lowerQuery) ||
              (book.subtitle || "").toLowerCase().includes(lowerQuery) ||
              (book.authorName || "").toLowerCase().includes(lowerQuery) ||
              (book.tags || []).some((tag) => (tag || "").toLowerCase().includes(lowerQuery)) ||
              (book.categories || []).some((cat) => (cat || "").toLowerCase().includes(lowerQuery))
          );
        } else {
          filtered = [...books];
        }

        // Sort Results
        if (sortBy === "newest") {
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === "popular") {
          filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        } else if (sortBy === "rating") {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setSearchResults(filtered);
      } catch (err) {
        console.error("SearchResults filter error:", err);
        setSearchResults(books);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [books, query, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 relative select-none">

      {/* Header Band */}
      <div className="text-left mb-8 pb-6 border-b border-brand-border">
        <span className="text-[10px] font-mono text-brand-accent font-bold tracking-widest uppercase mb-3 block">
          Search Results
        </span>
        <h1 className="text-3xl sm:text-[38px] font-display font-black text-brand-text tracking-tight flex flex-wrap items-center gap-2">
          <span>Results for</span>
          <span className="text-brand-accent">"{query}"</span>
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-secondary mt-2 font-semibold">
          Found {searchResults.length} matching {searchResults.length === 1 ? "eBook" : "eBooks"} in our catalog
        </p>
      </div>

      {/* Control Bar (Sort, View Toggles) */}
      {searchResults.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-brand-card border border-brand-border rounded-brand-card p-4 shadow-brand mb-8 select-none text-left">
          <div className="text-xs font-bold text-brand-text-secondary">
            Showing results filtered by search relevancy.
          </div>

          <div className="flex items-center gap-3 select-none justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-bg-secondary border border-brand-border text-brand-text text-xs rounded-full py-2 px-4 focus:outline-none focus:border-brand-accent cursor-pointer font-bold"
            >
              <option value="relevance">Relevance</option>
              <option value="popular">Popularity</option>
              <option value="newest">Newest Releases</option>
              <option value="rating">Top Rated</option>
            </select>

            <div className="flex items-center border border-brand-border rounded-full p-0.5 bg-brand-bg-secondary">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${view === "grid" ? "bg-brand-card text-brand-accent shadow-sm" : "text-brand-text-secondary hover:text-brand-text"
                  }`}
                aria-label="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${view === "list" ? "bg-brand-card text-brand-accent shadow-sm" : "text-brand-text-secondary hover:text-brand-text"
                  }`}
                aria-label="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid or Skeleton Content */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <BookGrid books={searchResults} view={view} />
      ) : (
        <div className="max-w-xl mx-auto py-6">
          <EmptyState
            title={`No results for "${query}"`}
            description="We couldn't find any books matching your query. Try checking for typos or browse our popular categories."
            actionLabel="Explore Library"
            onAction={() => { }}
          />

          {/* Suggestions List */}
          <div className="mt-10 border border-brand-border rounded-brand-card p-6 bg-brand-card shadow-brand text-left">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4 font-mono flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-accent" />
              Suggested Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {["Technology", "Business", "SaaS", "Design", "Database", "React", "AI"].map((term) => (
                <Link
                  key={term}
                  to={`/search?q=${encodeURIComponent(term)}`}
                  className="text-xs font-bold text-brand-text-secondary bg-brand-bg-secondary hover:bg-brand-bg border border-brand-border py-2 px-4 rounded-xl transition-all"
                >
                  {term}
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-brand-border text-center">
              <Link to="/marketplace" className="text-xs font-bold text-brand-accent hover:underline inline-flex items-center gap-1">
                Browse all categories
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SearchResults;
