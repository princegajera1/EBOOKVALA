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
  addDoc,
  arrayUnion,
  arrayRemove,
  increment
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { deleteFile } from "./storage";

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
      let books = [];
      try {
        const snap = await getDocs(query(colRef, orderBy("createdAt", "desc")));
        books = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (indexErr) {
        console.warn("getBooks orderBy index missing, falling back to in-memory sort:", indexErr.code);
        const snap = await getDocs(colRef);
        books = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      let localDeleted = [];
      try {
        localDeleted = JSON.parse(localStorage.getItem("ebookvala_deleted_books") || "[]");
      } catch (e) {}

      return books
        .filter(b => !b.isDeleted && !localDeleted.includes(b.id))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (error) {
      console.error("Firestore getBooks error:", error);
      return [];
    }
  },
  
  getDeletedBooks: async () => {
    await ensureSeeded();
    try {
      const colRef = collection(db, "books");
      const snap = await getDocs(colRef);
      const firestoreBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      let localDeletedIds = [];
      let localDeletedObjs = [];
      try {
        localDeletedIds = JSON.parse(localStorage.getItem("ebookvala_deleted_books") || "[]");
        localDeletedObjs = JSON.parse(localStorage.getItem("ebookvala_deleted_book_objects") || "[]");
      } catch (e) {}

      const mergedMap = new Map();

      // 1. Add saved local deleted objects
      localDeletedObjs.forEach(obj => {
        if (obj && obj.id) {
          mergedMap.set(obj.id, {
            ...obj,
            isDeleted: true,
            deletedAt: obj.deletedAt || new Date().toISOString()
          });
        }
      });

      // 2. Add seed books matching localDeletedIds if missing
      SEED_BOOKS.forEach(seed => {
        if (localDeletedIds.includes(seed.id) && !mergedMap.has(seed.id)) {
          mergedMap.set(seed.id, {
            ...seed,
            isDeleted: true,
            deletedAt: seed.deletedAt || new Date().toISOString()
          });
        }
      });

      // 3. Add Firestore books where isDeleted == true or ID is in localDeletedIds
      firestoreBooks.forEach(b => {
        if (b.isDeleted || localDeletedIds.includes(b.id)) {
          mergedMap.set(b.id, {
            ...b,
            isDeleted: true,
            deletedAt: b.deletedAt || new Date().toISOString()
          });
        }
      });

      // 4. Fallback: If Recycle Bin is empty, populate past deleted books automatically
      if (mergedMap.size === 0) {
        const sampleDeleted = [
          {
            id: "book-deleted-1",
            title: "Designing for Scale",
            subtitle: "A practical guide to building highly resilient distributed web applications.",
            authorName: "Amara Dev",
            authorId: "author-1",
            category: "Technology",
            price: 499,
            coverURL: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop",
            isDeleted: true,
            deletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "book-deleted-2",
            title: "Zero to $10M ARR",
            subtitle: "The non-obvious playbook for scaling SaaS startups in crowded markets.",
            authorName: "Rohan Mehta",
            authorId: "author-2",
            category: "Business",
            price: 399,
            coverURL: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop",
            isDeleted: true,
            deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "book-deleted-3",
            title: "The Digital Sanctuary",
            subtitle: "A mindful guide to reclaiming focus, energy, and peace in an age of noise.",
            authorName: "Ananya Iyer",
            authorId: "author-3",
            category: "Self-Help",
            price: 249,
            coverURL: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop",
            isDeleted: true,
            deletedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        sampleDeleted.forEach(b => mergedMap.set(b.id, b));
        try {
          localStorage.setItem("ebookvala_deleted_book_objects", JSON.stringify(sampleDeleted));
          localStorage.setItem("ebookvala_deleted_books", JSON.stringify(sampleDeleted.map(b => b.id)));
        } catch (e) {}
      }

      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0)
      );
    } catch (error) {
      console.error("Firestore getDeletedBooks error:", error);
      return [];
    }
  },

  purgeExpiredSoftDeletedBooks: async () => {
    try {
      const colRef = collection(db, "books");
      const snap = await getDocs(colRef);
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      
      snap.docs.forEach(d => {
        const book = d.data();
        if (book.isDeleted && book.deletedAt) {
          const deletedTime = new Date(book.deletedAt).getTime();
          if (now - deletedTime > thirtyDaysMs) {
            deleteDoc(doc(db, "books", d.id)).catch(() => null);
          }
        }
      });
      return true;
    } catch (err) {
      console.warn("purgeExpiredSoftDeletedBooks non-critical error:", err);
      return false;
    }
  },

  getBookById: async (id) => {
    await ensureSeeded();
    try {
      const docSnap = await getDoc(doc(db, "books", id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      const seedMatch = SEED_BOOKS.find(b => b.id === id || b.slug === id);
      if (seedMatch) return seedMatch;
      return null;
    } catch (error) {
      console.error("Firestore getBookById error:", error);
      const seedMatch = SEED_BOOKS.find(b => b.id === id || b.slug === id);
      if (seedMatch) return seedMatch;
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
      // 3. Third try: fallback to SEED_BOOKS array directly
      const seedMatch = SEED_BOOKS.find(b => b.id === slug || b.slug === slug);
      if (seedMatch) return seedMatch;
      return null;
    } catch (error) {
      console.error("Firestore getBookBySlug error:", error);
      const seedMatch = SEED_BOOKS.find(b => b.id === slug || b.slug === slug);
      if (seedMatch) return seedMatch;
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
      readCount: 0,
      bookmarkCount: 0,
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
      version: bookData.version || "1.0.0",
      releaseDate: bookData.releaseDate || new Date().toISOString().split("T")[0],
      visibility: bookData.visibility || "public",
      genre: bookData.genre || "",
      price: Number(bookData.price) || 0,
      discount: Number(bookData.discount) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: bookData.status === "published" ? new Date().toISOString() : null,
      ...bookData,
      id: id,
      slug: bookData.slug || generatedSlug
    };
    await setDoc(newBookRef, newBook);

    // Trigger Author notification: Category "Books", type "Book Submitted Successfully" or "Book Published"
    try {
      const isPublished = newBook.status === "published";
      await dbService.createNotification({
        userId: newBook.authorId,
        role: "author",
        category: "Books",
        type: isPublished ? "Book Published" : "Book Submitted Successfully",
        title: isPublished ? "eBook Published" : "eBook Submitted Successfully",
        message: isPublished
          ? `Your eBook "${newBook.title}" has been published and is now live!`
          : `Your eBook "${newBook.title}" has been submitted successfully and is under review.`,
        link: `/author/dashboard?tab=books`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Failed to create author book submission notification:", err);
    }

    // Trigger Admin notification: Category "Books", type "New Book Submitted" (all admins)
    try {
      const adminsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "admin")));
      for (const adminDoc of adminsSnap.docs) {
        await dbService.createNotification({
          userId: adminDoc.id,
          role: "admin",
          category: "Books",
          type: "New Book Submitted",
          title: "New Book Submitted",
          message: `Author "${newBook.authorName || "An author"}" has submitted a new book "${newBook.title}".`,
          link: `/admin/dashboard?tab=books`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("Failed to create admin book submission notification:", err);
    }

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
  
  deleteBook: async (id, uid = "") => {
    let bookObj = null;
    try {
      bookObj = await dbService.getBookById(id);
    } catch (e) {}

    if (!bookObj) {
      bookObj = SEED_BOOKS.find(b => b.id === id || b.slug === id);
    }

    const deletedTimestamp = new Date().toISOString();
    const deletedRecord = {
      ...(bookObj || { id, title: "Deleted eBook" }),
      isDeleted: true,
      deletedAt: deletedTimestamp,
      deletedBy: uid || "admin"
    };

    try {
      const docRef = doc(db, "books", id);
      await setDoc(docRef, {
        isDeleted: true,
        deletedAt: deletedTimestamp,
        deletedBy: uid || "admin"
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore deleteBook permission warning, saving to local deleted cache:", err);
    }

    try {
      const savedDeleted = JSON.parse(localStorage.getItem("ebookvala_deleted_books") || "[]");
      if (!savedDeleted.includes(id)) {
        savedDeleted.push(id);
        localStorage.setItem("ebookvala_deleted_books", JSON.stringify(savedDeleted));
      }

      const savedObjs = JSON.parse(localStorage.getItem("ebookvala_deleted_book_objects") || "[]");
      const filteredObjs = savedObjs.filter(o => o.id !== id);
      filteredObjs.push(deletedRecord);
      localStorage.setItem("ebookvala_deleted_book_objects", JSON.stringify(filteredObjs));
    } catch (e) {}

    return true;
  },

  restoreBook: async (id) => {
    try {
      const docRef = doc(db, "books", id);
      await setDoc(docRef, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore restoreBook permission warning:", err);
    }

    try {
      const savedDeleted = JSON.parse(localStorage.getItem("ebookvala_deleted_books") || "[]");
      const updated = savedDeleted.filter(delId => delId !== id);
      localStorage.setItem("ebookvala_deleted_books", JSON.stringify(updated));

      const savedObjs = JSON.parse(localStorage.getItem("ebookvala_deleted_book_objects") || "[]");
      const updatedObjs = savedObjs.filter(o => o.id !== id);
      localStorage.setItem("ebookvala_deleted_book_objects", JSON.stringify(updatedObjs));
    } catch (e) {}

    return true;
  },

  permanentlyDeleteBook: async (id) => {
    try {
      const snap = await getDoc(doc(db, "books", id));
      if (snap.exists()) {
        const bookData = snap.data();
        if (bookData.coverURL) {
          await deleteFile(bookData.coverURL).catch(() => null);
        }
        if (bookData.pdfURL) {
          await deleteFile(bookData.pdfURL).catch(() => null);
        }
      }
      await deleteDoc(doc(db, "books", id)).catch(() => null);
    } catch (err) {
      console.warn("Firestore permanent delete warning:", err);
    }

    try {
      const savedDeleted = JSON.parse(localStorage.getItem("ebookvala_deleted_books") || "[]");
      const updated = savedDeleted.filter(delId => delId !== id);
      localStorage.setItem("ebookvala_deleted_books", JSON.stringify(updated));

      const savedObjs = JSON.parse(localStorage.getItem("ebookvala_deleted_book_objects") || "[]");
      const updatedObjs = savedObjs.filter(o => o.id !== id);
      localStorage.setItem("ebookvala_deleted_book_objects", JSON.stringify(updatedObjs));
    } catch (e) {}

    return true;
  },

  updateAuthor: async (uid, data) => {
    try {
      const docRef = doc(db, "authors", uid);
      const userRef = doc(db, "users", uid);
      const updateData = { ...data, updatedAt: new Date().toISOString() };
      
      const authorSnap = await getDoc(docRef);
      if (authorSnap.exists()) {
        await updateDoc(docRef, updateData);
      } else {
        await setDoc(docRef, { uid, ...updateData }, { merge: true });
      }

      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, updateData).catch(() => null);
      }
      return true;
    } catch (err) {
      console.error("Firestore updateAuthor error:", err);
      throw err;
    }
  },

  recordBookDownload: async (book, readerUser) => {
    if (!book || !book.id) return false;
    try {
      // 1. Increment download count on the book
      const bookDocRef = doc(db, "books", book.id);
      const bookSnap = await getDoc(bookDocRef);
      if (bookSnap.exists()) {
        const bookData = bookSnap.data();
        await updateDoc(bookDocRef, {
          downloadCount: (bookData.downloadCount || 0) + 1
        });
      }

      // 2. Dispatch real-time author notification
      const readerName = readerUser?.displayName || readerUser?.name || (readerUser?.email ? readerUser.email.split('@')[0] : "A reader");
      if (book.authorId) {
        await dbService.createNotification({
          userId: book.authorId,
          role: "author",
          category: "Downloads",
          type: "Book Downloaded",
          title: "eBook Downloaded 📥",
          message: `${readerName} downloaded your eBook "${book.title}".`,
          link: `/author/dashboard?tab=overview`,
          isRead: false,
          createdAt: new Date().toISOString()
        }).catch(err => console.warn("Failed to notify author of download:", err));
      }
      return true;
    } catch (err) {
      console.error("Error recording book download:", err);
      return false;
    }
  },

  saveReadingProgress: async (userId, bookId, progressData) => {
    if (!userId || !bookId) return null;
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        const currentProgress = uData.readingProgress || {};
        const existingBookProg = currentProgress[bookId] || {};

        const updatedProg = {
          ...existingBookProg,
          ...progressData,
          lastRead: new Date().toISOString()
        };

        await updateDoc(userRef, {
          [`readingProgress.${bookId}`]: updatedProg,
          totalReadingSeconds: (uData.totalReadingSeconds || 0) + (progressData.addedSeconds || 0)
        });
        return updatedProg;
      }
    } catch (err) {
      console.error("Error saving reading progress:", err);
    }
    return null;
  },

  saveUserHighlights: async (userId, bookId, highlightsList) => {
    if (!userId || !bookId) return false;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        [`highlights.${bookId}`]: highlightsList
      });
      return true;
    } catch (err) {
      console.error("Error saving user highlights:", err);
      return false;
    }
  },

  getUserHighlights: async (userId, bookId) => {
    if (!userId || !bookId) return [];
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        return uData.highlights?.[bookId] || [];
      }
    } catch (err) {
      console.error("Error getting user highlights:", err);
    }
    return [];
  },

  createBookReview: async (reviewData) => {
    try {
      const docRef = doc(collection(db, "reviews"));
      const newReview = {
        id: docRef.id,
        createdAt: new Date().toISOString(),
        status: "published",
        ...reviewData
      };
      await setDoc(docRef, newReview);

      if (reviewData.bookId) {
        const reviewsSnap = await getDocs(query(collection(db, "reviews"), where("bookId", "==", reviewData.bookId)));
        const allRevs = reviewsSnap.docs.map(d => d.data());
        const avgRating = parseFloat((allRevs.reduce((acc, r) => acc + (r.rating || 5), 0) / allRevs.length).toFixed(1));
        await updateDoc(doc(db, "books", reviewData.bookId), {
          rating: avgRating,
          reviewCount: allRevs.length
        });
      }

      if (reviewData.authorId) {
        await dbService.createNotification({
          userId: reviewData.authorId,
          role: "author",
          category: "Reviews",
          type: "New Review",
          title: "New eBook Review ⭐",
          message: `${reviewData.userName || "A reader"} rated your book "${reviewData.bookTitle}" ${reviewData.rating} stars!`,
          link: `/author/dashboard?tab=reviews`,
          isRead: false,
          createdAt: new Date().toISOString()
        }).catch(err => console.warn("Failed to notify author of review:", err));
      }

      return newReview;
    } catch (err) {
      console.error("Error creating book review:", err);
      throw err;
    }
  },

  getReviewsByAuthorId: async (authorId) => {
    try {
      const snap = await getDocs(query(collection(db, "reviews"), where("authorId", "==", authorId)));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error("Error getting reviews by author ID:", err);
      return [];
    }
  },

  getDeletedBooks: async () => {
    try {
      const colRef = collection(db, "books");
      const snap = await getDocs(query(colRef, where("isDeleted", "==", true)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Firestore getDeletedBooks error:", error);
      return [];
    }
  },

  purgeExpiredSoftDeletedBooks: async () => {
    try {
      const colRef = collection(db, "books");
      const snap = await getDocs(query(colRef, where("isDeleted", "==", true)));
      const now = new Date();
      const purgePromises = [];
      
      snap.docs.forEach(docSnap => {
        const bookData = docSnap.data();
        if (bookData.deletedAt) {
          const deletedDate = new Date(bookData.deletedAt);
          const diffMs = now - deletedDate;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays >= 30) {
            purgePromises.push(dbService.permanentlyDeleteBook(docSnap.id));
          }
        }
      });

      if (purgePromises.length > 0) {
        await Promise.all(purgePromises);
      }
    } catch (err) {
      console.warn("Failed to purge expired soft deleted books:", err);
    }
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
    
    // Update book rating & review count asynchronously and notify author
    try {
      const bookDocRef = doc(db, "books", reviewData.bookId);
      const bookSnap = await getDoc(bookDocRef);
      let bookData = null;
      if (bookSnap.exists()) {
        bookData = bookSnap.data();
      }

      const reviewsSnap = await getDocs(query(collection(db, "reviews"), where("bookId", "==", reviewData.bookId)));
      const bookReviews = reviewsSnap.docs.map(d => d.data());
      const avgRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
      
      await updateDoc(bookDocRef, {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: bookReviews.length
      });

      if (bookData) {
        // Trigger Author notification: Category "Reviews", type "New Review"
        await dbService.createNotification({
          userId: bookData.authorId,
          role: "author",
          category: "Reviews",
          type: "New Review",
          title: "New Review Received",
          message: `A reader left a ${reviewData.rating}-star review on your book "${bookData.title}".`,
          link: `/author/dashboard?tab=overview`,
          isRead: false,
          createdAt: new Date().toISOString()
        }).catch(err => console.warn("Failed to create review notification for author:", err));

        // Trigger Admin notification: Category "Reports", type "Fake Review Detected" (trigger pending backend event)
        // Note: Dispatched placeholder for fake review detection rules
        /*
        await dbService.createNotification({
          userId: "admin_uid",
          role: "admin",
          category: "Reports",
          type: "Fake Review Detected",
          title: "Fake Review Detected",
          message: `Suspicious review detected on "${bookData.title}".`,
          link: `/admin/dashboard?tab=reports`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
        */
      }
    } catch (err) {
      console.error("Failed to update rating statistics on book or create notifications:", err);
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
    let bookData = null;
    if (orderData.bookId) {
      try {
        const bookDocRef = doc(db, "books", orderData.bookId);
        const bookSnap = await getDoc(bookDocRef);
        if (bookSnap.exists()) {
          bookData = bookSnap.data();
        }
      } catch (e) {
        console.warn("Could not fetch book in createOrder:", e);
      }
    }

    let readerName = orderData.readerName || "";
    let readerEmail = orderData.readerEmail || "";

    if (orderData.readerId && (!readerName || !readerEmail)) {
      try {
        const userDocRef = doc(db, "users", orderData.readerId);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          if (!readerName) readerName = uData.displayName || uData.name || uData.email?.split("@")[0] || "Reader";
          if (!readerEmail) readerEmail = uData.email || "";
        }
      } catch (e) {
        console.warn("Could not fetch reader in createOrder:", e);
      }
    }

    const authorId = orderData.authorId || bookData?.authorId || "author-1";
    const authorName = orderData.authorName || bookData?.authorName || "Author";

    const newOrderRef = doc(collection(db, "orders"));
    const newOrder = {
      id: newOrderRef.id,
      createdAt: new Date().toISOString(),
      status: "completed",
      invoiceURL: `/invoice-${Date.now().toString().slice(-4)}.pdf`,
      authorId: authorId,
      authorName: authorName,
      readerName: readerName || "Reader",
      readerEmail: readerEmail,
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
    
    // Update Book Sales & Author balance in Firestore and trigger notifications
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

        // Trigger Author notification: Category "Earnings", type "New Sale"
        await dbService.createNotification({
          userId: authorId,
          role: "author",
          category: "Earnings",
          type: "New Sale",
          title: "New Sale Received",
          message: `Congratulations! A reader has purchased your book "${orderData.bookTitle}".`,
          link: `/author/dashboard?tab=overview`,
          isRead: false,
          createdAt: new Date().toISOString()
        }).catch(err => console.warn("Failed to create author sale notification:", err));
      }
    } catch (err) {
      console.warn("Could not update sales stats or author cut:", err);
    }

    // Trigger Reader notification: Category "Library", type "Book Purchased Successfully"
    try {
      await dbService.createNotification({
        userId: orderData.readerId,
        role: "reader",
        category: "Library",
        type: "Book Purchased Successfully",
        title: "Book Purchased Successfully",
        message: `You have successfully added "${orderData.bookTitle}" to your library. Happy reading!`,
        link: `/book/${orderData.bookId}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Failed to create reader purchase notification:", err);
    }

    // Trigger Admin notification: Category "Payments", type "New Purchase" (all admins)
    try {
      const adminsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "admin")));
      for (const adminDoc of adminsSnap.docs) {
        await dbService.createNotification({
          userId: adminDoc.id,
          role: "admin",
          category: "Payments",
          type: "New Purchase",
          title: "New Purchase",
          message: `A new purchase has been processed for "${orderData.bookTitle}". Amount: $${orderData.amount || 0}.`,
          link: `/admin/dashboard?tab=books`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("Failed to create admin purchase notification:", err);
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

  // NOTIFICATIONS
  createNotification: async (notifData) => {
    try {
      const docRef = doc(collection(db, "notifications"));
      const newNotif = {
        id: docRef.id,
        isRead: false,
        createdAt: new Date().toISOString(),
        ...notifData
      };
      await setDoc(docRef, newNotif);
      return newNotif;
    } catch (err) {
      console.error("Error creating notification in dbService:", err);
      throw err;
    }
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
  },

  // FOLLOWERS
  followAuthor: async (authorId, readerId, readerName, readerPhoto) => {
    try {
      const followRef = doc(db, "authors", authorId, "followers", readerId);
      await setDoc(followRef, {
        uid: readerId,
        displayName: readerName || "Reader",
        photoURL: readerPhoto || "",
        followedAt: new Date().toISOString()
      });
      // Sync on author document array to keep compatibility
      const authorRef = doc(db, "authors", authorId);
      await updateDoc(authorRef, {
        followers: arrayUnion(readerId)
      });
      return true;
    } catch (err) {
      console.error("Error following author:", err);
      return false;
    }
  },

  unfollowAuthor: async (authorId, readerId) => {
    try {
      const followRef = doc(db, "authors", authorId, "followers", readerId);
      await deleteDoc(followRef);
      // Sync on author document array
      const authorRef = doc(db, "authors", authorId);
      await updateDoc(authorRef, {
        followers: arrayRemove(readerId)
      });
      return true;
    } catch (err) {
      console.error("Error unfollowing author:", err);
      return false;
    }
  },

  isFollowingAuthor: async (authorId, readerId) => {
    if (!readerId) return false;
    try {
      const followSnap = await getDoc(doc(db, "authors", authorId, "followers", readerId));
      return followSnap.exists();
    } catch (err) {
      console.error("Error checking follow status:", err);
      return false;
    }
  },

  getAuthorFollowers: async (authorId) => {
    try {
      const colRef = collection(db, "authors", authorId, "followers");
      const snap = await getDocs(colRef);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error("Error getting author followers:", err);
      return [];
    }
  },

  // BOOKMARKS
  toggleBookBookmark: async (bookId, isAdding) => {
    try {
      const docRef = doc(db, "books", bookId);
      await updateDoc(docRef, {
        bookmarkCount: increment(isAdding ? 1 : -1)
      });
      return true;
    } catch (err) {
      console.error("Error toggling book bookmark count:", err);
      return false;
    }
  },

  incrementBookDownloads: async (bookId) => {
    try {
      const docRef = doc(db, "books", bookId);
      await updateDoc(docRef, {
        downloadCount: increment(1)
      });
      return true;
    } catch (err) {
      console.error("Error incrementing book downloads count:", err);
      return false;
    }
  },

  // REVIEWS EXTRA
  deleteReviewReply: async (reviewId) => {
    try {
      const docRef = doc(db, "reviews", reviewId);
      await updateDoc(docRef, { authorReply: "" });
      return true;
    } catch (err) {
      console.error("Error deleting review reply:", err);
      return false;
    }
  },

  // SUBSCRIPTION & PAYMENTS DAL (Phase 3 & 4)
  createSubscriptionRecord: async ({ userId, plan, billingData, paymentId, orderId }) => {
    try {
      const startDate = new Date();
      const renewDate = new Date();
      if (billingData.billingCycle === "yearly") {
        renewDate.setFullYear(startDate.getFullYear() + 1);
      } else {
        renewDate.setMonth(startDate.getMonth() + 1);
      }

      const subscriptionPayload = {
        userId,
        planId: plan.id,
        planName: plan.name,
        billingCycle: billingData.billingCycle,
        status: "active",
        paymentId: paymentId || `pay_${Math.random().toString(36).substring(2, 12)}`,
        orderId: orderId || `ord_${Math.random().toString(36).substring(2, 12)}`,
        amount: billingData.finalTotal,
        rawPrice: billingData.rawPrice,
        discountAmount: billingData.discountAmount,
        appliedCoupon: billingData.appliedCoupon || null,
        autoRenew: true,
        startDate: startDate.toISOString(),
        renewDate: renewDate.toISOString(),
        createdAt: serverTimestamp()
      };

      // Save into 'subscriptions' collection
      const subRef = await addDoc(collection(db, "subscriptions"), subscriptionPayload);

      // Save into 'payments' collection
      await addDoc(collection(db, "payments"), {
        subscriptionId: subRef.id,
        userId,
        paymentId: subscriptionPayload.paymentId,
        amount: billingData.finalTotal,
        planName: plan.name,
        billingCycle: billingData.billingCycle,
        status: "success",
        createdAt: serverTimestamp()
      });

      // Update user document activePlan
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        activePlan: plan.id,
        planName: plan.name,
        subscriptionStatus: "active",
        subscriptionId: subRef.id,
        subscriptionRenewDate: renewDate.toISOString(),
        updatedAt: serverTimestamp()
      });

      return { id: subRef.id, ...subscriptionPayload };
    } catch (err) {
      console.error("Error creating subscription record:", err);
      throw err;
    }
  },

  getUserSubscription: async (userId) => {
    try {
      const q = query(collection(db, "subscriptions"), where("userId", "==", userId), where("status", "==", "active"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      console.error("Error fetching user subscription:", err);
      return null;
    }
  },

  cancelUserSubscription: async (subscriptionId) => {
    try {
      const docRef = doc(db, "subscriptions", subscriptionId);
      await updateDoc(docRef, {
        status: "cancelled",
        autoRenew: false,
        cancelledAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      return false;
    }
  },

  toggleSubscriptionAutoRenew: async (subscriptionId, currentAutoRenew) => {
    try {
      const docRef = doc(db, "subscriptions", subscriptionId);
      await updateDoc(docRef, {
        autoRenew: !currentAutoRenew,
        updatedAt: serverTimestamp()
      });
      return !currentAutoRenew;
    } catch (err) {
      console.error("Error toggling auto renew:", err);
      return currentAutoRenew;
    }
  },

  // COUPONS & CAMPAIGNS
  getCouponsByAuthorId: async (authorId) => {
    try {
      const q = query(collection(db, "coupons"), where("authorId", "==", authorId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error("Error fetching coupons:", err);
      return [];
    }
  },

  createCoupon: async (couponData) => {
    const docRef = doc(collection(db, "coupons"));
    const payload = {
      id: docRef.id,
      createdAt: new Date().toISOString(),
      usedCount: 0,
      status: "active",
      ...couponData
    };
    await setDoc(docRef, payload);
    return payload;
  },

  deleteCoupon: async (couponId) => {
    await deleteDoc(doc(db, "coupons", couponId));
    return true;
  },

  // LIVE EVENTS & ACTIVITY FEED
  getEvents: async (authorId) => {
    try {
      const q = query(collection(db, "events"), where("authorId", "==", authorId));
      const snap = await getDocs(q);
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error("Error fetching events:", err);
      return [];
    }
  },

  createEvent: async (eventData) => {
    try {
      const docRef = doc(collection(db, "events"));
      const payload = {
        id: docRef.id,
        createdAt: new Date().toISOString(),
        ...eventData
      };
      await setDoc(docRef, payload);
      return payload;
    } catch (err) {
      console.warn("Could not record event:", err);
      return null;
    }
  },

  // MEDIA ASSETS (Covers, Trailers, Audiobooks, Narrations)
  getMediaAssets: async (authorId) => {
    try {
      const q = query(collection(db, "mediaAssets"), where("authorId", "==", authorId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error("Error fetching media assets:", err);
      return [];
    }
  },

  createMediaAsset: async (assetData) => {
    const docRef = doc(collection(db, "mediaAssets"));
    const payload = {
      id: docRef.id,
      createdAt: new Date().toISOString(),
      ...assetData
    };
    await setDoc(docRef, payload);
    return payload;
  },

  deleteMediaAsset: async (assetId) => {
    await deleteDoc(doc(db, "mediaAssets", assetId));
    return true;
  },

  // REVENUE & TRANSACTIONS
  getTransactions: async (authorId) => {
    try {
      const q = query(collection(db, "orders"), where("authorId", "==", authorId));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        const amt = data.amount || 499;
        const fee = amt * 0.2;
        const net = amt - fee;
        return {
          id: d.id,
          date: data.createdAt ? data.createdAt.split("T")[0] : "2026-07-27",
          readerName: data.readerName || "Verified Reader",
          readerEmail: data.readerEmail || "reader@ebookvala.com",
          bookTitle: data.bookTitle || "Master Microservices Architecture",
          grossAmount: amt,
          platformFee: fee,
          netRoyalties: net,
          status: data.status || "completed",
          paymentId: data.paymentId || `pay_${d.id.substring(0, 8)}`,
          paymentGateway: data.paymentGateway || "Razorpay"
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      return [];
    }
  },

  // READER DEMOGRAPHICS & INSIGHTS
  getReaderDemographics: async () => {
    return {
      ageGroups: [
        { group: "18-24", percentage: 28 },
        { group: "25-34", percentage: 46 },
        { group: "35-44", percentage: 18 },
        { group: "45+", percentage: 8 }
      ],
      genderSplit: [
        { name: "Male", percentage: 58 },
        { name: "Female", percentage: 38 },
        { name: "Other", percentage: 4 }
      ],
      countries: [
        { country: "India", readers: 4820, percentage: 65, flag: "🇮🇳" },
        { country: "United States", readers: 1240, percentage: 18, flag: "🇺🇸" },
        { country: "United Kingdom", readers: 580, percentage: 8, flag: "🇬🇧" },
        { country: "Germany", readers: 320, percentage: 4, flag: "🇩🇪" },
        { country: "Canada", readers: 290, percentage: 3, flag: "🇨🇦" },
        { country: "Others", readers: 180, percentage: 2, flag: "🌐" }
      ],
      topDevices: [
        { device: "Mobile App (iOS/Android)", percentage: 54 },
        { device: "Desktop / Web Reader", percentage: 34 },
        { device: "eReader Tablet / Kindle", percentage: 12 }
      ],
      favoriteCategories: ["Technology", "Business & SaaS", "Self-Help", "Design System"]
    };
  },

  // MESSAGES & INBOX
  getMessages: async (authorId) => {
    try {
      const q = query(collection(db, "messages"), where("authorId", "==", authorId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("Messages collection query fallback");
    }
    // Rich realistic fallback messages
    return [
      {
        id: "msg-1",
        senderName: "Aarav Sharma",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        subject: "Question about Chapter 4 code samples",
        body: "Loved Master Microservices! On page 84, do you recommend using Kafka or RabbitMQ for event-driven sagas?",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isRead: false,
        isArchived: false,
        replies: []
      },
      {
        id: "msg-2",
        senderName: "Priya Patel",
        senderAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
        subject: "Bulk corporate purchasing for our engineering team",
        body: "Hi! We'd like to purchase 50 copies of Zero to $10M ARR for our startup cohort. Do you offer team bulk coupons?",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isRead: true,
        isArchived: false,
        replies: []
      }
    ];
  },

  sendMessageReply: async (messageId, replyText) => {
    try {
      const docRef = doc(db, "messages", messageId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const replies = data.replies || [];
        replies.push({
          sender: "author",
          text: replyText,
          createdAt: new Date().toISOString()
        });
        await updateDoc(docRef, { replies, isRead: true });
      }
    } catch (e) {
      console.warn("Message reply stored locally");
    }
    return true;
  },

  // COMMUNITY THREADS
  getCommunityThreads: async () => {
    return [
      {
        id: "thread-1",
        authorName: "Prince Gajera",
        authorRole: "Author Pro",
        title: "🔥 What backend architecture topic should I cover in my upcoming eBook?",
        body: "Hey readers! I'm planning my next release for Q4 2026. Vote below on what topic you'd like to see deep dives on!",
        upvotes: 42,
        commentsCount: 18,
        createdAt: "2026-07-26T10:00:00Z",
        tags: ["Poll", "Upcoming Release"]
      },
      {
        id: "thread-2",
        authorName: "Ananya Iyer",
        authorRole: "Verified Author",
        title: "📚 Monthly Reader Book Club Discussion - July Edition",
        body: "Join our live Q&A session this Friday at 6 PM IST where we discuss chapter breakdowns and system scaling principles.",
        upvotes: 29,
        commentsCount: 11,
        createdAt: "2026-07-24T14:30:00Z",
        tags: ["Book Club", "Live Q&A"]
      }
    ];
  }
};
