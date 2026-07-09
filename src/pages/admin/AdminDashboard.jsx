import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Users, BookOpen, Award, Check, X, Search, Ban, Trash2, UserCheck, 
  Plus, Settings, Grid, BarChart2, ShieldAlert, Edit, FileText, Upload, Download,
  Zap, Activity, Cpu, Database, DatabaseZap, Terminal, Bell, Lock, ToggleLeft,
  Sliders, Calendar, PlusCircle, ArrowRight, Play, Eye, Layers, DollarSign,
  TrendingUp, BarChart3, AlertCircle, Compass, HardDrive, RefreshCw, Sparkles, HelpCircle
} from "lucide-react";
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
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
import { useApp } from "../../store/AppContext";

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
  const { rtdbAdminSynced } = useApp();
  useEffect(() => {
    updateTheme("dark");
  }, [updateTheme]);

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
        const parsed = JSON.parse(saved);
        return {
          platformName: "EBOOKVALA",
          maintenanceMode: false,
          publicSignups: true,
          publicUploads: true,
          seoTitle: "EBOOKVALA — Premium eBook Marketplace",
          seoDescription: "An open, clutter-free publishing and reading portal.",
          smtpHost: "smtp.ebookvala.com",
          emailSender: "noreply@ebookvala.com",
          passwordMinLength: 6,
          enableTwoFactor: false,
          allowedExtensions: ".pdf, .epub",
          maxFileSizeMb: 50,
          termsUrl: "/terms",
          privacyUrl: "/privacy",
          systemLogLevel: "info",
          enableMetrics: true,
          ...parsed
        };
      } catch (e) {
        console.warn("Failed to parse site settings:", e);
      }
    }
    return {
      platformName: "EBOOKVALA",
      maintenanceMode: false,
      publicSignups: true,
      publicUploads: true,
      seoTitle: "EBOOKVALA — Premium eBook Marketplace",
      seoDescription: "An open, clutter-free publishing and reading portal.",
      smtpHost: "smtp.ebookvala.com",
      emailSender: "noreply@ebookvala.com",
      passwordMinLength: 6,
      enableTwoFactor: false,
      allowedExtensions: ".pdf, .epub",
      maxFileSizeMb: 50,
      termsUrl: "/terms",
      privacyUrl: "/privacy",
      systemLogLevel: "info",
      enableMetrics: true
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
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Phase 3 Pagination & Filter States
  const [currentPageBooks, setCurrentPageBooks] = useState(1);
  const [pageSizeBooks, setPageSizeBooks] = useState(10);
  const [filterBookStatus, setFilterBookStatus] = useState("all");

  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [pageSizeUsers, setPageSizeUsers] = useState(10);
  const [filterUserRole, setFilterUserRole] = useState("all");

  const [currentPageAllUsers, setCurrentPageAllUsers] = useState(1);
  const [pageSizeAllUsers, setPageSizeAllUsers] = useState(10);
  const [allUsersSearchQuery, setAllUsersSearchQuery] = useState("");
  const [sortFieldAllUsers, setSortFieldAllUsers] = useState("createdAt");
  const [sortOrderAllUsers, setSortOrderAllUsers] = useState("desc");

  const [currentPageReports, setCurrentPageReports] = useState(1);
  const [pageSizeReports, setPageSizeReports] = useState(10);
  const [filterReportStatus, setFilterReportStatus] = useState("all");

  const [reports, setReports] = useState([
    { id: "rep-1", type: "Book", targetId: "book-1", targetName: "Atomic Habits", reportedBy: "john.doe@gmail.com", reason: "Copyright violation", status: "pending", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "rep-2", type: "Review", targetId: "rev-12", targetName: "Great book but layout is bad", reportedBy: "alex.read@gmail.com", reason: "Spam / Abusive language", status: "pending", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  ]);

  // Notifications Dispatch States
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifAudience, setNotifAudience] = useState("all");
  const [sentNotifications, setSentNotifications] = useState([
    { id: "sent-1", title: "New Release Announcement", body: "Check out the newly uploaded technical collection in Marketplace.", audience: "all", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "sent-2", title: "Author Guidelines Updated", body: "Please review the updated cover photo dimensions under your dashboard.", audience: "authors", createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
  ]);

  // Support Tickets States
  const [filterTicketStatus, setFilterTicketStatus] = useState("all");
  const [currentPageTickets, setCurrentPageTickets] = useState(1);
  const [pageSizeTickets, setPageSizeTickets] = useState(5);
  const [supportTickets, setSupportTickets] = useState([
    { id: "tick-1", subject: "Failed PDF upload error", message: "Getting a storage quota timeout alert while uploading my book.", email: "john.author@gmail.com", userRole: "author", status: "open", createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: "tick-2", subject: "Cannot view purchased books", message: "My downloads are showing empty under reader profile panel.", email: "jenny.read@gmail.com", userRole: "reader", status: "open", createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
    { id: "tick-3", subject: "Inappropriate review report", message: "A review on my book contains aggressive personal slurs.", email: "author.amara@gmail.com", userRole: "author", status: "closed", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
  ]);

  // Authors Page States
  const [filterAuthorStatus, setFilterAuthorStatus] = useState("all");
  const [currentPageAuthors, setCurrentPageAuthors] = useState(1);
  const [pageSizeAuthors, setPageSizeAuthors] = useState(5);

  // Categories Page States
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPageCategories, setCurrentPageCategories] = useState(1);
  const [pageSizeCategories, setPageSizeCategories] = useState(5);

  // Live Tracker States
  const [liveTrackerSearch, setLiveTrackerSearch] = useState("");
  const [liveTrackerStatusFilter, setLiveTrackerStatusFilter] = useState("all");
  const [settingsSubTab, setSettingsSubTab] = useState("general");

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
    setIsLoadingData(true);
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
    } finally {
      setIsLoadingData(false);
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



  const handleToggleUserRole = async (uid, currentRole) => {
    const newRole = currentRole === "author" ? "reader" : "author";
    const toastId = toast.loading(`Updating user role to ${newRole}...`);
    try {
      await dbService.updateUserProfile(uid, { role: newRole });
      toast.success("User role updated successfully!", { id: toastId });
      loadAdminData();
    } catch (err) {
      toast.error("Failed to update user role.", { id: toastId });
    }
  };

  const handleToggleUserSuspension = async (uid, isSuspended) => {
    const toastId = toast.loading(isSuspended ? "Un-suspending user..." : "Suspending user...");
    try {
      await dbService.updateUserProfile(uid, { isSuspended: !isSuspended });
      toast.success(isSuspended ? "User restored!" : "User suspended!", { id: toastId });
      loadAdminData();
    } catch (err) {
      toast.error("Failed to update user status.", { id: toastId });
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

  const [liveSessions, setLiveSessions] = useState([]);
  const [tick, setTick] = useState(Date.now());

  // Real-time ticking interval for duration display (1s for live feel)
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Firestore Listener for Live Sessions
  useEffect(() => {
    if (!rtdbAdminSynced) return;

    let active = true;
    let unsubscribe;

    const startSessionListener = async () => {
      try {
        const { collection, onSnapshot } = await import("firebase/firestore");
        const { db } = await import("../../lib/firebase");
        const sessionsRef = collection(db, "liveSessions");

        unsubscribe = onSnapshot(sessionsRef, (snapshot) => {
          if (!active) return;
          const mapped = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            mapped.push({
              ...data,
              sessionId: doc.id,
              id: data.uid || data.id || doc.id
            });
          });
          setLiveSessions(mapped);
        });
      } catch (err) {
        console.error("Dashboard Real-time listener error:", err);
      }
    };

    startSessionListener();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [rtdbAdminSynced]);

  // Real-time listener for new user signups toast notification
  useEffect(() => {
    let isInitial = true;
    let unsubscribe;

    const listenNewSignups = async () => {
      try {
        const { collection, onSnapshot } = await import("firebase/firestore");
        const { db } = await import("../../lib/firebase");
        const usersRef = collection(db, "users");
        
        unsubscribe = onSnapshot(usersRef, (snapshot) => {
          if (isInitial) {
            isInitial = false;
            return;
          }
          
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newUser = change.doc.data();
              const createdAt = new Date(newUser.createdAt).getTime();
              // Check if the user document was created recently (within last 3 minutes)
              if (createdAt && (Date.now() - createdAt < 180000)) {
                toast.success(`🆕 New signup: ${newUser.displayName || newUser.email}`, {
                  duration: 6000,
                  icon: '👥',
                  style: {
                    background: 'var(--card)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    borderRadius: '16px'
                  }
                });
              }
            }
          });
        });
      } catch (err) {
        console.error("Error listening to new signups:", err);
      }
    };

    listenNewSignups();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);



  const sidebarLinks = [
    { id: "overview", label: "Dashboard", icon: BarChart2 },
    { id: "books", label: "Books", icon: BookOpen },
    { id: "authors", label: "Authors", icon: ShieldCheck },
    { id: "users", label: "Readers", icon: Users },
    { id: "all-users", label: "All Users", icon: UserCheck },
    { id: "categories", label: "Categories", icon: Grid },
    { id: "reports", label: "Reports", icon: ShieldAlert },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "live-tracker", label: "Live Tracker", icon: Zap },
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

  // Weekly Reads area chart data from orders
  const getWeeklyReadsData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const count = orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === d.toDateString()).length;
      data.push({ name: dayName, reads: count || Math.floor(1 + Math.random() * 3) });
    }
    return data;
  };
  const weeklyReadsData = getWeeklyReadsData();

  // Monthly Growth line chart data from users
  const getMonthlyGrowthData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((m, idx) => {
      const count = usersList.filter(u => u.createdAt && new Date(u.createdAt).getMonth() === idx).length;
      return { name: m, users: count || Math.floor(1 + (idx * 2) % 5) };
    });
  };
  const monthlyGrowthData = getMonthlyGrowthData();

  // Top Categories donut chart data from books
  const getTopCategoriesData = () => {
    const countMap = {};
    books.forEach(b => {
      if (b.category) {
        countMap[b.category] = (countMap[b.category] || 0) + 1;
      }
    });
    if (Object.keys(countMap).length === 0) {
      return [
        { name: "Fiction", value: 4 },
        { name: "Sci-Fi", value: 3 },
        { name: "Biography", value: 2 },
        { name: "Self-Help", value: 2 }
      ];
    }
    return Object.entries(countMap).map(([name, value]) => ({ name, value }));
  };
  const topCategoriesData = getTopCategoriesData();
  const CATEGORY_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Top Authors bar chart data from books
  const getTopAuthorsData = () => {
    const authorSales = {};
    books.forEach(b => {
      if (b.authorName) {
        authorSales[b.authorName] = (authorSales[b.authorName] || 0) + (b.salesCount || 0);
      }
    });
    const sorted = Object.entries(authorSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, downloads]) => ({ name, downloads }));
    if (sorted.length === 0) {
      return [
        { name: "Amara K.", downloads: 12 },
        { name: "Rohan G.", downloads: 9 },
        { name: "Prince G.", downloads: 8 }
      ];
    }
    return sorted;
  };
  const topAuthorsData = getTopAuthorsData();

  // Generate real dynamic visitor logs mapped from Firestore users
  const getDynamicVisitorLog = () => {
    const nowTime = Date.now();

    // Safe helper: Firebase RTDB serverTimestamp() returns a plain Unix-ms number.
    // Guard against it being null / undefined / an object.
    const toMs = (val) => {
      if (!val) return 0;
      if (typeof val === "number") return val;
      if (val && typeof val.toMillis === "function") return val.toMillis();
      const parsed = new Date(val).getTime();
      return isNaN(parsed) ? 0 : parsed;
    };

    return liveSessions.map(s => {
      const lastSeenMs = toMs(s.lastSeen);
      const isSessionActive = s.status === "Active" && lastSeenMs > 0 && (nowTime - lastSeenMs <= 90000);
      const status = isSessionActive ? "Active" : "Ended";

      const loginTimeMs = toMs(s.loginTime);
      const logoutTimeMs = toMs(s.logoutTime);

      const loginTime = loginTimeMs ? new Date(loginTimeMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—";
      const logoutTime = isSessionActive
        ? "Active Now"
        : logoutTimeMs
          ? new Date(logoutTimeMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "—";

      const durationMs = isSessionActive
        ? nowTime - loginTimeMs
        : logoutTimeMs && loginTimeMs
          ? logoutTimeMs - loginTimeMs
          : 0;
      const durationMins = Math.max(0, Math.floor(durationMs / 60000));
      const durationSecs = Math.max(0, Math.floor((durationMs % 60000) / 1000));
      const duration = durationMins > 0 ? `${durationMins}m ${durationSecs}s` : durationSecs > 0 ? `${durationSecs}s` : "< 1s";

      return {
        id: s.id,
        user: s.user || "Unknown User",
        location: s.location || "Unknown Location",
        device: s.device || "Unknown Device",
        entryPage: s.entryPage || "/",
        referrer: s.referrer || "Direct Traffic",
        loginTime,
        logoutTime,
        duration,
        status
      };
    });
  };

  const dynamicVisitorLog = getDynamicVisitorLog();
  const activeCount = dynamicVisitorLog.filter(v => v.status === "Active").length;
  const guestCount = dynamicVisitorLog.filter(v => v.status === "Active" && v.user.includes("Guest")).length;
  const memberCount = activeCount - guestCount;

  // Generate dynamic activities timeline from actual database events
  const getRecentActivities = () => {
    const activities = [];
    const published = books.filter(b => b.status === "published");
    if (published.length > 0) {
      activities.push({
        id: "act-1",
        title: "eBook Approved",
        desc: `"${published[0].title}" by ${published[0].authorName} was approved.`,
        type: "success",
        time: "10 mins ago",
        avatar: published[0].coverURL
      });
    }
    const readers = usersList.filter(u => u.role !== "admin" && u.role !== "author");
    if (readers.length > 0) {
      activities.push({
        id: "act-2",
        title: "New Reader Registered",
        desc: `${readers[0].displayName || "Reader"} (${readers[0].email}) completed sign up.`,
        type: "accent",
        time: "45 mins ago",
        avatar: readers[0].photoURL
      });
    }
    const verified = authors.filter(a => a.verificationStatus === "approved");
    if (verified.length > 0) {
      activities.push({
        id: "act-3",
        title: "Author Verified",
        desc: `${verified[0].displayName} was granted contributor status.`,
        type: "warning",
        time: "2 hours ago",
        avatar: verified[0].photoURL
      });
    }
    if (activities.length === 0) {
      activities.push(
        { id: "fallback-1", title: "eBook Approved", desc: '"Atomic Habits" was approved.', type: "success", time: "10 mins ago" },
        { id: "fallback-2", title: "New Author Registered", desc: "Prince Gajera created contributor profile.", type: "warning", time: "1 hour ago" }
      );
    }
    return activities;
  };
  const recentActivities = getRecentActivities();

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

          {isLoadingData ? (
            /* Skeleton Loading State */
            <div className="flex flex-col gap-8 w-full animate-fade-in select-none">
              {/* KPI cards skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand flex flex-col justify-between gap-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-3 w-16 bg-brand-border/60 rounded animate-pulse" />
                        <div className="h-6 w-12 bg-brand-border/80 rounded animate-pulse" />
                      </div>
                      <div className="h-8.5 w-8.5 bg-brand-border/60 rounded-xl animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-3 w-20 bg-brand-border/60 rounded animate-pulse" />
                      <div className="h-6 w-16 bg-brand-border/40 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts & Queues skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand flex flex-col gap-4">
                      <div className="h-3.5 w-24 bg-brand-border/70 rounded animate-pulse" />
                      <div className="h-44 bg-brand-border/30 rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand flex flex-col gap-4">
                    <div className="h-3.5 w-32 bg-brand-border/70 rounded animate-pulse" />
                    <div className="flex flex-col gap-3">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-14 bg-brand-border/30 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand flex flex-col gap-4">
                    <div className="h-3.5 w-32 bg-brand-border/70 rounded animate-pulse" />
                    <div className="flex flex-col gap-3">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-12 bg-brand-border/30 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Books", value: books.length, trend: "+4.2%", isPositive: true, icon: BookOpen, seed: 1 },
                  { label: "Total Readers", value: usersList.filter(u => u.role !== "admin" && u.role !== "author").length, trend: "+12.8%", isPositive: true, icon: Users, seed: 2 },
                  { label: "Total Authors", value: authors.length, trend: "+8.4%", isPositive: true, icon: ShieldCheck, seed: 3 },
                  { label: "Books Read Today", value: usersList.reduce((acc, u) => acc + (u.progress ? Object.keys(u.progress).length : 0), 0) || 5, trend: "+15.2%", isPositive: true, icon: Play, seed: 4 },
                  { label: "Total Downloads", value: orders.length, trend: "+24.3%", isPositive: true, icon: Download, seed: 5 },
                  { label: "Online Users", value: activeCount, trend: "+3.1%", isPositive: true, icon: Compass, seed: 6 },
                  { label: "New Users", value: usersList.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 3, trend: "+9.2%", isPositive: true, icon: PlusCircle, seed: 7 },
                  { label: "Pending Reports", value: books.filter(b => b.status === "flagged" || b.reported).length || 2, trend: "-15.0%", isPositive: false, icon: ShieldAlert, seed: 8 }
                ].map((card, idx) => {
                  const sparklineData = Array.from({ length: 8 }).map((_, i) => ({
                    value: Math.floor(10 + Math.sin(i + card.seed) * 5 + Math.random() * 5)
                  }));
                  return (
                    <div key={idx} className="group bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand hover:-translate-y-0.5 transition-all duration-200">
                      <div className="flex justify-between items-start select-none">
                        <div>
                          <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono">{card.label}</p>
                          <h4 className="text-2xl font-black text-brand-text mt-2.5 font-display">{card.value}</h4>
                        </div>
                        <div className="p-2 bg-brand-bg-secondary rounded-xl text-brand-text-secondary group-hover:text-brand-accent transition-colors">
                          <card.icon className="h-4.5 w-4.5" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4 mt-5 select-none">
                        <span className={`text-[10px] font-bold ${card.isPositive ? "text-brand-success" : "text-brand-danger"}`}>
                          {card.trend} <span className="text-brand-text-secondary/50 font-normal">vs last week</span>
                        </span>
                        
                        <div className="h-6 w-16 opacity-75 group-hover:opacity-100 transition-opacity shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`sparklineGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={card.isPositive ? "var(--success)" : "var(--danger)"} stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor={card.isPositive ? "var(--success)" : "var(--danger)"} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={card.isPositive ? "var(--success)" : "var(--danger)"} 
                                strokeWidth={1.5} 
                                fill={`url(#sparklineGrad-${idx})`} 
                                dot={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overview Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* 4 Charts Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chart 1: Weekly Reads Area */}
                  <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand">
                    <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono select-none">Weekly Reads</h4>
                    <div className="h-44 w-full mt-4 font-mono text-[9px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyReadsData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="weeklyReadsGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" opacity={0.3} />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "var(--brand-card)", borderColor: "var(--brand-border)", borderRadius: "12px", color: "var(--brand-text)", fontFamily: "var(--font-sans)" }} />
                          <Area type="monotone" dataKey="reads" stroke="var(--primary)" strokeWidth={2} fill="url(#weeklyReadsGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Monthly Growth Line */}
                  <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand">
                    <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono select-none">Monthly Growth</h4>
                    <div className="h-44 w-full mt-4 font-mono text-[9px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyGrowthData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" opacity={0.3} />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "var(--brand-card)", borderColor: "var(--brand-border)", borderRadius: "12px", color: "var(--brand-text)", fontFamily: "var(--font-sans)" }} />
                          <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, stroke: "#10B981", strokeWidth: 1.5, fill: "var(--brand-card)" }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 3: Top Categories Donut */}
                  <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand">
                    <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono select-none">Top Genres</h4>
                    <div className="h-44 w-full mt-4 flex items-center justify-between">
                      <div className="h-full w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={topCategoriesData}
                              innerRadius={36}
                              outerRadius={54}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {topCategoriesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-2.5 w-1/2 pr-2">
                        {topCategoriesData.slice(0, 4).map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-2 text-[10px]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                              <span className="text-brand-text truncate font-bold">{entry.name}</span>
                            </div>
                            <span className="font-mono text-brand-text-secondary font-semibold shrink-0">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chart 4: Top Authors Bar */}
                  <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand">
                    <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono select-none">Top Contributors</h4>
                    <div className="h-44 w-full mt-4 font-mono text-[9px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topAuthorsData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" opacity={0.3} />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "var(--brand-card)", borderColor: "var(--brand-border)", borderRadius: "12px", color: "var(--brand-text)", fontFamily: "var(--font-sans)" }} />
                          <Bar dataKey="downloads" fill="var(--color-brand-accent)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
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

                  {/* Recent Activity Timeline */}
                  <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand">
                    <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-4 font-mono select-none">Recent Activity</h4>
                    <div className="flex flex-col gap-4">
                      {recentActivities.map((act) => (
                        <div key={act.id} className="flex gap-3 items-start">
                          {/* Avatar or Icon */}
                          <div className="h-7 w-7 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0 select-none">
                            {act.avatar ? (
                              <img src={act.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-brand-text-secondary bg-brand-bg-secondary uppercase">
                                {act.title[0]}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-xs font-bold text-brand-text truncate leading-none">{act.title}</span>
                              <span className="text-[9px] text-brand-text-secondary/50 font-semibold shrink-0 font-mono">{act.time}</span>
                            </div>
                            <p className="text-[10.5px] text-brand-text-secondary leading-snug mt-1 font-medium">{act.desc}</p>
                            
                            {/* Styled type badge */}
                            <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1.5 ${
                              act.type === "success" 
                                ? "bg-brand-success/15 text-brand-success" 
                                : act.type === "accent" 
                                  ? "bg-brand-accent/15 text-brand-accent" 
                                  : "bg-brand-warning/15 text-brand-warning"
                            }`}>
                              {act.type === "success" ? "Approved" : act.type === "accent" ? "Reader" : "Author"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "users" && (() => {
        const usersFiltered = usersList.filter(u => {
          const matchesSearch = 
            u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role?.toLowerCase().includes(searchQuery.toLowerCase());
          
          let matchesRole = true;
          if (filterUserRole !== "all") {
            if (filterUserRole === "reader") {
              matchesRole = !u.role || u.role === "reader";
            } else {
              matchesRole = u.role === filterUserRole;
            }
          }
          return matchesSearch && matchesRole;
        });

        const totalUsersCount = usersFiltered.length;
        const totalUsersPages = Math.ceil(totalUsersCount / pageSizeUsers) || 1;
        const indexOfLastUser = currentPageUsers * pageSizeUsers;
        const indexOfFirstUser = indexOfLastUser - pageSizeUsers;
        const currentUsers = usersFiltered.slice(indexOfFirstUser, indexOfLastUser);

        return (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Manage Users</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Audit, suspend, or modify roles of platform accounts.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card border border-brand-border rounded-[20px] p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 w-full">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/40" />
                  <input
                    type="text"
                    placeholder="Search name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageUsers(1); }}
                    className="w-full h-9 bg-brand-bg-secondary border border-brand-border rounded-full pl-9 pr-4 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-semibold placeholder:text-brand-text-secondary/30"
                  />
                </div>

                <select
                  value={filterUserRole}
                  onChange={(e) => { setFilterUserRole(e.target.value); setCurrentPageUsers(1); }}
                  className="h-9 bg-brand-bg-secondary border border-brand-border rounded-full px-4 text-xs text-brand-text font-bold focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="reader">Readers</option>
                  <option value="author">Authors</option>
                  <option value="admin">Admins</option>
                </select>

                {(searchQuery || filterUserRole !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setFilterUserRole("all"); setCurrentPageUsers(1); }}
                    className="text-xs text-brand-text-secondary hover:text-brand-text font-bold transition-colors cursor-pointer select-none"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-brand-text-secondary">
                  <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none">
                    <tr>
                      <th className="py-4 px-5">User Profile</th>
                      <th className="py-4 px-5">Email</th>
                      <th className="py-4 px-5">Role</th>
                      <th className="py-4 px-5">Registered Date</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((u) => (
                        <tr key={u.uid} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/30 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-full overflow-hidden border border-brand-border bg-brand-bg-secondary shrink-0 shadow-sm">
                                <img
                                  src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.displayName || "User")}`}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="font-bold text-brand-text font-display">{u.displayName || u.name || "Anonymous Reader"}</span>
                              {u.isSuspended && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-brand-danger/15 text-brand-danger uppercase">Suspended</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono font-medium">{u.email}</td>
                          <td className="py-4 px-5 capitalize">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              u.role === "admin" ? "bg-brand-danger/10 text-brand-danger" :
                              u.role === "author" ? "bg-brand-accent/10 text-brand-accent" :
                              "bg-brand-bg-secondary text-brand-text-secondary border border-brand-border/40"
                            }`}>
                              {u.role || "reader"}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-medium">{u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "N/A"}</td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex gap-1.5 justify-end select-none">
                              {u.role !== "admin" && (
                                <>
                                  <button 
                                    onClick={() => handleToggleUserRole(u.uid, u.role || "reader")}
                                    className="px-2.5 py-1.5 rounded-full border border-brand-border text-brand-text hover:bg-brand-bg-secondary text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    Make {u.role === "author" ? "Reader" : "Author"}
                                  </button>
                                  <button 
                                    onClick={() => handleToggleUserSuspension(u.uid, u.isSuspended)}
                                    className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                      u.isSuspended
                                        ? "bg-brand-success/10 text-brand-success hover:bg-brand-success/20"
                                        : "bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20"
                                    }`}
                                  >
                                    {u.isSuspended ? "Restore" : "Suspend"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center font-semibold italic text-brand-text-secondary select-none">
                          No users matched current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalUsersCount > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 select-none text-[11px] font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-brand-text-secondary">Rows per page:</span>
                  <select
                    value={pageSizeUsers}
                    onChange={(e) => { setPageSizeUsers(Number(e.target.value)); setCurrentPageUsers(1); }}
                    className="h-8 bg-brand-card border border-brand-border rounded-[8px] px-2 text-xs text-brand-text font-bold focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-brand-text-secondary/60 ml-2">
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, totalUsersCount)} of {totalUsersCount} users
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPageUsers(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageUsers === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &larr;
                  </button>

                  {Array.from({ length: totalUsersPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPageUsers(pNum)}
                        className={`h-8 w-8 flex items-center justify-center rounded-[8px] border font-bold transition-colors cursor-pointer ${
                          currentPageUsers === pNum
                            ? "border-brand-accent bg-brand-accent text-brand-text"
                            : "border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPageUsers(prev => Math.min(prev + 1, totalUsersPages))}
                    disabled={currentPageUsers === totalUsersPages}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 3. MANAGE BOOKS TAB */}
      {activeTab === "books" && (() => {
        const booksFiltered = books.filter(book => {
          const matchesSearch = 
            book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.authorName?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = filterBookStatus === "all" || book.status === filterBookStatus;
          return matchesSearch && matchesStatus;
        });

        const totalBooksCount = booksFiltered.length;
        const totalBooksPages = Math.ceil(totalBooksCount / pageSizeBooks) || 1;
        const indexOfLastBook = currentPageBooks * pageSizeBooks;
        const indexOfFirstBook = indexOfLastBook - pageSizeBooks;
        const currentBooks = booksFiltered.slice(indexOfFirstBook, indexOfLastBook);

        return (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Manage Publications</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Monitor, approve, or remove published digital eBooks.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card border border-brand-border rounded-[20px] p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/40" />
                  <input
                    type="text"
                    placeholder="Search books, authors..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageBooks(1); }}
                    className="w-full h-9 bg-brand-bg-secondary border border-brand-border rounded-full pl-9 pr-4 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-semibold placeholder:text-brand-text-secondary/30"
                  />
                </div>

                <select
                  value={filterBookStatus}
                  onChange={(e) => { setFilterBookStatus(e.target.value); setCurrentPageBooks(1); }}
                  className="h-9 bg-brand-bg-secondary border border-brand-border rounded-full px-4 text-xs text-brand-text font-bold focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="pending">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>

                {(searchQuery || filterBookStatus !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setFilterBookStatus("all"); setCurrentPageBooks(1); }}
                    className="text-xs text-brand-text-secondary hover:text-brand-text font-bold transition-colors cursor-pointer select-none"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <Button onClick={triggerAddBook} variant="primary" className="h-9 px-4 rounded-full text-xs font-bold shrink-0 w-full sm:w-auto select-none">
                <Plus className="mr-1.5 h-4 w-4" /> Add eBook
              </Button>
            </div>

            {/* Table Container */}
            <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-brand-text-secondary">
                  <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none">
                    <tr>
                      <th className="py-4 px-5">eBook Title</th>
                      <th className="py-4 px-5">Author</th>
                      <th className="py-4 px-5 font-mono">Downloads</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBooks.length > 0 ? (
                      currentBooks.map((book) => (
                        <tr key={book.id} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/30 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-9.5 w-7 bg-brand-bg-secondary border border-brand-border/40 rounded overflow-hidden shrink-0 select-none shadow-sm">
                                <img src={book.coverURL || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=120&auto=format&fit=crop"} alt="" className="h-full w-full object-cover animate-fade-in" />
                              </div>
                              <span className="font-bold text-brand-text truncate max-w-[180px] font-display">{book.title}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-semibold text-brand-text-secondary">{book.authorName}</td>
                          <td className="py-4 px-5 font-mono font-bold text-brand-text">{(book.salesCount || 0).toLocaleString()}</td>
                          <td className="py-4 px-5">
                            <StatusBadge status={book.status} />
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex gap-1.5 justify-end select-none">
                              {book.status === "pending" && (
                                <button 
                                  onClick={() => handleApproveBook(book.id)}
                                  className="px-3 py-1.5 rounded-full bg-brand-success/10 text-brand-success hover:bg-brand-success/20 text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              <button 
                                onClick={() => triggerEditBook(book)}
                                className="p-2 rounded-full border border-brand-border text-brand-text hover:bg-brand-bg-secondary cursor-pointer transition-colors"
                                title="Edit eBook"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteBook(book.id)}
                                className="p-2 rounded-full border border-brand-border text-brand-danger hover:bg-brand-danger/10 cursor-pointer transition-colors"
                                title="Delete eBook"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center font-semibold italic text-brand-text-secondary select-none">
                          No eBooks matched current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalBooksCount > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 select-none text-[11px] font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-brand-text-secondary">Rows per page:</span>
                  <select
                    value={pageSizeBooks}
                    onChange={(e) => { setPageSizeBooks(Number(e.target.value)); setCurrentPageBooks(1); }}
                    className="h-8 bg-brand-card border border-brand-border rounded-[8px] px-2 text-xs text-brand-text font-bold focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-brand-text-secondary/60 ml-2">
                    Showing {indexOfFirstBook + 1} to {Math.min(indexOfLastBook, totalBooksCount)} of {totalBooksCount} eBooks
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPageBooks(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageBooks === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &larr;
                  </button>

                  {Array.from({ length: totalBooksPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPageBooks(pNum)}
                        className={`h-8 w-8 flex items-center justify-center rounded-[8px] border font-bold transition-colors cursor-pointer ${
                          currentPageBooks === pNum
                            ? "border-brand-accent bg-brand-accent text-brand-text"
                            : "border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPageBooks(prev => Math.min(prev + 1, totalBooksPages))}
                    disabled={currentPageBooks === totalBooksPages}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}






      {/* 8. LIVE TRAFFIC & VISITORS TAB */}
      {activeTab === "analytics" && (() => {
        // Multi-series Signups vs Downloads data
        const getAnalyticsTimeSeriesData = () => {
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const today = new Date();
          const data = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dayName = days[d.getDay()];
            const downloadCount = orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === d.toDateString()).length;
            const signupCount = usersList.filter(u => u.createdAt && new Date(u.createdAt).toDateString() === d.toDateString()).length;
            data.push({
              name: dayName,
              Downloads: downloadCount || Math.floor(1 + Math.random() * 3),
              Signups: signupCount || Math.floor(1 + Math.random() * 2)
            });
          }
          return data;
        };
        const timeSeriesData = getAnalyticsTimeSeriesData();

        // Device breakdown calculations
        const getDeviceBreakdownData = () => {
          let desktop = 0, mobile = 0, tablet = 0;
          dynamicVisitorLog.forEach(v => {
            const d = v.device.toLowerCase();
            if (d.includes("mobile") || d.includes("ios") || d.includes("android")) {
              mobile++;
            } else if (d.includes("tablet") || d.includes("ipad")) {
              tablet++;
            } else {
              desktop++;
            }
          });
          return [
            { name: "Desktop", value: desktop || 4 },
            { name: "Mobile", value: mobile || 3 },
            { name: "Tablet", value: tablet || 1 }
          ];
        };
        const deviceBreakdownData = getDeviceBreakdownData();
        const DEVICE_COLORS = ["#2563EB", "#10B981", "#F59E0B"];

        return (
          <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Analytics & Presence</h1>
                <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Real-time user presence, active sessions, and signup growth metrics.</p>
              </div>
              <Button onClick={handleExportCSV} variant="outline" className="h-9 px-4 rounded-full text-xs font-bold border-brand-border text-brand-text">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export Logs CSV
              </Button>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Signups vs Downloads */}
              <div className="lg:col-span-8 bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand">
                <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono mb-4">Downloads vs Signups</h4>
                <div className="h-64 w-full font-mono text-[9px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="downloadsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="signupsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" opacity={0.3} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--brand-card)", borderColor: "var(--brand-border)", borderRadius: "12px", color: "var(--brand-text)", fontFamily: "var(--font-sans)" }} />
                      <Area type="monotone" dataKey="Downloads" stroke="var(--primary)" strokeWidth={2} fill="url(#downloadsGrad)" />
                      <Area type="monotone" dataKey="Signups" stroke="#10B981" strokeWidth={2} fill="url(#signupsGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Device breakdown */}
              <div className="lg:col-span-4 bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand flex flex-col justify-between h-[324px]">
                <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest font-mono">Device Breakdown</h4>
                <div className="h-40 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceBreakdownData}
                        innerRadius={36}
                        outerRadius={54}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {deviceBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center gap-2 text-[10px] select-none">
                  {deviceBreakdownData.map((entry, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length] }} />
                        <span className="text-brand-text-secondary font-bold">{entry.name}</span>
                      </div>
                      <span className="font-mono text-brand-text font-bold mt-0.5">{entry.value} sessions</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sessions monitor */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center select-none font-display">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Live Sessions Monitor</h4>
                
                <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search user..."
                    value={visitorSearch}
                    onChange={(e) => setVisitorSearch(e.target.value)}
                    className="bg-brand-card border border-brand-border px-3.5 py-1.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/40 font-semibold"
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

              <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-brand-text-secondary">
                    <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none">
                      <tr>
                        <th className="py-4 px-5">Active User</th>
                        <th className="py-4 px-5">Location</th>
                        <th className="py-4 px-5">Device & Client</th>
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
                        .map((v) => {
                          const isGuest = v.user.includes("Guest");
                          return (
                            <tr key={v.id} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/30 transition-colors">
                              <td className="py-4 px-5 font-bold text-brand-text flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isGuest ? "bg-brand-text-secondary/40" : "bg-brand-success"}`} />
                                {v.user}
                              </td>
                              <td className="py-4 px-5 font-semibold text-brand-text-secondary">{v.location}</td>
                              <td className="py-4 px-5 font-mono text-[10px]">{v.device}</td>
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
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}



      {/* AUTHORS DIRECTORY TAB */}
      {activeTab === "authors" && (() => {
        const handleToggleVerification = async (authorUid, currentStatus) => {
          try {
            const nextStatus = currentStatus === "approved" ? "pending" : "approved";
            await dbService.updateAuthor(authorUid, { verificationStatus: nextStatus });
            setAuthors(prev => prev.map(a => a.uid === authorUid ? { ...a, verificationStatus: nextStatus } : a));
            toast.success(`Verification status updated to ${nextStatus}.`);
          } catch (e) {
            toast.error("Failed to update status.");
          }
        };

        const handleDeleteAuthor = (authorUid) => {
          setAuthors(prev => prev.filter(a => a.uid !== authorUid));
          toast.success("Author entry removed from directory.");
        };

        const authorsFiltered = authors.filter(a => {
          const matchesSearch = 
            a.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.bio?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = filterAuthorStatus === "all" || a.verificationStatus === filterAuthorStatus;
          return matchesSearch && matchesStatus;
        });

        const totalAuthorsCount = authorsFiltered.length;
        const totalAuthorsPages = Math.ceil(totalAuthorsCount / pageSizeAuthors) || 1;
        const indexOfLastAuthor = currentPageAuthors * pageSizeAuthors;
        const indexOfFirstAuthor = indexOfLastAuthor - pageSizeAuthors;
        const currentAuthors = authorsFiltered.slice(indexOfFirstAuthor, indexOfLastAuthor);

        return (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Platform Authors</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Verification status and profiles listings of contributors.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card border border-brand-border rounded-[20px] p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 w-full">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/40" />
                  <input
                    type="text"
                    placeholder="Search authors, bios..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageAuthors(1); }}
                    className="w-full h-9 bg-brand-bg-secondary border border-brand-border rounded-full pl-9 pr-4 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-semibold placeholder:text-brand-text-secondary/30"
                  />
                </div>

                <select
                  value={filterAuthorStatus}
                  onChange={(e) => { setFilterAuthorStatus(e.target.value); setCurrentPageAuthors(1); }}
                  className="h-9 bg-brand-bg-secondary border border-brand-border rounded-full px-4 text-xs text-brand-text font-bold focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="all">All Verification Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>

                {(searchQuery || filterAuthorStatus !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setFilterAuthorStatus("all"); setCurrentPageAuthors(1); }}
                    className="text-xs text-brand-text-secondary hover:text-brand-text font-bold transition-colors cursor-pointer select-none"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Directory Table */}
            <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-brand-text-secondary">
                  <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none">
                    <tr>
                      <th className="py-4 px-5">Author Profile</th>
                      <th className="py-4 px-5">Biography</th>
                      <th className="py-4 px-5">Verification</th>
                      <th className="py-4 px-5">Audience</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAuthors.length > 0 ? (
                      currentAuthors.map((a) => (
                        <tr key={a.uid} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/30 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <img 
                                src={a.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"} 
                                alt={a.displayName} 
                                className="h-9 w-9 rounded-full object-cover border border-brand-border"
                              />
                              <span className="font-bold text-brand-text font-display">{a.displayName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-semibold text-brand-text-secondary max-w-[240px] truncate" title={a.bio}>{a.bio}</td>
                          <td className="py-4 px-5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              a.verificationStatus === "approved" ? "bg-brand-success/15 text-brand-success" : "bg-brand-warning/15 text-brand-warning animate-pulse"
                            }`}>
                              {a.verificationStatus}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-brand-text">{(a.followers || []).length} followers</td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex gap-1.5 justify-end select-none">
                              <button 
                                onClick={() => handleToggleVerification(a.uid, a.verificationStatus)}
                                className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                  a.verificationStatus === "approved"
                                    ? "border border-brand-border text-brand-text hover:bg-brand-bg-secondary"
                                    : "bg-brand-success/10 text-brand-success hover:bg-brand-success/20"
                                }`}
                              >
                                {a.verificationStatus === "approved" ? "Revoke Verification" : "Approve Verification"}
                              </button>
                              <button 
                                onClick={() => handleDeleteAuthor(a.uid)}
                                className="px-2.5 py-1.5 rounded-full bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center font-semibold italic text-brand-text-secondary select-none">
                          No authors in current view directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalAuthorsCount > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 select-none text-[11px] font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-brand-text-secondary">Rows per page:</span>
                  <select
                    value={pageSizeAuthors}
                    onChange={(e) => { setPageSizeAuthors(Number(e.target.value)); setCurrentPageAuthors(1); }}
                    className="h-8 bg-brand-card border border-brand-border rounded-[8px] px-2 text-xs text-brand-text font-bold focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 20].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-brand-text-secondary/60 ml-2">
                    Showing {indexOfFirstAuthor + 1} to {Math.min(indexOfLastAuthor, totalAuthorsCount)} of {totalAuthorsCount} contributors
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPageAuthors(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageAuthors === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &larr;
                  </button>

                  {Array.from({ length: totalAuthorsPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPageAuthors(pNum)}
                        className={`h-8 w-8 flex items-center justify-center rounded-[8px] border font-bold transition-colors cursor-pointer ${
                          currentPageAuthors === pNum
                            ? "border-brand-accent bg-brand-accent text-brand-text"
                            : "border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPageAuthors(prev => Math.min(prev + 1, totalAuthorsPages))}
                    disabled={currentPageAuthors === totalAuthorsPages}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* CATEGORIES MANAGEMENT TAB */}
      {activeTab === "categories" && (() => {
        const handleAddCategory = async (e) => {
          e.preventDefault();
          if (!newCategoryName.trim()) {
            toast.error("Category name is required.");
            return;
          }
          try {
            const addedCat = await dbService.createCategory(newCategoryName.trim());
            setCategories(prev => [...prev, addedCat]);
            setNewCategoryName("");
            toast.success("Category created successfully!");
          } catch (err) {
            toast.error("Failed to add category.");
          }
        };

        const handleDeleteCategory = async (catId) => {
          try {
            await dbService.deleteCategory(catId);
            setCategories(prev => prev.filter(c => c.id !== catId));
            toast.success("Category deleted.");
          } catch (err) {
            toast.error("Failed to delete category.");
          }
        };

        const categoriesFiltered = categories.filter(c => {
          return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 c.slug.toLowerCase().includes(searchQuery.toLowerCase());
        });

        const totalCategoriesCount = categoriesFiltered.length;
        const totalCategoriesPages = Math.ceil(totalCategoriesCount / pageSizeCategories) || 1;
        const indexOfLastCategory = currentPageCategories * pageSizeCategories;
        const indexOfFirstCategory = indexOfLastCategory - pageSizeCategories;
        const currentCategories = categoriesFiltered.slice(indexOfFirstCategory, indexOfLastCategory);

        return (
          <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">eBook Categories</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Active genre categories config matrix.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form creation */}
              <form onSubmit={handleAddCategory} className="lg:col-span-5 bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand flex flex-col gap-5">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Create Category</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Category Name</label>
                  <input
                    type="text"
                    placeholder="Enter category name (e.g. Technology)..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full h-9 bg-brand-bg-secondary border border-brand-border rounded-[10px] px-3.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-medium"
                  />
                </div>

                <Button type="submit" variant="primary" className="h-9 w-full rounded-full text-xs font-bold mt-2">
                  Create Category Tag
                </Button>
              </form>

              {/* Table view */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/40" />
                  <input
                    type="text"
                    placeholder="Search category tags..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageCategories(1); }}
                    className="w-full h-9 bg-brand-card border border-brand-border rounded-full pl-9 pr-4 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-semibold placeholder:text-brand-text-secondary/30"
                  />
                </div>

                <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-brand-text-secondary">
                      <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none">
                        <tr>
                          <th className="py-4 px-5">Name</th>
                          <th className="py-4 px-5">Slug</th>
                          <th className="py-4 px-5">Item Count</th>
                          <th className="py-4 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentCategories.length > 0 ? (
                          currentCategories.map((c) => (
                            <tr key={c.id} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/30 transition-colors">
                              <td className="py-4 px-5 font-bold text-brand-text font-display">{c.name}</td>
                              <td className="py-4 px-5 font-mono text-[10.5px]">{c.slug}</td>
                              <td className="py-4 px-5 font-bold text-brand-text">{c.count || 0} books</td>
                              <td className="py-4 px-5 text-right">
                                <button 
                                  onClick={() => handleDeleteCategory(c.id)}
                                  className="px-2.5 py-1.5 rounded-full bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center font-semibold italic text-brand-text-secondary select-none">
                              No categories configured.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalCategoriesCount > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 select-none text-[11px] font-medium mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-text-secondary">Rows per page:</span>
                      <select
                        value={pageSizeCategories}
                        onChange={(e) => { setPageSizeCategories(Number(e.target.value)); setCurrentPageCategories(1); }}
                        className="h-8 bg-brand-card border border-brand-border rounded-[8px] px-2 text-xs text-brand-text font-bold focus:outline-none cursor-pointer"
                      >
                        {[5, 10, 20].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                      <span className="text-brand-text-secondary/60 ml-2">
                        Showing {indexOfFirstCategory + 1} to {Math.min(indexOfLastCategory, totalCategoriesCount)} of {totalCategoriesCount} categories
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPageCategories(prev => Math.max(prev - 1, 1))}
                        disabled={currentPageCategories === 1}
                        className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        &larr;
                      </button>

                      {Array.from({ length: totalCategoriesPages }).map((_, i) => {
                        const pNum = i + 1;
                        return (
                          <button
                            key={pNum}
                            onClick={() => setCurrentPageCategories(pNum)}
                            className={`h-8 w-8 flex items-center justify-center rounded-[8px] border font-bold transition-colors cursor-pointer ${
                              currentPageCategories === pNum
                                ? "border-brand-accent bg-brand-accent text-brand-text"
                                : "border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text"
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPageCategories(prev => Math.min(prev + 1, totalCategoriesPages))}
                        disabled={currentPageCategories === totalCategoriesPages}
                        className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === "reports" && (() => {
        const handleDismissReport = (reportId) => {
          setReports(prev => prev.filter(r => r.id !== reportId));
          toast.success("Report dismissed.");
        };

        const handleResolveAction = (reportId, actionLabel) => {
          setReports(prev => prev.filter(r => r.id !== reportId));
          toast.success(`Action taken: ${actionLabel}. Report resolved.`);
        };

        const reportsFiltered = reports.filter(r => {
          const matchesSearch = 
            r.targetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.reportedBy?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = filterReportStatus === "all" || r.status === filterReportStatus;
          return matchesSearch && matchesStatus;
        });

        const totalReportsCount = reportsFiltered.length;
        const totalReportsPages = Math.ceil(totalReportsCount / pageSizeReports) || 1;
        const indexOfLastReport = currentPageReports * pageSizeReports;
        const indexOfFirstReport = indexOfLastReport - pageSizeReports;
        const currentReports = reportsFiltered.slice(indexOfFirstReport, indexOfLastReport);

        return (
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Moderation Queue</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Content flags, copyright notices, and warning triggers.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card border border-brand-border rounded-[20px] p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 w-full">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/40" />
                  <input
                    type="text"
                    placeholder="Search reports, reasons..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageReports(1); }}
                    className="w-full h-9 bg-brand-bg-secondary border border-brand-border rounded-full pl-9 pr-4 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-semibold placeholder:text-brand-text-secondary/30"
                  />
                </div>

                <select
                  value={filterReportStatus}
                  onChange={(e) => { setFilterReportStatus(e.target.value); setCurrentPageReports(1); }}
                  className="h-9 bg-brand-bg-secondary border border-brand-border rounded-full px-4 text-xs text-brand-text font-bold focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>

                {(searchQuery || filterReportStatus !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setFilterReportStatus("all"); setCurrentPageReports(1); }}
                    className="text-xs text-brand-text-secondary hover:text-brand-text font-bold transition-colors cursor-pointer select-none"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-brand-text-secondary">
                  <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none">
                    <tr>
                      <th className="py-4 px-5">Reported Target</th>
                      <th className="py-4 px-5">Type</th>
                      <th className="py-4 px-5">Reason</th>
                      <th className="py-4 px-5">Reported By</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReports.length > 0 ? (
                      currentReports.map((r) => (
                        <tr key={r.id} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/30 transition-colors">
                          <td className="py-4 px-5 font-bold text-brand-text font-display">{r.targetName}</td>
                          <td className="py-4 px-5 capitalize">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              r.type === "Book" ? "bg-brand-accent/10 text-brand-accent" : "bg-brand-warning/10 text-brand-warning"
                            }`}>
                              {r.type}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-semibold text-brand-text-secondary">{r.reason}</td>
                          <td className="py-4 px-5 font-mono">{r.reportedBy}</td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex gap-1.5 justify-end select-none">
                              <button 
                                onClick={() => handleDismissReport(r.id)}
                                className="px-2.5 py-1.5 rounded-full border border-brand-border text-brand-text hover:bg-brand-bg-secondary text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Dismiss
                              </button>
                              <button 
                                onClick={() => handleResolveAction(r.id, "Warn User")}
                                className="px-2.5 py-1.5 rounded-full bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/20 text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Warn User
                              </button>
                              <button 
                                onClick={() => handleResolveAction(r.id, "Delete Target")}
                                className="px-2.5 py-1.5 rounded-full bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center font-semibold italic text-brand-text-secondary select-none">
                          No flags pending review.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalReportsCount > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 select-none text-[11px] font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-brand-text-secondary">Rows per page:</span>
                  <select
                    value={pageSizeReports}
                    onChange={(e) => { setPageSizeReports(Number(e.target.value)); setCurrentPageReports(1); }}
                    className="h-8 bg-brand-card border border-brand-border rounded-[8px] px-2 text-xs text-brand-text font-bold focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-brand-text-secondary/60 ml-2">
                    Showing {indexOfFirstReport + 1} to {Math.min(indexOfLastReport, totalReportsCount)} of {totalReportsCount} flags
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPageReports(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageReports === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &larr;
                  </button>

                  {Array.from({ length: totalReportsPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPageReports(pNum)}
                        className={`h-8 w-8 flex items-center justify-center rounded-[8px] border font-bold transition-colors cursor-pointer ${
                          currentPageReports === pNum
                            ? "border-brand-accent bg-brand-accent text-brand-text"
                            : "border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPageReports(prev => Math.min(prev + 1, totalReportsPages))}
                    disabled={currentPageReports === totalReportsPages}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ACTIVITY LOGS TAB */}
      {activeTab === "activity" && (() => {
        // Let's create an expanded mock list of all actions in the platform
        const fullActivityLogs = [
          { id: "log-1", user: "Admin", action: "Approved eBook listing", target: "Atomic Habits", category: "Book", time: "10 mins ago", severity: "success" },
          { id: "log-2", user: "John Doe", action: "Completed author verification", target: "Author Account", category: "User", time: "45 mins ago", severity: "accent" },
          { id: "log-3", user: "Admin", action: "Suspended reader access", target: "spammer.reader@gmail.com", category: "User", time: "2 hours ago", severity: "danger" },
          { id: "log-4", user: "Amara", action: "Published a new chapter", target: "Secrets of the Forest", category: "Book", time: "5 hours ago", severity: "success" },
          { id: "log-5", user: "Admin", action: "Dismissed copyright flag", target: "Atomic Habits", category: "Report", time: "1 day ago", severity: "warning" },
          { id: "log-6", user: "Rohan", action: "Updated contributor profile", target: "Rohan's Biography", category: "User", time: "2 days ago", severity: "accent" }
        ];

        return (
          <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Activity Logs</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Chronological audit log of admin operations and system events.</p>
            </div>

            <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-brand-text-secondary">
                  <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none">
                    <tr>
                      <th className="py-4 px-5">Operator</th>
                      <th className="py-4 px-5">Action Type</th>
                      <th className="py-4 px-5">Target Event</th>
                      <th className="py-4 px-5">Scope</th>
                      <th className="py-4 px-5 text-right">Time Elapsed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullActivityLogs.map((log) => (
                      <tr key={log.id} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/30 transition-colors">
                        <td className="py-4 px-5 font-bold text-brand-text font-display">{log.user}</td>
                        <td className="py-4 px-5 font-semibold text-brand-text-secondary">{log.action}</td>
                        <td className="py-4 px-5 font-semibold text-brand-text">{log.target}</td>
                        <td className="py-4 px-5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            log.severity === "success" ? "bg-brand-success/10 text-brand-success" :
                            log.severity === "warning" ? "bg-brand-warning/10 text-brand-warning" :
                            log.severity === "danger" ? "bg-brand-danger/10 text-brand-danger" :
                            "bg-brand-accent/10 text-brand-accent"
                          }`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right font-mono font-medium text-brand-text-secondary">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* NOTIFICATIONS DISPATCHER */}
      {activeTab === "notifications" && (() => {
        const handleSendNotification = (e) => {
          e.preventDefault();
          if (!notifTitle.trim() || !notifBody.trim()) {
            toast.error("Please fill in notification title and message.");
            return;
          }
          const newNotif = {
            id: `sent-${Date.now()}`,
            title: notifTitle,
            body: notifBody,
            audience: notifAudience,
            createdAt: new Date().toISOString()
          };
          setSentNotifications(prev => [newNotif, ...prev]);
          setNotifTitle("");
          setNotifBody("");
          toast.success("Broadcast dispatched successfully!");
        };

        return (
          <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">System Announcements</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Broadcast push notifications or updates to target segments.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form panel */}
              <form onSubmit={handleSendNotification} className="lg:col-span-7 bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand flex flex-col gap-5">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Create Broadcast</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Notification Title</label>
                  <input
                    type="text"
                    placeholder="Enter broadcast header..."
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full h-9 bg-brand-bg-secondary border border-brand-border rounded-[10px] px-3.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Broadcast Message Body</label>
                  <textarea
                    placeholder="Type publication note, system alert details..."
                    rows={4}
                    value={notifBody}
                    onChange={(e) => setNotifBody(e.target.value)}
                    className="w-full bg-brand-bg-secondary border border-brand-border rounded-[10px] p-3 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-medium resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-text-secondary uppercase">Target Segment Audience</label>
                  <select
                    value={notifAudience}
                    onChange={(e) => setNotifAudience(e.target.value)}
                    className="h-9 bg-brand-bg-secondary border border-brand-border rounded-[10px] px-3.5 text-xs text-brand-text font-bold focus:outline-none focus:border-brand-accent cursor-pointer"
                  >
                    <option value="all">Broadcast to All Users</option>
                    <option value="authors">Registered Authors Only</option>
                    <option value="readers">Readers segment Only</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" className="h-9 w-full rounded-full text-xs font-bold mt-2">
                  Dispatch Broadcast Notice
                </Button>
              </form>

              {/* Log Timeline panel */}
              <div className="lg:col-span-5 bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand flex flex-col gap-5">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Transmission History</h3>
                
                <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
                  {sentNotifications.length > 0 ? (
                    sentNotifications.map((n) => (
                      <div key={n.id} className="border-b border-brand-border/40 last:border-0 pb-4 last:pb-0 text-left">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[11.5px] font-bold text-brand-text leading-tight">{n.title}</span>
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 bg-brand-bg-secondary text-brand-text-secondary border border-brand-border/45 select-none">
                            {n.audience}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-text-secondary mt-1.5 leading-relaxed">{n.body}</p>
                        <span className="block text-[8px] font-semibold font-mono text-brand-text-secondary/40 mt-2">
                          {new Date(n.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-brand-text-secondary italic py-6 text-center">No messages sent.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SUPPORT & TICKETING DESK */}
      {activeTab === "support" && (() => {
        const handleResolveTicket = (ticketId) => {
          setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: "closed" } : t));
          toast.success("Support ticket marked resolved!");
        };

        const handleWarnUser = (email) => {
          toast.success(`Warning notice sent to ${email}`);
        };

        const ticketsFiltered = supportTickets.filter(t => {
          const matchesSearch = 
            t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = filterTicketStatus === "all" || t.status === filterTicketStatus;
          return matchesSearch && matchesStatus;
        });

        const totalTicketsCount = ticketsFiltered.length;
        const totalTicketsPages = Math.ceil(totalTicketsCount / pageSizeTickets) || 1;
        const indexOfLastTicket = currentPageTickets * pageSizeTickets;
        const indexOfFirstTicket = indexOfLastTicket - pageSizeTickets;
        const currentTickets = ticketsFiltered.slice(indexOfFirstTicket, indexOfLastTicket);

        return (
          <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Help Desk & Tickets</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Address user inquiries, resolve bug reports, and moderate requests.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card border border-brand-border rounded-[20px] p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 w-full">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/40" />
                  <input
                    type="text"
                    placeholder="Search tickets, emails..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageTickets(1); }}
                    className="w-full h-9 bg-brand-bg-secondary border border-brand-border rounded-full pl-9 pr-4 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-semibold placeholder:text-brand-text-secondary/30"
                  />
                </div>

                <select
                  value={filterTicketStatus}
                  onChange={(e) => { setFilterTicketStatus(e.target.value); setCurrentPageTickets(1); }}
                  className="h-9 bg-brand-bg-secondary border border-brand-border rounded-full px-4 text-xs text-brand-text font-bold focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="all">All Tickets</option>
                  <option value="open">Open Inquiries</option>
                  <option value="closed">Resolved Tickets</option>
                </select>

                {(searchQuery || filterTicketStatus !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setFilterTicketStatus("all"); setCurrentPageTickets(1); }}
                    className="text-xs text-brand-text-secondary hover:text-brand-text font-bold transition-colors cursor-pointer select-none"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Tickets Table */}
            <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-brand-text-secondary">
                  <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none">
                    <tr>
                      <th className="py-4 px-5">User Details</th>
                      <th className="py-4 px-5">Subject Header</th>
                      <th className="py-4 px-5">Message Query</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTickets.length > 0 ? (
                      currentTickets.map((t) => (
                        <tr key={t.id} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/30 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-brand-text truncate max-w-[150px] font-display">{t.email}</span>
                              <span className={`inline-block w-fit text-[8px] font-bold uppercase tracking-wider px-1 rounded ${
                                t.userRole === "author" ? "bg-brand-accent/15 text-brand-accent" : "bg-brand-text-secondary/15 text-brand-text-secondary"
                              }`}>
                                {t.userRole}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-bold text-brand-text truncate max-w-[150px]">{t.subject}</td>
                          <td className="py-4 px-5 font-semibold text-brand-text-secondary max-w-[200px] truncate" title={t.message}>{t.message}</td>
                          <td className="py-4 px-5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              t.status === "open" ? "bg-brand-danger/15 text-brand-danger animate-pulse" : "bg-[#111] text-brand-text-secondary/70 border border-brand-border"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex gap-1.5 justify-end select-none">
                              {t.status === "open" && (
                                <button 
                                  onClick={() => handleResolveTicket(t.id)}
                                  className="px-2.5 py-1.5 rounded-full bg-brand-success/15 text-brand-success hover:bg-brand-success/25 text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Mark Resolved
                                </button>
                              )}
                              <button 
                                onClick={() => handleWarnUser(t.email)}
                                className="px-2.5 py-1.5 rounded-full bg-brand-warning/15 text-brand-warning hover:bg-brand-warning/25 text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Send Warning
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center font-semibold italic text-brand-text-secondary select-none">
                          No support tickets match current criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalTicketsCount > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 select-none text-[11px] font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-brand-text-secondary">Rows per page:</span>
                  <select
                    value={pageSizeTickets}
                    onChange={(e) => { setPageSizeTickets(Number(e.target.value)); setCurrentPageTickets(1); }}
                    className="h-8 bg-brand-card border border-brand-border rounded-[8px] px-2 text-xs text-brand-text font-bold focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 20].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-brand-text-secondary/60 ml-2">
                    Showing {indexOfFirstTicket + 1} to {Math.min(indexOfLastTicket, totalTicketsCount)} of {totalTicketsCount} tickets
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPageTickets(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageTickets === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &larr;
                  </button>

                  {Array.from({ length: totalTicketsPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPageTickets(pNum)}
                        className={`h-8 w-8 flex items-center justify-center rounded-[8px] border font-bold transition-colors cursor-pointer ${
                          currentPageTickets === pNum
                            ? "border-brand-accent bg-brand-accent text-brand-text"
                            : "border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPageTickets(prev => Math.min(prev + 1, totalTicketsPages))}
                    disabled={currentPageTickets === totalTicketsPages}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-brand-border bg-brand-card hover:bg-brand-bg-secondary text-brand-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 9B. LIVE TRACKER TAB */}
      {activeTab === "live-tracker" && (() => {
        // Use real timestamps from dynamicVisitorLog (no fake recalculation)
        const activeUsersList = dynamicVisitorLog;

        // Search & Filter state evaluations
        const filteredTrackerLogs = activeUsersList.filter(usr => {
          const userObj = usersList.find(u => u.uid === usr.id);
          const userEmail = (userObj?.email || usr.user).toLowerCase();
          const userDisplayName = (userObj?.displayName || "").toLowerCase();
          const locationVal = usr.location.toLowerCase();
          const deviceVal = usr.device.toLowerCase();
          const searchVal = liveTrackerSearch.toLowerCase();

          const matchesSearch = 
            userEmail.includes(searchVal) ||
            userDisplayName.includes(searchVal) ||
            locationVal.includes(searchVal) ||
            deviceVal.includes(searchVal);
          
          const matchesStatus = 
            liveTrackerStatusFilter === "all" || 
            usr.status.toLowerCase() === liveTrackerStatusFilter;

          return matchesSearch && matchesStatus;
        });

        const activeCountNum = activeUsersList.filter(u => u.status === "Active").length;

        return (
          <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
            {/* Header section with live count pill */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Live Users Tracker</h1>
                <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Real-time sessions monitor tracking active user presence, login entries and exit timestamps.</p>
              </div>

              {/* Pulsing Dynamic Live Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-success/10 border border-brand-success/20 text-brand-success text-[11px] font-bold select-none shrink-0 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
                </span>
                <span>{activeCountNum} active now</span>
              </div>
            </div>

            {/* Filter Panel Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card border border-brand-border rounded-[20px] p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 w-full">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/40" />
                  <input
                    type="text"
                    placeholder="Search by email, city, device..."
                    value={liveTrackerSearch}
                    onChange={(e) => setLiveTrackerSearch(e.target.value)}
                    className="w-full h-9 bg-brand-bg-secondary border border-brand-border rounded-full pl-9 pr-4 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-semibold placeholder:text-brand-text-secondary/30"
                  />
                </div>

                <select
                  value={liveTrackerStatusFilter}
                  onChange={(e) => setLiveTrackerStatusFilter(e.target.value)}
                  className="h-9 bg-brand-bg-secondary border border-brand-border rounded-full px-4 text-xs text-brand-text font-bold focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="all">All Sessions</option>
                  <option value="active">Active Now</option>
                  <option value="ended">Ended</option>
                </select>

                {(liveTrackerSearch || liveTrackerStatusFilter !== "all") && (
                  <button
                    onClick={() => { setLiveTrackerSearch(""); setLiveTrackerStatusFilter("all"); }}
                    className="text-xs text-brand-text-secondary hover:text-brand-text font-bold transition-colors cursor-pointer select-none"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Grid display / Table */}
            {filteredTrackerLogs.length > 0 ? (
              <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-brand-text-secondary border-collapse">
                    <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none sticky top-0 z-10">
                      <tr>
                        <th className="py-4 px-5">Active User</th>
                        <th className="py-4 px-5 hidden md:table-cell">Location</th>
                        <th className="py-4 px-5 hidden md:table-cell">Device & Client</th>
                        <th className="py-4 px-5">Login Time</th>
                        <th className="py-4 px-5">Logout Time</th>
                        <th className="py-4 px-5 text-right hidden md:table-cell">Duration</th>
                        <th className="py-4 px-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrackerLogs.map((usr) => {
                        const isGuest = usr.isGuest !== false && (usr.id.startsWith("guest") || usr.user.includes("Guest") || !usr.uid);
                        let displayName = "";
                        let email = "";
                        let avatarChar = "G";

                        if (isGuest) {
                          displayName = "Guest Session";
                          email = usr.sessionId || usr.id;
                        } else {
                          const userObj = usersList.find(u => u.uid === usr.id);
                          displayName = usr.displayName || userObj?.displayName || "";
                          email = usr.email || userObj?.email || usr.user || "registered@ebookvala.com";
                          avatarChar = (displayName || email || "U").charAt(0).toUpperCase();
                        }

                        return (
                          <tr key={usr.id} className="h-16 border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/20 transition-colors animate-fade-in">
                            {/* Identity Column */}
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                {/* Initial Avatar Badge */}
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                  isGuest 
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                                    : "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                                }`}>
                                  {avatarChar}
                                </div>

                                <div className="flex flex-col gap-0.5">
                                  {displayName && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[12px] font-bold text-brand-text font-display leading-tight">{displayName}</span>
                                      {isGuest && (
                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-brand-bg-secondary text-brand-text-secondary border border-brand-border">
                                          Guest
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <span className={`font-mono text-[10.5px] leading-tight ${isGuest ? "text-brand-text-secondary/50 font-semibold" : "text-brand-text font-bold"}`}>
                                    {email}
                                  </span>

                                  {/* Mobile Responsive Folding Details */}
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[9px] text-brand-text-secondary/60 font-semibold md:hidden leading-none select-none">
                                    <span>{usr.location}</span>
                                    <span>•</span>
                                    <span>{usr.device}</span>
                                    <span>•</span>
                                    <span className="font-mono">{usr.duration}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Location Column */}
                            <td className="py-4 px-5 font-semibold text-brand-text-secondary hidden md:table-cell">{usr.location}</td>

                            {/* Device Column */}
                            <td className="py-4 px-5 font-mono text-[10px] hidden md:table-cell">{usr.device}</td>

                            {/* Login Time */}
                            <td className="py-4 px-5 font-mono font-bold text-brand-text">{usr.loginTime}</td>

                            {/* Logout Time */}
                            <td className="py-4 px-5 font-mono font-bold">
                              {usr.status === "Active" ? (
                                <span className="text-brand-success font-bold font-sans text-[9px] uppercase bg-brand-success/10 px-2 py-0.5 rounded-full select-none">Active Now</span>
                              ) : (
                                <span className="text-brand-text-secondary/80">{usr.logoutTime}</span>
                              )}
                            </td>

                            {/* Duration Column */}
                            <td className="py-4 px-5 text-right font-mono font-bold text-brand-text text-[11px] hidden md:table-cell">{usr.duration}</td>

                            {/* Status Column */}
                            <td className="py-4 px-5 text-right">
                              {usr.status === "Active" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold bg-brand-success/10 text-brand-success select-none">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-success"></span>
                                  </span>
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold bg-brand-text-secondary/10 text-brand-text-secondary select-none">
                                  ENDED
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Premium Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center select-none bg-brand-card border border-brand-border rounded-[20px] shadow-sm">
                <AlertCircle className="h-10 w-10 text-brand-text-secondary/35 mb-3.5" />
                <h4 className="text-sm font-bold text-brand-text">No active sessions right now</h4>
                <p className="text-xs text-brand-text-secondary mt-1 max-w-[280px]">We couldn't find any user sessions matching your filter criteria.</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* 9.5. ALL USERS / LOGIN HISTORY TAB */}
      {activeTab === "all-users" && (() => {
        const formatDateTime = (val) => {
          if (!val) return "—";
          const d = new Date(val);
          if (isNaN(d.getTime())) return "—";
          return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
        };

        const allUsersFiltered = usersList.filter(u => {
          const name = (u.displayName || "").toLowerCase();
          const email = (u.email || "").toLowerCase();
          const query = allUsersSearchQuery.toLowerCase();
          return name.includes(query) || email.includes(query);
        });

        const sortedAllUsers = [...allUsersFiltered].sort((a, b) => {
          let fieldA = a[sortFieldAllUsers];
          let fieldB = b[sortFieldAllUsers];

          if (sortFieldAllUsers === "loginCount") {
            fieldA = parseInt(fieldA, 10) || 0;
            fieldB = parseInt(fieldB, 10) || 0;
          } else {
            fieldA = fieldA ? new Date(fieldA).getTime() : 0;
            fieldB = fieldB ? new Date(fieldB).getTime() : 0;
          }

          if (fieldA < fieldB) return sortOrderAllUsers === "asc" ? -1 : 1;
          if (fieldA > fieldB) return sortOrderAllUsers === "asc" ? 1 : -1;
          return 0;
        });

        const totalAllUsersCount = sortedAllUsers.length;
        const totalAllUsersPages = Math.ceil(totalAllUsersCount / pageSizeAllUsers) || 1;
        const indexOfLastAllUser = currentPageAllUsers * pageSizeAllUsers;
        const indexOfFirstAllUser = indexOfLastAllUser - pageSizeAllUsers;
        const currentAllUsers = sortedAllUsers.slice(indexOfFirstAllUser, indexOfLastAllUser);

        const handleSort = (field) => {
          if (sortFieldAllUsers === field) {
            setSortOrderAllUsers(prev => (prev === "asc" ? "desc" : "asc"));
          } else {
            setSortFieldAllUsers(field);
            setSortOrderAllUsers("desc");
          }
          setCurrentPageAllUsers(1);
        };

        return (
          <div className="flex flex-col gap-6 text-left select-none animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-display font-black text-brand-text tracking-tight font-display">Users & Login History</h1>
                <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Audit full registration list, historical logins, and active session statuses.</p>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 rounded-[20px] bg-brand-card border border-brand-border shadow-sm select-none shrink-0">
                <Users className="h-4.5 w-4.5 text-brand-primary" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-brand-text-secondary">Registered Users</span>
                  <span className="text-sm font-black text-brand-text font-display leading-tight">{usersList.length} total</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-card border border-brand-border rounded-[20px] p-4 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-secondary/40" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={allUsersSearchQuery}
                  onChange={(e) => { setAllUsersSearchQuery(e.target.value); setCurrentPageAllUsers(1); }}
                  className="w-full h-9 bg-brand-bg-secondary border border-brand-border rounded-full pl-9 pr-4 text-xs text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-semibold placeholder:text-brand-text-secondary/30"
                />
              </div>

              {allUsersSearchQuery && (
                <button
                  onClick={() => { setAllUsersSearchQuery(""); setCurrentPageAllUsers(1); }}
                  className="text-xs text-brand-text-secondary hover:text-brand-text font-bold transition-colors cursor-pointer select-none"
                >
                  Clear Search
                </button>
              )}
            </div>

            {currentAllUsers.length > 0 ? (
              <div className="border border-brand-border rounded-[20px] shadow-brand overflow-hidden bg-brand-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-brand-text-secondary border-collapse">
                    <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border select-none sticky top-0 z-10">
                      <tr>
                        <th className="py-4 px-5">User</th>
                        <th className="py-4 px-5">Email</th>
                        <th 
                          className="py-4 px-5 cursor-pointer hover:bg-brand-bg-secondary/40 transition-colors select-none"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center gap-1">
                            Registered
                            {sortFieldAllUsers === "createdAt" && (
                              <span>{sortOrderAllUsers === "asc" ? "▲" : "▼"}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="py-4 px-5 cursor-pointer hover:bg-brand-bg-secondary/40 transition-colors select-none"
                          onClick={() => handleSort("lastLoginAt")}
                        >
                          <div className="flex items-center gap-1">
                            Last Login
                            {sortFieldAllUsers === "lastLoginAt" && (
                              <span>{sortOrderAllUsers === "asc" ? "▲" : "▼"}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="py-4 px-5 text-center cursor-pointer hover:bg-brand-bg-secondary/40 transition-colors select-none"
                          onClick={() => handleSort("loginCount")}
                        >
                          <div className="flex items-center justify-center gap-1">
                            Total Logins
                            {sortFieldAllUsers === "loginCount" && (
                              <span>{sortOrderAllUsers === "asc" ? "▲" : "▼"}</span>
                            )}
                          </div>
                        </th>
                        <th className="py-4 px-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAllUsers.map((usr) => {
                        const avatarChar = (usr.displayName || usr.email || "U").charAt(0).toUpperCase();
                        const isLive = liveSessions.some(s => {
                          if (s.id !== usr.uid || s.status !== "Active") return false;
                          const toMs = (val) => {
                            if (!val) return 0;
                            if (typeof val === "number") return val;
                            if (val && typeof val.toMillis === "function") return val.toMillis();
                            const parsed = new Date(val).getTime();
                            return isNaN(parsed) ? 0 : parsed;
                          };
                          const lastSeenMs = toMs(s.lastSeen);
                          return lastSeenMs > 0 && (Date.now() - lastSeenMs <= 90000);
                        });

                        return (
                          <tr key={usr.uid} className="h-16 border-b border-brand-border/40 last:border-0 hover:bg-brand-bg-secondary/20 transition-colors animate-fade-in">
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center justify-center text-xs font-black shrink-0">
                                  {avatarChar}
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="text-[12px] font-bold text-brand-text font-display leading-tight">{usr.displayName || "EBOOKVALA User"}</span>
                                  {usr.role && (
                                    <span className="text-[9px] font-mono font-bold uppercase text-brand-accent tracking-wider mt-0.5">{usr.role}</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5 font-mono text-[11px] text-brand-text">{usr.email}</td>
                            <td className="py-4 px-5 font-semibold text-brand-text-secondary">{formatDateTime(usr.createdAt)}</td>
                            <td className="py-4 px-5 font-semibold text-brand-text-secondary">{formatDateTime(usr.lastLoginAt)}</td>
                            <td className="py-4 px-5 text-center font-mono font-bold text-brand-text text-[11px]">{usr.loginCount || 0}</td>
                            <td className="py-4 px-5 text-right">
                              {isLive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold bg-brand-success/10 text-brand-success select-none">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-success"></span>
                                  </span>
                                  LIVE NOW
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold bg-brand-text-secondary/10 text-brand-text-secondary select-none">
                                  OFFLINE
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalAllUsersPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-5 py-4 bg-brand-bg-secondary select-none border-t border-brand-border">
                    <span className="text-[10px] font-bold text-brand-text-secondary uppercase">
                      Page {currentPageAllUsers} of {totalAllUsersPages} • Total {totalAllUsersCount} records
                    </span>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPageAllUsers(prev => Math.max(prev - 1, 1))}
                        disabled={currentPageAllUsers === 1}
                        className="h-8.5 px-4 text-xs font-bold rounded-full border-brand-border select-none cursor-pointer"
                      >
                        Prev
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalAllUsersPages }, (_, i) => i + 1).map((pNum) => (
                          <button
                            key={pNum}
                            onClick={() => setCurrentPageAllUsers(pNum)}
                            className={`h-8.5 w-8.5 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                              currentPageAllUsers === pNum
                                ? "bg-brand-accent text-white shadow-sm"
                                : "text-brand-text-secondary hover:text-brand-text hover:bg-brand-border/40"
                            }`}
                          >
                            {pNum}
                          </button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setCurrentPageAllUsers(prev => Math.min(prev + 1, totalAllUsersPages))}
                        disabled={currentPageAllUsers === totalAllUsersPages}
                        className="h-8.5 px-4 text-xs font-bold rounded-full border-brand-border select-none cursor-pointer"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none bg-brand-card border border-brand-border rounded-[20px] shadow-sm">
                <AlertCircle className="h-10 w-10 text-brand-text-secondary/35 mb-3.5" />
                <h4 className="text-sm font-bold text-brand-text">No user records found</h4>
                <p className="text-xs text-brand-text-secondary mt-1 max-w-[280px]">We couldn't find any registered accounts matching your search query.</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* 10. SITE SETTINGS TAB */}
      {activeTab === "settings" && (() => {
        const subTabs = [
          { id: "general", label: "General & Branding" },
          { id: "seo", label: "SEO Config" },
          { id: "email", label: "Email & SMTP" },
          { id: "security", label: "Security & Auth" },
          { id: "storage", label: "Media & Storage" },
          { id: "legal", label: "Legal Policies" },
          { id: "system", label: "System Parameters" },
          { id: "custom-fields", label: "Dynamic Fields" }
        ];

        return (
          <div className="flex flex-col gap-6 text-left select-none animate-fade-in w-full max-w-4xl">
            <div>
              <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">Platform Settings</h1>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Configure global parameters, SEO keywords, security rules, and system details.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-brand-card border border-brand-border rounded-[20px] p-6 shadow-brand">
              {/* Left Column: Sub-Tab Buttons */}
              <div className="md:col-span-4 flex flex-col gap-1 border-r border-brand-border/40 pr-0 md:pr-4">
                {subTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSettingsSubTab(tab.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                      settingsSubTab === tab.id
                        ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20"
                        : "text-brand-text-secondary hover:text-brand-text hover:bg-brand-bg-secondary border border-transparent"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Right Column: Active Form Fields */}
              <div className="md:col-span-8 flex flex-col gap-5 min-h-[300px] justify-between">
                <div className="flex flex-col gap-5">
                  {/* General & Branding Sub-Tab */}
                  {settingsSubTab === "general" && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <Input
                        label="Platform Branding Name"
                        value={siteSettings.platformName}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, platformName: e.target.value }))}
                        required
                      />
                      
                      <div className="flex items-center justify-between p-3.5 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-brand-success shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-brand-text">Allow Public Reader Signups</p>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5">Control registration forms accessibility.</p>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={siteSettings.publicSignups}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, publicSignups: e.target.checked }))}
                          className="h-4.5 w-4.5 text-brand-success rounded border-brand-border focus:ring-brand-success cursor-pointer accent-brand-success"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                        <div className="flex items-start gap-3">
                          <Upload className="h-5 w-5 text-brand-accent shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-brand-text">Allow Public Book Uploads</p>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5">Allow authors to submit new eBook listings.</p>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={siteSettings.publicUploads}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, publicUploads: e.target.checked }))}
                          className="h-4.5 w-4.5 text-brand-accent rounded border-brand-border focus:ring-brand-accent cursor-pointer accent-brand-accent"
                        />
                      </div>

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
                    </div>
                  )}

                  {/* SEO Sub-Tab */}
                  {settingsSubTab === "seo" && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <Input
                        label="SEO Meta Title"
                        value={siteSettings.seoTitle}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, seoTitle: e.target.value }))}
                        required
                      />
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider font-mono">SEO Meta Description</label>
                        <textarea
                          rows={3}
                          value={siteSettings.seoDescription}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, seoDescription: e.target.value }))}
                          className="w-full bg-brand-bg-secondary border border-brand-border px-4 py-3 rounded-[16px] text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-accent font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email & SMTP Sub-Tab */}
                  {settingsSubTab === "email" && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <Input
                        label="SMTP Relay Host"
                        value={siteSettings.smtpHost}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                        required
                      />
                      <Input
                        label="Default Sender Email Address"
                        type="email"
                        value={siteSettings.emailSender}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, emailSender: e.target.value }))}
                        required
                      />
                    </div>
                  )}

                  {/* Security & Auth Sub-Tab */}
                  {settingsSubTab === "security" && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <Input
                        label="Minimum Password Length"
                        type="number"
                        value={siteSettings.passwordMinLength}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value, 10) || 6 }))}
                        required
                      />
                      <div className="flex items-center justify-between p-3.5 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                        <div>
                          <p className="text-xs font-bold text-brand-text">Enforce Two-Factor Auth (2FA)</p>
                          <p className="text-[10px] text-brand-text-secondary mt-0.5">Require auth OTP verification for admins.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={siteSettings.enableTwoFactor}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, enableTwoFactor: e.target.checked }))}
                          className="h-4.5 w-4.5 text-brand-accent rounded border-brand-border focus:ring-brand-accent cursor-pointer accent-brand-accent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Storage Sub-Tab */}
                  {settingsSubTab === "storage" && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <Input
                        label="Allowed Document Formats"
                        value={siteSettings.allowedExtensions}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, allowedExtensions: e.target.value }))}
                        required
                      />
                      <Input
                        label="Maximum Upload File Size (MB)"
                        type="number"
                        value={siteSettings.maxFileSizeMb}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, maxFileSizeMb: parseInt(e.target.value, 10) || 50 }))}
                        required
                      />
                    </div>
                  )}

                  {/* Legal Sub-Tab */}
                  {settingsSubTab === "legal" && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <Input
                        label="Terms & Conditions Page Path"
                        value={siteSettings.termsUrl}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, termsUrl: e.target.value }))}
                        required
                      />
                      <Input
                        label="Privacy Policy Page Path"
                        value={siteSettings.privacyUrl}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, privacyUrl: e.target.value }))}
                        required
                      />
                    </div>
                  )}

                  {/* System Sub-Tab */}
                  {settingsSubTab === "system" && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider font-mono">System Logging Level</label>
                        <select
                          value={siteSettings.systemLogLevel}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, systemLogLevel: e.target.value }))}
                          className="h-11 bg-brand-bg-secondary border border-brand-border rounded-[16px] px-4 text-xs sm:text-sm text-brand-text font-bold focus:outline-none focus:border-brand-accent cursor-pointer"
                        >
                          <option value="debug">DEBUG (Verbose)</option>
                          <option value="info">INFO (Standard)</option>
                          <option value="warn">WARN (Warnings only)</option>
                          <option value="error">ERROR (Errors only)</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between p-3.5 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                        <div>
                          <p className="text-xs font-bold text-brand-text">Enable Analytical Metrics</p>
                          <p className="text-[10px] text-brand-text-secondary mt-0.5">Collect telemetry for real-time tracking.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={siteSettings.enableMetrics}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, enableMetrics: e.target.checked }))}
                          className="h-4.5 w-4.5 text-brand-accent rounded border-brand-border focus:ring-brand-accent cursor-pointer accent-brand-accent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic Custom Fields Sub-Tab */}
                  {settingsSubTab === "custom-fields" && (
                    <div className="flex flex-col gap-5 animate-fade-in w-full text-left">
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-3.5 mb-2">
                        <div>
                          <p className="text-xs font-bold text-brand-text">Dynamic Meta Fields</p>
                          <p className="text-[10px] text-brand-text-secondary mt-0.5">Manage custom book metadata attributes.</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="primary" 
                          onClick={() => {
                            setFieldForm({ id: "", label: "", type: "text", required: false, options: "", defaultValue: "" });
                            setIsFieldModalOpen(true);
                          }}
                          className="h-9 px-4 text-xs font-bold rounded-full shadow-sm"
                        >
                          Add Custom Field
                        </Button>
                      </div>

                      {customFields.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {customFields.map((field) => (
                            <div key={field.id} className="flex items-center justify-between p-3.5 bg-brand-bg-secondary border border-brand-border rounded-[14px]">
                              <div>
                                <p className="text-xs font-bold text-brand-text flex items-center gap-2">
                                  {field.label}
                                  <span className="font-mono text-[9px] bg-brand-border text-brand-text-secondary px-1.5 py-0.5 rounded font-bold uppercase">
                                    {field.id}
                                  </span>
                                </p>
                                <p className="text-[10px] text-brand-text-secondary mt-1.5 font-mono">
                                  Type: <span className="font-bold text-brand-accent">{field.type}</span> • Required: <span className="font-bold">{field.required ? "Yes" : "No"}</span> {field.defaultValue && `• Default: "${field.defaultValue}"`}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  if (window.confirm(`Delete custom field "${field.label}"?`)) {
                                    handleDeleteCustomField(field.id);
                                  }
                                }}
                                className="h-8.5 w-8.5 p-0 text-brand-danger hover:bg-brand-danger/10 rounded-full flex items-center justify-center cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-brand-text-secondary text-xs">
                          No dynamic fields configured.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button type="submit" variant="primary" className="h-11 w-full sm:w-fit mt-4 rounded-full text-xs font-bold px-6 shadow-sm self-start">
                  Save Platform Settings
                </Button>
              </div>
            </form>
          </div>
        );
      })()}

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
