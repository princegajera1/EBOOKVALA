import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { BookOpen, PenTool, ArrowRight, Mail, Check } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
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

export const Register = () => {
  const { register: signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

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

  const onSubmit = async (data) => {
    const toastId = toast.loading("Creating account...");
    try {
      setRegisteredEmail(data.email);
      await signUp(data.email, data.password, data.displayName, data.role);
      setIsSuccess(true);
      toast.success("Account created successfully! Check your inbox.", { id: toastId });
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.message || "Registration failed. Email might already be in use.", { id: toastId });
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-6 text-center select-none w-full max-w-sm mx-auto">
          <div className="h-14 w-14 rounded-full bg-brand-bg-secondary border border-brand-border text-brand-text flex items-center justify-center mx-auto mb-2 shadow-sm">
            <Mail className="h-6 w-6 text-brand-accent" />
          </div>
          
          <div>
            <h2 className="text-3xl font-display font-black text-brand-text">Verify your email</h2>
            <p className="text-xs text-brand-text-secondary mt-3 leading-relaxed max-w-xs mx-auto font-semibold">
              We've sent a verification link to <span className="font-bold text-brand-text">{registeredEmail}</span>. Please verify your email to complete registration.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4 w-full">
            <Link to="/login" className="w-full">
              <Button variant="primary" className="w-full h-11 rounded-full text-xs font-bold shadow-sm">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6 w-full text-left select-none">
        <div>
          <h2 className="text-3xl font-display font-black text-brand-text">Create account</h2>
          <p className="text-xs text-brand-text-secondary mt-1.5 font-semibold">Join EBOOKVALA to read and publish free digital books.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Prince Gajera"
            label="Full Name"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
          
          <Input
            type="email"
            placeholder="name@example.com"
            label="Email Address"
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="password"
              placeholder="••••••••"
              label="Password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              type="password"
              placeholder="••••••••"
              label="Confirm Password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>

          {/* Role Selection Cards */}
          <div className="flex flex-col gap-2.5 select-none text-left mt-1">
            <label className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">I want to...</label>
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

          <Button type="submit" variant="primary" isLoading={loading} className="w-full h-11 rounded-full text-xs font-bold mt-3 shadow-sm">
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
      </div>
    </AuthLayout>
  );
};

export default Register;
