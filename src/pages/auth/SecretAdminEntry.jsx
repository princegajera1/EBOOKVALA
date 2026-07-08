import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Read from env — not hardcoded in bundle
const SECRET_PASSWORD = import.meta.env.VITE_SECRET_ADMIN_TOKEN || "2412";

const ADMIN_EMAIL = "admin@ebookvala.com";
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || "admin0561";

export const SecretAdminEntry = () => {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

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

    setUnlocked(true);
    setStatusMsg("Verifying...");

    try {
      // AuthContext.login() handles:
      // 1. Auto-create admin Firebase Auth account if missing
      // 2. Auto-create Firestore doc with role:"admin" if missing
      // 3. syncUserProfile so isAdmin becomes true
      await login(ADMIN_EMAIL, ADMIN_PASS, "admin");
      setStatusMsg("Access Granted ✓");
      setTimeout(() => navigate("/admin/dashboard"), 700);
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
