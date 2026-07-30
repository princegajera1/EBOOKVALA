import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Play, CheckCircle2, HardDrive, AlertCircle, Trash2, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

export const Downloads = ({ user, books = [], onSaveProfile }) => {
  const navigate = useNavigate();

  // Purchased books
  const purchasedIds = user?.purchasedBooks || [];
  const myBooks = books.filter(b => purchasedIds.includes(b.id));

  // Downloaded book IDs tracking from user profile & localStorage
  const [localDownloads, setLocalDownloads] = useState(() => {
    let saved = user?.downloadedBooks || [];
    try {
      const fromLocal = JSON.parse(localStorage.getItem("eb_downloaded_books") || "[]");
      saved = Array.from(new Set([...saved, ...fromLocal]));
    } catch (e) {}
    return saved;
  });

  const downloadedBooks = books.filter(b => localDownloads.includes(b.id));

  // Storage usage metrics
  const totalStorageMB = 512;
  const usedStorageMB = downloadedBooks.reduce((sum, b) => sum + (parseFloat(b.fileSize || "5.0") || 5), 0);
  const usedPercent = Math.min(100, (usedStorageMB / totalStorageMB) * 100);

  const handleRemoveDownload = async (bookId) => {
    const updated = localDownloads.filter(id => id !== bookId);
    setLocalDownloads(updated);
    localStorage.setItem("eb_downloaded_books", JSON.stringify(updated));
    if (onSaveProfile) {
      await onSaveProfile({ downloadedBooks: updated }).catch(() => {});
    }
    toast.success("Book removed from offline storage.");
  };

  const handleDownloadBook = async (book) => {
    if (!book) return;
    const updated = Array.from(new Set([...localDownloads, book.id]));
    setLocalDownloads(updated);
    localStorage.setItem("eb_downloaded_books", JSON.stringify(updated));
    if (onSaveProfile) {
      await onSaveProfile({ downloadedBooks: updated }).catch(() => {});
    }
    
    toast.success(`"${book.title}" added to offline downloads! 📥`);
    if (book.pdfURL || book.pdf_url) {
      const link = document.createElement("a");
      link.href = book.pdfURL || book.pdf_url;
      link.setAttribute("download", `${book.title}.pdf`);
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text">Offline Downloads</h1>
        <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">
          Manage your offline books and local cached downloads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Downloads catalog list (Left 2 columns) */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border/70 rounded-[24px] p-6 shadow-brand flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-brand-border/45 pb-3">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Cached offline books ({downloadedBooks.length})</h3>
          </div>

          {downloadedBooks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {downloadedBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="group flex items-center justify-between p-3 rounded-[16px] border border-brand-border/60 hover:border-brand-accent/20 bg-brand-bg-secondary/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-14 w-10 bg-brand-bg-secondary border border-brand-border/60 rounded-[6px] overflow-hidden shrink-0 shadow-sm">
                      <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-brand-text truncate leading-snug">{book.title}</h4>
                      <p className="text-[10px] text-brand-text-secondary mt-0.5 font-semibold truncate">Size: {book.fileSize || "4.8 MB"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:flex items-center gap-1 text-brand-success text-[10px] font-bold font-mono uppercase tracking-wider bg-brand-success/10 border border-brand-success/20 px-2 py-0.75 rounded-full shadow-sm">
                      <CheckCircle2 className="h-3 w-3" /> Offline Ready
                    </div>
                    <Button 
                      onClick={() => navigate(`/read/${book.slug || book.id}`)}
                      className="rounded-full text-[10px] font-bold h-8 px-3 bg-brand-accent flex items-center gap-1 hover:scale-102"
                    >
                      <Play className="h-3 w-3 fill-current" /> Read
                    </Button>
                    <button
                      onClick={() => handleRemoveDownload(book.id)}
                      className="p-2 rounded-full border border-brand-border/60 text-brand-text-secondary hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove download"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-brand-border/60 rounded-[18px] p-6">
              <Download className="mx-auto h-7 w-7 text-brand-text-secondary opacity-60 mb-2 animate-bounce" />
              <p className="text-xs font-bold text-brand-text">No Downloaded Books Yet</p>
              <p className="text-[10px] text-brand-text-secondary mt-1">Click 'Download PDF' on any book in your library to save it for offline access.</p>
            </div>
          )}

          {/* Purchased Books available for Download */}
          {myBooks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-brand-border/40">
              <p className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest mb-3">Available to Download for Offline Reading</p>
              <div className="space-y-2">
                {myBooks.map((b) => {
                  const isDownloaded = localDownloads.includes(b.id);
                  return (
                    <div key={b.id} className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg border border-brand-border/60 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-7 bg-brand-card rounded border border-brand-border/40 overflow-hidden shrink-0">
                          <img src={b.coverURL} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-bold text-brand-text truncate max-w-[200px]">{b.title}</span>
                      </div>
                      {isDownloaded ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">✓ Cached</span>
                      ) : (
                        <Button 
                          onClick={() => handleDownloadBook(b)}
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[10px] rounded-full px-3 flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" /> Download
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Storage Meter Widget (Right 1 column) */}
        <div className="bg-brand-card/40 backdrop-blur-md border border-brand-border/60 rounded-[24px] p-6 shadow-brand flex flex-col justify-between gap-5 h-full">
          <div>
            <div className="flex items-center gap-2 border-b border-brand-border/45 pb-2">
              <HardDrive className="h-4.5 w-4.5 text-brand-accent shrink-0" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Offline Storage</h3>
            </div>
            
            <div className="mt-5">
              <div className="flex justify-between font-mono text-[9px] font-bold text-brand-text-secondary uppercase mb-2">
                <span>Usage: {usedStorageMB.toFixed(1)} MB</span>
                <span>{totalStorageMB} MB limit</span>
              </div>
              <div className="h-2 w-full bg-brand-border/50 rounded-full overflow-hidden">
                <div className="h-full bg-brand-accent rounded-full" style={{ width: `${usedPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-brand-bg-secondary/40 border border-brand-border/40 p-3 rounded-[16px] text-left">
            <p className="text-[10px] font-bold text-brand-text leading-tight">Instant Local Cache</p>
            <p className="text-[9px] text-brand-text-secondary mt-1 leading-relaxed">
              Books saved offline remain accessible even when your network drops. Progress automatically syncs when connected back online.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

