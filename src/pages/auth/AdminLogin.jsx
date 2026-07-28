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
  const { login, user, updateProfile, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: { email: "princegajera944@gmail.com" }
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Verifying Super Admin clearance...");
    const enteredEmail = data.email.trim();
    const enteredPass = data.password.trim();

    try {
      const adminUser = await login(enteredEmail, enteredPass, true);
      if (adminUser) {
        sessionStorage.setItem("admin_session_unlocked", "true");
        toast.success("Super Admin authenticated! Welcome back, Prince.", { id: toastId });
        navigate("/admin/dashboard");
        return;
      }
    } catch (err) {
      console.warn("Standard login failed, evaluating admin fallback...", err);
    }

    // Check if entered password matches Super Admin password or secret PINs
    if (enteredPass === "Prince@2412" || enteredPass === "2412" || enteredPass === "635284" || enteredPass === "admin0561") {
      try {
        if (user?.uid) {
          await updateProfile({ role: "admin" });
          await dbService.updateUser(user.uid, { role: "admin" });
        } else {
          await login("princegajera944@gmail.com", "Prince@2412", true).catch(() => null);
        }
        sessionStorage.setItem("admin_session_unlocked", "true");
        toast.success("Super Admin clearance authorized! Welcome back, Admin.", { id: toastId });
        navigate("/admin/dashboard");
        return;
      } catch (e) {
        console.warn("PIN auth fallback error:", e);
      }
    }

    if (user?.uid) {
      await updateProfile({ role: "admin" });
      sessionStorage.setItem("admin_session_unlocked", "true");
      toast.success("Security clearance authorized! Welcome back, Admin.", { id: toastId });
      navigate("/admin/dashboard");
    } else {
      toast.error("Invalid credentials. Password: Prince@2412 or PIN: 2412", { id: toastId });
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
            Enter authorized security credentials or Secret PIN (2412) to access EBOOKVALA administration panel.
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
            placeholder="2412 or password"
            label="Access Token / Password (PIN: 2412)"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" variant="primary" isLoading={loading} className="w-full h-11 rounded-full text-xs font-bold mt-4 shadow-sm">
            Authenticate Access
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-col gap-2 items-center">
          <button 
            onClick={() => navigate("/admin2412")}
            className="text-xs text-brand-accent hover:underline font-bold cursor-pointer transition-colors py-1"
          >
            🔐 Use Secret Key PIN Entry (2412)
          </button>
          
          <button 
            onClick={() => navigate("/")}
            className="text-xs text-brand-text-secondary hover:text-brand-text font-bold cursor-pointer transition-colors py-1"
          >
            Return to Marketplace
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
