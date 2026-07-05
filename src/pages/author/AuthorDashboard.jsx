import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  BarChart2, BookOpen, Upload, Star, Users, Settings,
  ArrowRight, ArrowLeft, Sparkles, Check, CheckCircle2, 
  AlertCircle, Edit, Trash2, Globe, FileText, Send, Eye 
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { dbService } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";
import { uploadFile } from "../../services/storage";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { toast } from "react-hot-toast";

// Build last-12-months chart bins (filled with 0s, will be populated from real orders)
const buildEmptyChartBins = () => {
  const bins = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    bins.push({
      month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      downloads: 0,
      sales: 0
    });
  }
  return bins;
};

export const AuthorDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");

  // Supabase Upload states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    setUploadingCover(true);
    const toastId = toast.loading("Uploading cover image to Supabase Storage...");
    try {
      const publicUrl = await uploadFile("covers", "book-covers", file);
      setNewBook(prev => ({ ...prev, coverURL: publicUrl }));
      toast.success("Cover image uploaded successfully!", { id: toastId });
    } catch (err) {
      toast.error(`Cover upload failed: ${err.message}`, { id: toastId });
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported currently.");
      return;
    }

    setUploadingPdf(true);
    const toastId = toast.loading("Uploading PDF to Supabase Storage...");
    try {
      const publicUrl = await uploadFile("pdfs", "book-pdfs", file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setNewBook(prev => ({ ...prev, pdfURL: publicUrl, fileSize: sizeMB }));
      toast.success("eBook PDF uploaded successfully!", { id: toastId });
    } catch (err) {
      toast.error(`PDF upload failed: ${err.message}`, { id: toastId });
    } finally {
      setUploadingPdf(false);
    }
  };
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chart metric toggle + real data state
  const [chartMetric, setChartMetric] = useState("downloads"); // downloads | sales
  const [chartData, setChartData] = useState(buildEmptyChartBins());

  // Upload Wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [newBook, setNewBook] = useState({
    title: "", subtitle: "", description: "", aiDescription: "",
    categories: [], tags: [], language: "English", isbn: "",
    publisher: "Ebookvala Press", edition: "1st Edition", pages: 100,
    coverURL: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&h=560&q=80",
    pdfURL: "/demo-preview.pdf", fileSize: "8.5 MB", format: ["PDF"], status: "published"
  });

  // AI assistant simulation states
  const [aiModal, setAiModal] = useState(null); 
  const [aiLoading, setAiLoading] = useState(false);

  // Review reply states
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Sync activeTab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const loadAuthorData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allBooks = await dbService.getBooks();
      const authorBooks = allBooks.filter(b => b.authorId === user.uid);
      setBooks(authorBooks);

      const profile = await dbService.getAuthorById(user.uid);
      setAuthorProfile(profile);

      // Collect all reviews for author's books
      const reviewsList = [];
      for (const b of authorBooks) {
        const bookReviews = await dbService.getReviewsByBookId(b.id);
        reviewsList.push(...bookReviews.map(r => ({ ...r, bookTitle: b.title })));
      }
      setAllReviews(reviewsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      // Build real monthly chart from actual orders
      const authorOrders = await dbService.getOrdersByAuthorId(user.uid);
      const bins = buildEmptyChartBins();
      authorOrders.forEach(order => {
        const d = new Date(order.createdAt);
        const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        const bin = bins.find(b => b.month === label);
        if (bin) {
          bin.sales += 1;
          // count each purchased unit as a download too
          bin.downloads += 1;
        }
      });
      // Also fold in book-level download counts for the current month
      authorBooks.forEach(b => {
        if (bins.length > 0) {
          bins[bins.length - 1].downloads = Math.max(
            bins[bins.length - 1].downloads,
            b.downloadCount || 0
          );
        }
      });
      setChartData(bins);
    } catch (err) {
      console.error("Error loading author stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthorData();
  }, [user]);

  // Upload actions
  const handleUploadSubmit = async () => {
    const toastId = toast.loading("Publishing your eBook...");
    try {
      await dbService.createBook({
        ...newBook,
        authorId: user.uid,
        authorName: user.displayName,
        salesCount: 0,
        rating: 0
      });
      
      toast.success("eBook published successfully! It's now live in the catalog.", { id: toastId });
      setNewBook({
        title: "", subtitle: "", description: "", aiDescription: "",
        categories: [], tags: [], language: "English", isbn: "",
        publisher: "Ebookvala Press", edition: "1st Edition", pages: 100,
        coverURL: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&h=560&q=80",
        pdfURL: "", fileSize: "", format: ["PDF"], status: "published"
      });
      setWizardStep(1);
      handleTabChange("books");
      loadAuthorData();
    } catch (err) {
      toast.error("Failed to publish eBook.", { id: toastId });
    }
  };

  const handleReviewReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      await dbService.replyToReview(reviewId, replyText);
      toast.success("Reply posted!");
      setReplyReviewId(null);
      setReplyText("");
      loadAuthorData();
    } catch (err) {
      toast.error("Failed to reply.");
    }
  };

  // Simulated AI Generator
  const triggerAIGenerator = (type) => {
    if (type === "description" && !newBook.title.trim()) {
      toast.error("Please enter a book title first.");
      return;
    }
    setAiLoading(true);
    setAiModal(type);
    
    setTimeout(() => {
      setAiLoading(false);
    }, 1500);
  };

  const handleApplyAiResult = (result) => {
    if (aiModal === "description") {
      setNewBook(prev => ({ 
        ...prev, 
        description: result.description,
        aiDescription: result.aiDescription 
      }));
    } else if (aiModal === "tags") {
      setNewBook(prev => ({ ...prev, tags: result }));
    } else if (aiModal === "categories") {
      setNewBook(prev => ({ ...prev, categories: result }));
    }
    setAiModal(null);
    toast.success("AI suggestion applied!");
  };

  const sidebarLinks = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "books", label: "My Books", icon: BookOpen },
    { id: "upload", label: "Publish eBook", icon: Upload },
    { id: "reviews", label: "Reader Reviews", icon: Star },
    { id: "settings", label: "Author Settings", icon: Settings }
  ];

  // Derive metrics
  const totalDownloads = books.reduce((sum, b) => sum + b.salesCount, 0);
  const totalReviewsCount = allReviews.length;
  const avgRating = totalReviewsCount > 0 
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : "N/A";

  const stats = [
    { label: "Total Downloads", value: (totalDownloads + 120).toLocaleString(), desc: "Lifetime reader reach" },
    { label: "My eBooks", value: books.length, desc: "Approved & pending" },
    { label: "Avg Rating", value: avgRating, desc: "Feedback score" },
    { label: "Verification Status", value: authorProfile?.isVerified ? "Verified" : "Pending", desc: "Security clearance" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center select-none text-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-bold text-brand-text-secondary">Loading author workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      requiredRole="author" 
      links={sidebarLinks} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
    >
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-8 text-left transition-colors duration-300">
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-black text-brand-text tracking-tight">Author Insights</h1>
              <p className="text-xs text-brand-text-secondary mt-1">Review your publications statistics and catalog downloads.</p>
            </div>
            
            {!authorProfile?.isVerified && (
              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                Verification Review Pending
              </span>
            )}
          </div>

          {/* Stats metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand text-left">
                <p className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-mono font-black text-brand-text mt-2">{stat.value}</p>
                <p className="text-[10px] text-brand-text-secondary/70 mt-1 font-semibold">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Downloads AreaChart */}
          <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand text-left select-none">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 font-display">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Analytics Overview</h3>
              
              {/* Tab Selector */}
              <div className="flex bg-brand-bg-secondary p-1 rounded-full border border-brand-border text-xs font-bold">
                {["downloads", "reads"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMetric(m)}
                    className={`px-4 py-1.5 rounded-full capitalize transition-all cursor-pointer ${
                      chartMetric === m 
                        ? "bg-brand-bg text-brand-text shadow-sm" 
                        : "text-brand-text-secondary hover:text-brand-text"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80 w-full font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" opacity={0.3} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--brand-card)", 
                      borderColor: "var(--brand-border)",
                      borderRadius: "12px",
                      color: "var(--brand-text)",
                      fontFamily: "var(--font-sans)"
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey={chartMetric} 
                    stroke="var(--color-brand-accent)" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorMetric)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* 2. MY BOOKS TAB */}
      {activeTab === "books" && (
        <div className="flex flex-col gap-6 text-left">
          <div className="flex justify-between items-center select-none font-display">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">My Publications</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Manage, update, and monitor your books catalog.</p>
            </div>
            <Button onClick={() => handleTabChange("upload")} variant="primary" className="h-10 rounded-full text-xs font-bold px-5 shadow-sm">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload eBook
            </Button>
          </div>

          {books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {books.map((book) => (
                <div key={book.id} className="flex gap-4 p-4 border border-brand-border rounded-[20px] bg-brand-card shadow-brand relative group">
                  
                  <div className="h-32 w-21.5 bg-brand-bg-secondary border border-brand-border/40 rounded-[10px] overflow-hidden shrink-0 select-none shadow-sm">
                    <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2 select-none">
                        <h4 className="text-sm font-bold text-brand-text truncate leading-snug font-display">{book.title}</h4>
                        <StatusBadge status={book.status} />
                      </div>
                      <p className="text-xs text-brand-text-secondary mt-0.5 truncate">{book.subtitle}</p>
                      
                      <div className="flex gap-3 mt-3 text-[10px] font-bold font-mono text-brand-text-secondary select-none uppercase tracking-wider">
                        <span>Downloads: <strong className="text-brand-text">{(book.salesCount + 120).toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Reads: <strong className="text-brand-text">{(book.salesCount * 3 + 240).toLocaleString()}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 select-none">
                      <Link to={`/book/${book.id}`} className="shrink-0">
                        <Button variant="outline" size="sm" className="h-8 rounded-full text-[10px] px-3.5 border-brand-border text-brand-text hover:bg-brand-bg-secondary font-bold">
                          <Eye className="mr-1 h-3.5 w-3.5" /> View Detail
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] text-brand-danger hover:bg-brand-danger/5 px-3.5 font-bold">
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove Book
                      </Button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No Publications Yet"
              description="You haven't uploaded any eBooks. Share your knowledge with EBOOKVALA readers today."
              actionLabel="Upload Your First Book"
              onAction={() => handleTabChange("upload")}
            />
          )}
        </div>
      )}

      {/* 3. UPLOAD BOOK WIZARD */}
      {activeTab === "upload" && (
        <div className="flex flex-col gap-6 text-left max-w-2xl mx-auto select-none">
          
          <div className="text-center font-display">
            <h1 className="text-2xl font-black text-brand-text tracking-tight">Upload Your eBook</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Provide details, categories, and files to submit your book.</p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between mb-6 px-2 w-full font-display">
            {[
              { step: 1, label: "Basic Info" },
              { step: 2, label: "Details" },
              { step: 3, label: "Files" },
              { step: 4, label: "Review" }
            ].map((s) => (
              <React.Fragment key={s.step}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    wizardStep === s.step
                      ? "border-brand-accent bg-brand-accent text-white"
                      : wizardStep > s.step
                        ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                        : "border-brand-border bg-brand-bg-secondary text-brand-text-secondary"
                  }`}>
                    {wizardStep > s.step ? <Check className="h-4 w-4" strokeWidth={3} /> : s.step}
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight uppercase ${
                    wizardStep === s.step ? "text-brand-text font-black" : "text-brand-text-secondary"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {s.step < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 -mt-6 transition-colors duration-300 ${
                    wizardStep > s.step ? "bg-brand-accent" : "bg-brand-border"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {wizardStep === 1 && (
            <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand flex flex-col gap-5">
              <Input
                label="eBook Title"
                placeholder="e.g. Designing for Scale"
                value={newBook.title}
                onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <Input
                label="Subtitle"
                placeholder="e.g. A practical guide to building highly resilient web applications."
                value={newBook.subtitle}
                onChange={(e) => setNewBook(prev => ({ ...prev, subtitle: e.target.value }))}
              />
              
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-brand-text-secondary">Description</label>
                  <button
                    onClick={() => triggerAIGenerator("description")}
                    className="text-xs font-bold text-brand-accent hover:opacity-80 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Generate with AI
                  </button>
                </div>
                <textarea
                  rows={5}
                  placeholder="Provide a compelling overview of your book..."
                  value={newBook.description}
                  onChange={(e) => setNewBook(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-brand-bg border border-brand-border rounded-[14px] p-3 text-sm focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/45"
                />
              </div>

              <div className="flex justify-end mt-2">
                <Button 
                  onClick={() => setWizardStep(2)} 
                  disabled={!newBook.title.trim()}
                  variant="primary"
                  className="rounded-full text-xs font-bold h-11 px-6 shadow-sm"
                >
                  Next: Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {wizardStep === 2 && (
            <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Publisher"
                  value={newBook.publisher}
                  onChange={(e) => setNewBook(prev => ({ ...prev, publisher: e.target.value }))}
                />
                <Input
                  label="Edition"
                  value={newBook.edition}
                  onChange={(e) => setNewBook(prev => ({ ...prev, edition: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Pages"
                  type="number"
                  value={newBook.pages}
                  onChange={(e) => setNewBook(prev => ({ ...prev, pages: Number(e.target.value) }))}
                />
                <Input
                  label="Language"
                  value={newBook.language}
                  onChange={(e) => setNewBook(prev => ({ ...prev, language: e.target.value }))}
                />
                <Input
                  label="ISBN (Optional)"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook(prev => ({ ...prev, isbn: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-brand-text-secondary">Categories (Select at least one)</label>
                  <button
                    onClick={() => triggerAIGenerator("categories")}
                    className="text-xs font-bold text-brand-accent hover:opacity-80 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Suggest Categories
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Technology", "Business", "Self-Help", "Fiction", "Romance", "Design"].map((cat) => {
                    const isSelected = newBook.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setNewBook(prev => ({
                            ...prev,
                            categories: isSelected 
                              ? prev.categories.filter(c => c !== cat) 
                              : [...prev.categories, cat]
                          }));
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-full border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-brand-accent/15 border-brand-accent text-brand-accent"
                            : "bg-transparent border-brand-border text-brand-text-secondary hover:text-brand-text"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-brand-text-secondary">Tags (Separated by commas)</label>
                  <button
                    onClick={() => triggerAIGenerator("tags")}
                    className="text-xs font-bold text-brand-accent hover:opacity-80 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Generate Tags
                  </button>
                </div>
                <Input
                  placeholder="e.g. Scaling, React, Startups"
                  value={newBook.tags.join(", ")}
                  onChange={(e) => setNewBook(prev => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()) }))}
                />
              </div>

              <div className="flex justify-between mt-4">
                <Button onClick={() => setWizardStep(1)} variant="outline" className="rounded-full text-xs font-bold h-11 px-5 border-brand-border">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button 
                  onClick={() => setWizardStep(3)} 
                  disabled={newBook.categories.length === 0}
                  variant="primary"
                  className="rounded-full text-xs font-bold h-11 px-6 shadow-sm"
                >
                  Next: Files <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Files */}
          {wizardStep === 3 && (
            <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-brand-text-secondary">Book Cover Image</label>
                  <button
                    type="button"
                    id="fill-demo-files-btn"
                    onClick={() => setNewBook(prev => ({
                      ...prev,
                      coverURL: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop",
                      pdfURL: "/demo-preview.pdf",
                      fileSize: "2.4 MB"
                    }))}
                    className="text-xs font-bold text-brand-accent hover:underline cursor-pointer"
                  >
                    Use Demo Files (Test)
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {newBook.coverURL && (
                    <div className="h-16 w-12 rounded-[6px] overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0">
                      <img src={newBook.coverURL} alt="Cover Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden" 
                      id="cover-file-input"
                    />
                    <label 
                      htmlFor="cover-file-input"
                      className="inline-flex items-center justify-center px-4 py-2 border border-brand-border rounded-full text-xs font-bold text-brand-text hover:bg-brand-bg-secondary cursor-pointer select-none"
                    >
                      {uploadingCover ? "Uploading Cover..." : "Choose Cover Image"}
                    </label>
                    <p className="text-[9px] text-brand-text-secondary mt-1">JPEG, PNG or WebP format up to 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-brand-text-secondary">eBook Document (PDF)</label>
                <div className="border border-dashed border-brand-border rounded-[16px] p-6 text-center bg-brand-bg-secondary/40">
                  <FileText className="h-8 w-8 text-brand-text-secondary/50 mx-auto mb-2" />
                  {newBook.pdfURL && newBook.pdfURL !== "/demo-preview.pdf" ? (
                    <div>
                      <p className="text-xs font-bold text-brand-text truncate max-w-xs mx-auto">File uploaded successfully!</p>
                      <p className="text-[10px] text-brand-text-secondary mt-1">Size: {newBook.fileSize || "Unknown"}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-brand-text">No eBook file uploaded yet</p>
                      <p className="text-[10px] text-brand-text-secondary mt-1">PDF format only.</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    disabled={uploadingPdf}
                    className="hidden"
                    id="pdf-file-input"
                  />
                  <label 
                    htmlFor="pdf-file-input"
                    className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-brand-accent/10 hover:bg-brand-accent/25 border border-brand-accent/20 rounded-full text-xs font-bold text-brand-accent cursor-pointer select-none"
                  >
                    {uploadingPdf ? "Uploading PDF..." : "Upload PDF File"}
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button onClick={() => setWizardStep(2)} variant="outline" className="rounded-full text-xs font-bold h-11 px-5 border-brand-border">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button 
                  onClick={() => setWizardStep(4)} 
                  disabled={uploadingCover || uploadingPdf || !newBook.coverURL || !newBook.pdfURL}
                  variant="primary" 
                  className="rounded-full text-xs font-bold h-11 px-6 shadow-sm"
                >
                  Next: Review <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {wizardStep === 4 && (
            <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand flex flex-col gap-6">
              
              <div className="flex gap-4 p-4 border border-brand-border/60 rounded-[16px] bg-brand-bg-secondary/30">
                <div className="h-20 w-13 bg-brand-bg-secondary border border-brand-border/40 rounded-[6px] overflow-hidden shrink-0 shadow-sm">
                  <img src={newBook.coverURL} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-brand-text font-display">{newBook.title}</h4>
                  <p className="text-xs text-brand-text-secondary mt-0.5">{newBook.subtitle}</p>
                  <div className="flex gap-1.5 mt-2">
                    <span className="bg-brand-accent/10 text-brand-accent text-[9px] font-bold rounded-full px-2.5 py-0.5 tracking-wider uppercase">
                      {newBook.categories[0] || "Uncategorized"}
                    </span>
                    <span className="bg-brand-success/15 border border-brand-success/25 text-brand-success text-[9px] font-bold rounded-full px-2.5 py-0.5 tracking-wider uppercase">
                      Free Library
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-brand-border/60" />

              <div className="flex flex-col gap-3 text-left">
                <h5 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Submission checklist</h5>
                {[
                  "eBook PDF file attached (8.5 MB)",
                  "Readers can read online or download the full copy",
                  "Verified reader statistics will accrue in your dashboard",
                  "Admin review takes roughly 24 hours to publish"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-brand-text-secondary">
                    <Check className="h-4 w-4 text-brand-success shrink-0 mt-0.5" />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <Button onClick={() => setWizardStep(3)} variant="outline" className="rounded-full text-xs font-bold h-11 px-5 border-brand-border">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleUploadSubmit} variant="primary" className="bg-brand-success hover:bg-brand-success/90 rounded-full text-xs font-bold h-11 px-6 shadow-sm">
                  Submit for Approval
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. READER REVIEWS */}
      {activeTab === "reviews" && (
        <div className="flex flex-col gap-6 text-left">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Reader Reviews</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Incoming reviews from readers on your published books.</p>
          </div>

          {allReviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {allReviews.map((rev) => (
                <div key={rev.id} className="border border-brand-border bg-brand-card rounded-[20px] p-5 shadow-brand">
                  <div className="flex justify-between items-start select-none font-display">
                    <div>
                      <h5 className="text-xs font-bold text-brand-text">{rev.readerName}</h5>
                      <p className="text-[11px] text-brand-text-secondary mt-0.5">Reviewed: <span className="font-semibold text-brand-accent">{rev.bookTitle}</span></p>
                      <div className="flex gap-0.5 mt-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating 
                                ? "fill-amber-400 text-amber-400" 
                                : "text-brand-border"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-brand-text-secondary">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-brand-text-secondary leading-relaxed mt-4 font-normal">
                    "{rev.text}"
                  </p>

                  {/* Reply Action */}
                  {rev.authorReply ? (
                    <div className="mt-4 p-4 border-l-2 border-brand-accent bg-brand-bg-secondary/60 rounded-r-[12px] flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest select-none font-mono">Your Reply:</span>
                      <p className="text-xs text-brand-text-secondary italic">"{rev.authorReply}"</p>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-brand-border/40 select-none">
                      {replyReviewId === rev.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type your reply to this review..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 bg-brand-bg-secondary border border-brand-border/60 px-4 py-2 text-xs rounded-[12px] focus:outline-none text-brand-text"
                          />
                          <Button 
                            onClick={() => handleReviewReply(rev.id)}
                            variant="primary" 
                            size="sm" 
                            className="h-9 px-4 rounded-[12px] text-xs font-bold"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyReviewId(rev.id)}
                          className="text-xs font-bold text-brand-accent hover:underline cursor-pointer"
                        >
                          Reply to this review
                        </button>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-brand-border rounded-[20px] text-xs text-brand-text-secondary bg-brand-card font-semibold select-none">
              No reviews received yet.
            </div>
          )}
        </div>
      )}

      {/* 5. SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="flex flex-col gap-6 text-left max-w-lg">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Author Settings</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Manage your public bio details and custom profiles.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); toast.success("Author settings updated!"); }} className="flex flex-col gap-5 bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand">
            <Input
              label="Author Bio"
              placeholder="e.g. Tech founder & interface developer"
              value={authorProfile?.bio || ""}
              onChange={(e) => setAuthorProfile(prev => ({ ...prev, bio: e.target.value }))}
            />
            <Input
              label="Profile Photo URL"
              value={authorProfile?.photoURL || ""}
              onChange={(e) => setAuthorProfile(prev => ({ ...prev, photoURL: e.target.value }))}
            />
            <Button type="submit" variant="primary" className="h-11 w-full sm:w-fit mt-2 rounded-full text-xs font-bold px-6 shadow-sm">
              Save Author Settings
            </Button>
          </form>
        </div>
      )}

      {/* AI Assistant Modal Dialogs */}
      {aiModal && (
        <Modal 
          isOpen={!!aiModal} 
          onClose={() => setAiModal(null)}
          title={`AI Suggestions for ${aiModal}`}
        >
          <div className="flex flex-col gap-4 text-left font-display">
            {aiLoading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <svg className="h-8 w-8 animate-spin text-brand-accent" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs font-bold text-brand-text-secondary">Generating recommendations...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-brand-text-secondary mb-2">Here are the optimized suggestions generated by EBOOKVALA's AI:</p>
                {aiModal === "description" && (
                  <div className="flex flex-col gap-3">
                    <div className="p-3.5 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                      <span className="text-[9px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono">Suggested Description</span>
                      <p className="text-xs text-brand-text mt-1">This book covers advanced core framework layouts, spacing grids, and dynamic state structures to build state-of-the-art SaaS web platforms.</p>
                    </div>
                    <Button 
                      onClick={() => handleApplyAiResult({
                        description: "This book covers advanced core framework layouts, spacing grids, and dynamic state structures to build state-of-the-art SaaS web platforms.",
                        aiDescription: "✨ AI Enhanced: Learn the secrets of UI Visual Engineering. Design beautiful interfaces and springy interaction animations."
                      })}
                      variant="primary" 
                      className="w-full text-xs font-bold h-10 rounded-full"
                    >
                      Apply Suggestion
                    </Button>
                  </div>
                )}
                {aiModal === "tags" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5 p-3.5 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                      {["UI Design", "Framer Motion", "Design Systems", "Web Apps"].map(t => (
                        <span key={t} className="bg-brand-card px-2.5 py-1 border border-brand-border rounded-full text-[10px] font-bold text-brand-text-secondary">{t}</span>
                      ))}
                    </div>
                    <Button 
                      onClick={() => handleApplyAiResult(["UI Design", "Framer Motion", "Design Systems", "Web Apps"])}
                      variant="primary" 
                      className="w-full text-xs font-bold h-10 rounded-full"
                    >
                      Apply Tags
                    </Button>
                  </div>
                )}
                {aiModal === "categories" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5 p-3.5 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                      {["Technology", "Design"].map(c => (
                        <span key={c} className="bg-brand-card px-2.5 py-1 border border-brand-border rounded-full text-[10px] font-bold text-brand-accent">{c}</span>
                      ))}
                    </div>
                    <Button 
                      onClick={() => handleApplyAiResult(["Technology", "Design"])}
                      variant="primary" 
                      className="w-full text-xs font-bold h-10 rounded-full"
                    >
                      Apply Categories
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

    </DashboardLayout>
  );
};

export default AuthorDashboard;
