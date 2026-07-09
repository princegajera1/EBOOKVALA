import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { dbService } from "../services/db";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { 
    user, 
    loading: authLoading, 
    isAuthenticated,
    login, 
    logout, 
    register, 
    updateProfile 
  } = useAuth();

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  
  // Payment Simulation Overlay States
  const [activePayment, setActivePayment] = useState(null);
  const [rtdbAdminSynced, setRtdbAdminSynced] = useState(false);

  // Helper to apply theme classes to documentElement
  const applyTheme = (t) => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Update theme state and persist
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    updateTheme(nextTheme);
  };

  // Sync theme classes on mount and updates
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Load cart on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("eb_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Cart loading error:", e);
      }
    }
  }, []);

  // Sync Wishlist when user profile loads/changes
  useEffect(() => {
    if (user) {
      setWishlist(user.wishlist || []);
    } else {
      setWishlist([]);
    }
  }, [user]);

  // Dynamic Real-time Presence Tracking for Guests and Registered Users
  useEffect(() => {
    let sessionId = sessionStorage.getItem("eb_session_id");
    if (!sessionId) {
      sessionId = typeof crypto.randomUUID === "function" 
        ? crypto.randomUUID() 
        : "guest_" + Math.random().toString(36).substring(2) + Date.now();
      sessionStorage.setItem("eb_session_id", sessionId);
    }

    let active = true;
    let heartbeatInterval;
    let sessionDocRef;
    let unloadHandler;

    const startPresenceTracking = async () => {
      try {
        const { doc, setDoc, updateDoc, serverTimestamp } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        
        // Browser and OS parsing utility
        const getBrowserAndOS = () => {
          const ua = navigator.userAgent;
          let browser = "Unknown Browser";
          let os = "Unknown OS";

          if (ua.indexOf("Firefox") > -1) browser = "Firefox";
          else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Browser";
          else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
          else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
          else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) browser = "Edge";
          else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
          else if (ua.indexOf("Safari") > -1) browser = "Safari";

          if (ua.indexOf("Windows NT 10.0") > -1) os = "Windows 10/11";
          else if (ua.indexOf("Windows NT 6.2") > -1) os = "Windows 8";
          else if (ua.indexOf("Windows NT 6.1") > -1) os = "Windows 7";
          else if (ua.indexOf("Android") > -1) os = "Android";
          else if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) os = "iOS";
          else if (ua.indexOf("Macintosh") > -1) os = "macOS";
          else if (ua.indexOf("Linux") > -1) os = "Linux";

          return `${browser} / ${os}`;
        };

        // Fetch location with fail-safe caching in sessionStorage
        const getIpLocation = async () => {
          try {
            const cached = sessionStorage.getItem("eb_session_location");
            if (cached) return cached;

            const res = await fetch("https://freeipapi.com/api/json");
            if (!res.ok) throw new Error("Free IP API failed");
            const data = await res.json();
            if (data.cityName && data.countryName) {
              const loc = `${data.cityName}, ${data.countryName}`;
              sessionStorage.setItem("eb_session_location", loc);
              return loc;
            }
            return "Unknown Location";
          } catch (err) {
            console.error("IP Geolocation error:", err);
            return "Unknown Location";
          }
        };

        sessionDocRef = doc(db, "liveSessions", sessionId);
        const location = await getIpLocation();
        const device = getBrowserAndOS();
        const entryPage = window.location.pathname || "/";
        const referrer = document.referrer ? new URL(document.referrer).hostname : "Direct Traffic";

        const userInfo = user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || null,
          id: user.uid,
          user: `${user.displayName || "EbookVala User"} (${user.email})`,
          isGuest: false,
          location,
          device,
          entryPage,
          referrer,
        } : {
          uid: null,
          email: null,
          displayName: null,
          id: sessionId,
          user: "Guest User (Anonymous)",
          isGuest: true,
          location,
          device,
          entryPage,
          referrer,
        };

        await setDoc(sessionDocRef, {
          ...userInfo,
          loginTime: serverTimestamp(),
          status: "Active",
          lastSeen: serverTimestamp(),
        }, { merge: true });

        // 30 seconds heartbeat loop
        heartbeatInterval = setInterval(async () => {
          if (active && sessionDocRef) {
            try {
              await updateDoc(sessionDocRef, { lastSeen: serverTimestamp() });
            } catch (heartbeatErr) {
              console.error("Heartbeat sync error:", heartbeatErr);
            }
          }
        }, 30000);

        unloadHandler = async () => {
          if (sessionDocRef) {
            try {
              await updateDoc(sessionDocRef, {
                status: "Ended",
                logoutTime: new Date().toISOString()
              });
            } catch (e) {
              // ignore
            }
          }
        };

        window.addEventListener("beforeunload", unloadHandler);

      } catch (err) {
        console.error("Real-time presence error:", err);
      }
    };

    startPresenceTracking();

    return () => {
      active = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (unloadHandler) window.removeEventListener("beforeunload", unloadHandler);
    };
  }, [user]);

  // Sync Admin Role - directly authorize once logged in (no RTDB requirement)
  useEffect(() => {
    if (user && user.role === "admin") {
      setRtdbAdminSynced(true);
    } else {
      setRtdbAdminSynced(false);
    }
  }, [user]);

  // Cart Methods
  const addToCart = (book) => {
    if (cart.some(item => item.id === book.id)) {
      toast.error("Book is already in your cart.");
      return;
    }
    const updatedCart = [...cart, book];
    setCart(updatedCart);
    localStorage.setItem("eb_cart", JSON.stringify(updatedCart));
    toast.success(`${book.title} added to cart.`);
  };

  const removeFromCart = (bookId) => {
    const updatedCart = cart.filter(item => item.id !== bookId);
    setCart(updatedCart);
    localStorage.setItem("eb_cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("eb_cart");
  };

  // Wishlist Methods
  const toggleWishlist = async (bookId) => {
    if (!user) {
      toast.error("Please sign in to manage wishlist.");
      return;
    }
    
    let updatedWishlist;
    const isRemoving = wishlist.includes(bookId);
    if (isRemoving) {
      updatedWishlist = wishlist.filter(id => id !== bookId);
      toast.success("Removed from wishlist.");
    } else {
      updatedWishlist = [...wishlist, bookId];
      toast.success("Added to wishlist.");
    }
    
    setWishlist(updatedWishlist);
    try {
      await updateProfile({ wishlist: updatedWishlist });
      await dbService.toggleBookBookmark(bookId, !isRemoving);
    } catch (err) {
      console.error("Failed to sync wishlist to Firestore:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        loading: authLoading,
        authLoading,
        cart,
        wishlist,
        theme,
        activePayment,
        setActivePayment,
        rtdbAdminSynced,
        toggleTheme,
        updateTheme,
        login,
        logout,
        register,
        updateProfile,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
