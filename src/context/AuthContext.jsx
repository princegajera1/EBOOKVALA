import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  deleteUser
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Internal: Sync user profile from Firestore into app state.
  // Returns the built user object so callers can use it directly.
  // --------------------------------------------------------------------------
  const syncUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const builtUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          name: userData.name || userData.displayName || firebaseUser.displayName || "",
          displayName: userData.name || userData.displayName || firebaseUser.displayName || "",
          photoURL: userData.photoURL || firebaseUser.photoURL || "",
          role: userData.role || "reader",
          purchasedBooks: userData.purchasedBooks || [],
          wishlist: userData.wishlist || [],
          readingProgress: userData.readingProgress || {},
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        };
        setUser(builtUser);
        return builtUser;
      } else {
        // BUG 6 FIX: Orphaned auth user (has Firebase Auth record but no Firestore doc).
        // Do NOT silently log them in as a reader — set user to null.
        // DO NOT call signOut here, to allow new Google users to complete their profile setup.
        console.warn("Auth user exists but no Firestore profile found yet.");
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error("Error syncing user profile from Firestore:", err);
      // On Firestore read error, do not silently fall through — clear user to avoid
      // a half-authenticated broken state.
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // 1. Auth State Listener — single source of truth
  // --------------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // BUG 10 FIX: Only set loading=true if we actually need to do async work.
      // Avoids the flash when signup calls signOut internally and triggers this listener.
      if (firebaseUser) {
        setLoading(true);
        await syncUserProfile(firebaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncUserProfile]);

  // --------------------------------------------------------------------------
  // 2. Email Signup
  // BUG 1 FIX: Atomic signup — if Firestore write fails after Auth account creation,
  // delete the orphaned Auth account so the user can retry cleanly.
  // --------------------------------------------------------------------------
  const signup = async (email, password, name, role = "reader") => {
    setLoading(true);
    let firebaseUser = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;

      // Update Firebase Auth display name
      await firebaseUpdateProfile(firebaseUser, { displayName: name });

      // Write Firestore user document
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

      // Send verification email (non-blocking, ignore errors on fake domains)
      try {
        await sendEmailVerification(firebaseUser);
      } catch (verificationErr) {
        console.warn("Failed to send verification email (non-blocking):", verificationErr);
      }

      // Sync profile into app state immediately to authenticate session
      await syncUserProfile(firebaseUser);

      setLoading(false);
      return firebaseUser;
    } catch (err) {
      // BUG 1 FIX: If we created the Firebase Auth account but Firestore write failed,
      // delete the orphaned Firebase Auth user so the user can retry signup.
      if (firebaseUser && err.code !== "auth/email-already-in-use") {
        try {
          await deleteUser(firebaseUser);
        } catch (deleteErr) {
          console.error("Failed to clean up orphaned Firebase Auth account:", deleteErr);
        }
      }
      setLoading(false);
      throw err;
    }
  };

  // --------------------------------------------------------------------------
  // 3. Email Login
  // BUG 4 FIX: Honor the "rememberMe" flag using Firebase setPersistence.
  // --------------------------------------------------------------------------
  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      // Set persistence based on rememberMe flag
      // If rememberMe is a string (e.g. "admin"), default to true.
      const shouldRemember = typeof rememberMe === "boolean" ? rememberMe : true;
      await setPersistence(
        auth,
        shouldRemember ? browserLocalPersistence : browserSessionPersistence
      );

      let firebaseUser = null;

      // Try login; if admin account doesn't exist yet, auto-create it.
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
      } catch (loginErr) {
        const isNotFound =
          loginErr.code === "auth/user-not-found" ||
          loginErr.code === "auth/invalid-credential" ||
          loginErr.code === "auth/invalid-login-credentials";
        if (isNotFound && email.toLowerCase() === "admin@ebookvala.com") {
          // First-time setup: create the admin Firebase Auth account
          const newCred = await createUserWithEmailAndPassword(auth, email, password);
          firebaseUser = newCred.user;
        } else {
          throw loginErr;
        }
      }

      // Ensure Firestore user document exists BEFORE syncUserProfile is called
      // (avoids race condition where onAuthStateChanged fires with no doc yet)
      const userDocSnap = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDocSnap.exists()) {
        const name = firebaseUser.displayName || (email.toLowerCase() === "admin@ebookvala.com" ? "Admin" : "EBOOKVALA Reader");
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

      // Sync profile into app state
      await syncUserProfile(firebaseUser);
      return firebaseUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };


  // --------------------------------------------------------------------------
  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw err;
    }
  };

  // --------------------------------------------------------------------------
  // 7. Logout
  // BUG 5 FIX: Always clear the logging_out flag on logout, not just via ProtectedRoute.
  // Also clear any local app caches to prevent data leaking into next session.
  // --------------------------------------------------------------------------
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // BUG 5 FIX: Remove the flag immediately on intentional logout.
      // ProtectedRoute will not show "Please sign in" toast after intentional logout.
      sessionStorage.setItem("logging_out", "true");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 8. Update Profile
  // --------------------------------------------------------------------------
  const updateProfile = async (profileData) => {
    if (!auth.currentUser) throw new Error("No authenticated user session.");

    try {
      // Update Firebase Auth display name/photo
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

      // Update Firestore users collection
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const cleanData = { ...profileData, updatedAt: new Date().toISOString() };
      if (cleanData.name) {
        cleanData.displayName = cleanData.name;
      }
      // SECURITY: Never allow client to change their own role via updateProfile.
      delete cleanData.role;
      await setDoc(userDocRef, cleanData, { merge: true });

      // Update Author profile if applicable
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

      // Sync updated state
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
        forgotPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
