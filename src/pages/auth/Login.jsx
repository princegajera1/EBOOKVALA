import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Sparkles, BookOpen, User, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Modal } from "../../components/ui/Modal";
import { toast } from "react-hot-toast";
import { auth, db } from "../../lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const loginSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  rememberMe: zod.boolean().optional()
});

const GoogleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: "1.2em", height: "1.2em" }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: "1.2em", height: "1.2em" }}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.71-1.16 1.85-1.02 2.96 1.12.09 2.27-.59 2.97-1.4z" />
  </svg>
);

const GithubIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: "1.2em", height: "1.2em" }}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

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
    loginWithGoogle, 
    completeGoogleRegistration, 
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

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [googleUserForRegistration, setGoogleUserForRegistration] = useState(null);

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

  const onLogin = async (data) => {
    setIsEmailNotVerified(false);
    setSubmitError("");
    const toastId = toast.loading("Verifying credentials...");
    try {
      const firebaseUser = await login(data.email, data.password);
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

  const handleGoogleLogin = async () => {
    setSubmitError("");
    try {
      const result = await loginWithGoogle();
      if (result.isNew) {
        setGoogleUserForRegistration(result.firebaseUser);
        setIsRoleModalOpen(true);
      } else {
        toast.success("Welcome back! 👋");
        redirectByRole(result.user.role);
      }
    } catch (err) {
      console.error("Google login error:", err);
      triggerShake();
      setSubmitError("Google Sign-In failed. Please try again.");
      toast.error("Google Sign-In failed.");
    }
  };

  const handleCompleteGoogleRegistration = async (role) => {
    if (!googleUserForRegistration) return;
    try {
      const userData = await completeGoogleRegistration(googleUserForRegistration, role);
      setIsRoleModalOpen(false);
      toast.success("Account created successfully!");
      redirectByRole(userData.role);
    } catch (err) {
      console.error("Google registration error:", err);
      setSubmitError("Failed to complete Google registration.");
      toast.error("Failed to complete Google registration.");
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

  const redirectByRole = (role) => {
    if (from) {
      navigate(from, { replace: true });
    } else {
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "author") navigate("/author/dashboard");
      else navigate("/dashboard");
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!resetEmail) {
      setSubmitError("Please enter your email address.");
      toast.error("Please enter your email address.");
      return;
    }
    const toastId = toast.loading("Sending reset link...");
    try {
      await forgotPassword(resetEmail);
      toast.success("Password reset link sent! Check your inbox.", { id: toastId });
      setIsForgotPassword(false);
      setResetEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      triggerShake();
      let errMsg = err.message || "Failed to send reset link.";
      if (err.code === "auth/user-not-found") {
        errMsg = "No registered user found with this email address.";
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

            {/* Third-Party Logins */}
            <div className="flex flex-col gap-2 select-none">
              <Button 
                onClick={handleGoogleLogin}
                variant="secondary" 
                className="w-full h-11 rounded-full border-brand-border bg-brand-card hover:bg-brand-bg-secondary flex items-center justify-center gap-2.5 text-xs font-bold text-brand-text shadow-sm"
              >
                <GoogleIcon className="h-4 w-4 shrink-0" />
                Continue with Google
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => toast("GitHub Sign-In coming soon!", { icon: "🐙" })}
                  variant="secondary" 
                  className="h-10.5 rounded-full border-brand-border bg-brand-card hover:bg-brand-bg-secondary flex items-center justify-center gap-2 text-[11px] font-bold text-brand-text shadow-sm"
                >
                  <GithubIcon className="h-4 w-4 shrink-0" />
                  GitHub
                </Button>
                <Button 
                  disabled
                  variant="secondary" 
                  className="h-10.5 rounded-full border-brand-border bg-brand-card flex items-center justify-center gap-2 text-[11px] font-bold text-brand-text opacity-40 cursor-not-allowed shadow-sm"
                >
                  <AppleIcon className="h-4 w-4 shrink-0" />
                  Apple
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 select-none">
              <div className="h-px bg-brand-border flex-1" />
              <span className="text-[9px] uppercase font-mono font-bold text-brand-text-secondary/70 tracking-wider">or credentials</span>
              <div className="h-px bg-brand-border flex-1" />
            </div>

            {/* Form */}
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

      {/* GOOGLE FIRST-LOGIN ROLE SELECTION MODAL */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Choose Your Role"
        className="max-w-sm"
      >
        <p className="text-xs text-brand-text-secondary text-center max-w-[240px] mx-auto mb-6 leading-relaxed font-semibold">
          Welcome! Please select how you want to use EBOOKVALA.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleCompleteGoogleRegistration("reader")}
            className="flex items-center gap-4 p-4 border border-brand-border rounded-[16px] hover:border-brand-accent hover:bg-brand-bg-secondary group transition-all text-left cursor-pointer"
          >
            <div className="h-9.5 w-9.5 rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center text-brand-text-secondary/70 group-hover:text-brand-accent shrink-0">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-text">Reader Account</h4>
              <p className="text-[10px] text-brand-text-secondary mt-0.5 font-semibold">Browse, download and read free digital books.</p>
            </div>
          </button>

          <button
            onClick={() => handleCompleteGoogleRegistration("author")}
            className="flex items-center gap-4 p-4 border border-brand-border rounded-[16px] hover:border-brand-accent hover:bg-brand-bg-secondary group transition-all text-left cursor-pointer"
          >
            <div className="h-9.5 w-9.5 rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center text-brand-text-secondary/70 group-hover:text-brand-accent shrink-0">
              <User className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-text">Author Account</h4>
              <p className="text-[10px] text-brand-text-secondary mt-0.5 font-semibold">Upload, publish, and share your eBooks for free.</p>
            </div>
          </button>
        </div>
      </Modal>
    </AuthLayout>
  );
};

export default Login;
