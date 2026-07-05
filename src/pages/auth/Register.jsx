import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, PenTool, ArrowRight, Mail, Check, Eye, EyeOff, AlertCircle, User, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { toast } from "react-hot-toast";

const registerSchema = zod.object({
  displayName: zod.string().min(2, "Name must be at least 2 characters"),
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: zod.string().min(6, "Confirm Password must be at least 6 characters"),
  role: zod.enum(["reader", "author"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
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

export const Register = () => {
  const { register: signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "reader" }
  });

  const selectedRole = watch("role");
  const passwordValue = watch("password") || "";

  const triggerShake = () => {
    if (prefersReducedMotion) return;
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "bg-transparent", text: "text-transparent" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { score: 25, label: "Weak", color: "bg-red-500", text: "text-red-500" };
    if (score === 2 || score === 3) return { score: 60, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
    return { score: 100, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    setSubmitError("");
    const toastId = toast.loading("Creating account...");
    try {
      await signUp(data.email, data.password, data.displayName, data.role);
      toast.success("Welcome to EBOOKVALA! 🎉", { id: toastId });
      
      // Auto-redirect to reader or author workspace instantly
      if (data.role === "author") {
        navigate("/author/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      triggerShake();
      let errMsg = err.message || "Registration failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "An account with this email address already exists. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "The password is too weak. Please use a stronger password.";
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
        <div>
          <h2 className="text-3xl font-display font-black text-brand-text">Create account</h2>
          <p className="text-xs text-brand-text-secondary mt-1.5 font-semibold">Join EBOOKVALA to read and publish free digital books.</p>
        </div>

        {submitError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-600 font-medium animate-fade-in">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthInput
            type="text"
            placeholder="Prince Gajera"
            label="Full Name"
            icon={User}
            error={errors.displayName?.message}
            {...register("displayName")}
          />
          
          <AuthInput
            type="email"
            placeholder="name@example.com"
            label="Email Address"
            icon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
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
              {/* Password strength meter */}
              {passwordValue && (
                <div className="flex flex-col gap-1.5 mt-1 select-none px-1">
                  <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="text-brand-text-secondary">Password Strength:</span>
                    <span className={strength.text}>{strength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-brand-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`} 
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <AuthInput
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              label="Confirm Password"
              icon={Lock}
              showToggle
              toggleOpen={showConfirmPassword}
              setToggleOpen={setShowConfirmPassword}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>

          {/* Role Selection Cards */}
          <div className="flex flex-col gap-2.5 select-none text-left mt-1">
            <label className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider font-mono">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue("role", "reader")}
                className={`flex flex-col items-center justify-center p-4 border rounded-[16px] gap-2.5 cursor-pointer transition-all ${
                  selectedRole === "reader"
                    ? "border-brand-accent bg-brand-bg-secondary text-brand-accent shadow-sm"
                    : "border-brand-border bg-transparent text-brand-text-secondary hover:text-brand-text"
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-xs font-bold">Read Books</span>
              </button>
              
              <button
                type="button"
                onClick={() => setValue("role", "author")}
                className={`flex flex-col items-center justify-center p-4 border rounded-[16px] gap-2.5 cursor-pointer transition-all ${
                  selectedRole === "author"
                    ? "border-brand-accent bg-brand-bg-secondary text-brand-accent shadow-sm"
                    : "border-brand-border bg-transparent text-brand-text-secondary hover:text-brand-text"
                }`}
              >
                <PenTool className="h-5 w-5" />
                <span className="text-xs font-bold">Publish Books</span>
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={loading} className="w-full h-12 rounded-full text-xs font-bold mt-3 shadow-sm">
            Create Account
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-brand-text-secondary select-none font-semibold">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-accent font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default Register;
