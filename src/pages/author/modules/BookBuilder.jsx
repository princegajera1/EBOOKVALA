import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowUp, ArrowDown, Copy, Lock, Unlock, Eye, EyeOff, Trash2, 
  RotateCcw, Save, History, Redo2, Undo2, Plus, Sparkles, BookOpen, AlertCircle
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

const INITIAL_CHAPTERS = [
  { id: "ch-cover", title: "Book Cover", type: "Cover", locked: false, hidden: false },
  { id: "ch-preface", title: "Preface & Intro", type: "Preface", locked: false, hidden: false },
  { id: "ch-1", title: "Chapter 1: The Foundations", type: "Chapter 1", locked: false, hidden: false },
  { id: "ch-2", title: "Chapter 2: Core Architectures", type: "Chapter 2", locked: false, hidden: false },
  { id: "ch-img", title: "Visual Diagrams Pack", type: "Images", locked: false, hidden: false },
  { id: "ch-tbl", title: "Comparative Data Matrix", type: "Tables", locked: false, hidden: false },
  { id: "ch-qot", title: "Key Industry Quotes", type: "Quotes", locked: false, hidden: false },
  { id: "ch-ftr", title: "Appendix & References", type: "Footer", locked: false, hidden: false },
  { id: "ch-end", title: "Closing Epilogue", type: "Ending", locked: false, hidden: false }
];

export const BookBuilder = ({ books = [] }) => {
  const [selectedBookId, setSelectedBookId] = useState("");
  const [chapters, setChapters] = useState([]);
  
  // Undo/Redo Stacks
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Version History Snapshots
  const [snapshots, setSnapshots] = useState([]);
  
  // Autosave status indicator
  const [saveStatus, setSaveStatus] = useState("saved"); // saved | saving | dirty
  const autoSaveTimerRef = useRef(null);

  // Set default book selection
  useEffect(() => {
    if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0].id);
    }
  }, [books, selectedBookId]);

  // Load chapters when book changes
  useEffect(() => {
    if (selectedBookId) {
      // Mock loading chapters from local storage per book or default
      const saved = localStorage.getItem(`book_builder_ch_${selectedBookId}`);
      const initialList = saved ? JSON.parse(saved) : INITIAL_CHAPTERS;
      setChapters(initialList);
      
      // Load snapshots
      const savedSnaps = localStorage.getItem(`book_builder_snaps_${selectedBookId}`);
      setSnapshots(savedSnaps ? JSON.parse(savedSnaps) : []);

      // Reset Undo Redo Stacks
      setHistory([initialList]);
      setHistoryIndex(0);
      setSaveStatus("saved");
    }
  }, [selectedBookId]);

  // Handle local state changes & trigger undo/redo histories
  const updateChaptersState = (newChapters, isUndoRedoOperation = false) => {
    setChapters(newChapters);
    setSaveStatus("dirty");

    // Clear timers
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    // Set debounced autosave (5s)
    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave(newChapters);
    }, 5000);

    if (!isUndoRedoOperation) {
      // Truncate stack if we were in the middle of undo/redo
      const cleanHistory = history.slice(0, historyIndex + 1);
      const updatedHistory = [...cleanHistory, newChapters];
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    }
  };

  // Undo Action
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      updateChaptersState(history[prevIdx], true);
      toast.success("Undone! ↩️");
    }
  };

  // Redo Action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      updateChaptersState(history[nextIdx], true);
      toast.success("Redone! ↪️");
    }
  };

  // Auto-Save Execution
  const handleAutoSave = (listToSave) => {
    if (!selectedBookId) return;
    setSaveStatus("saving");
    setTimeout(() => {
      localStorage.setItem(`book_builder_ch_${selectedBookId}`, JSON.stringify(listToSave));
      setSaveStatus("saved");
    }, 1000);
  };

  // Manual Save (Force save immediately)
  const handleManualSave = () => {
    if (!selectedBookId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    handleAutoSave(chapters);
    toast.success("eBook Structure Saved! 💾");
  };

  // Reordering: Shift Up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newChapters = [...chapters];
    const temp = newChapters[index];
    newChapters[index] = newChapters[index - 1];
    newChapters[index - 1] = temp;
    updateChaptersState(newChapters);
  };

  // Reordering: Shift Down
  const handleMoveDown = (index) => {
    if (index === chapters.length - 1) return;
    const newChapters = [...chapters];
    const temp = newChapters[index];
    newChapters[index] = newChapters[index + 1];
    newChapters[index + 1] = temp;
    updateChaptersState(newChapters);
  };

  // Duplicate Chapter
  const handleDuplicate = (chapter) => {
    const newChapters = [...chapters];
    const index = newChapters.findIndex(c => c.id === chapter.id);
    const duplicated = {
      ...chapter,
      id: `dup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${chapter.title} (Copy)`,
      locked: false
    };
    newChapters.splice(index + 1, 0, duplicated);
    updateChaptersState(newChapters);
    toast.success(`Duplicated "${chapter.title}"! 👯`);
  };

  // Delete Chapter
  const handleDelete = (id, title) => {
    const newChapters = chapters.filter(c => c.id !== id);
    updateChaptersState(newChapters);
    toast.success(`Removed "${title}"! 🗑️`);
  };

  // Toggle Lock State
  const handleToggleLock = (id) => {
    const newChapters = chapters.map(c => c.id === id ? { ...c, locked: !c.locked } : c);
    updateChaptersState(newChapters);
  };

  // Toggle Hidden State
  const handleToggleHidden = (id) => {
    const newChapters = chapters.map(c => c.id === id ? { ...c, hidden: !c.hidden } : c);
    updateChaptersState(newChapters);
  };

  // Add Chapter
  const handleAddChapter = () => {
    const newChapters = [...chapters];
    const name = window.prompt("Enter Chapter / Section Title:", "New Chapter");
    if (!name) return;
    
    const newCh = {
      id: `ch-custom-${Date.now()}`,
      title: name,
      type: "Custom",
      locked: false,
      hidden: false
    };
    newChapters.push(newCh);
    updateChaptersState(newChapters);
    toast.success(`Added "${name}"! ➕`);
  };

  // Create Snapshot Version
  const handleCreateSnapshot = () => {
    if (!selectedBookId) return;
    const snapName = window.prompt("Enter Version Tag / Name:", `v1.${snapshots.length + 1} Draft`);
    if (!snapName) return;

    const newSnapshot = {
      id: `snap-${Date.now()}`,
      name: snapName,
      timestamp: new Date().toISOString(),
      data: chapters
    };
    const nextSnaps = [newSnapshot, ...snapshots];
    setSnapshots(nextSnaps);
    localStorage.setItem(`book_builder_snaps_${selectedBookId}`, JSON.stringify(nextSnaps));
    toast.success(`Snapshot "${snapName}" saved successfully! 📸`);
  };

  // Restore Snapshot
  const handleRestoreSnapshot = (snapshot) => {
    if (!window.confirm(`Restore to "${snapshot.name}"? Current unsaved layout changes will be lost.`)) return;
    setChapters(snapshot.data);
    updateChaptersState(snapshot.data);
    toast.success(`Restored to "${snapshot.name}"! 🔄`);
  };

  const selectedBook = books.find(b => b.id === selectedBookId);

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-brand-text">Book Builder</h1>
          <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
            Draft, layout, and lock sections of your book in a responsive drag-and-drop workspace.
          </p>
        </div>

        {/* Selected Book Dropdown */}
        <div className="flex items-center gap-2 select-none">
          <BookOpen className="h-4 w-4 text-brand-accent shrink-0" />
          <select 
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="bg-brand-card border border-brand-border px-3 py-1.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
          >
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-brand-border rounded-[20px] bg-brand-card p-6 select-none font-display">
          <AlertCircle className="mx-auto h-9 w-9 text-brand-text-secondary opacity-60 mb-3" />
          <h3 className="text-sm font-bold text-brand-text">No Books Available</h3>
          <p className="text-xs text-brand-text-secondary mt-1">Please create a book project first in the "Publish eBook" tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Layout Builder */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Toolbar Controls */}
            <div className="flex items-center justify-between p-4 bg-brand-card border border-brand-border rounded-[20px] shadow-sm select-none">
              
              {/* Undo Redo Indicators */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleUndo} 
                  disabled={historyIndex <= 0}
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full cursor-pointer hover:bg-brand-bg-secondary"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleRedo} 
                  disabled={historyIndex >= history.length - 1}
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full cursor-pointer hover:bg-brand-bg-secondary"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-brand-border mx-1" />
                
                {/* Autosave status indicator */}
                <span className="text-[10px] font-semibold text-brand-text-secondary">
                  {saveStatus === "saved" && <span className="text-brand-success font-bold flex items-center gap-1">● Saved</span>}
                  {saveStatus === "saving" && <span className="text-brand-accent animate-pulse font-bold flex items-center gap-1">● Saving...</span>}
                  {saveStatus === "dirty" && <span className="text-amber-500 font-bold flex items-center gap-1">● Unsaved edits</span>}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleAddChapter}
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-full text-[11px] font-bold border-brand-border text-brand-text hover:bg-brand-bg-secondary cursor-pointer"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Chapter
                </Button>
                <Button 
                  onClick={handleManualSave}
                  variant="primary" 
                  size="sm" 
                  className="h-8 rounded-full text-[11px] font-bold px-4 cursor-pointer"
                >
                  <Save className="mr-1 h-3.5 w-3.5" /> Save Structure
                </Button>
              </div>

            </div>

            {/* Chapters Interactive List */}
            <div className="flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
              {chapters.map((ch, idx) => (
                <div 
                  key={ch.id}
                  className={`flex items-center justify-between p-3.5 bg-brand-card border rounded-[16px] transition-all ${
                    ch.locked ? "border-brand-border bg-brand-bg-secondary/40 opacity-90" : "border-brand-border hover:border-brand-border-hover shadow-sm"
                  } ${ch.hidden ? "border-dashed opacity-65" : ""}`}
                >
                  
                  {/* Left drag handle simulated & name */}
                  <div className="flex items-center gap-3 min-w-0">
                    
                    {/* Shift Controls */}
                    <div className="flex flex-col gap-0.5 select-none">
                      <button 
                        disabled={idx === 0} 
                        onClick={() => handleMoveUp(idx)}
                        className="p-0.5 rounded text-brand-text-secondary hover:bg-brand-bg-secondary disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button 
                        disabled={idx === chapters.length - 1} 
                        onClick={() => handleMoveDown(idx)}
                        className="p-0.5 rounded text-brand-text-secondary hover:bg-brand-bg-secondary disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-brand-bg-secondary rounded border border-brand-border text-brand-text-secondary uppercase">
                          {ch.type}
                        </span>
                        {ch.locked && <Lock className="h-3 w-3 text-brand-accent" />}
                        {ch.hidden && <EyeOff className="h-3 w-3 text-brand-text-secondary" />}
                      </div>
                      <h4 className={`text-xs font-bold text-brand-text mt-1 truncate max-w-xs ${ch.locked ? "opacity-75" : ""}`}>
                        {ch.title}
                      </h4>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center gap-1 select-none">
                    
                    {/* Toggle lock */}
                    <button 
                      onClick={() => handleToggleLock(ch.id)}
                      className={`p-2 rounded-full hover:bg-brand-bg-secondary ${ch.locked ? "text-brand-accent" : "text-brand-text-secondary"}`}
                      title={ch.locked ? "Unlock element" : "Lock element to read-only"}
                    >
                      {ch.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </button>

                    {/* Toggle visibility */}
                    <button 
                      onClick={() => handleToggleHidden(ch.id)}
                      className={`p-2 rounded-full hover:bg-brand-bg-secondary ${ch.hidden ? "text-brand-text-secondary" : "text-brand-accent"}`}
                      title={ch.hidden ? "Show element to readers" : "Hide element from catalog"}
                    >
                      {ch.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>

                    {/* Duplicate */}
                    <button 
                      disabled={ch.locked}
                      onClick={() => handleDuplicate(ch)}
                      className="p-2 rounded-full text-brand-text-secondary hover:bg-brand-bg-secondary disabled:opacity-20"
                      title="Duplicate element"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete */}
                    <button 
                      disabled={ch.locked}
                      onClick={() => handleDelete(ch.id, ch.title)}
                      className="p-2 rounded-full text-brand-danger hover:bg-brand-danger/15 disabled:opacity-20"
                      title="Delete element"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Version History Sidebar */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 flex flex-col gap-4 shadow-sm select-none">
            
            <div className="flex justify-between items-center pb-2 border-b border-brand-border">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono flex items-center gap-1.5">
                <History className="h-4 w-4 text-brand-accent" /> Snapshot History
              </h3>
              <button 
                onClick={handleCreateSnapshot}
                className="text-[10px] font-bold text-brand-accent hover:underline cursor-pointer"
              >
                Create Tag
              </button>
            </div>

            {snapshots.length > 0 ? (
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
                {snapshots.map((snap) => (
                  <div key={snap.id} className="p-3 bg-brand-bg-secondary border border-brand-border rounded-[14px] flex items-center justify-between gap-2">
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-brand-text truncate leading-tight">{snap.name}</p>
                      <p className="text-[9px] text-brand-text-secondary font-mono mt-1 uppercase tracking-wider">
                        {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(snap.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="p-2 bg-brand-accent/10 text-brand-accent rounded-full hover:bg-brand-accent hover:text-white transition-all"
                      title="Restore to this version"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-brand-text-secondary text-[11px] font-semibold italic border border-dashed border-brand-border rounded-[14px] p-4 bg-brand-bg-secondary/40">
                No snapshots saved yet. Press "Create Tag" above to save version checkpoints.
              </div>
            )}

            <div className="p-4 bg-brand-accent/5 rounded-[16px] border border-brand-accent/10 mt-2">
              <span className="text-[10px] font-bold text-brand-accent flex items-center gap-1 uppercase tracking-widest font-mono">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Auto-Save Active
              </span>
              <p className="text-[10px] text-brand-text-secondary mt-1 font-semibold leading-relaxed text-left">
                Builder saves changes automatically after 5 seconds of inactivity. You can undo/redo actions locally anytime.
              </p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
