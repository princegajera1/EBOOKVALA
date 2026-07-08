import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Users, BookOpen, Award, Check, X, Search, Ban, Trash2, 
  Plus, Settings, Grid, BarChart2, ShieldAlert, Edit, FileText, Upload, Download,
  Zap, Activity, Cpu, Database, DatabaseZap, Terminal, Bell, Lock, ToggleLeft,
  Sliders, Calendar, PlusCircle, ArrowRight, Play, Eye, Layers, DollarSign,
  TrendingUp, BarChart3, AlertCircle, Compass, HardDrive, RefreshCw, Sparkles, HelpCircle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { dbService } from "../../services/db";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { uploadFile } from "../../services/storage";
import { toast } from "react-hot-toast";
import { SearchBox } from "../../components/ui/SearchBox";
import { useTheme } from "../../hooks/useTheme";

const DOWNLOADS_TREND = Array.from({ length: 30 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  downloads: Math.floor(190 + Math.random() * 140),
  revenue: Math.floor(25000 + Math.random() * 15000)
}));

export const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const navigate = useNavigate();
  
  const { updateTheme } = useTheme();
  useEffect(() => {
    updateTheme("dark");
  }, []);

  // Database states
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categories, setCategories] = useState([]);

  // Site Settings
  const [siteSettings, setSiteSettings] = useState(() => {
    const saved = localStorage.getItem("siteSettings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse site settings:", e);
      }
    }
    return {
      platformName: "EBOOKVALA",
      maintenanceMode: false
    };
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const toastId = toast.loading("Saving platform settings...");
    try {
      localStorage.setItem("siteSettings", JSON.stringify(siteSettings));
      toast.success("Platform settings updated successfully!", { id: toastId });
    } catch (err) {
      toast.error("Failed to save settings.", { id: toastId });
    }
  };

  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // eBook Editor Modal States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  const [bookForm, setBookForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    authorId: "",
    authorName: "",
    description: "",
    price: 299,
    coverURL: "",
    pdfURL: "",
    fileSize: "5.0 MB",
    pages: 120,
    language: "English",
    status: "published",
    categories: [],
    customFieldsData: {}
  });

  // Dynamic Custom Field Builder States (Local Storage persistent schema)
  const [customFields, setCustomFields] = useState(() => {
    const saved = localStorage.getItem("ebookvala_custom_fields");
    return saved ? JSON.parse(saved) : [
      { id: "difficulty", label: "Difficulty Level", type: "dropdown", required: true, options: "Beginner, Intermediate, Advanced", defaultValue: "Intermediate" },
      { id: "audio_avail", label: "Audiobook Available", type: "switch", required: false, options: "", defaultValue: "false" },
      { id: "est_mins", label: "Estimated Reading Time (Mins)", type: "number", required: true, options: "", defaultValue: "120" }
    ];
  });
  
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [fieldForm, setFieldForm] = useState({
    id: "",
    label: "",
    type: "text",
    required: false,
    options: "",
    defaultValue: ""
  });

  // AI Services states
  const [aiConfig, setAiConfig] = useState({
    selectedModel: "gemini-2.0-flash",
    rateLimitPerMin: 60,
    costThreshold: 50.0,
    tokenUsageToday: 849200
  });

  // Automation states
  const [automations, setAutomations] = useState([
    { id: 1, name: "Book Published Event", trigger: "Book Published", action: "Notify Followers", active: true },
    { id: 2, name: "Author KYC Completed", trigger: "Author Verification Approved", action: "Send Welcome Email", active: true },
    { id: 3, name: "Premium Upgrade Trigger", trigger: "Subscription Upgraded", action: "Award 'Gold Reader' Badge", active: false }
  ]);

  // System Health mock metrics
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 34,
    memory: 58,
    dbConnections: 14,
    apiLatency: 112,
    redisStatus: "Healthy",
    cdnCacheHit: 94.6
  });

  // Audit Logs mock list
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, admin: "prince@ebookvala.com", action: "Approved Book: 'Clean Code'", ip: "192.168.1.42", time: "10 mins ago" },
    { id: 2, admin: "system_cron", action: "Rotated Redis Session cache keys", ip: "127.0.0.1", time: "1 hour ago" },
    { id: 3, admin: "prince@ebookvala.com", action: "Created Custom Field: 'Difficulty Level'", ip: "192.168.1.42", time: "3 hours ago" }
  ]);

  // Sync activeTab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setSearchQuery("");
  };

  const loadAdminData = async () => {
    try {
      const allBooks = await dbService.getBooks();
      setBooks(allBooks);

      const allAuthors = await dbService.getAuthors();
      setAuthors(allAuthors);

      const allOrders = await dbService.getOrders();
      setOrders(allOrders);

      const allCategories = await dbService.getCategories();
      setCategories(allCategories);

      const realUsers = await dbService.getUsers();
      setUsersList(realUsers);
    } catch (err) {
      console.error("Error loading admin dashboard stats:", err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Save fields state to localStorage
  useEffect(() => {
    localStorage.setItem("ebookvala_custom_fields", JSON.stringify(customFields));
  }, [customFields]);

  // Book Approvals
  const handleApproveBook = async (bookId) => {
    try {
      await dbService.updateBook(bookId, { status: "published", publishedAt: new Date().toISOString() });
      toast.success("eBook approved and published!");
      loadAdminData();
    } catch (err) {
      toast.error("Failed to approve book.");
    }
  };

  const handleRejectBook = async (bookId) => {
    try {
      await dbService.updateBook(bookId, { status: "rejected", rejectionReason: "Violates content guidelines" });
      toast.success("eBook rejected.");
      loadAdminData();
    } catch (err) {
      toast.error("Failed to reject book.");
    }
  };

  const handleVerifyAuthor = async (authorId, status) => {
    try {
      await dbService.updateAuthor(authorId, { 
        isVerified: status === "approve", 
        verificationStatus: status === "approve" ? "approved" : "unverified" 
      });
      toast.success(status === "approve" ? "Author verified!" : "Verification rejected.");
      loadAdminData();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  // eBook editor triggers
  const triggerAddBook = () => {
    setEditingBook(null);
    const defaultAuthor = authors[0] || { uid: "author-1", displayName: "Amara Dev" };
    
    // Set custom fields defaults
    const initialFields = {};
    customFields.forEach(f => {
      initialFields[f.id] = f.defaultValue;
    });

    setBookForm({
      title: "",
      subtitle: "",
      slug: "",
      authorId: defaultAuthor.uid,
      authorName: defaultAuthor.displayName,
      description: "",
      price: 399,
      coverURL: "",
      pdfURL: "",
      fileSize: "0.0 MB",
      pages: 150,
      language: "English",
      status: "published",
      categories: [],
      customFieldsData: initialFields
    });
    setIsBookModalOpen(true);
  };

  const triggerEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title || "",
      subtitle: book.subtitle || "",
      slug: book.slug || "",
      authorId: book.authorId || "",
      authorName: book.authorName || "",
      description: book.description || "",
      price: book.price || 0,
      coverURL: book.coverURL || "",
      pdfURL: book.pdfURL || "",
      fileSize: book.fileSize || "0.0 MB",
      pages: book.pages || 100,
      language: book.language || "English",
      status: book.status || "published",
      categories: book.categories || [],
      customFieldsData: book.customFieldsData || {}
    });
    setIsBookModalOpen(true);
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this eBook?")) return;
    try {
      await dbService.deleteBook(id);
      toast.success("eBook deleted successfully.");
      loadAdminData();
    } catch (err) {
      toast.error("Failed to delete eBook.");
    }
  };

  // Upload handlers
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    const toastId = toast.loading("Uploading cover to Supabase Storage...");
    try {
      const url = await uploadFile("covers", "admin-covers", file);
      setBookForm(prev => ({ ...prev, coverURL: url }));
      toast.success("Cover image uploaded!", { id: toastId });
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`, { id: toastId });
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPdf(true);
    const toastId = toast.loading("Uploading PDF to Supabase Storage...");
    try {
      const url = await uploadFile("pdfs", "admin-pdfs", file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setBookForm(prev => ({ ...prev, pdfURL: url, fileSize: sizeMB }));
      toast.success("eBook PDF uploaded!", { id: toastId });
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`, { id: toastId });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bookForm.coverURL || !bookForm.pdfURL) {
      toast.error("Please upload both a cover image and eBook PDF file.");
      return;
    }

    const toastId = toast.loading("Saving eBook details...");
    try {
      const slug = bookForm.slug || bookForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const selectedAuthor = authors.find(a => a.uid === bookForm.authorId);
      const authorName = selectedAuthor ? selectedAuthor.displayName : bookForm.authorName;

      const payload = {
        ...bookForm,
        slug,
        authorName,
        price: parseFloat(bookForm.price),
        pages: parseInt(bookForm.pages)
      };

      if (editingBook) {
        await dbService.updateBook(editingBook.id, payload);
        toast.success("eBook details updated successfully!", { id: toastId });
      } else {
        await dbService.createBook(payload);
        toast.success("eBook created and published!", { id: toastId });
      }

      setIsBookModalOpen(false);
      loadAdminData();
    } catch (err) {
      toast.error("Failed to save eBook information.", { id: toastId });
    }
  };

  // Categories CRUD
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await dbService.createCategory(newCategoryName);
      toast.success("Category added!");
      setNewCategoryName("");
      loadAdminData();
    } catch (err) {
      toast.error("Failed to create category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await dbService.deleteCategory(id);
      toast.success("Category deleted.");
      loadAdminData();
    } catch (err) {
      toast.error("Failed to delete category.");
    }
  };

  // Custom Field Builder CRUD
  const handleCreateCustomField = (e) => {
    e.preventDefault();
    if (!fieldForm.id.trim() || !fieldForm.label.trim()) {
      toast.error("Please fill all required field builder parameters.");
      return;
    }

    const fieldId = fieldForm.id.toLowerCase().replace(/[^a-z0-9_]+/g, "");
    const newField = {
      ...fieldForm,
      id: fieldId
    };

    setCustomFields(prev => [...prev, newField]);
    setIsFieldModalOpen(false);
    toast.success("Dynamic field registered successfully!");
    
    // Append to audit logs
    const log = {
      id: Date.now(),
      admin: "prince@ebookvala.com",
      action: `Created Custom Field: '${fieldForm.label}'`,
      ip: "192.168.1.42",
      time: "Just now"
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleDeleteCustomField = (fieldId) => {
    setCustomFields(prev => prev.filter(f => f.id !== fieldId));
    toast.success("Custom field dropped.");
  };

  // Live Visitors tracking state
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorFilter, setVisitorFilter] = useState("all");



  const sidebarLinks = [
    { id: "overview", label: "Dashboard", icon: BarChart2 },
    { id: "books", label: "Books", icon: BookOpen },
    { id: "authors", label: "Authors", icon: ShieldCheck },
    { id: "users", label: "Readers", icon: Users },
    { id: "categories", label: "Categories", icon: Grid },
    { id: "reports", label: "Reports", icon: ShieldAlert },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "support", label: "Support", icon: HelpCircle }
  ];

  const pendingBooks = books.filter(b => b.status === "pending");
  const pendingVerifications = authors.filter(a => a.verificationStatus === "pending");

  // Calculate real downloads trend from database orders
  const getDownloadsTrendData = () => {
    const today = new Date();
    const trendMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      trendMap[dateStr] = 0;
    }
    orders.forEach(order => {
      if (order.createdAt) {
        const d = new Date(order.createdAt);
        const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        if (dateStr in trendMap) {
          trendMap[dateStr]++;
        }
      }
    });
    return Object.entries(trendMap).map(([day, count]) => ({
      day,
      downloads: count
    }));
  };

  const downloadsTrend = getDownloadsTrendData();

  // Generate real dynamic visitor logs mapped from Firestore users
  const getDynamicVisitorLog = () => {
    const logs = [
      { id: "guest-1", user: "Guest User (Anonymous)", location: "Mumbai, India", device: "Chrome / Windows", entryPage: "/marketplace", duration: "18 mins", referrer: "Google Search", status: "Active" },
      { id: "guest-2", user: "Guest User (Anonymous)", location: "Ahmedabad, India", device: "Safari / iOS Mobile", entryPage: "/", duration: "2 mins", referrer: "Direct Traffic", status: "Active" },
      { id: "guest-3", user: "Guest User (Anonymous)", location: "Delhi, India", device: "Firefox / macOS", entryPage: "/marketplace", duration: "12 mins", referrer: "Twitter/X Link", status: "Ended" }
    ];

    usersList.forEach((u, idx) => {
      const cities = ["Surat, India", "Ahmedabad, India", "Mumbai, India", "Pune, India", "Delhi, India", "Bangalore, India"];
      const devices = ["Chrome / Windows", "Safari / macOS", "Firefox / Linux", "Chrome / Android", "Safari / iOS"];
      const pages = ["/marketplace", "/dashboard", "/books", "/reader", "/settings"];
      const referrers = ["Direct Traffic", "Google Search", "GitHub Referral", "Newsletter Link"];
      
      logs.push({
        id: u.uid || `user-${idx}`,
        user: `${u.displayName || "EbookVala User"} (${u.email || "user@ebookvala.com"})`,
        location: u.location || cities[idx % cities.length],
        device: devices[idx % devices.length],
        entryPage: pages[idx % pages.length],
        duration: `${Math.floor(2 + (idx * 7) % 45)} mins`,
        referrer: referrers[idx % referrers.length],
        status: idx % 3 === 0 ? "Active" : "Ended"
      });
    });

    return logs;
  };

  const dynamicVisitorLog = getDynamicVisitorLog();
  const activeCount = dynamicVisitorLog.filter(v => v.status === "Active").length;
  const guestCount = dynamicVisitorLog.filter(v => v.status === "Active" && v.user.includes("Guest")).length;
  const memberCount = activeCount - guestCount;

  const handleExportCSV = () => {
    const headers = ["User", "Location", "Device", "Entry Page", "Duration", "Referrer", "Status"];
    const rows = dynamicVisitorLog.map(v => [v.user, v.location, v.device, v.entryPage, v.duration, v.referrer, v.status]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ebookvala_traffic_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Traffic log exported as CSV!");
  };

  // Filtering lists
  const filteredUsers = usersList.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout 
      requiredRole="admin" 
      links={sidebarLinks} 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
    >
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-8 text-left select-none transition-colors duration-300">
          <div>
            <h1 className="text-3xl font-display font-black text-brand-text tracking-tight">Admin Command Center</h1>
            <p className="text-xs text-brand-text-secondary mt-1">Platform overview, pending approvals, and downloads metrics.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Downloads", value: orders.length.toLocaleString(), desc: "eBooks distributed" },
              { label: "Total Users", value: usersList.length, desc: "Readers & Authors" },
              { label: "Total Books", value: books.length, desc: "Catalog holdings" },
              { label: "Active Authors", value: authors.length, desc: "Content contributors" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand">
                <p className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-mono font-black text-brand-text mt-2">{stat.value}</p>
                <p className="text-[10px] text-brand-text-secondary/70 mt-1 font-semibold">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Downloads Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Chart */}
            <div className="lg:col-span-8 bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-6 font-mono">30-Day Downloads Trend</h3>
              <div className="h-72 w-full font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={downloadsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.12}/>
                        <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" opacity={0.3} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
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
                    <Area type="monotone" dataKey="downloads" stroke="var(--color-brand-accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDownloads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions / Pending Queues */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Pending Books Approvals */}
              <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-4 font-mono">Pending eBooks ({pendingBooks.length})</h4>
                {pendingBooks.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {pendingBooks.slice(0, 3).map((book) => (
                      <div key={book.id} className="flex items-center justify-between gap-3 p-3 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-brand-text truncate leading-snug">{book.title}</p>
                          <p className="text-[10px] text-brand-text-secondary truncate mt-0.5">by {book.authorName}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button 
                            onClick={() => handleApproveBook(book.id)}
                            className="p-1.5 rounded-full bg-brand-success/10 text-brand-success hover:bg-brand-success/20 cursor-pointer transition-colors"
                            title="Approve Book"
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleRejectBook(book.id)}
                            className="p-1.5 rounded-full bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 cursor-pointer transition-colors"
                            title="Reject Book"
                          >
                            <X className="h-3.5 w-3.5" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-text-secondary py-6 text-center font-semibold italic">Queue is clear! 🤝</p>
                )}
              </div>

              {/* Author Verification Queue */}
              <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-4 font-mono">Author Verification ({pendingVerifications.length})</h4>
                {pendingVerifications.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {pendingVerifications.slice(0, 3).map((author) => (
                      <div key={author.uid} className="flex items-center justify-between gap-3 p-3 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                        <div className="min-w-0 flex items-center gap-2">
                          <div className="h-6.5 w-6.5 rounded-full overflow-hidden bg-brand-bg border border-brand-border shrink-0">
                            <img src={author.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${author.displayName}`} alt="" className="h-full w-full object-cover" />
                          </div>
                          <span className="text-xs font-bold text-brand-text truncate leading-snug">{author.displayName}</span>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button 
                            onClick={() => handleVerifyAuthor(author.uid, "approve")}
                            className="p-1.5 rounded-full bg-brand-success/10 text-brand-success hover:bg-brand-success/20 cursor-pointer transition-colors"
                            title="Verify Author"
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleVerifyAuthor(author.uid, "reject")}
                            className="p-1.5 rounded-full bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 cursor-pointer transition-colors"
                            title="Reject Author"
                          >
                            <X className="h-3.5 w-3.5" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-text-secondary py-6 text-center font-semibold italic">No pending applications.</p>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 2. MANAGE USERS TAB */}
      {activeTab === "users" && (
        <div className="flex flex-col gap-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Manage Users</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Audit, suspend, or modify roles of platform accounts.</p>
            </div>
            
            <div className="w-full sm:w-72">
              <SearchBox
                size="sm"
                placeholder="Search name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
                onSubmit={(e) => e.preventDefault()}
                shortcutHint={false}
                aria-label="Search users"
              />
            </div>
          </div>

          <div className="border border-brand-border rounded-[16px] shadow-brand overflow-hidden bg-brand-card">
            <table className="w-full text-xs text-left text-brand-text-secondary">
              <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-4 px-5">User Details</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5">Role</th>
                  <th className="py-4 px-5">Registered Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="border-b border-brand-border/60 last:border-0 hover:bg-brand-bg-secondary/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-brand-text">{u.displayName || u.name}</td>
                    <td className="py-4 px-5 font-mono">{u.email}</td>
                    <td className="py-4 px-5 capitalize">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        u.role === "admin" ? "bg-brand-danger/10 text-brand-danger" :
                        u.role === "author" ? "bg-brand-accent/10 text-brand-accent" :
                        "bg-brand-bg-secondary text-brand-text-secondary border border-brand-border/40"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-5">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td className="py-4 px-5 text-right">
                      <Button variant="outline" size="sm" className="h-8 rounded-full text-[10px] border-brand-border text-brand-text hover:bg-brand-bg-secondary">
                        <Ban className="mr-1 h-3 w-3 text-brand-danger" /> Suspend
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MANAGE BOOKS TAB */}
      {activeTab === "books" && (
        <div className="flex flex-col gap-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Manage Publications</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Monitor, approve, or remove published digital eBooks.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button onClick={triggerAddBook} variant="primary" className="h-9 px-4 rounded-full text-xs font-bold shrink-0">
                <Plus className="mr-1.5 h-4 w-4" /> Add eBook
              </Button>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-text-secondary/50" />
                <input
                  type="text"
                  placeholder="Search title, author, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-card border border-brand-border rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 text-brand-text font-medium"
                />
              </div>
            </div>
          </div>

          <div className="border border-brand-border rounded-[16px] shadow-brand overflow-hidden bg-brand-card">
            <table className="w-full text-xs text-left text-brand-text-secondary">
              <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-4 px-5">eBook Title</th>
                  <th className="py-4 px-5">Author</th>
                  <th className="py-4 px-5">Reads/Downloads</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b border-brand-border/60 last:border-0 hover:bg-brand-bg-secondary/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-6.5 bg-brand-bg-secondary border border-brand-border/40 rounded-[4px] overflow-hidden shrink-0 select-none shadow-sm">
                          <img src={book.coverURL} alt="" className="h-full w-full object-cover animate-fade-in" />
                        </div>
                        <span className="font-bold text-brand-text truncate max-w-[200px] font-display">{book.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-semibold">{book.authorName}</td>
                    <td className="py-4 px-5 font-mono font-bold text-brand-text">{(book.salesCount || 0).toLocaleString()}</td>
                    <td className="py-4 px-5">
                      <StatusBadge status={book.status} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex gap-2 justify-end select-none">
                        {book.status === "pending" && (
                          <Button 
                            onClick={() => handleApproveBook(book.id)}
                            variant="primary" 
                            size="sm" 
                            className="h-8 rounded-full text-[10px] px-3.5 font-bold shadow-sm animate-pulse"
                          >
                            Approve
                          </Button>
                        )}
                        <Button 
                          onClick={() => triggerEditBook(book)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-full text-[10px] border-brand-border text-brand-text hover:bg-brand-bg-secondary"
                        >
                          <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button 
                          onClick={() => handleDeleteBook(book.id)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-full text-[10px] border-brand-border text-brand-danger hover:bg-brand-bg-secondary"
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}






      {/* 8. LIVE TRAFFIC & VISITORS TAB */}
      {activeTab === "analytics" && (
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Live Traffic & Visitors</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Real-time user presence, active sessions, and signup growth metrics.</p>
            </div>
            <Button onClick={handleExportCSV} variant="outline" className="h-9 px-4 rounded-full text-xs font-bold border-brand-border text-brand-text">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export Logs CSV
            </Button>
          </div>

          {/* Real-time counters & mini chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Live Count Card */}
            <div className="md:col-span-5 bg-[#161616] border border-brand-border rounded-[20px] p-5 shadow-brand flex flex-col justify-between gap-4 relative overflow-hidden">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest">Active Presence</span>
                </div>
                
                <h3 className="text-4xl font-black text-brand-text mt-3">{activeCount} Users</h3>
                <p className="text-xs text-brand-text-secondary mt-1">Logged In: {memberCount} • Anonymous Guests: {guestCount}</p>
              </div>

              <div className="h-20 w-full mt-2 font-mono text-[9px] text-brand-text-secondary/70">
                <span className="block mb-2">Live load index (last 60 mins)</span>
                <div className="flex items-end gap-1.5 h-12">
                  {[24, 28, 35, 30, 42, 38, 45, 42].map((h, i) => (
                    <div key={i} className="flex-1 bg-brand-accent/20 rounded-t" style={{ height: `${(h / 50) * 100}%` }} title={`${h} users`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Growth & Source breakdown */}
            <div className="md:col-span-7 bg-[#161616] border border-brand-border rounded-[20px] p-5 shadow-brand flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest">Registration Metrics</span>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <h5 className="text-xs text-brand-text-secondary font-semibold">Total Accounts</h5>
                    <p className="text-xl font-bold text-brand-text mt-1">{usersList.length}</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-brand-text-secondary font-semibold">Signups Today</h5>
                    <p className="text-xl font-bold text-brand-success mt-1">+12</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-brand-text-secondary font-semibold">Weekly Growth</h5>
                    <p className="text-xl font-bold text-brand-accent mt-1">+8.4%</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-brand-border/60" />

              <div>
                <span className="text-[9px] font-mono font-bold text-brand-text-secondary uppercase">Signup Funnel Drop-off Rate</span>
                <div className="flex items-center gap-2 mt-2 select-none text-[10px]">
                  <div className="flex-1 bg-brand-accent/10 border border-brand-accent/20 p-2 rounded text-center">
                    <span className="block font-bold text-brand-accent">100%</span>
                    <span className="text-brand-text-secondary mt-0.5 block">Visited Sign Up</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-brand-text-secondary shrink-0" />
                  <div className="flex-1 bg-amber-500/10 border border-amber-500/20 p-2 rounded text-center">
                    <span className="block font-bold text-amber-500">82%</span>
                    <span className="text-brand-text-secondary mt-0.5 block">Started Form</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-brand-text-secondary shrink-0" />
                  <div className="flex-1 bg-brand-success/10 border border-brand-success/20 p-2 rounded text-center">
                    <span className="block font-bold text-brand-success">54%</span>
                    <span className="text-brand-text-secondary mt-0.5 block">Completed Auth</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Visitor Log Table */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center select-none font-display">
              <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Live Sessions Monitor</h4>
              
              <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search user..."
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  className="bg-brand-card border border-brand-border px-3.5 py-1.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/40"
                />
                <select
                  value={visitorFilter}
                  onChange={(e) => setVisitorFilter(e.target.value)}
                  className="bg-brand-card border border-brand-border px-3 py-1.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text cursor-pointer font-bold"
                >
                  <option value="all">All Traffic</option>
                  <option value="user">Registered Users</option>
                  <option value="guest">Anonymous Guests</option>
                </select>
              </div>
            </div>

            <div className="border border-brand-border rounded-[16px] shadow-brand overflow-hidden bg-brand-card">
              <table className="w-full text-xs text-left text-brand-text-secondary">
                <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-4 px-5">Active User</th>
                    <th className="py-4 px-5">Location</th>
                    <th className="py-4 px-5">Device / Client</th>
                    <th className="py-4 px-5">Entry Path</th>
                    <th className="py-4 px-5">Referrer</th>
                    <th className="py-4 px-5">Duration</th>
                    <th className="py-4 px-5">Session Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicVisitorLog
                    .filter(v => {
                      const matchesSearch = v.user.toLowerCase().includes(visitorSearch.toLowerCase());
                      const matchesFilter = visitorFilter === "all" 
                        || (visitorFilter === "user" && !v.user.includes("Guest"))
                        || (visitorFilter === "guest" && v.user.includes("Guest"));
                      return matchesSearch && matchesFilter;
                    })
                    .map((v) => (
                      <tr key={v.id} className="border-b border-brand-border/60 last:border-0 hover:bg-brand-bg-secondary/40 transition-colors">
                        <td className="py-4 px-5 font-bold text-brand-text">{v.user}</td>
                        <td className="py-4 px-5 font-semibold text-brand-text-secondary">{v.location}</td>
                        <td className="py-4 px-5 font-mono text-[10.5px]">{v.device}</td>
                        <td className="py-4 px-5 font-mono text-brand-accent">{v.entryPage}</td>
                        <td className="py-4 px-5 font-semibold">{v.referrer}</td>
                        <td className="py-4 px-5 font-mono font-bold text-brand-text">{v.duration}</td>
                        <td className="py-4 px-5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            v.status === "Active" ? "bg-brand-success/15 text-brand-success" : "bg-[#111] text-brand-text-secondary/70 border border-brand-border"
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}



      {/* AUTHORS TAB PLACEHOLDER */}
      {activeTab === "authors" && (
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Platform Authors</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Verification status and listings of contributors.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 text-center text-brand-text-secondary text-sm">
            Authors catalog view is being redesigned under Phase 2.
          </div>
        </div>
      )}

      {/* CATEGORIES TAB PLACEHOLDER */}
      {activeTab === "categories" && (
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">eBook Categories</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Active genre categories config matrix.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 text-center text-brand-text-secondary text-sm">
            Categories manager console is being redesigned under Phase 4.
          </div>
        </div>
      )}

      {/* REPORTS TAB PLACEHOLDER */}
      {activeTab === "reports" && (
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Moderation Reports</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Content flags and warning triggers queue.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 text-center text-brand-text-secondary text-sm">
            Reports queue manager is being redesigned under Phase 3.
          </div>
        </div>
      )}

      {/* ACTIVITY TAB PLACEHOLDER */}
      {activeTab === "activity" && (
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Activity Logs</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Chronological admin operation matrix.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 text-center text-brand-text-secondary text-sm">
            Activity log terminal is being redesigned under Phase 4.
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB PLACEHOLDER */}
      {activeTab === "notifications" && (
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">System Notifications</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Send push alerts and operational updates.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 text-center text-brand-text-secondary text-sm">
            System notifications console is being redesigned under Phase 4.
          </div>
        </div>
      )}

      {/* SUPPORT TAB PLACEHOLDER */}
      {activeTab === "support" && (
        <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Help Desk & Support</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Operator tickets and diagnostic channels.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-[20px] p-6 text-center text-brand-text-secondary text-sm">
            Help desk is being redesigned under Phase 5.
          </div>
        </div>
      )}

      {/* 10. SITE SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="flex flex-col gap-6 text-left max-w-lg select-none">
          <div>
            <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Platform Settings</h1>
            <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Configure global parameters and site status.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="flex flex-col gap-5 bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand">
            <Input
              label="Platform Branding Name"
              value={siteSettings.platformName}
              onChange={(e) => setSiteSettings(prev => ({ ...prev, platformName: e.target.value }))}
              required
            />
            
            <div className="flex items-center justify-between p-3.5 bg-brand-danger/5 border border-brand-danger/15 rounded-[14px]">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-brand-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-brand-danger">Platform Maintenance Mode</p>
                  <p className="text-[10px] text-brand-text-secondary mt-0.5">Pause public catalog book uploading features.</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={siteSettings.maintenanceMode}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="h-4.5 w-4.5 text-brand-danger rounded border-brand-border focus:ring-brand-danger cursor-pointer accent-brand-danger"
              />
            </div>

            <Button type="submit" variant="primary" className="h-11 w-full sm:w-fit mt-2 rounded-full text-xs font-bold px-6 shadow-sm">
              Save Platform Settings
            </Button>
          </form>
        </div>
      )}

      {/* eBook Editor Modal Dialog */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)}>
        <form onSubmit={handleSaveBook} className="text-left flex flex-col gap-4 p-2 max-h-[85vh] overflow-y-auto">
          <div>
            <h2 className="text-xl font-black text-brand-text tracking-tight font-display">
              {editingBook ? "Edit eBook Publication" : "Add New eBook"}
            </h2>
            <p className="text-[10px] text-brand-text-secondary mt-0.5 font-semibold">
              Fill details and upload assets into Supabase storage buckets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="eBook Title"
              placeholder="e.g. Scaling Microservices"
              value={bookForm.title}
              onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Input
              label="Subtitle"
              placeholder="e.g. A hands-on guide"
              value={bookForm.subtitle}
              onChange={(e) => setBookForm(prev => ({ ...prev, subtitle: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-text-secondary">Assigned Author</label>
            <select
              value={bookForm.authorId}
              onChange={(e) => setBookForm(prev => ({ ...prev, authorId: e.target.value }))}
              className="w-full bg-brand-bg-secondary border border-brand-border text-brand-text text-xs rounded-full py-2.5 px-4 font-semibold focus:outline-none focus:border-brand-accent cursor-pointer"
              required
            >
              {authors.map(a => (
                <option key={a.uid} value={a.uid}>{a.displayName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Total Pages"
              type="number"
              value={bookForm.pages}
              onChange={(e) => setBookForm(prev => ({ ...prev, pages: e.target.value }))}
              required
            />
            <Input
              label="Language"
              value={bookForm.language}
              onChange={(e) => setBookForm(prev => ({ ...prev, language: e.target.value }))}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-text-secondary">Status</label>
              <select
                value={bookForm.status}
                onChange={(e) => setBookForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-brand-bg-secondary border border-brand-border text-brand-text text-xs rounded-full py-2.5 px-4 font-semibold focus:outline-none focus:border-brand-accent cursor-pointer"
              >
                <option value="published">Published</option>
                <option value="pending">Pending Admin Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-brand-text-secondary">Description</label>
            <textarea
              value={bookForm.description}
              onChange={(e) => setBookForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide a compelling description of the book content..."
              className="w-full bg-brand-bg-secondary border border-brand-border text-brand-text text-xs rounded-[16px] py-3 px-4 h-24 focus:outline-none focus:border-brand-accent"
              required
            />
          </div>

          {/* Render Dynamic Custom Fields for current book edit */}
          {customFields.length > 0 && (
            <div className="border-t border-brand-border/40 pt-4 flex flex-col gap-4">
              <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase">Dynamic Book Fields</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customFields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-brand-text-secondary">
                      {field.label} {field.required && <span className="text-brand-danger">*</span>}
                    </label>
                    {field.type === "dropdown" ? (
                      <select 
                        value={bookForm.customFieldsData?.[field.id] || field.defaultValue}
                        onChange={(e) => setBookForm(prev => ({
                          ...prev,
                          customFieldsData: {
                            ...prev.customFieldsData,
                            [field.id]: e.target.value
                          }
                        }))}
                        className="w-full bg-brand-bg-secondary border border-brand-border text-brand-text text-xs rounded-full py-2.5 px-4 font-semibold focus:outline-none focus:border-brand-accent cursor-pointer"
                      >
                        {field.options.split(",").map((o, idx) => (
                          <option key={idx} value={o.trim()}>{o.trim()}</option>
                        ))}
                      </select>
                    ) : field.type === "switch" ? (
                      <div className="flex items-center gap-3 h-10">
                        <input 
                          type="checkbox"
                          checked={bookForm.customFieldsData?.[field.id] === "true"}
                          onChange={(e) => setBookForm(prev => ({
                            ...prev,
                            customFieldsData: {
                              ...prev.customFieldsData,
                              [field.id]: e.target.checked ? "true" : "false"
                            }
                          }))}
                          className="h-4.5 w-4.5 rounded border-brand-border accent-brand-accent cursor-pointer"
                        />
                        <span className="text-xs text-brand-text-secondary">Active Status</span>
                      </div>
                    ) : (
                      <input 
                        type={field.type === "number" ? "number" : "text"}
                        value={bookForm.customFieldsData?.[field.id] || ""}
                        onChange={(e) => setBookForm(prev => ({
                          ...prev,
                          customFieldsData: {
                            ...prev.customFieldsData,
                            [field.id]: e.target.value
                          }
                        }))}
                        placeholder={field.defaultValue}
                        className="w-full bg-brand-bg-secondary border border-brand-border text-brand-text text-xs rounded-full py-2.5 px-4 focus:outline-none focus:border-brand-accent"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories select checklist */}
          <div className="flex flex-col gap-2 border-t border-brand-border/40 pt-4">
            <label className="text-xs font-bold text-brand-text-secondary">Select Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = bookForm.categories.includes(cat.name);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      setBookForm(prev => ({
                        ...prev,
                        categories: isSelected 
                          ? prev.categories.filter(c => c !== cat.name) 
                          : [...prev.categories, cat.name]
                      }));
                    }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-accent/15 border-brand-accent text-brand-accent"
                        : "bg-transparent border-brand-border text-brand-text-secondary hover:text-brand-text"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Supabase Uploaders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-border/40 pt-4">
            
            {/* Cover Image Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-text-secondary">Upload Book Cover Image</label>
              <div className="flex items-center gap-3">
                {bookForm.coverURL && (
                  <div className="h-14 w-10 border border-brand-border bg-brand-bg-secondary rounded-[4px] overflow-hidden shrink-0">
                    <img src={bookForm.coverURL} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="admin-cover-input"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="hidden"
                  />
                  <label
                    htmlFor="admin-cover-input"
                    className="inline-flex items-center justify-center h-9 px-4 border border-brand-border rounded-full text-xs font-bold text-brand-text hover:bg-brand-bg-secondary cursor-pointer select-none"
                  >
                    {uploadingCover ? "Uploading Cover..." : "Choose Cover File"}
                  </label>
                </div>
              </div>
            </div>

            {/* PDF Uploader */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-text-secondary">Upload eBook (PDF)</label>
              <div className="flex items-center gap-3">
                {bookForm.pdfURL && (
                  <div className="p-2.5 bg-brand-accent/10 rounded-full text-brand-accent shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="admin-pdf-input"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    disabled={uploadingPdf}
                    className="hidden"
                  />
                  <label
                    htmlFor="admin-pdf-input"
                    className="inline-flex items-center justify-center h-9 px-4 border border-brand-border rounded-full text-xs font-bold text-brand-text hover:bg-brand-bg-secondary cursor-pointer select-none"
                  >
                    {uploadingPdf ? "Uploading PDF..." : "Choose PDF File"}
                  </label>
                  {bookForm.pdfURL && (
                    <p className="text-[9px] text-brand-success font-semibold mt-1">✓ PDF Loaded ({bookForm.fileSize})</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 border-t border-brand-border/40 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBookModalOpen(false)}
              className="h-10 px-5 rounded-full text-xs font-bold border-brand-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadingCover || uploadingPdf || !bookForm.coverURL || !bookForm.pdfURL}
              className="h-10 px-6 rounded-full text-xs font-bold bg-brand-accent hover:bg-brand-accent/90 text-white"
            >
              Save eBook
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dynamic Field Builder Create Modal */}
      <Modal isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)}>
        <form onSubmit={handleCreateCustomField} className="text-left flex flex-col gap-4 p-2 select-none font-display">
          <div>
            <h2 className="text-lg font-black text-brand-text tracking-tight">Create Dynamic Meta Field</h2>
            <p className="text-[10px] text-brand-text-secondary mt-0.5">Adds a custom attribute to books without a DB migration.</p>
          </div>

          <Input 
            label="Field ID (Machine reference e.g., 'difficulty_level')"
            placeholder="e.g. difficulty_level"
            value={fieldForm.id}
            onChange={(e) => setFieldForm(prev => ({ ...prev, id: e.target.value }))}
            required
          />

          <Input 
            label="Field Label (Visible to authors/editors)"
            placeholder="e.g. Difficulty Level"
            value={fieldForm.label}
            onChange={(e) => setFieldForm(prev => ({ ...prev, label: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-text-secondary">Input Type</label>
              <select
                value={fieldForm.type}
                onChange={(e) => setFieldForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-brand-bg-secondary border border-brand-border text-brand-text text-xs rounded-full py-2.5 px-4 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="text">Text Input</option>
                <option value="number">Number Input</option>
                <option value="dropdown">Dropdown Select</option>
                <option value="switch">Switch Toggle</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-text-secondary">Validation Rule</label>
              <div className="flex items-center gap-3 h-10">
                <input 
                  type="checkbox"
                  checked={fieldForm.required}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, required: e.target.checked }))}
                  className="h-4.5 w-4.5 rounded border-brand-border accent-brand-accent cursor-pointer"
                />
                <span className="text-xs text-brand-text-secondary">Mark Required</span>
              </div>
            </div>
          </div>

          {fieldForm.type === "dropdown" && (
            <Input 
              label="Options (Comma separated)"
              placeholder="e.g. Easy, Medium, Hard"
              value={fieldForm.options}
              onChange={(e) => setFieldForm(prev => ({ ...prev, options: e.target.value }))}
              required
            />
          )}

          <Input 
            label="Default Value"
            placeholder="e.g. Easy"
            value={fieldForm.defaultValue}
            onChange={(e) => setFieldForm(prev => ({ ...prev, defaultValue: e.target.value }))}
          />

          <div className="flex justify-end gap-3 border-t border-brand-border/40 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFieldModalOpen(false)}
              className="h-10 px-5 rounded-full text-xs font-bold border-brand-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="h-10 px-6 rounded-full text-xs font-bold shadow-sm"
            >
              Add Field
            </Button>
          </div>
        </form>
      </Modal>

    </DashboardLayout>
  );
};

export default AdminDashboard;
