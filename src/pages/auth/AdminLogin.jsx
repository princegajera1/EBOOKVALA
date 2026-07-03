import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { toast } from "react-hot-toast";

const adminSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters")
});

export const AdminLogin = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: { email: "admin@ebookvala.com" }
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Verifying security clearance...");
    try {
      const adminUser = await login(data.email, data.password, "admin");
      if (adminUser) {
        toast.success("Security token authorized! Welcome back, Admin.", { id: toastId });
        navigate("/admin/dashboard");
      }
    } catch (err) {
      toast.error("Security token authorization failed.", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-brand-bg p-6 select-none transition-colors duration-300">
      <div className="w-full max-w-sm flex flex-col gap-6 text-center">
        
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-brand-bg-secondary border border-brand-border text-brand-accent flex items-center justify-center mb-2 shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-display font-black text-brand-text tracking-tight">Admin Console</h2>
          <p className="text-xs text-brand-text-secondary max-w-xs leading-relaxed font-semibold">
            Enter authorized security credentials to access EBOOKVALA administration panel.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-left bg-brand-card border border-brand-border p-6 rounded-brand-card shadow-brand">
          <Input
            type="email"
            placeholder="admin@ebookvala.com"
            label="Security Email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            type="password"
            placeholder="••••••••"
            label="Access Token / Password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" variant="primary" isLoading={loading} className="w-full h-11 rounded-full text-xs font-bold mt-4 shadow-sm">
            Authenticate Access
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </form>

        <button 
          onClick={() => navigate("/")}
          className="text-xs text-brand-text-secondary hover:text-brand-text font-bold cursor-pointer w-fit self-center transition-colors py-1"
        >
          Return to Marketplace
        </button>

      </div>
    </div>
  );
};

export default AdminLogin;
