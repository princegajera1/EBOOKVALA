import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, ShieldCheck, Crown, CreditCard } from "lucide-react";
import { Button } from "../ui/Button";
import { toast } from "react-hot-toast";
import { useApp } from "../../store/AppContext";
import { initiateRazorpayCheckout } from "../../services/razorpay";

export const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    tagline: "Basic reading access to open public titles with ad support.",
    cta: "Start Free",
    ctaVariant: "ghost",
    popular: false,
    icon: ShieldCheck,
    features: [
      "Access to 500+ Public eBooks",
      "Standard Web Reader",
      "Ad-Supported Experience",
      "Single Device Access"
    ]
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 50,
    yearlyPrice: 40,
    tagline: "Full library access without any interruptions or ads.",
    cta: "Get Starter",
    ctaVariant: "ghost",
    popular: false,
    icon: Zap,
    features: [
      "Everything in Free +",
      "Access to 10,000+ Premium eBooks",
      "Zero Ads Experience",
      "Multi-Device Sync (2 Devices)",
      "Standard Reader Customization",
      "Community Access"
    ]
  },
  {
    id: "reader",
    name: "Reader",
    monthlyPrice: 100,
    yearlyPrice: 80,
    tagline: "Unlimited reading with offline downloads and smart annotations.",
    cta: "Get Reader",
    ctaVariant: "ghost",
    popular: false,
    icon: ShieldCheck,
    features: [
      "Everything in Starter +",
      "Unlimited Offline Downloads",
      "Bookmarks, Highlights & Notes Sync",
      "Reading Streak & Goal Tracker",
      "Up to 4 Devices Sync"
    ]
  },
  {
    id: "plus",
    name: "Plus",
    monthlyPrice: 180,
    yearlyPrice: 144,
    tagline: "Supercharged reading experience powered by advanced AI assistants.",
    cta: "Start Free Trial",
    ctaVariant: "primary",
    popular: true,
    badgeText: "MOST POPULAR",
    icon: Sparkles,
    features: [
      "Everything in Reader +",
      "AI Chat with Book (Unlimited)",
      "Instant AI Book & Chapter Summaries",
      "AI Flashcards & Quiz Generator",
      "Multi-Language AI Translator",
      "Unlimited Devices Sync"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 300,
    yearlyPrice: 240,
    tagline: "The complete knowledge suite with audiobooks and VIP benefits.",
    cta: "Get Pro Access",
    ctaVariant: "ghost",
    popular: false,
    icon: Crown,
    features: [
      "Everything in Plus +",
      "Full Audiobooks Library Access",
      "Human Voice AI Narrations",
      "Priority Customer Support 24/7",
      "Early Access to New Releases",
      "Export Notes & Highlights to Notion/Obsidian"
    ]
  }
];

export const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
  const { user, isAuthenticated } = useApp();
  const navigate = useNavigate();

  const handlePlanSubscribe = async (plan) => {
    if (plan.id === "free" || (plan.monthlyPrice === 0 && plan.yearlyPrice === 0)) {
      navigate("/register");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login or register to subscribe to a plan.");
      navigate("/login");
      return;
    }

    const planPrice = billingCycle === "yearly" ? plan.yearlyPrice * 12 : plan.monthlyPrice;
    const toastId = toast.loading(`Preparing ${plan.name} Plan checkout via Razorpay...`);

    try {
      await initiateRazorpayCheckout({
        amount: planPrice,
        title: `EbookVala ${plan.name} Plan`,
        description: `Subscription: ${plan.name} Plan (${billingCycle})`,
        user: user,
        onSuccess: (response) => {
          toast.success(`Successfully subscribed to ${plan.name} Plan! Payment ID: ${response.razorpay_payment_id}`, { id: toastId });
          navigate("/dashboard");
        },
        onCancel: () => {
          toast.error("Subscription payment cancelled.", { id: toastId });
        }
      });
    } catch (err) {
      if (err.message !== "Payment cancelled by user") {
        toast.error(err.message || "Payment failed", { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-14 select-none text-left">
      {/* Header & Billing Cycle Toggle */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-mono text-brand-accent font-bold tracking-widest uppercase bg-brand-accent/10 border border-brand-accent/20 px-3.5 py-1.5 rounded-full inline-block">
          FLEXIBLE PLANS
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-brand-text mt-4 tracking-tight">
          Invest in Your Mind. Choose Your Plan.
        </h2>
        <p className="text-xs sm:text-base text-brand-text-secondary mt-3 font-normal leading-relaxed">
          Flexible pricing tailored for students, avid readers, and high-performance teams. Cancel anytime.
        </p>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-xs sm:text-sm font-bold transition-colors ${billingCycle === "monthly" ? "text-brand-text" : "text-brand-text-secondary"}`}>
            Monthly Billing
          </span>

          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 bg-brand-card border border-brand-border rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer"
            aria-label="Toggle Billing Cycle"
          >
            <motion.div
              animate={{ x: billingCycle === "yearly" ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-5 h-5 bg-brand-accent rounded-full shadow-md"
            />
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-xs sm:text-sm font-bold transition-colors ${billingCycle === "yearly" ? "text-brand-text" : "text-brand-text-secondary"}`}>
              Yearly Billing
            </span>
            <span className="text-[10px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* 5 Pricing Cards (Responsive Grid / Desktop 5 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
        {PRICING_PLANS.map((plan, idx) => {
          const Icon = plan.icon;
          const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className={`relative bg-brand-card border rounded-[24px] p-5 shadow-brand flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-brand-accent ring-4 ring-brand-accent/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-gradient-to-b from-brand-accent/5 via-brand-card to-brand-card"
                  : "border-brand-border hover:border-brand-accent/40"
              }`}
            >
              {/* Highlight Badge for Popular Plan */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-accent text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 z-20 whitespace-nowrap">
                  <Sparkles className="h-3 w-3 fill-white text-white" />
                  {plan.badgeText}
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold font-display text-brand-text">{plan.name}</span>
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center border ${plan.popular ? "bg-brand-accent/10 text-brand-accent border-brand-accent/30" : "bg-brand-bg-secondary text-brand-text-secondary border-brand-border"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <p className="text-[11px] text-brand-text-secondary leading-normal mb-4 min-h-[36px]">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-4 border-b border-brand-border">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-display text-brand-text">
                      ₹{price}
                    </span>
                    <span className="text-xs font-semibold text-brand-text-secondary">
                      /month
                    </span>
                  </div>
                  {billingCycle === "yearly" && price > 0 && (
                    <p className="text-[10px] font-semibold text-brand-success mt-1">
                      Billed ₹{price * 12}/year
                    </p>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.popular ? "bg-brand-accent/15 text-brand-accent" : "bg-brand-success/15 text-brand-success"}`}>
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className={`leading-snug text-[11px] ${fIdx === 0 && feature.includes("Everything in") ? "font-bold text-brand-text" : "text-brand-text-secondary"}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="w-full mt-auto pt-2">
                <Button
                  onClick={() => handlePlanSubscribe(plan)}
                  variant={plan.popular ? "primary" : "ghost"}
                  className={`w-full py-2.5 text-xs font-bold rounded-full justify-center transition-all flex items-center gap-1.5 ${
                    !plan.popular ? "border border-brand-border text-brand-text hover:bg-brand-bg-secondary" : ""
                  }`}
                >
                  {price > 0 && <CreditCard className="h-3.5 w-3.5 text-brand-accent" />}
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;
