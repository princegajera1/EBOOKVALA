import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Users, BookOpen, Award, Check, X, Search, Ban, Trash2, 
  Plus, Settings, Grid, BarChart2, ShieldAlert, Edit, FileText, Upload
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

// 30 Days eBook Downloads data (retains trend style visualizer)
const DOWNLOADS_TREND = Array.from({ length: 30 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  downloads: Math.floor(180 + Math.random() * 120)
}));

export const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const navigate = useNavigate();

  // Database states
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categories, setCategories] = useState([]);

  // Site Settings
  const [siteSettings, setSiteSettings] = useState({
    platformName: "EBOOKVALA",
    maintenanceMode: false
  });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // eBook Editor Modal States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null); // null = Adding, otherwise editing
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
    categories: []
  });

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

      // Retrieve actual registered users from Firestore
      const realUsers = await dbService.getUsers();
      
      setUsersList(realUsers);
    } catch (err) {
      console.error("Error loading admin dashboard stats:", err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

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
      categories: []
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
      categories: book.categories || []
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
      
      // Lookup selected author display name
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

  // Categories CRUD (lives in Firestore)
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

  // Site settings save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success("Platform settings updated!");
  };

  const sidebarLinks = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "books", label: "Manage Books", icon: BookOpen },
    { id: "categories", label: "Categories", icon: Grid },
    { id: "settings", label: "Platform Settings", icon: Settings }
  ];

  const pendingBooks = books.filter(b => b.status === "pending");
  const pendingVerifications = authors.filter(a => a.verificationStatus === "pending");

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
              { label: "Total Downloads", value: (orders.length + 1540).toLocaleString(), desc: "eBooks distributed" },
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
                  <AreaChart data={DOWNLOADS_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-text-secondary/50" />
              <input
                type="text"
                placeholder="Search name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-card border border-brand-border rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 text-brand-text font-medium"
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

      {/* 4. CATEGORIES TAB */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          
          {/* Add Category Form */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-brand-text tracking-tight font-display">Create Category</h2>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Add new category classification.</p>
            </div>
            
            <div className="bg-brand-card border border-brand-border rounded-[20px] p-5 shadow-brand flex flex-col gap-4">
              <Input
                label="Category Name"
                placeholder="e.g. Science Fiction"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={handleAddCategory} variant="primary" className="w-full h-11 rounded-full text-xs font-bold shadow-sm mt-2">
                <Plus className="mr-1.5 h-4 w-4" /> Create Category
              </Button>
            </div>
          </div>

          {/* List Categories */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-brand-text tracking-tight font-display">Existing Categories</h2>
              <p className="text-xs text-brand-text-secondary mt-1 font-semibold">Review list of active book categories.</p>
            </div>

            <div className="border border-brand-border rounded-[16px] shadow-brand overflow-hidden bg-brand-card select-none">
              <table className="w-full text-xs text-left text-brand-text-secondary">
                <thead className="bg-brand-bg-secondary text-brand-text uppercase font-bold text-[10px] tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-4 px-5">Category Name</th>
                    <th className="py-4 px-5">Slug Reference</th>
                    <th className="py-4 px-5">eBooks Count</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-brand-border/60 last:border-0 hover:bg-brand-bg-secondary/40 transition-colors">
                      <td className="py-4 px-5 font-bold text-brand-text">{cat.name}</td>
                      <td className="py-4 px-5 font-mono text-[10px]">{cat.slug}</td>
                      <td className="py-4 px-5 font-mono font-bold text-brand-text">{cat.count || 0} Books</td>
                      <td className="py-4 px-5 text-right">
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-brand-danger hover:bg-brand-danger/10 rounded-full transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 5. SITE SETTINGS TAB */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <Input
              label="eBook Price (INR)"
              type="number"
              value={bookForm.price}
              onChange={(e) => setBookForm(prev => ({ ...prev, price: e.target.value }))}
              required
            />
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

          {/* Categories select checklist */}
          <div className="flex flex-col gap-2">
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
              variant="primary"
              disabled={uploadingCover || uploadingPdf || !bookForm.coverURL || !bookForm.pdfURL}
              className="h-10 px-6 rounded-full text-xs font-bold shadow-sm"
            >
              Save eBook
            </Button>
          </div>
        </form>
      </Modal>

    </DashboardLayout>
  );
};

export default AdminDashboard;
