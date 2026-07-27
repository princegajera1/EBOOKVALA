import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, X, Check, ArrowRight, ShieldCheck, Crown } from "lucide-react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";

export const UpgradeUnlockModal = ({ isOpen, onClose, lockedFeature, requiredPlan = "Plus", onUpgradeNow }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const featureTitle = lockedFeature?.title || "Premium Feature Locked";
  const featureDescription = lockedFeature?.description || "This feature requires a Plus or Pro subscription plan to access.";

  const handleUpgradeClick = () => {
    onClose();
    if (onUpgradeNow) {
      onUpgradeNow(requiredPlan.toLowerCase());
    } else {
      navigate("/#pricing");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
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
          className="relative w-full max-w-md bg-brand-card border border-brand-accent/40 rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(59,130,246,0.25)] z-10 text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 h-9 w-9 rounded-full border border-brand-border bg-brand-bg-secondary flex items-center justify-center text-brand-text-secondary hover:text-brand-text hover:border-brand-accent transition-all cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Locked Lock Icon Badge */}
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-brand-accent/15 border-2 border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md relative">
            <Lock className="h-7 w-7" />
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-sm">
              <Sparkles className="h-3.5 w-3.5 fill-black" />
            </div>
          </div>

          {/* Badge */}
          <span className="text-[10px] font-mono font-extrabold text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">
            Requires {requiredPlan} Plan
          </span>

          {/* Header */}
          <h3 className="text-2xl font-display font-black text-brand-text tracking-tight">
            Unlock {featureTitle}
          </h3>
          <p className="text-xs text-brand-text-secondary mt-1.5 leading-relaxed font-normal">
            {featureDescription}
          </p>

          {/* Highlights Box */}
          <div className="my-5 p-4 bg-brand-bg-secondary border border-brand-border rounded-2xl text-left space-y-2 text-xs">
            <p className="text-[11px] font-bold text-brand-text uppercase font-mono tracking-wider mb-2">What you unlock:</p>
            {[
              "AI Chat Assistant for instant Q&A on any chapter",
              "AI Flashcards & Mind Map summary generation",
              "Unlimited offline downloads & multi-device sync",
              "Zero ad interruptions on all 10,000+ titles"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px]">
                <Check className="h-3.5 w-3.5 text-brand-accent shrink-0 mt-0.5" />
                <span className="text-brand-text-secondary font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5">
            <Button
              onClick={handleUpgradeClick}
              variant="primary"
              className="w-full rounded-xl py-3 text-xs font-bold shadow-brand flex items-center justify-center gap-2"
            >
              Upgrade to {requiredPlan} Plan Now
              <ArrowRight className="h-4 w-4" />
            </Button>

            <button
              onClick={onClose}
              className="text-xs font-semibold text-brand-text-secondary hover:text-brand-text transition-colors py-1 cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
