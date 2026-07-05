// Unified Data Access Layer backed by Live Firebase Firestore
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc 
} from "firebase/firestore";
import { db } from "../lib/firebase";

// Original Mock Seed Data to initialize Firestore if empty
const SEED_AUTHORS = [
  {
    uid: "author-1",
    displayName: "Amara Dev",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Pioneering software engineer and technical writer. Amara masterfully scales distributed systems and teaches modern engineering patterns.",
    socialLinks: { twitter: "@amaradev", github: "amaradev", website: "amaradev.com" },
    isVerified: true,
    verificationStatus: "approved",
    totalEarnings: 84320,
    availableBalance: 12400,
    pendingBalance: 3200,
    followers: ["user-prince", "user-2"],
    totalSales: 282,
    createdAt: "2024-01-15T08:30:00Z"
  },
  {
    uid: "author-2",
    displayName: "Rohan Mehta",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Business strategist and venture capitalist. Rohan shares actionable playbooks on SaaS startups and modern software product sales.",
    socialLinks: { twitter: "@rohanvc", linkedin: "rohanmehta" },
    isVerified: true,
    verificationStatus: "approved",
    totalEarnings: 156000,
    availableBalance: 48500,
    pendingBalance: 8900,
    followers: ["user-prince", "user-3", "user-4"],
    totalSales: 520,
    createdAt: "2023-09-10T10:15:00Z"
  },
  {
    uid: "author-3",
    displayName: "Ananya Iyer",
    photoURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Mindfulness coach and writer. Ananya provides clear templates on designing calm, focus-centered, purposeful workspaces.",
    socialLinks: { twitter: "@ananyamind", website: "ananyaiyer.com" },
    isVerified: false,
    verificationStatus: "pending",
    totalEarnings: 34200,
    availableBalance: 8200,
    pendingBalance: 1500,
    followers: ["user-5"],
    totalSales: 114,
    createdAt: "2024-03-01T14:45:00Z"
  }
];

const SEED_BOOKS = [
  {
    id: "book-1",
    title: "Designing for Scale",
    subtitle: "A practical guide to building highly resilient distributed web applications.",
    slug: "designing-for-scale",
    authorId: "author-1",
    authorName: "Amara Dev",
    description: "Building systems that scale is challenging. This book provides a complete hands-on guide covering microservices, caching, load balancing, message queues, and database sharding.",
    aiDescription: "✨ AI Enhanced: Master high-availability backend engineering. Blueprints and battle-tested code patterns for Senior Engineers and Architects.",
    categories: ["Technology", "Design"],
    tags: ["Systems Architecture", "Scale", "Backend", "Microservices"],
    language: "English",
    isbn: "978-3-16-148410-0",
    publisher: "Ebookvala Press",
    edition: "2nd Edition",
    pages: 342,
    readingTimeMinutes: 280,
    coverURL: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop",
    pdfURL: "/demo-preview.pdf",
    epubURL: "",
    previewPdfURL: "/demo-preview.pdf",
    price: 499,
    originalPrice: 899,
    discount: 44,
    couponCodes: ["SCALE10", "WELCOME20"],
    rating: 4.9,
    reviewCount: 48,
    downloadCount: 1420,
    viewCount: 5200,
    salesCount: 210,
    fileSize: "14.2 MB",
    format: ["PDF", "EPUB"],
    isDRM: true,
    status: "published",
    rejectionReason: "",
    isFeatured: true,
    isNew: false,
    isTrending: true,
    createdAt: "2024-01-20T12:00:00Z",
    updatedAt: "2024-05-15T12:00:00Z",
    publishedAt: "2024-01-25T12:00:00Z"
  },
  {
    id: "book-2",
    title: "Zero to $10M ARR",
    subtitle: "The non-obvious playbook for scaling SaaS startups in crowded markets.",
    slug: "zero-to-10m-arr",
    authorId: "author-2",
    authorName: "Rohan Mehta",
    description: "Venture capitalist and founder Rohan Mehta breaks down exact SaaS marketing funnels, outbound pricing tiers, and acquisition tricks.",
    aiDescription: "✨ AI Enhanced: Masterclass in distribution. Highly recommended for Modern Tech Founders and Business leaders.",
    categories: ["Business", "Self-Help"],
    tags: ["SaaS", "Startups", "Growth", "Marketing"],
    language: "English",
    isbn: "978-1-56619-909-4",
    publisher: "Stripe Press India",
    edition: "1st Edition",
    pages: 288,
    readingTimeMinutes: 240,
    coverURL: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop",
    pdfURL: "/demo-preview.pdf",
    epubURL: "",
    previewPdfURL: "/demo-preview.pdf",
    price: 399,
    originalPrice: 799,
    discount: 50,
    couponCodes: ["STARTUP30"],
    rating: 4.8,
    reviewCount: 65,
    downloadCount: 2210,
    viewCount: 8900,
    salesCount: 380,
    fileSize: "8.6 MB",
    format: ["PDF"],
    isDRM: false,
    status: "published",
    rejectionReason: "",
    isFeatured: true,
    isNew: false,
    isTrending: true,
    createdAt: "2023-10-01T09:00:00Z",
    updatedAt: "2024-06-01T09:00:00Z",
    publishedAt: "2023-10-05T09:00:00Z"
  },
  {
    id: "book-3",
    title: "The Digital Sanctuary",
    subtitle: "A mindful guide to reclaiming focus, energy, and peace in an age of noise.",
    slug: "the-digital-sanctuary",
    authorId: "author-3",
    authorName: "Ananya Iyer",
    description: "Establish conscious boundaries with modern tech. Curate distraction-free work environments and practice cognitive deep work.",
    aiDescription: "✨ AI Enhanced: Cognitive strategies to optimize focus and escape screen exhaustion. Perfect for remote workers.",
    categories: ["Self-Help", "Fiction"],
    tags: ["Mindfulness", "Productivity", "Focus", "Mental Health"],
    language: "English",
    isbn: "978-0-12-345678-9",
    publisher: "Sanctuary Books",
    edition: "1st Edition",
    pages: 210,
    readingTimeMinutes: 160,
    coverURL: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop",
    pdfURL: "/demo-preview.pdf",
    epubURL: "",
    previewPdfURL: "/demo-preview.pdf",
    price: 249,
    originalPrice: 499,
    discount: 50,
    couponCodes: ["CALM25"],
    rating: 4.7,
    reviewCount: 32,
    downloadCount: 890,
    viewCount: 3400,
    salesCount: 114,
    fileSize: "6.1 MB",
    format: ["PDF", "EPUB"],
    isDRM: false,
    status: "published",
    rejectionReason: "",
    isFeatured: false,
    isNew: true,
    isTrending: false,
    createdAt: "2024-03-05T15:00:00Z",
    updatedAt: "2024-03-05T15:00:00Z",
    publishedAt: "2024-03-10T15:00:00Z"
  }
];

const SEED_CATEGORIES = [
  { id: "cat-1", name: "Technology", slug: "technology", count: 6 },
  { id: "cat-2", name: "Business", slug: "business", count: 4 },
  { id: "cat-3", name: "Self-Help", slug: "self-help", count: 3 },
  { id: "cat-4", name: "Fiction", slug: "fiction", count: 3 }
];

// Helper to check and seed firestore collections if they are empty
let seedingPromise = null;
const ensureSeeded = async () => {
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
      const booksRef = collection(db, "books");
      const booksSnap = await getDocs(query(booksRef, limit(1)));
      
      if (booksSnap.empty) {
        console.log("Firestore empty. Seeding initial data...");

        // 1. Seed Categories
        for (const cat of SEED_CATEGORIES) {
          await setDoc(doc(db, "categories", cat.id), cat);
        }

        // 2. Seed Authors
        for (const author of SEED_AUTHORS) {
          await setDoc(doc(db, "authors", author.uid), author);
          // Sync basic user document in users collection
          await setDoc(doc(db, "users", author.uid), {
            uid: author.uid,
            name: author.displayName,
            displayName: author.displayName,
            email: `${author.displayName.toLowerCase().replace(/\s+/g, "")}@ebookvala.com`,
            photoURL: author.photoURL,
            role: "author",
            purchasedBooks: [],
            wishlist: [],
            createdAt: author.createdAt,
            updatedAt: author.createdAt
          });
        }

        // 3. Seed Books
        for (const book of SEED_BOOKS) {
          await setDoc(doc(db, "books", book.id), book);
        }

        console.log("Firestore seeding completed successfully!");
      }
    } catch (err) {
      console.warn("Firestore automatic seeding failed (probably offline/permissions):", err);
    }
  })();

  return seedingPromise;
};

export const dbService = {
  // BOOKS
  getBooks: async () => {
    await ensureSeeded();
    try {
      const colRef = collection(db, "books");
      try {
        // Primary: orderBy query (requires Firestore index on createdAt)
        const snap = await getDocs(query(colRef, orderBy("createdAt", "desc")));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (indexErr) {
        // Fallback: fetch all docs and sort in-memory (if index missing)
        console.warn("getBooks orderBy index missing, falling back to in-memory sort:", indexErr.code);
        const snap = await getDocs(colRef);
        const books = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return books.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }
    } catch (error) {
      console.error("Firestore getBooks error:", error);
      return [];
    }
  },
  
  getBookById: async (id) => {
    await ensureSeeded();
    try {
      const docSnap = await getDoc(doc(db, "books", id));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error("Firestore getBookById error:", error);
      return null;
    }
  },
  
  getBookBySlug: async (slug) => {
    await ensureSeeded();
    try {
      // 1. First try: treat the param as a Firestore doc ID (most reliable, used by Author Dashboard)
      const docSnap = await getDoc(doc(db, "books", slug));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      // 2. Second try: query by slug field (for human-readable slug URLs)
      const q = query(collection(db, "books"), where("slug", "==", slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
      return null;
    } catch (error) {
      console.error("Firestore getBookBySlug error:", error);
      return null;
    }
  },
  
  createBook: async (bookData) => {
    const newBookRef = doc(collection(db, "books"));
    const id = newBookRef.id;
    const generatedSlug = bookData.title
      ? bookData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : id;
    const newBook = {
      rating: 0,
      reviewCount: 0,
      downloadCount: 0,
      viewCount: 1,
      salesCount: 0,
      isFeatured: false,
      isNew: true,
      isTrending: false,
      // Always initialize array fields to prevent filter crashes
      categories: [],
      tags: [],
      format: ["PDF"],
      subtitle: "",
      description: "",
      isbn: "",
      language: "English",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: bookData.status === "published" ? new Date().toISOString() : null,
      ...bookData,
      id: id,
      slug: bookData.slug || generatedSlug
    };
    await setDoc(newBookRef, newBook);
    return newBook;
  },
  
  updateBook: async (id, updateData) => {
    const docRef = doc(db, "books", id);
    const cleanUpdates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, cleanUpdates, { merge: true });
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() };
  },
  
  deleteBook: async (id) => {
    await deleteDoc(doc(db, "books", id));
    return true;
  },

  // AUTHORS
  getAuthors: async () => {
    await ensureSeeded();
    try {
      const snap = await getDocs(collection(db, "authors"));
      return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Firestore getAuthors error:", error);
      return [];
    }
  },
  
  getAuthorById: async (id) => {
    await ensureSeeded();
    try {
      const docSnap = await getDoc(doc(db, "authors", id));
      return docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error("Firestore getAuthorById error:", error);
      return null;
    }
  },
  
  updateAuthor: async (id, updateData) => {
    const docRef = doc(db, "authors", id);
    await setDoc(docRef, updateData, { merge: true });
    const snap = await getDoc(docRef);
    return { uid: snap.id, ...snap.data() };
  },
  
  registerAuthor: async (authorId, authorData) => {
    const docRef = doc(db, "authors", authorId);
    const snap = await getDoc(docRef);
    if (snap.exists()) return { uid: snap.id, ...snap.data() };
    
    const newAuthor = {
      uid: authorId,
      bio: "",
      socialLinks: {},
      isVerified: false,
      verificationStatus: "pending",
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      followers: [],
      totalSales: 0,
      createdAt: new Date().toISOString(),
      ...authorData
    };
    await setDoc(docRef, newAuthor);
    return newAuthor;
  },

  // REVIEWS
  getReviewsByBookId: async (bookId) => {
    try {
      const q = query(collection(db, "reviews"), where("bookId", "==", bookId));
      const snap = await getDocs(q);
      return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Firestore getReviewsByBookId error:", error);
      return [];
    }
  },

  getReviewsByUserId: async (userId) => {
    try {
      const q = query(collection(db, "reviews"), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Firestore getReviewsByUserId error:", error);
      return [];
    }
  },
  
  addReview: async (reviewData) => {
    const newReviewRef = doc(collection(db, "reviews"));
    const newReview = {
      id: newReviewRef.id,
      createdAt: new Date().toISOString(),
      authorReply: "",
      ...reviewData
    };
    await setDoc(newReviewRef, newReview);
    
    // Update book rating & review count asynchronously
    try {
      const reviewsSnap = await getDocs(query(collection(db, "reviews"), where("bookId", "==", reviewData.bookId)));
      const bookReviews = reviewsSnap.docs.map(d => d.data());
      const avgRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
      
      await updateDoc(doc(db, "books", reviewData.bookId), {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: bookReviews.length
      });
    } catch (err) {
      console.error("Failed to update rating statistics on book:", err);
    }
    
    return newReview;
  },
  
  replyToReview: async (reviewId, replyText) => {
    const docRef = doc(db, "reviews", reviewId);
    await updateDoc(docRef, { authorReply: replyText });
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() };
  },

  // ORDERS / PURCHASES
  getOrders: async () => {
    try {
      const snap = await getDocs(collection(db, "orders"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Firestore getOrders error:", error);
      return [];
    }
  },
  
  getOrdersByReaderId: async (readerId) => {
    try {
      const q = query(collection(db, "orders"), where("readerId", "==", readerId));
      const snap = await getDocs(q);
      return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Firestore getOrdersByReaderId error:", error);
      return [];
    }
  },
  
  getOrdersByAuthorId: async (authorId) => {
    try {
      const q = query(collection(db, "orders"), where("authorId", "==", authorId));
      const snap = await getDocs(q);
      return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Firestore getOrdersByAuthorId error:", error);
      return [];
    }
  },
  
  createOrder: async (orderData) => {
    const newOrderRef = doc(collection(db, "orders"));
    const newOrder = {
      id: newOrderRef.id,
      createdAt: new Date().toISOString(),
      status: "completed",
      invoiceURL: `/invoice-${Date.now().toString().slice(-4)}.pdf`,
      ...orderData
    };
    await setDoc(newOrderRef, newOrder);
    
    // Update Reader's Purchased Books in Firestore
    try {
      const userDocRef = doc(db, "users", orderData.readerId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const purchased = userData.purchasedBooks || [];
        if (!purchased.includes(orderData.bookId)) {
          purchased.push(orderData.bookId);
          const progress = userData.readingProgress || {};
          progress[orderData.bookId] = { currentPage: 1, totalPages: 100, lastRead: new Date().toISOString() };
          await updateDoc(userDocRef, {
            purchasedBooks: purchased,
            readingProgress: progress
          });
        }
      }
    } catch (err) {
      console.warn("Could not record purchase in reader profile:", err);
    }
    
    // Update Book Sales & Author balance in Firestore
    try {
      const bookDocRef = doc(db, "books", orderData.bookId);
      const bookSnap = await getDoc(bookDocRef);
      if (bookSnap.exists()) {
        const bookData = bookSnap.data();
        await updateDoc(bookDocRef, {
          salesCount: (bookData.salesCount || 0) + 1,
          downloadCount: (bookData.downloadCount || 0) + 1
        });
        
        // Author Cut (80%)
        const authorId = bookData.authorId;
        const authorCut = orderData.amount * 0.8;
        const authorDocRef = doc(db, "authors", authorId);
        const authorSnap = await getDoc(authorDocRef);
        if (authorSnap.exists()) {
          const authorData = authorSnap.data();
          await updateDoc(authorDocRef, {
            totalEarnings: (authorData.totalEarnings || 0) + authorCut,
            availableBalance: (authorData.availableBalance || 0) + authorCut,
            totalSales: (authorData.totalSales || 0) + 1
          });
        }
      }
    } catch (err) {
      console.warn("Could not update sales stats or author cut:", err);
    }
    
    return newOrder;
  },

  // WITHDRAWALS
  getWithdrawals: async () => {
    try {
      const snap = await getDocs(collection(db, "withdrawals"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Firestore getWithdrawals error:", error);
      return [];
    }
  },
  
  getWithdrawalsByAuthorId: async (authorId) => {
    try {
      const q = query(collection(db, "withdrawals"), where("authorId", "==", authorId));
      const snap = await getDocs(q);
      return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Firestore getWithdrawalsByAuthorId error:", error);
      return [];
    }
  },
  
  requestWithdrawal: async (withdrawalData) => {
    const docRef = doc(collection(db, "withdrawals"));
    const newWithdrawal = {
      id: docRef.id,
      createdAt: new Date().toISOString(),
      processedAt: null,
      status: "pending",
      ...withdrawalData
    };
    await setDoc(docRef, newWithdrawal);
    
    // Deduct available balance, add to pending
    try {
      const authorDocRef = doc(db, "authors", withdrawalData.authorId);
      const authorSnap = await getDoc(authorDocRef);
      if (authorSnap.exists()) {
        const authorData = authorSnap.data();
        await updateDoc(authorDocRef, {
          availableBalance: (authorData.availableBalance || 0) - withdrawalData.amount,
          pendingBalance: (authorData.pendingBalance || 0) + withdrawalData.amount
        });
      }
    } catch (err) {
      console.error("Error updating author withdrawal balances:", err);
    }
    
    return newWithdrawal;
  },
  
  approveWithdrawal: async (id) => {
    const docRef = doc(db, "withdrawals", id);
    await updateDoc(docRef, {
      status: "completed",
      processedAt: new Date().toISOString()
    });
    const snap = await getDoc(docRef);
    const data = snap.data();
    
    try {
      const authorDocRef = doc(db, "authors", data.authorId);
      const authorSnap = await getDoc(authorDocRef);
      if (authorSnap.exists()) {
        const authorData = authorSnap.data();
        await updateDoc(authorDocRef, {
          pendingBalance: Math.max(0, (authorData.pendingBalance || 0) - data.amount)
        });
      }
    } catch (err) {
      console.error("Error updating author pending balance:", err);
    }
    
    return { id: docRef.id, ...data };
  },
  
  rejectWithdrawal: async (id) => {
    const docRef = doc(db, "withdrawals", id);
    await updateDoc(docRef, {
      status: "rejected",
      processedAt: new Date().toISOString()
    });
    const snap = await getDoc(docRef);
    const data = snap.data();
    
    try {
      const authorDocRef = doc(db, "authors", data.authorId);
      const authorSnap = await getDoc(authorDocRef);
      if (authorSnap.exists()) {
        const authorData = authorSnap.data();
        await updateDoc(authorDocRef, {
          pendingBalance: Math.max(0, (authorData.pendingBalance || 0) - data.amount),
          availableBalance: (authorData.availableBalance || 0) + data.amount
        });
      }
    } catch (err) {
      console.error("Error refunding author available balance:", err);
    }
    
    return { id: docRef.id, ...data };
  },

  // USERS / PROFILE DATA
  getUserProfile: async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
    } catch (error) {
      console.error("Firestore getUserProfile error:", error);
      return null;
    }
  },
  
  getUsers: async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Firestore getUsers error:", error);
      return [];
    }
  },
  
  updateUserProfile: async (uid, updateData) => {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, updateData, { merge: true });
    const snap = await getDoc(docRef);
    return { uid: snap.id, ...snap.data() };
  },

  // CATEGORIES
  getCategories: async () => {
    await ensureSeeded();
    try {
      const snap = await getDocs(collection(db, "categories"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Firestore getCategories error:", error);
      return SEED_CATEGORIES;
    }
  },

  createCategory: async (categoryName) => {
    const docRef = doc(collection(db, "categories"));
    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCat = {
      id: docRef.id,
      name: categoryName,
      slug: slug,
      count: 0
    };
    await setDoc(docRef, newCat);
    return newCat;
  },

  deleteCategory: async (id) => {
    await deleteDoc(doc(db, "categories", id));
    return true;
  }
};
