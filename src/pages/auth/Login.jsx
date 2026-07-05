import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { toast } from "react-hot-toast";
import { auth, db } from "../../lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const loginSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  rememberMe: zod.boolean().optional()
});

const AuthInput = React.forwardRef(({ 
  label, 
  icon: Icon, 
  error, 
  type = "text", 
  showToggle, 
  toggleOpen, 
  setToggleOpen, 
  ...props 
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left select-none relative">
      {label && (
        <label className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider font-mono">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-4 h-4.5 w-4.5 text-brand-text-secondary/60 transition-colors pointer-events-none" />
        )}
        <input
          type={type}
          ref={ref}
          className={`flex w-full bg-brand-bg-secondary border px-4 py-3 rounded-[16px] text-xs sm:text-sm transition-all placeholder:text-brand-text-secondary/30 focus:outline-none focus:bg-brand-card text-brand-text font-medium border-brand-border focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 disabled:cursor-not-allowed disabled:opacity-50 ${
            Icon ? "pl-11" : ""
          } ${showToggle ? "pr-11" : ""} ${
            error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/5" : ""
          }`}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setToggleOpen(!toggleOpen)}
            className="absolute right-4 text-brand-text-secondary/70 hover:text-brand-text transition-colors cursor-pointer focus:outline-none"
            aria-label={toggleOpen ? "Hide password" : "Show password"}
          >
            {toggleOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="text-[11px] text-red-500 font-bold mt-0.5 select-text"
            aria-live="polite"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
});
AuthInput.displayName = "AuthInput";

export const Login = () => {
  const { 
    login,
    forgotPassword, 
    loading 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [shake, setShake] = useState(false);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: true }
  });

  const triggerShake = () => {
    if (prefersReducedMotion) return;
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const redirectByRole = (role) => {
    if (from) {
      navigate(from, { replace: true });
    } else {
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "author") navigate("/author/dashboard");
      else navigate("/dashboard");
    }
  };

  const onLogin = async (data) => {
    setIsEmailNotVerified(false);
    setSubmitError("");
    const toastId = toast.loading("Verifying credentials...");
    try {
      const firebaseUser = await login(data.email, data.password, data.rememberMe);
      if (firebaseUser) {
        toast.success("Welcome back! 👋", { id: toastId });
        if (data.email.toLowerCase() === "admin@ebookvala.com") {
          navigate(from || "/admin/dashboard", { replace: true });
        } else {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists() && userDoc.data()?.role) {
            redirectByRole(userDoc.data().role);
          } else {
            redirectByRole("reader");
          }
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      triggerShake();
      let errMsg = err.message || "Invalid email or password.";
      if (err.code === "auth/email-not-verified") {
        setIsEmailNotVerified(true);
        errMsg = "Please verify your email first. Check your inbox for the verification link.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        errMsg = "No account found or invalid credentials. Please check your email and password.";
      }
      setSubmitError(errMsg);
      toast.error(errMsg, { id: toastId });
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast.success("Verification email resent! Check your inbox.");
      } catch (err) {
        console.error("Resend error:", err);
        toast.error("Failed to resend verification email.");
      }
    } else {
      toast.error("Unable to resend. Please sign in again.");
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!resetEmail.trim()) {
      setSubmitError("Please enter your email address.");
      toast.error("Please enter your email address.");
      return;
    }
    const toastId = toast.loading("Sending reset link...");
    try {
      await forgotPassword(resetEmail.trim());
      toast.success("Password reset link sent! Check your inbox (and spam folder).", { id: toastId });
      setIsForgotPassword(false);
      setResetEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      triggerShake();
      let errMsg = err.message || "Failed to send reset link.";
      if (err.code === "auth/user-not-found") {
        errMsg = "No registered user found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      } else if (err.code === "auth/too-many-requests") {
        errMsg = "Too many attempts. Please wait a moment and try again.";
      }
      setSubmitError(errMsg);
      toast.error(errMsg, { id: toastId });
    }
  };

  return (
    <AuthLayout>
      <motion.div 
        animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0], transition: { duration: 0.4 } } : {}}
        className="flex flex-col gap-6 w-full text-left select-none"
      >
        
        {/* FORGOT PASSWORD VIEW */}
        {isForgotPassword ? (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-display font-black text-brand-text">Reset Password</h2>
              <p className="text-xs text-brand-text-secondary mt-2 leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-600 font-medium">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4">
              <AuthInput
                type="email"
                required
                placeholder="name@example.com"
                label="Email Address"
                icon={Mail}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" className="w-full h-12 text-xs font-bold rounded-full mt-2 shadow-sm">
                Send Reset Link
              </Button>
            </form>

            <button 
              onClick={() => {
                setIsForgotPassword(false);
                setSubmitError("");
              }}
              className="text-xs text-brand-text hover:underline font-bold self-center cursor-pointer py-1"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          /* MAIN LOGIN VIEW */
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-display font-black text-brand-text">Sign in</h2>
              <p className="text-xs text-brand-text-secondary mt-1.5 font-semibold">Enter credentials to access EBOOKVALA.</p>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-600 font-medium animate-fade-in">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Email Not Verified Warning */}
            {isEmailNotVerified && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-2.5 text-xs text-amber-600">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Email Verification Required</p>
                    <p className="mt-0.5 leading-relaxed">Please verify your email address before logging in. Check your spam folder if missing.</p>
                  </div>
                </div>
                <Button 
                  onClick={handleResendVerification}
                  variant="outline" 
                  size="sm"
                  className="w-fit text-[10px] h-8 rounded-full border-amber-500/30 text-amber-600 hover:bg-amber-500/5 font-bold"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit(onLogin)} className="flex flex-col gap-4">
              <AuthInput
                type="email"
                placeholder="name@example.com"
                label="Email Address"
                icon={Mail}
                error={errors.email?.message}
                {...register("email")}
              />
              
              <div className="flex flex-col gap-1 relative">
                <AuthInput
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  label="Password"
                  icon={Lock}
                  showToggle
                  toggleOpen={showPassword}
                  setToggleOpen={setShowPassword}
                  error={errors.password?.message}
                  {...register("password")}
                />
                
                <button 
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setSubmitError("");
                  }}
                  className="text-[11px] font-bold text-brand-accent hover:underline text-right mt-1.5 cursor-pointer w-fit self-end"
                >
                  Forgot Password?
                </button>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-brand-text-secondary cursor-pointer select-none font-semibold mt-1">
                <input
                  type="checkbox"
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent/10 h-4 w-4 cursor-pointer accent-brand-accent"
                  {...register("rememberMe")}
                />
                <span>Remember me for 30 days</span>
              </label>

              <Button type="submit" variant="primary" isLoading={loading} className="w-full h-12 rounded-full text-xs font-bold mt-2 shadow-sm">
                Sign In
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </form>

            <div className="text-center text-xs text-brand-text-secondary select-none font-semibold">
              Don't have an account?{" "}
              <Link to="/register" className="text-brand-accent font-bold hover:underline">
                Register
              </Link>
            </div>
          </div>
        )}

      </motion.div>
    </AuthLayout>
  );
};

export default Login;
