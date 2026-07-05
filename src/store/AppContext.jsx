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
    loginWithGoogle, 
    logout, 
    register, 
    updateProfile 
  } = useAuth();

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  
  // Payment Simulation Overlay States
  const [activePayment, setActivePayment] = useState(null);

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
        toggleTheme,
        updateTheme,
        login,
        loginWithGoogle,
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
