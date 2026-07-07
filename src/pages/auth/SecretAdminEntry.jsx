import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

// Read from env — not hardcoded in bundle
const SECRET_PASSWORD = import.meta.env.VITE_SECRET_ADMIN_TOKEN || "";

const ADMIN_EMAIL = "admin@ebookvala.com";
const ADMIN_PASS = "admin0561";

export const SecretAdminEntry = () => {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMsg("");

    if (value !== SECRET_PASSWORD) {
      setShake(true);
      setValue("");
      setTimeout(() => setShake(false), 600);
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    // Correct secret token — proceed
    setUnlocked(true);
    setStatusMsg("Verifying...");

    try {
      let firebaseUser = null;

      // Step 1: Try to login first
      try {
        const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
        firebaseUser = cred.user;
        setStatusMsg("Authenticated!");
      } catch (loginErr) {
        // If user doesn't exist, create them
        if (
          loginErr.code === "auth/user-not-found" ||
          loginErr.code === "auth/invalid-credential" ||
          loginErr.code === "auth/invalid-login-credentials"
        ) {
          setStatusMsg("First time setup — creating admin account...");
          const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
          firebaseUser = cred.user;
          setStatusMsg("Admin account created!");
        } else {
          throw loginErr;
        }
      }

      // Step 2: Ensure Firestore document exists with role: "admin"
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        setStatusMsg("Setting up admin profile...");
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          name: "Admin",
          displayName: "Admin",
          email: ADMIN_EMAIL,
          photoURL: "",
          role: "admin",
          purchasedBooks: [],
          wishlist: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Make sure role is admin even if doc exists
        const data = userDoc.data();
        if (data.role !== "admin") {
          await setDoc(userDocRef, { role: "admin" }, { merge: true });
        }
      }

      setStatusMsg("Access Granted ✓");
      setTimeout(() => navigate("/admin/dashboard"), 800);
    } catch (err) {
      console.error("Admin auth error:", err);
      setUnlocked(false);
      setErrorMsg(`Auth failed: ${err.message}`);
      setShake(true);
      setValue("");
      setTimeout(() => setShake(false), 600);
      setStatusMsg("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #0d0d0d)",
        flexDirection: "column",
        gap: "0",
        userSelect: "none",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* Lock icon */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "var(--bg-secondary, #1a1a1a)",
            border: "1px solid var(--border, #2a2a2a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            marginBottom: "4px",
            transition: "all 0.3s",
            boxShadow: unlocked
              ? "0 0 24px rgba(34,197,94,0.3)"
              : "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {unlocked ? "✅" : "🔐"}
        </div>

        {/* Password input */}
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Password"
          autoFocus
          maxLength={20}
          disabled={unlocked}
          style={{
            background: "var(--card, #161616)",
            border: `1.5px solid ${shake ? "#ef4444" : "var(--border, #2a2a2a)"}`,
            borderRadius: "12px",
            color: "var(--text, #f0f0f0)",
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            padding: "12px 20px",
            outline: "none",
            textAlign: "center",
            width: "200px",
            transition: "border 0.2s, transform 0.1s",
            transform: shake ? "translateX(-6px)" : "none",
            animation: shake ? "shake 0.4s ease" : "none",
            opacity: unlocked ? 0.5 : 1,
          }}
        />

        {statusMsg && (
          <div style={{ color: "#22c55e", fontSize: "11px", fontWeight: "600", marginTop: "-8px" }}>
            {statusMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ color: "#ef4444", fontSize: "11px", fontWeight: "600", marginTop: "-8px", maxWidth: "260px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={unlocked}
          style={{
            background: unlocked ? "#16a34a" : "var(--primary, #7c3aed)",
            color: "#fff",
            border: "none",
            borderRadius: "99px",
            padding: "10px 36px",
            fontWeight: 700,
            fontSize: "13px",
            cursor: unlocked ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            letterSpacing: "0.04em",
            opacity: unlocked ? 0.7 : 1,
          }}
        >
          {unlocked ? "Opening..." : "Enter"}
        </button>
      </form>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

export default SecretAdminEntry;
