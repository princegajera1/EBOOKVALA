import React, { useState } from "react";
import { 
  Eye, Edit, Trash2, Copy, FileText, CheckSquare, Square, 
  Archive, Upload, Pin, ChevronRight, BookOpen, AlertCircle
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

  // Filter books based on status tab
  const filteredBooks = books.filter(b => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "pinned") return pinnedBookIds.includes(b.id);
    if (selectedStatus === "featured") return b.isFeatured;
    return b.status === selectedStatus;
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
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-display font-black text-brand-text">Library Management</h1>
        <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
          Manage your publishing catalog, set visibility, drafts, and perform bulk operations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-brand-border select-none">
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

      {/* Grid Container */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const isSelected = selectedBookIds.includes(book.id);
            const isPinned = pinnedBookIds.includes(book.id);

            return (
              <div 
                key={book.id} 
                className={`relative flex flex-col bg-brand-card rounded-brand-card border shadow-brand transition-all duration-200 overflow-hidden ${
                  isSelected ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent" : "border-brand-border hover:border-brand-border-hover"
                }`}
              >
                {/* Checkbox Overlay */}
                <button 
                  onClick={() => toggleSelectBook(book.id)}
                  className="absolute top-3.5 left-3.5 z-10 p-1 rounded bg-black/40 text-white backdrop-blur-md border border-white/20 hover:scale-105 transition-transform"
                >
                  {isSelected ? (
                    <CheckSquare className="h-4.5 w-4.5 text-brand-accent fill-brand-accent/20" />
                  ) : (
                    <Square className="h-4.5 w-4.5 opacity-80" />
                  )}
                </button>

                {/* Pinned Ribbon */}
                {isPinned && (
                  <div className="absolute top-0 right-0 bg-brand-accent text-white px-3 py-1 rounded-bl-[12px] z-10 flex items-center gap-1 select-none">
                    <Pin className="h-3 w-3 fill-white" />
                    <span className="text-[9px] font-bold tracking-wider uppercase font-mono">Pinned</span>
                  </div>
                )}

                {/* Cover & Body */}
                <div className="flex gap-4 p-4">
                  <div 
                    onClick={() => navigate(`/book/${book.slug || book.id}`)}
                    className="h-28 w-20 bg-brand-bg-secondary border border-brand-border rounded-[10px] overflow-hidden shrink-0 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold tracking-wider uppercase text-brand-accent">
                          {(book.categories && book.categories[0]) || "eBook"}
                        </span>
                        <StatusBadge status={book.status} />
                      </div>
                      <h4 className="text-sm font-bold text-brand-text truncate leading-snug font-display mt-1.5">
                        {book.title}
                      </h4>
                      <p className="text-xs text-brand-text-secondary truncate mt-0.5">{book.subtitle || "No subtitle."}</p>
                    </div>

                    <div className="flex gap-1.5 mt-2 flex-wrap text-[10px] font-bold font-mono text-brand-text-secondary uppercase select-none">
                      <span>Price: <strong className="text-brand-text">{book.price > 0 ? `₹${book.price}` : "Free"}</strong></span>
                      <span>•</span>
                      <span>Reads: <strong className="text-brand-text">{book.readCount || 0}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="px-4 py-3 bg-brand-bg-secondary/40 border-t border-brand-border/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-1.5">
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
                      onClick={() => {
                        if (book.pdfURL && book.pdfURL !== "/demo-preview.pdf") {
                          window.open(book.pdfURL, "_blank", "noopener,noreferrer");
                        } else {
                          window.open(`/book/${book.id}`, "_blank", "noopener,noreferrer");
                        }
                      }}
                      variant="outline" 
                      size="sm" 
                      className="h-7.5 rounded-full text-[10px] px-2.5 font-bold border-brand-border text-brand-text hover:bg-brand-bg-secondary cursor-pointer"
                    >
                      <Eye className="mr-1 h-3 w-3" /> Preview
                    </Button>
                    <Button 
                      onClick={() => navigate(`/read/${book.slug || book.id}`)}
                      variant="outline" 
                      size="sm" 
                      className="h-7.5 rounded-full text-[10px] px-2.5 font-bold border-brand-border text-brand-accent hover:bg-brand-accent/5 cursor-pointer"
                    >
                      <BookOpen className="mr-1 h-3 w-3" /> Open
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    <Button 
                      onClick={() => onEditBook(book)} 
                      variant="ghost" 
                      size="sm" 
                      className="h-7.5 w-7.5 p-0 rounded-full text-brand-text-secondary hover:bg-brand-bg-secondary cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      onClick={() => onDuplicateBook(book)} 
                      variant="ghost" 
                      size="sm" 
                      className="h-7.5 w-7.5 p-0 rounded-full text-brand-text-secondary hover:bg-brand-bg-secondary cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      onClick={() => onDeleteBook(book)} 
                      variant="ghost" 
                      size="sm" 
                      className="h-7.5 w-7.5 p-0 rounded-full text-brand-danger hover:bg-brand-danger/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-brand-border rounded-[20px] bg-brand-card p-6 select-none font-display">
          <AlertCircle className="mx-auto h-9 w-9 text-brand-text-secondary opacity-60 mb-3" />
          <h3 className="text-sm font-bold text-brand-text">No Books Found</h3>
          <p className="text-xs text-brand-text-secondary mt-1">There are no books in the selected status catalog tab.</p>
          <Button onClick={() => setSelectedStatus("all")} variant="outline" className="mt-4 rounded-full text-xs font-bold px-5 h-9 border-brand-border">
            Clear Filter
          </Button>
        </div>
      )}
    </div>
  );
};
