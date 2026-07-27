import React from "react";
import { PricingSection } from "../components/sections/PricingSection";
import { FadeUp } from "../components/common/FadeUp";
import { ShieldCheck, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const Pricing = () => {
  return (
    <div className="flex flex-col bg-brand-bg transition-colors duration-300 min-h-screen pt-8 pb-16">
      <PricingSection />

      {/* FAQ Banner / Assurance Section */}
      <section className="max-w-4xl mx-auto px-6 mt-8 w-full text-center">
        <FadeUp>
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-6 sm:p-8 shadow-brand flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-brand-text font-display">Have questions about plans?</h4>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Check out our FAQ page or speak directly with our support team.
                </p>
              </div>
            </div>
            <Link to="/faq" className="shrink-0">
              <button className="px-5 py-2.5 bg-brand-bg border border-brand-border rounded-full text-xs font-bold text-brand-text hover:bg-brand-bg-secondary transition-all">
                Visit Help & FAQ
              </button>
            </Link>
          </div>
        </FadeUp>
      </section>
    </div>
  );
};

export default Pricing;
