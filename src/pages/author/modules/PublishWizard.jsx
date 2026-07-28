import React, { useState, useEffect } from "react";
import { 
  BookOpen, Upload, Image as ImageIcon, DollarSign, Globe, Eye, Send, 
  CheckCircle2, ArrowRight, ArrowLeft, Save, Sparkles, RefreshCw, Layers, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { dbService } from "../../../services/db";
import { uploadFile } from "../../../services/storage";
import { toast } from "react-hot-toast";

const STEPS = [
  { id: 1, name: "Book Details", icon: BookOpen },
  { id: 2, name: "Upload Files", icon: Upload },
  { id: 3, name: "Cover Art", icon: ImageIcon },
  { id: 4, name: "Pricing & DRM", icon: DollarSign },
  { id: 5, name: "SEO & Social", icon: Globe },
  { id: 6, name: "Live Preview", icon: Eye },
  { id: 7, name: "Publish & Launch", icon: Send }
];

export const PublishWizard = ({ user, initialBook = null, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [form, setForm] = useState({
    title: initialBook?.title || "",
    subtitle: initialBook?.subtitle || "",
    authorName: initialBook?.authorName || user?.displayName || user?.name || "",
    description: initialBook?.description || "",
    aiDescription: initialBook?.aiDescription || "",
    categories: initialBook?.categories || ["Technology"],
    tags: initialBook?.tags ? initialBook.tags.join(", ") : "SaaS, Software, Code",
    language: initialBook?.language || "English",
    isbn: initialBook?.isbn || "978-3-16-148410-0",
    publisher: initialBook?.publisher || "Ebookvala Press",
    edition: initialBook?.edition || "1st Edition",
    pages: initialBook?.pages || 120,
    coverURL: initialBook?.coverURL || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    pdfURL: initialBook?.pdfURL || "",
    previewPdfURL: initialBook?.previewPdfURL || "/demo-preview.pdf",
    price: initialBook?.price ?? 499,
    originalPrice: initialBook?.originalPrice ?? 899,
    discount: initialBook?.discount ?? 44,
    couponCodes: initialBook?.couponCodes ? initialBook.couponCodes.join(", ") : "WELCOME20",
    isDRM: initialBook?.isDRM ?? true,
    visibility: initialBook?.visibility || "public",
    scheduledDate: initialBook?.scheduledDate || "",
    metaTitle: initialBook?.metaTitle || "",
    metaDescription: initialBook?.metaDescription || ""
  });

  // Auto-save draft effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.title.trim()) {
        handleSaveDraft(true);
      }
    }, 15000); // Auto-save draft every 15s
    return () => clearTimeout(timer);
  }, [form]);

  const updateForm = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveDraft = async (silent = false) => {
    if (!user) return;
    setSavingDraft(true);
    try {
      const payload = {
        ...form,
        authorId: user.uid,
        tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags,
        couponCodes: typeof form.couponCodes === "string" ? form.couponCodes.split(",").map(c => c.trim()).filter(Boolean) : form.couponCodes,
        status: "draft",
        updatedAt: new Date().toISOString()
      };

      if (initialBook?.id) {
        await dbService.updateBook(initialBook.id, payload);
      } else {
        const newBook = await dbService.createBook(payload);
        initialBook = newBook;
      }
      if (!silent) toast.success("Draft saved successfully! 💾");
    } catch (err) {
      if (!silent) toast.error("Failed to save draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    const toastId = toast.loading("Uploading cover image...");
    try {
      const publicUrl = await uploadFile("covers", "book-covers", file);
      updateForm("coverURL", publicUrl);
      toast.success("Cover uploaded!", { id: toastId });
    } catch (err) {
      toast.error(`Cover upload failed: ${err.message}`, { id: toastId });
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPdf(true);
    const toastId = toast.loading("Uploading PDF document...");
    try {
      const publicUrl = await uploadFile("pdfs", "book-pdfs", file);
      updateForm("pdfURL", publicUrl);
      updateForm("fileSize", `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      toast.success("eBook PDF uploaded!", { id: toastId });
    } catch (err) {
      toast.error(`PDF upload failed: ${err.message}`, { id: toastId });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handlePublish = async (statusOverride = "published") => {
    if (!form.title.trim()) {
      toast.error("Please provide a book title.");
      return;
    }
    const toastId = toast.loading("Publishing eBook to EbookVala marketplace...");
    try {
      const payload = {
        ...form,
        authorId: user.uid,
        tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags,
        couponCodes: typeof form.couponCodes === "string" ? form.couponCodes.split(",").map(c => c.trim()).filter(Boolean) : form.couponCodes,
        status: statusOverride,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (initialBook?.id) {
        await dbService.updateBook(initialBook.id, payload);
      } else {
        await dbService.createBook(payload);
      }

      await dbService.createEvent({
        authorId: user.uid,
        type: "book_published",
        title: "eBook Published",
        description: `Published "${form.title}" on EbookVala`
      });

      toast.success(`🎉 "${form.title}" is now Live on EbookVala!`, { id: toastId });
      if (onFinish) onFinish();
    } catch (err) {
      toast.error("Failed to publish book.", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Stepper Navigation */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto gap-3 no-scrollbar pb-1">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap select-none cursor-pointer ${
                  isActive 
                    ? "bg-brand-accent text-white shadow-md shadow-brand-accent/20 scale-[1.02]"
                    : isCompleted
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-[#1c1c1f] text-brand-text-secondary hover:text-brand-text border border-brand-border/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{s.id}. {s.name}</span>
                {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 md:p-8 shadow-md">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
                <div>
                  <h3 className="text-lg font-display font-black text-brand-text">1. Basic Metadata & Overview</h3>
                  <p className="text-xs text-brand-text-secondary">Enter book title, subtitle, category tags, and descriptive copy.</p>
                </div>
                <Sparkles className="h-5 w-5 text-brand-accent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Book Title *" value={form.title} onChange={e => updateForm("title", e.target.value)} placeholder="e.g. Master Microservices Architecture" />
                <Input label="Subtitle" value={form.subtitle} onChange={e => updateForm("subtitle", e.target.value)} placeholder="e.g. Blueprints & patterns for high-scale apps" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Author Display Name" value={form.authorName} onChange={e => updateForm("authorName", e.target.value)} />
                <Input label="Publisher" value={form.publisher} onChange={e => updateForm("publisher", e.target.value)} />
                <Input label="Edition" value={form.edition} onChange={e => updateForm("edition", e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-1.5">Book Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => updateForm("description", e.target.value)}
                  placeholder="Detailed synopsis of your book for readers..."
                  className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-1.5">AI Enhanced Summary (Short Highlight)</label>
                <textarea
                  rows={2}
                  value={form.aiDescription}
                  onChange={e => updateForm("aiDescription", e.target.value)}
                  placeholder="✨ AI Enhanced short summary highlight..."
                  className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="border-b border-brand-border/40 pb-4">
                <h3 className="text-lg font-display font-black text-brand-text">2. Upload eBook Files</h3>
                <p className="text-xs text-brand-text-secondary">Upload your manuscript PDF or EPUB file directly to Supabase storage.</p>
              </div>

              <div 
                onClick={() => document.getElementById("pdf-input")?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handlePdfUpload({ target: { files: e.dataTransfer.files } });
                  }
                }}
                className="border-2 border-dashed border-brand-border/60 hover:border-brand-accent rounded-2xl p-8 text-center transition-colors cursor-pointer group"
              >
                <Upload className="h-10 w-10 text-brand-accent mx-auto mb-3 animate-bounce group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-brand-text">Upload Manuscript (PDF / EPUB)</p>
                <p className="text-[11px] text-brand-text-secondary mt-1">Recommended size: under 50 MB. Click or drag & drop file here.</p>
                <input type="file" accept=".pdf,.epub" onChange={handlePdfUpload} className="hidden" id="pdf-input" />
                <div className="mt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    isLoading={uploadingPdf}
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("pdf-input")?.click();
                    }}
                  >
                    Select PDF File
                  </Button>
                </div>
              </div>

              {form.pdfURL && (
                <div className="bg-[#111113] border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-brand-text">PDF Uploaded Successfully</p>
                      <p className="text-[10px] text-brand-text-secondary font-mono">{form.pdfURL}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">{form.fileSize || "PDF"}</span>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="border-b border-brand-border/40 pb-4">
                <h3 className="text-lg font-display font-black text-brand-text">3. Cover Artwork Customizer</h3>
                <p className="text-xs text-brand-text-secondary">Upload a 300x450 High Resolution Cover image.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <Input label="Cover Image URL" value={form.coverURL} onChange={e => updateForm("coverURL", e.target.value)} />
                  <div>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" id="cover-input" />
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full cursor-pointer" 
                      isLoading={uploadingCover}
                      onClick={() => document.getElementById("cover-input")?.click()}
                    >
                      Upload Custom Cover Image
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-36 h-52 rounded-xl overflow-hidden shadow-2xl border border-brand-border/60 relative group">
                    <img src={form.coverURL} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="border-b border-brand-border/40 pb-4">
                <h3 className="text-lg font-display font-black text-brand-text">4. Pricing, Coupons & DRM Protection</h3>
                <p className="text-xs text-brand-text-secondary">Set price, original list price, discounts, and digital rights management.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Selling Price (₹) *" type="number" value={form.price} onChange={e => updateForm("price", Number(e.target.value))} />
                <Input label="Original List Price (₹)" type="number" value={form.originalPrice} onChange={e => updateForm("originalPrice", Number(e.target.value))} />
                <Input label="Coupon Codes" value={form.couponCodes} onChange={e => updateForm("couponCodes", e.target.value)} placeholder="e.g. SCALE20, LAUNCH10" />
              </div>

              <div className="bg-[#111113] border border-brand-border/60 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-accent" />
                  <div>
                    <p className="text-xs font-bold text-brand-text">DRM Digital Rights Protection</p>
                    <p className="text-[11px] text-brand-text-secondary">Enforce encrypted digital watermark & copy protection on PDF downloads.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm("isDRM", !form.isDRM)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${form.isDRM ? "bg-brand-accent" : "bg-[#252529]"}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${form.isDRM ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="border-b border-brand-border/40 pb-4">
                <h3 className="text-lg font-display font-black text-brand-text">5. SEO & Social Meta Card Optimization</h3>
                <p className="text-xs text-brand-text-secondary">Customize Google search snippets and Twitter / OpenGraph preview cards.</p>
              </div>

              <Input label="SEO Meta Title" value={form.metaTitle || form.title} onChange={e => updateForm("metaTitle", e.target.value)} />
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-1.5">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={form.metaDescription || form.description}
                  onChange={e => updateForm("metaDescription", e.target.value)}
                  className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
                />
              </div>

              <div className="bg-[#111113] border border-brand-border/60 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Google Search Preview</p>
                <p className="text-sm font-bold text-sky-400 hover:underline cursor-pointer">{form.metaTitle || form.title || "Book Title"} | EbookVala</p>
                <p className="text-xs text-brand-text-secondary">{form.metaDescription || form.description || "Synopsis placeholder..."}</p>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="border-b border-brand-border/40 pb-4">
                <h3 className="text-lg font-display font-black text-brand-text">6. Live Storefront Reader Preview</h3>
                <p className="text-xs text-brand-text-secondary">This is how your book detail page will appear to prospective readers.</p>
              </div>

              <div className="bg-[#111113] border border-brand-border/60 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
                <div className="w-32 h-48 rounded-xl overflow-hidden shadow-xl border border-brand-border/40 shrink-0">
                  <img src={form.coverURL} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-3 flex-1">
                  <h2 className="text-xl font-display font-black text-brand-text">{form.title || "Untitled Book"}</h2>
                  <p className="text-xs text-brand-text-secondary font-bold">by {form.authorName || "Author"}</p>
                  <p className="text-xs text-brand-text leading-relaxed line-clamp-3">{form.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-brand-accent">₹{form.price}</span>
                    <span className="text-xs line-through text-brand-text-secondary">₹{form.originalPrice}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="border-b border-brand-border/40 pb-4">
                <h3 className="text-lg font-display font-black text-brand-text">7. Ready to Publish!</h3>
                <p className="text-xs text-brand-text-secondary">Publish immediately or schedule release date.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#111113] border border-brand-border/60 rounded-2xl p-6 text-center space-y-3">
                  <Send className="h-8 w-8 text-brand-accent mx-auto" />
                  <h4 className="text-sm font-bold text-brand-text">Publish Immediately</h4>
                  <p className="text-xs text-brand-text-secondary">Make this eBook available on EbookVala right away.</p>
                  <Button variant="primary" className="w-full" onClick={() => handlePublish("published")}>Publish Now 🚀</Button>
                </div>

                <div className="bg-[#111113] border border-brand-border/60 rounded-2xl p-6 text-center space-y-3">
                  <Save className="h-8 w-8 text-amber-400 mx-auto" />
                  <h4 className="text-sm font-bold text-brand-text">Save as Draft</h4>
                  <p className="text-xs text-brand-text-secondary">Keep in draft state to review and edit later.</p>
                  <Button variant="outline" className="w-full" onClick={() => handlePublish("draft")}>Save as Draft 💾</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Action Footer */}
        <div className="flex items-center justify-between border-t border-brand-border/40 pt-6 mt-8">
          <Button
            variant="ghost"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Previous Step
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handleSaveDraft()} isLoading={savingDraft}>
              <Save className="h-3.5 w-3.5 mr-1" /> Save Draft
            </Button>
            {currentStep < 7 ? (
              <Button variant="primary" size="sm" onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}>
                Next Step <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => handlePublish("published")}>
                Publish eBook 🚀
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
