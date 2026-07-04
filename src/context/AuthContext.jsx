import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile from Firestore users collection
  const syncUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          name: userData.name || userData.displayName || firebaseUser.displayName || "",
          displayName: userData.name || userData.displayName || firebaseUser.displayName || "",
          photoURL: userData.photoURL || firebaseUser.photoURL || "",
          role: userData.role || "reader",
          purchasedBooks: userData.purchasedBooks || [],
          wishlist: userData.wishlist || [],
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        });
      } else {
        // Fallback or user doc doesn't exist yet
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          name: firebaseUser.displayName || "",
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
          role: "reader",
          purchasedBooks: [],
          wishlist: [],
        });
      }
    } catch (err) {
      console.error("Error syncing user profile from Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Listen for Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const isTestEmail = firebaseUser.email?.toLowerCase().endsWith(".test");
        const isAdminEmail = firebaseUser.email?.toLowerCase() === "admin@ebookvala.com";
        if (!isAdminEmail && !isTestEmail && !firebaseUser.emailVerified) {
          setUser(null);
          setLoading(false);
          return;
        }
        await syncUserProfile(firebaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Email Signup
  const signup = async (email, password, name, role = "reader") => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update basic firebase display name
      await firebaseUpdateProfile(firebaseUser, { displayName: name });

      // Save user profile to Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userData = {
        uid: firebaseUser.uid,
        name: name,
        displayName: name,
        email: email,
        photoURL: "",
        role: role,
        purchasedBooks: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userDocRef, userData);

      // Create Author profile in Firestore if role is author
      if (role === "author") {
        const authorDocRef = doc(db, "authors", firebaseUser.uid);
        await setDoc(authorDocRef, {
          uid: firebaseUser.uid,
          displayName: name,
          photoURL: "",
          bio: `Hello! I am ${name}, an author on EBOOKVALA.`,
          socialLinks: {},
          isVerified: false,
          verificationStatus: "unverified",
          totalEarnings: 0,
          availableBalance: 0,
          pendingBalance: 0,
          followers: [],
          totalSales: 0,
          createdAt: new Date().toISOString()
        });
      }

      // Send Verification Email
      await sendEmailVerification(firebaseUser);

      // Log out user immediately since they must verify email first
      sessionStorage.setItem("logging_out", "true");
      await signOut(auth);
      
      setLoading(false);
      return firebaseUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // 3. Email Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Check if email is verified (Bypass for admin or .test test domains)
      const isTestEmail = email.toLowerCase().endsWith(".test");
      if (email.toLowerCase() !== "admin@ebookvala.com" && !isTestEmail && !firebaseUser.emailVerified) {
        const error = new Error("Please verify your email first. Check your inbox.");
        error.code = "auth/email-not-verified";
        sessionStorage.setItem("logging_out", "true");
        await signOut(auth);
        setLoading(false);
        throw error;
      }

      // Verify user document exists in Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists()) {
        // Automatically create a document for existing auth user (e.g. if created prior to Firestore sync)
        const name = firebaseUser.displayName || "Ebookvala Reader";
        const role = email.toLowerCase() === "admin@ebookvala.com" ? "admin" : "reader";
        await setDoc(doc(db, "users", firebaseUser.uid), {
          uid: firebaseUser.uid,
          name: name,
          displayName: name,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || "",
          role: role,
          purchasedBooks: [],
          wishlist: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Force sync
      await syncUserProfile(firebaseUser);
      return firebaseUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // 4. Google Login
  const googleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data()?.role) {
        const userData = userDoc.data();
        // User already registered in Firestore
        await syncUserProfile(firebaseUser);
        return { isNew: false, user: { uid: firebaseUser.uid, email: firebaseUser.email, ...userData } };
      } else {
        // Brand new user from Google, requires role selection or default to reader
        // Return isNew: true so the UI can prompt for Role selection
        setLoading(false);
        return { isNew: true, firebaseUser };
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // 5. Complete Google Registration
  const completeGoogleRegistration = async (firebaseUser, role) => {
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const name = firebaseUser.displayName || "Google Reader";
      const userData = {
        uid: firebaseUser.uid,
        name: name,
        displayName: name,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || "",
        role: role,
        purchasedBooks: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userDocRef, userData);

      if (role === "author") {
        const authorDocRef = doc(db, "authors", firebaseUser.uid);
        await setDoc(authorDocRef, {
          uid: firebaseUser.uid,
          displayName: name,
          photoURL: firebaseUser.photoURL || "",
          bio: `Hello! I am ${name}, an author on EBOOKVALA.`,
          socialLinks: {},
          isVerified: false,
          verificationStatus: "unverified",
          totalEarnings: 0,
          availableBalance: 0,
          pendingBalance: 0,
          followers: [],
          totalSales: 0,
          createdAt: new Date().toISOString()
        });
      }

      await syncUserProfile(firebaseUser);
      return userData;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // 6. Forgot Password
  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw err;
    }
  };

  // 7. Logout
  const logout = async () => {
    setLoading(true);
    try {
      sessionStorage.setItem("logging_out", "true");
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 8. Update Profile (auth and db)
  const updateProfile = async (profileData) => {
    if (!auth.currentUser) throw new Error("No authenticated user session.");

    try {
      // 1. Update Firebase Auth user
      const updates = {};
      if (profileData.name || profileData.displayName) {
        updates.displayName = profileData.name || profileData.displayName;
      }
      if (profileData.photoURL) {
        updates.photoURL = profileData.photoURL;
      }
      if (Object.keys(updates).length > 0) {
        await firebaseUpdateProfile(auth.currentUser, updates);
      }

      // 2. Update Firestore users collection
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const cleanData = { ...profileData, updatedAt: new Date().toISOString() };
      // Rename name to displayName inside Firestore if needed
      if (cleanData.name) {
        cleanData.displayName = cleanData.name;
      }
      await setDoc(userDocRef, cleanData, { merge: true });

      // 3. Update Author profile in Firestore if author
      if (user?.role === "author") {
        const authorDocRef = doc(db, "authors", auth.currentUser.uid);
        const authorUpdates = {
          displayName: cleanData.displayName || cleanData.name || user.displayName,
          updatedAt: new Date().toISOString()
        };
        if (cleanData.photoURL) authorUpdates.photoURL = cleanData.photoURL;
        if (cleanData.bio) authorUpdates.bio = cleanData.bio;
        if (cleanData.socialLinks) authorUpdates.socialLinks = cleanData.socialLinks;
        await setDoc(authorDocRef, authorUpdates, { merge: true });
      }

      // Sync state
      await syncUserProfile(auth.currentUser);
    } catch (err) {
      console.error("Error updating profile in AuthContext:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        googleLogin,
        completeGoogleRegistration,
        forgotPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
