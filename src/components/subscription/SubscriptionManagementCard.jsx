import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, Calendar, ShieldCheck, Zap, AlertTriangle, ArrowUpRight, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { toast } from "react-hot-toast";
import { dbService } from "../../services/db";
import { useNavigate } from "react-router-dom";
import { IS_FREE_YEAR_ACTIVE } from "../../config/featureFlags";

export const SubscriptionManagementCard = ({ user, onUpgradeClick }) => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRenew, setAutoRenew] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const fetchSub = async () => {
      if (user?.uid) {
        setLoading(true);
        try {
          const sub = await dbService.getUserSubscription(user.uid);
          if (sub) {
            setSubscription(sub);
            setAutoRenew(sub.autoRenew !== false);
          }
        } catch (e) {
          console.error("Subscription load error:", e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSub();
  }, [user]);

  const activePlanName = user?.activePlan || subscription?.planId || "free";
  const planDisplayName = activePlanName.toUpperCase();

  // Days remaining calculation
  const renewDateObj = subscription?.renewDate ? new Date(subscription.renewDate) : null;
  const now = new Date();
  const diffDays = renewDateObj ? Math.max(0, Math.ceil((renewDateObj - now) / (1000 * 60 * 60 * 24))) : 30;

  const handleToggleAutoRenew = async () => {
    if (!subscription?.id) return;
    try {
      const nextVal = await dbService.toggleSubscriptionAutoRenew(subscription.id, autoRenew);
      setAutoRenew(nextVal);
      toast.success(`Auto-renew ${nextVal ? "enabled" : "disabled"}.`);
    } catch (e) {
      toast.error("Failed to update auto-renew setting.");
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;
    setIsCancelling(true);
    try {
      await dbService.cancelUserSubscription(subscription.id);
      setSubscription(prev => ({ ...prev, status: "cancelled", autoRenew: false }));
      setAutoRenew(false);
      setShowCancelConfirm(false);
      toast.success("Subscription cancelled. You retain full access until the end of your billing period.");
    } catch (e) {
      toast.error("Failed to cancel subscription.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (IS_FREE_YEAR_ACTIVE) {
    return (
      <div className="bg-brand-card border border-emerald-500/30 rounded-[24px] p-6 shadow-brand text-left select-none relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-black text-brand-text">1-Year Free Access</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> VIP Active
                </span>
              </div>
              <p className="text-xs text-brand-text-secondary mt-0.5 font-normal">
                All premium features unlocked 100% free for 365 days. Zero paywalls.
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
          <div className="p-4 bg-brand-bg-secondary border border-brand-border rounded-2xl">
            <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider block">Access Status</span>
            <span className="text-xl font-black font-display text-emerald-400 mt-1 block">
              100% Free Pass
            </span>
          </div>

          <div className="p-4 bg-brand-bg-secondary border border-brand-border rounded-2xl">
            <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider block">Duration</span>
            <span className="text-sm font-bold text-brand-text mt-2 block">
              1 Full Year Access
            </span>
          </div>

          <div className="p-4 bg-brand-bg-secondary border border-brand-border rounded-2xl">
            <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider block">Billing Amount</span>
            <span className="text-sm font-bold text-emerald-400 mt-2 block font-mono">
              ₹0 / Entire Year
            </span>
          </div>
        </div>

        {/* Features list */}
        <div className="p-4 bg-brand-bg-secondary/60 border border-brand-border rounded-2xl">
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-2.5">
            Unlocked Features & VIP Perks:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              "Access to 10,000+ Premium eBooks",
              "AI Chat with Book & Chapter Summaries",
              "Unlimited Offline Downloads",
              "AI Flashcards & Quiz Generator",
              "Multi-Device Sync",
              "Zero Ads & Zero Paywalls"
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-brand-text-secondary">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-brand text-left select-none relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 text-brand-accent flex items-center justify-center shrink-0">
            {activePlanName === "pro" ? <Crown className="h-6 w-6" /> : activePlanName === "plus" ? <Sparkles className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-black text-brand-text capitalize">{activePlanName} Plan</span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                subscription?.status === "cancelled" 
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                  : activePlanName === "free"
                  ? "bg-brand-bg-secondary text-brand-text-secondary border border-brand-border"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                {subscription?.status === "cancelled" ? "Cancelling Soon" : activePlanName === "free" ? "Free Tier" : "Active Member"}
              </span>
            </div>
            <p className="text-xs text-brand-text-secondary mt-0.5 font-normal">
              {activePlanName === "free" 
                ? "Basic reading access to open public titles" 
                : `${subscription?.billingCycle || "Monthly"} subscription access`}
            </p>
          </div>
        </div>

        <Button
          onClick={onUpgradeClick || (() => navigate("/#pricing"))}
          variant="primary"
          className="rounded-xl py-2 px-5 text-xs font-bold shrink-0 shadow-brand flex items-center gap-1.5"
        >
          {activePlanName === "free" ? "Upgrade Plan" : "Change Plan"}
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Subscription Metrics & Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
        <div className="p-4 bg-brand-bg-secondary border border-brand-border rounded-2xl">
          <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider block">Days Remaining</span>
          <span className="text-2xl font-black font-display text-brand-text mt-1 block">
            {activePlanName === "free" ? "∞" : `${diffDays} Days`}
          </span>
        </div>

        <div className="p-4 bg-brand-bg-secondary border border-brand-border rounded-2xl">
          <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider block">Next Renewal Date</span>
          <span className="text-sm font-bold text-brand-text mt-2 block">
            {renewDateObj ? renewDateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
          </span>
        </div>

        <div className="p-4 bg-brand-bg-secondary border border-brand-border rounded-2xl">
          <span className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider block">Billing Frequency</span>
          <span className="text-sm font-bold text-brand-text mt-2 block capitalize">
            {subscription?.billingCycle || "Monthly"} (₹{subscription?.amount || (activePlanName === "free" ? 0 : 180)})
          </span>
        </div>
      </div>

      {/* Included Active Features List */}
      <div className="mb-5 p-4 bg-brand-bg-secondary/60 border border-brand-border rounded-2xl">
        <span className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-wider block mb-2.5">
          Active {activePlanName.toUpperCase()} Plan Features & Perks:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {(activePlanName === "pro" ? [
            "Full Audiobooks Library Access",
            "Human Voice AI Narrations",
            "Priority Customer Support 24/7",
            "AI Chat with Book (Unlimited)",
            "AI Flashcards & Quiz Generator",
            "Export Notes & Highlights"
          ] : activePlanName === "plus" ? [
            "AI Chat with Book (Unlimited)",
            "Instant AI Book & Chapter Summaries",
            "AI Flashcards & Quiz Generator",
            "Multi-Language AI Translator",
            "Unlimited Devices Sync",
            "Zero Ads Experience"
          ] : activePlanName === "reader" ? [
            "Unlimited Offline Downloads",
            "Bookmarks, Highlights & Notes Sync",
            "Reading Streak & Goal Tracker",
            "Up to 4 Devices Sync",
            "Zero Ads Experience"
          ] : activePlanName === "starter" ? [
            "Access to 10,000+ Premium eBooks",
            "Zero Ads Experience",
            "Multi-Device Sync (2 Devices)",
            "Standard Reader Customization"
          ] : [
            "Access to 500+ Public eBooks",
            "Standard Web Reader",
            "Single Device Access"
          ]).map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-brand-text-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Controls: Auto Renew & Cancel Subscription */}
      {activePlanName !== "free" && subscription?.status !== "cancelled" && (
        <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          {/* Auto Renew Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAutoRenew}
              className={`relative w-12 h-6 rounded-full p-1 transition-colors ${autoRenew ? "bg-brand-accent" : "bg-brand-border"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${autoRenew ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <span className="font-semibold text-brand-text-secondary">
              Auto-renew subscription ({autoRenew ? "Enabled" : "Disabled"})
            </span>
          </div>

          {/* Cancel Trigger */}
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            Cancel Subscription
          </button>
        </div>
      )}

      {/* Cancellation Confirmation Alert Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
            <h4 className="text-lg font-bold text-brand-text">Cancel Subscription?</h4>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              Are you sure you want to cancel your {activePlanName.toUpperCase()} plan? You will retain access until {renewDateObj ? renewDateObj.toLocaleDateString() : "the end of your billing cycle"}.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowCancelConfirm(false)} className="flex-1 text-xs rounded-xl font-bold">
                Keep Subscription
              </Button>
              <Button onClick={handleCancelSubscription} disabled={isCancelling} className="flex-1 bg-red-500 text-white hover:bg-red-600 text-xs rounded-xl font-bold">
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
