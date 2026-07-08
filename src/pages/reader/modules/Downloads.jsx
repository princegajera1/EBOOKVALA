import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Play, ToggleLeft, ToggleRight, CheckCircle2, HardDrive, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export const Downloads = ({ user, books = [] }) => {
  const navigate = useNavigate();

  // Purchased books can be downloaded
  const purchasedIds = user?.purchasedBooks || [];
  const myBooks = books.filter(b => purchasedIds.includes(b.id));

  // Mock download state
  const downloadedBooks = myBooks.slice(0, 2);

  // Storage usage metrics
  const totalStorageMB = 512;
  const usedStorageMB = downloadedBooks.reduce((sum, b) => sum + (parseFloat(b.fileSize || "5.0") || 5), 0);
  const usedPercent = (usedStorageMB / totalStorageMB) * 100;

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text">Offline Downloads</h1>
        <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">
          Manage your offline books and local cached downloads.
        </p>
      </div>

      {myBooks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Downloads catalog list (Left 2 columns) */}
          <div className="lg:col-span-2 bg-brand-card border border-brand-border/70 rounded-[24px] p-6 shadow-brand flex flex-col gap-4">
            <div className="border-b border-brand-border/45 pb-3">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Cached offline books</h3>
            </div>

            {downloadedBooks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {downloadedBooks.map((book) => (
                  <div 
                    key={book.id} 
                    className="group flex items-center justify-between p-3 rounded-[16px] border border-brand-border/60 hover:border-brand-accent/20 bg-brand-bg-secondary/20 hover:bg-[#1a1a1c]/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-14 w-10 bg-[#161616] border border-brand-border/60 rounded-[6px] overflow-hidden shrink-0 shadow-sm">
                        <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-brand-text truncate leading-snug">{book.title}</h4>
                        <p className="text-[10px] text-brand-text-secondary mt-0.5 font-semibold truncate">Size: {book.fileSize || "4.8 MB"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-brand-success text-[10px] font-bold font-mono uppercase tracking-wider bg-brand-success/10 border border-brand-success/20 px-2 py-0.75 rounded-full shadow-sm">
                        <CheckCircle2 className="h-3 w-3" /> Offline
                      </div>
                      <Button 
                        onClick={() => navigate(`/read/${book.slug || book.id}`)}
                        className="rounded-full text-[10px] font-bold h-8.5 px-4 bg-brand-accent flex items-center gap-1 hover:scale-102"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Read
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-7 w-7 text-brand-text-secondary opacity-65 mb-1" />
                <p className="text-xs font-bold text-brand-text">No downloaded books</p>
                <p className="text-[10px] text-brand-text-secondary mt-1">Download books from your library for offline access.</p>
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
              <p className="text-[10px] font-bold text-brand-text leading-tight">Storage Auto-Clean</p>
              <p className="text-[9px] text-brand-text-secondary mt-1 leading-relaxed">
                Automatically offloads finished books when space drops below 50 MB. Offline book progress will always remain saved in your profile.
              </p>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-brand-border/60 rounded-[24px] bg-brand-card p-6 select-none max-w-md mx-auto">
          <Download className="mx-auto h-9 w-9 text-brand-text-secondary opacity-60 mb-2 animate-bounce" />
          <h3 className="text-xs font-bold text-brand-text tracking-tight font-display uppercase">No Downloads Available</h3>
          <p className="text-[10px] text-brand-text-secondary mt-1 max-w-sm font-medium">
            You don't own any books yet. Books you purchase in the catalog can be cached locally for offline reading.
          </p>
          <Button onClick={() => navigate("/marketplace")} className="mt-5 rounded-full text-[10px] font-bold h-8.5 px-4 bg-brand-accent shadow-sm">
            Browse Bookstore
          </Button>
        </div>
      )}

    </div>
  );
};
