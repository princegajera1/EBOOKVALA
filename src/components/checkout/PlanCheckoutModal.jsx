import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, ShieldCheck, Tag, CreditCard, Sparkles, ArrowRight, 
  ChevronLeft, AlertCircle, Building2, MapPin, Phone, Mail, User 
} from "lucide-react";
import { Button } from "../ui/Button";
import { toast } from "react-hot-toast";

// Coupons Database Table (Static + Dynamic Validations)
export const VALID_COUPONS = {
  "LAUNCH50": { code: "LAUNCH50", discountType: "percentage", discountValue: 50, description: "50% Launch Discount" },
  "WELCOME20": { code: "WELCOME20", discountType: "percentage", discountValue: 20, description: "20% Welcome Offer" },
  "EBOOK10": { code: "EBOOK10", discountType: "percentage", discountValue: 10, description: "10% Reader Discount" },
  "PRO100": { code: "PRO100", discountType: "flat", discountValue: 100, description: "₹100 Flat Discount" }
};

export const PlanCheckoutModal = ({ isOpen, onClose, plan, user, onProceedToPayment, onFreeActivation }) => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [step, setStep] = useState(1); // 1: Plan Details, 2: Billing & Coupon

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");
  const [stateName, setStateName] = useState("Gujarat");
  const [gstin, setGstin] = useState("");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Sync user defaults when modal opens
  useEffect(() => {
    if (user) {
      setFullName(user.displayName || user.name || "");
      setEmail(user.email || "");
    }
    if (plan?.billingCycle) {
      setBillingCycle(plan.billingCycle);
    }
  }, [user, plan]);

  if (!isOpen || !plan) return null;

  // Calculate pricing breakdown
  const rawPrice = billingCycle === "yearly" ? plan.yearlyPrice * 12 : plan.monthlyPrice;
  const isFreePlan = plan.id === "free" || rawPrice === 0;

  // Coupon calculation logic
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = Math.round((rawPrice * appliedCoupon.discountValue) / 100);
    } else if (appliedCoupon.discountType === "flat") {
      discountAmount = Math.min(appliedCoupon.discountValue, rawPrice);
    }
  }

  const subtotalAfterDiscount = Math.max(0, rawPrice - discountAmount);
  const gstAmount = isFreePlan ? 0 : Math.round(subtotalAfterDiscount * 0.18); // 18% GST for India billing
  const finalTotal = subtotalAfterDiscount + gstAmount;

  // Apply Coupon Handler
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");

    const cleanedCode = couponCode.trim().toUpperCase();
    if (!cleanedCode) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const matched = VALID_COUPONS[cleanedCode];
    if (matched) {
      setAppliedCoupon(matched);
      toast.success(`Coupon "${matched.code}" applied! Saved ₹${discountAmount || matched.discountValue}`);
    } else {
      setCouponError("Invalid or expired coupon code. Try LAUNCH50 or WELCOME20.");
      toast.error("Invalid coupon code.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed.");
  };

  // Form Submit Handler
  const handleProceed = (e) => {
    e.preventDefault();

    if (isFreePlan) {
      if (onFreeActivation) {
        onFreeActivation(plan);
      }
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    // Step 2 Validation
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast.error("Please fill in your name, email, and phone number.");
      return;
    }

    const billingData = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country,
      state: stateName,
      gstin: gstin.trim(),
      billingCycle,
      rawPrice,
      discountAmount,
      gstAmount,
      finalTotal,
      appliedCoupon: appliedCoupon ? appliedCoupon.code : null
    };

    if (onProceedToPayment) {
      onProceedToPayment(plan, billingData);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-brand-card border border-brand-border rounded-[28px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-10 text-left max-h-[90vh] overflow-y-auto scrollbar-thin"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 h-9 w-9 rounded-full border border-brand-border/80 bg-brand-bg-secondary flex items-center justify-center text-brand-text-secondary hover:text-brand-text hover:border-brand-accent transition-all cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Step Indicator Header */}
          <div className="flex items-center gap-2 mb-6">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="h-8 w-8 rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer mr-1"
                aria-label="Back to step 1"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <span className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-widest block">
                Step {step} of 2 — {step === 1 ? "Plan Review" : "Billing Details"}
              </span>
              <h3 className="text-2xl font-display font-black text-brand-text tracking-tight mt-0.5">
                {step === 1 ? `Review ${plan.name} Plan` : "Enter Billing Information"}
              </h3>
            </div>
          </div>

          {/* STEP 1: PLAN DETAILS & CYCLE SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Selected Plan Summary Banner */}
              <div className="p-5 bg-brand-bg-secondary border border-brand-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-brand-text font-display">{plan.name} Plan</span>
                    {plan.popular && (
                      <span className="text-[9px] font-extrabold text-white bg-brand-accent px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-text-secondary mt-1">{plan.tagline}</p>
                </div>

                {!isFreePlan && (
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-2xl font-black font-display text-brand-text">₹{rawPrice}</span>
                    <span className="text-xs text-brand-text-secondary"> / {billingCycle}</span>
                  </div>
                )}
              </div>

              {/* Monthly / Yearly Billing Toggle */}
              {!isFreePlan && (
                <div className="flex items-center justify-between p-3.5 bg-brand-bg border border-brand-border rounded-2xl">
                  <span className="text-xs font-bold text-brand-text">Billing Cycle:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        billingCycle === "monthly" ? "bg-brand-accent text-white" : "text-brand-text-secondary hover:text-brand-text"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("yearly")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        billingCycle === "yearly" ? "bg-brand-accent text-white" : "text-brand-text-secondary hover:text-brand-text"
                      }`}
                    >
                      Yearly
                      <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.2 rounded-full font-extrabold">Save 20%</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Feature Checklist */}
              <div>
                <h4 className="text-xs font-bold text-brand-text uppercase font-mono tracking-wider mb-3">Included Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs">
                      <div className="h-4.5 w-4.5 rounded-full bg-brand-accent/15 text-brand-accent flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="text-brand-text-secondary font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-border flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose} className="rounded-xl text-xs font-bold">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleProceed} className="rounded-xl text-xs font-bold px-6 shadow-brand flex items-center gap-2">
                  {isFreePlan ? "Activate Free Plan" : "Continue to Billing"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: BILLING FORM & LIVE COUPON */}
          {step === 2 && (
            <form onSubmit={handleProceed} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Column: Billing Details Form */}
                <div className="md:col-span-7 space-y-3.5">
                  <h4 className="text-xs font-bold text-brand-text uppercase font-mono tracking-wider">Subscriber Information</h4>

                  <div>
                    <label className="text-[11px] font-bold text-brand-text-secondary block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary/60" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full bg-brand-bg border border-brand-border pl-10 pr-4 py-2 text-xs rounded-xl text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-brand-text-secondary block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary/60" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-brand-bg border border-brand-border pl-10 pr-4 py-2 text-xs rounded-xl text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-brand-text-secondary block mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary/60" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-brand-bg border border-brand-border pl-10 pr-4 py-2 text-xs rounded-xl text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-brand-text-secondary block mb-1">Country</label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border px-3 py-2 text-xs rounded-xl text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-brand-text-secondary block mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border px-3 py-2 text-xs rounded-xl text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-brand-text-secondary block mb-1">GSTIN / Tax ID (Optional)</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-secondary/60" />
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="24AAAAA0000A1Z5"
                        className="w-full bg-brand-bg border border-brand-border pl-10 pr-4 py-2 text-xs rounded-xl text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary & Coupon Code Box */}
                <div className="md:col-span-5 flex flex-col justify-between bg-brand-bg-secondary border border-brand-border rounded-2xl p-4">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-brand-text uppercase font-mono tracking-wider">Order Summary</h4>

                    {/* Live Coupon Box */}
                    <div>
                      <label className="text-[11px] font-bold text-brand-text-secondary block mb-1.5">Have a Coupon?</label>
                      {!appliedCoupon ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. LAUNCH50"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 bg-brand-bg border border-brand-border px-3 py-1.5 text-xs rounded-xl text-brand-text uppercase tracking-wider focus:outline-none focus:border-brand-accent"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="bg-brand-accent text-white px-3 py-1.5 text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <Tag className="h-3.5 w-3.5" />
                            <span>{appliedCoupon.code} ({appliedCoupon.description})</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-brand-text-secondary hover:text-red-400 font-bold text-[10px]"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-[10px] text-red-400 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {couponError}
                        </p>
                      )}
                    </div>

                    {/* Price Line Items */}
                    <div className="space-y-2 pt-3 border-t border-brand-border text-xs">
                      <div className="flex justify-between text-brand-text-secondary">
                        <span>{plan.name} Plan ({billingCycle})</span>
                        <span>₹{rawPrice}</span>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>Discount ({appliedCoupon.code})</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-brand-text-secondary">
                        <span>GST (18%)</span>
                        <span>₹{gstAmount}</span>
                      </div>

                      <div className="flex justify-between text-brand-text font-extrabold text-sm pt-2 border-t border-brand-border/80">
                        <span>Total Payable</span>
                        <span className="text-brand-accent">₹{finalTotal}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full rounded-xl py-3 text-xs font-bold mt-6 shadow-brand flex items-center justify-center gap-2"
                  >
                    Proceed to Payment (₹{finalTotal})
                    <CreditCard className="h-4 w-4" />
                  </Button>
                </div>

              </div>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
