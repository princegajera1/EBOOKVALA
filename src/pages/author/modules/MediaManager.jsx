import React, { useState, useEffect } from "react";
import { Folder, FileText, Image as ImageIcon, Video, Music, Upload, Trash2, Plus, Play, Pause } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { dbService } from "../../../services/db";
import { uploadFile } from "../../../services/storage";
import { toast } from "react-hot-toast";

export const MediaManager = ({ user, books = [] }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all | covers | audiobooks | trailers

  const [newAsset, setNewAsset] = useState({
    title: "",
    type: "cover", // cover | audiobook | trailer | document
    url: "",
    fileSize: "",
    bookId: books[0]?.id || "none"
  });

  const loadAssets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await dbService.getMediaAssets(user.uid);
      setAssets(list);
    } catch (err) {
      console.error("Error loading assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const toastId = toast.loading("Uploading media file...");
    try {
      const isAudio = file.type.startsWith("audio/");
      const isVideo = file.type.startsWith("video/");
      const isImg = file.type.startsWith("image/");

      const folder = isAudio ? "audiobooks" : isVideo ? "trailers" : "covers";
      const publicUrl = await uploadFile(folder, "media-assets", file);
      
      const assetType = isAudio ? "audiobook" : isVideo ? "trailer" : "cover";
      const sizeMB = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      await dbService.createMediaAsset({
        title: file.name,
        type: assetType,
        url: publicUrl,
        fileSize: sizeMB,
        authorId: user.uid,
        bookId: newAsset.bookId
      });

      toast.success("Media asset uploaded! 📁", { id: toastId });
      loadAssets();
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assetId) => {
    try {
      await dbService.deleteMediaAsset(assetId);
      toast.success("Media asset deleted.");
      loadAssets();
    } catch (err) {
      toast.error("Failed to delete asset.");
    }
  };

  const filteredAssets = assets.filter(a => activeTab === "all" || a.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-brand-text flex items-center gap-2">
            <Folder className="h-5 w-5 text-brand-accent" />
            Media Library & Audiobook Manager
          </h2>
          <p className="text-xs text-brand-text-secondary mt-1">
            Upload and organize book cover artwork, video trailers, audiobook narration MP3s, and manuscripts.
          </p>
        </div>

        <div>
          <input type="file" onChange={handleFileUpload} className="hidden" id="media-upload-input" />
          <label htmlFor="media-upload-input">
            <Button variant="primary" size="sm" isLoading={uploading}>
              <Upload className="h-4 w-4 mr-1.5" /> Upload Media Asset
            </Button>
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border/40 pb-3">
        {["all", "cover", "audiobook", "trailer"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors select-none cursor-pointer ${
              activeTab === tab 
                ? "bg-brand-accent text-white" 
                : "bg-[#161618] text-brand-text-secondary hover:text-brand-text border border-brand-border/40"
            }`}
          >
            {tab === "all" ? "All Media Assets" : tab}
          </button>
        ))}
      </div>

      {/* Media Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full bg-[#161618] border border-brand-border/60 rounded-2xl p-8 text-center">
            <Folder className="h-10 w-10 text-brand-text-secondary mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-brand-text">No media assets found</p>
            <p className="text-[11px] text-brand-text-secondary mt-1">Upload covers, trailer videos, or audiobook chapter files above.</p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-[#161618] border border-brand-border/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded border border-brand-accent/20">
                  {asset.type}
                </span>
                <button onClick={() => handleDelete(asset.id)} className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-xs font-bold text-brand-text truncate">{asset.title}</p>
              <p className="text-[10px] text-brand-text-secondary font-mono">{asset.fileSize || "10 MB"}</p>

              {asset.type === "cover" && (
                <div className="w-full h-36 rounded-lg overflow-hidden border border-brand-border/40">
                  <img src={asset.url} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}

              {asset.type === "audiobook" && (
                <audio controls src={asset.url} className="w-full h-8" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
