import React, { useState } from "react";
import { 
  Eye, Edit, Trash2, Copy, FileText, CheckSquare, Square, 
  Archive, Upload, Pin, ChevronRight, BookOpen, AlertCircle,
  Search, ArrowUpDown, Filter, Star
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const LibraryManagement = ({ 
  books = [], 
  onEditBook, 
  onDuplicateBook, 
  onDeleteBook, 
  onUpdateBookStatus,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastUpdated"); // lastUpdated | title | downloads | reads

  // Custom pinned state (stored in local storage as a mock user preference, or fallback to book property)
  const [pinnedBookIds, setPinnedBookIds] = useState(() => {
    try {
      const saved = localStorage.getItem("pinned_books");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const togglePin = (bookId) => {
    let nextPinned;
    if (pinnedBookIds.includes(bookId)) {
      nextPinned = pinnedBookIds.filter(id => id !== bookId);
      toast.success("eBook unpinned from dashboard!");
    } else {
      nextPinned = [...pinnedBookIds, bookId];
      toast.success("eBook pinned to dashboard top!");
    }
    setPinnedBookIds(nextPinned);
    localStorage.setItem("pinned_books", JSON.stringify(nextPinned));
  };

  // Derive counts for tabs
  const getCount = (status) => {
    if (status === "all") return books.length;
    if (status === "pinned") return books.filter(b => pinnedBookIds.includes(b.id)).length;
    if (status === "featured") return books.filter(b => b.isFeatured).length;
    return books.filter(b => b.status === status).length;
  };

  const statuses = [
    { id: "all", label: "All Books" },
    { id: "published", label: "Published" },
    { id: "draft", label: "Drafts" },
    { id: "archived", label: "Archived" },
    { id: "private", label: "Private" },
    { id: "pinned", label: "Pinned" },
    { id: "featured", label: "Featured" }
  ];

  // Filter books based on status tab & search query
  const filteredBooks = books.filter(b => {
    // 1. Status Filter
    let statusMatch = true;
    if (selectedStatus === "pinned") statusMatch = pinnedBookIds.includes(b.id);
    else if (selectedStatus === "featured") statusMatch = !!b.isFeatured;
    else if (selectedStatus !== "all") statusMatch = b.status === selectedStatus;

    // 2. Search query Match
    let searchMatch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      searchMatch = b.title.toLowerCase().includes(q) || 
                    (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
                    (b.language && b.language.toLowerCase().includes(q));
    }

    return statusMatch && searchMatch;
  }).sort((a, b) => {
    // 3. Sort Order
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "downloads") return (b.downloadCount || 0) - (a.downloadCount || 0);
    if (sortBy === "reads") return (b.readCount || 0) - (a.readCount || 0);
    // default/lastUpdated
    return new Date(b.releaseDate || b.createdAt || 0) - new Date(a.releaseDate || a.createdAt || 0);
  });

  // Checkbox handlers
  const toggleSelectAll = () => {
    if (selectedBookIds.length === filteredBooks.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(filteredBooks.map(b => b.id));
    }
  };

  const toggleSelectBook = (id) => {
    if (selectedBookIds.includes(id)) {
      setSelectedBookIds(selectedBookIds.filter(bid => bid !== id));
    } else {
      setSelectedBookIds([...selectedBookIds, id]);
    }
  };

  // Bulk Actions
  const handleBulkPublish = async () => {
    if (selectedBookIds.length === 0) return;
    const toastId = toast.loading(`Publishing ${selectedBookIds.length} books...`);
    try {
      for (const id of selectedBookIds) {
        await onUpdateBookStatus(id, "published");
      }
      toast.success(`Published ${selectedBookIds.length} books!`, { id: toastId });
      setSelectedBookIds([]);
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Bulk publish failed.", { id: toastId });
    }
  };

  const handleBulkArchive = async () => {
    if (selectedBookIds.length === 0) return;
    const toastId = toast.loading(`Archiving ${selectedBookIds.length} books...`);
    try {
      for (const id of selectedBookIds) {
        await onUpdateBookStatus(id, "archived");
      }
      toast.success(`Archived ${selectedBookIds.length} books!`, { id: toastId });
      setSelectedBookIds([]);
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Bulk archive failed.", { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBookIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete these ${selectedBookIds.length} eBooks permanently?`)) return;
    const toastId = toast.loading(`Deleting ${selectedBookIds.length} books...`);
    try {
      for (const id of selectedBookIds) {
        const bookObj = books.find(b => b.id === id);
        if (bookObj) await onDeleteBook(bookObj);
      }
      toast.success(`Deleted ${selectedBookIds.length} books!`, { id: toastId });
      setSelectedBookIds([]);
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Bulk deletion failed.", { id: toastId });
    }
  };

  const handleBulkPin = () => {
    if (selectedBookIds.length === 0) return;
    const newPinned = [...new Set([...pinnedBookIds, ...selectedBookIds])];
    setPinnedBookIds(newPinned);
    localStorage.setItem("pinned_books", JSON.stringify(newPinned));
    toast.success(`Pinned ${selectedBookIds.length} books!`);
    setSelectedBookIds([]);
  };

  return (
    <div className="flex flex-col gap-6 text-left select-none font-display">
      <div>
        <h1 className="text-2xl font-display font-black text-brand-text">Library Catalog</h1>
        <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
          Manage your publishing catalog, set visibility, drafts, and perform bulk operations on rows.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-brand-border">
        {statuses.map((tab) => {
          const count = getCount(tab.id);
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setSelectedBookIds([]);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive 
                  ? "border-brand-accent bg-brand-accent/10 text-brand-accent font-black shadow-sm" 
                  : "border-transparent text-brand-text-secondary hover:bg-brand-bg-secondary hover:text-brand-text"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-brand-accent/25 text-brand-accent" : "bg-brand-bg-secondary text-brand-text-secondary"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters: Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-brand-card border border-brand-border p-3 rounded-[20px] shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary opacity-60" />
          <input
            type="text"
            placeholder="Search by title, subtitle, language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border pl-10 pr-4 py-2 text-xs rounded-full focus:outline-none focus:border-brand-accent placeholder:text-brand-text-secondary/50 text-brand-text font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto font-mono text-[10px] font-bold text-brand-text-secondary uppercase select-none">
          <ArrowUpDown className="h-4 w-4 text-brand-text-secondary shrink-0" />
          <span>Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-brand-bg border border-brand-border px-3 py-1.5 text-[11px] rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold cursor-pointer"
          >
            <option value="lastUpdated">Last Updated</option>
            <option value="title">Title (A-Z)</option>
            <option value="downloads">Downloads count</option>
            <option value="reads">Reads count</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedBookIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-[16px] text-brand-text select-none animate-fade-in gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-accent bg-brand-accent/15 px-2.5 py-1 rounded-full font-mono">
              {selectedBookIds.length} Selected
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={handleBulkPublish}
              className="px-3.5 py-1.5 text-[11px] font-bold rounded-full bg-brand-accent text-white flex items-center gap-1.5 hover:scale-[1.02] transition-transform cursor-pointer shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" /> Publish
            </button>
            <button 
              onClick={handleBulkArchive}
              className="px-3.5 py-1.5 text-[11px] font-bold rounded-full border border-brand-border bg-brand-card text-brand-text flex items-center gap-1.5 hover:bg-brand-bg-secondary cursor-pointer"
            >
              <Archive className="h-3.5 w-3.5" /> Archive
            </button>
            <button 
              onClick={handleBulkPin}
              className="px-3.5 py-1.5 text-[11px] font-bold rounded-full border border-brand-border bg-brand-card text-brand-text flex items-center gap-1.5 hover:bg-brand-bg-secondary cursor-pointer"
            >
              <Pin className="h-3.5 w-3.5" /> Pin
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 text-[11px] font-bold rounded-full bg-brand-danger/10 text-brand-danger border border-brand-danger/25 flex items-center gap-1.5 hover:bg-brand-danger/20 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* SaaS Library Table */}
      {filteredBooks.length > 0 ? (
        <div className="bg-brand-card border border-brand-border rounded-[24px] shadow-sm overflow-hidden select-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-secondary font-bold uppercase tracking-wider font-mono text-[9px] bg-brand-bg-secondary/20">
                  <th className="p-4 w-10 text-center">
                    <button 
                      onClick={toggleSelectAll}
                      className="p-1 rounded hover:bg-black/5 text-brand-text"
                    >
                      {selectedBookIds.length === filteredBooks.length ? (
                        <CheckSquare className="h-4.5 w-4.5 text-brand-accent" />
                      ) : (
                        <Square className="h-4.5 w-4.5 opacity-60" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Cover</th>
                  <th className="p-4">Title & Description</th>
                  <th className="p-4">Language</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Downloads</th>
                  <th className="p-4 text-right">Reads</th>
                  <th className="p-4 text-right">Bookmarks</th>
                  <th className="p-4 text-center">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/30 font-semibold text-brand-text-secondary">
                {filteredBooks.map((book) => {
                  const isSelected = selectedBookIds.includes(book.id);
                  const isPinned = pinnedBookIds.includes(book.id);
                  
                  return (
                    <tr 
                      key={book.id} 
                      className={`hover:bg-brand-bg-secondary/15 transition-colors ${
                        isSelected ? "bg-brand-accent/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleSelectBook(book.id)}
                          className="p-1 rounded hover:bg-black/5 text-brand-text"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4.5 w-4.5 text-brand-accent" />
                          ) : (
                            <Square className="h-4.5 w-4.5 opacity-60" />
                          )}
                        </button>
                      </td>

                      {/* Cover */}
                      <td className="p-4">
                        <div 
                          onClick={() => navigate(`/book/${book.slug || book.id}`)}
                          className="h-14 w-10 bg-brand-bg-secondary border border-brand-border/60 rounded-[6px] overflow-hidden shrink-0 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="p-4 max-w-[200px] lg:max-w-xs">
                        <div className="flex items-center gap-1.5">
                          {isPinned && <Pin className="h-3 w-3 text-brand-accent fill-brand-accent" />}
                          <span className="text-xs font-bold text-brand-text truncate block">{book.title}</span>
                        </div>
                        <p className="text-[10px] text-brand-text-secondary truncate mt-0.5">{book.subtitle || book.description || "No description."}</p>
                      </td>

                      {/* Language */}
                      <td className="p-4 font-mono text-[10px] text-brand-text">{book.language || "English"}</td>

                      {/* Status */}
                      <td className="p-4">
                        <StatusBadge status={book.status} />
                      </td>

                      {/* Downloads */}
                      <td className="p-4 text-right font-mono text-brand-text">{book.downloadCount || 0}</td>

                      {/* Reads */}
                      <td className="p-4 text-right font-mono text-brand-text">{book.readCount || 0}</td>

                      {/* Bookmarks */}
                      <td className="p-4 text-right font-mono">{book.bookmarkCount || 0}</td>

                      {/* Rating */}
                      <td className="p-4 text-center font-mono">
                        <div className="flex items-center justify-center gap-0.5 text-amber-500 text-[10px] font-bold">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span>{book.rating ? book.rating.toFixed(1) : "—"}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            onClick={() => togglePin(book.id)}
                            variant="ghost" 
                            size="sm" 
                            className={`h-7.5 w-7.5 p-0 rounded-full cursor-pointer hover:bg-brand-bg-secondary ${
                              isPinned ? "text-brand-accent" : "text-brand-text-secondary"
                            }`}
                            title={isPinned ? "Unpin book" : "Pin book to dashboard"}
                          >
                            <Pin className="h-3.5 w-3.5" />
                          </Button>

                          <Button 
                            onClick={() => navigate(`/read/${book.slug || book.id}`)}
                            variant="outline" 
                            size="sm" 
                            className="h-7.5 rounded-full text-[10px] px-2.5 font-bold border-brand-border text-brand-accent hover:bg-brand-accent/5 cursor-pointer flex items-center"
                          >
                            <BookOpen className="mr-1 h-3 w-3" /> Open
                          </Button>

                          <Button 
                            onClick={() => onEditBook(book)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-7.5 w-7.5 p-0 rounded-full text-brand-text-secondary hover:bg-brand-bg-secondary cursor-pointer"
                            title="Edit metadata"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            onClick={() => onDuplicateBook(book)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-7.5 w-7.5 p-0 rounded-full text-brand-text-secondary hover:bg-brand-bg-secondary cursor-pointer"
                            title="Duplicate book"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            onClick={() => onDeleteBook(book)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-7.5 w-7.5 p-0 rounded-full text-brand-danger hover:bg-brand-danger/10 cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-brand-border rounded-[20px] bg-brand-card p-6 select-none font-display">
          <AlertCircle className="mx-auto h-9 w-9 text-brand-text-secondary opacity-60 mb-3" />
          <h3 className="text-sm font-bold text-brand-text">No Books Found</h3>
          <p className="text-xs text-brand-text-secondary mt-1">There are no books in the selected status catalog tab.</p>
          <Button onClick={() => { setSelectedStatus("all"); setSearchQuery(""); }} variant="outline" className="mt-4 rounded-full text-xs font-bold px-5 h-9 border-brand-border">
            Clear Filter
          </Button>
        </div>
      )}
    </div>
  );
};
export default LibraryManagement;
