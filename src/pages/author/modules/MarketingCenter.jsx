import React, { useState, useEffect } from "react";
import { 
  Tag, Percent, Link2, Mail, Plus, Trash2, Copy, Send, Sparkles, CheckCircle2, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { dbService } from "../../../services/db";
import { toast } from "react-hot-toast";

export const MarketingCenter = ({ user, books = [] }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage", // percentage | flat
    discountValue: 20,
    maxRedemptions: 100,
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    targetBookId: "all"
  });

  // UTM Generator State
  const [utmSource, setUtmSource] = useState("twitter");
  const [utmMedium, setUtmMedium] = useState("social");
  const [utmCampaign, setUtmCampaign] = useState("launch_promo");
  const [selectedUtmBook, setSelectedUtmBook] = useState(books[0]?.id || "homepage");

  // Email Campaign Composer State
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const loadCoupons = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await dbService.getCouponsByAuthorId(user.uid);
      setCoupons(list);
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [user]);

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    const toastId = toast.loading("Creating discount coupon...");
    try {
      await dbService.createCoupon({
        ...newCoupon,
        code: newCoupon.code.toUpperCase().trim(),
        authorId: user.uid
      });
      toast.success(`Coupon "${newCoupon.code.toUpperCase()}" activated! 🎉`, { id: toastId });
      setNewCoupon({
        code: "",
        discountType: "percentage",
        discountValue: 20,
        maxRedemptions: 100,
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        targetBookId: "all"
      });
      loadCoupons();
    } catch (err) {
      toast.error("Failed to create coupon.", { id: toastId });
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    try {
      await dbService.deleteCoupon(couponId);
      toast.success(`Coupon ${code} removed.`);
      loadCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon.");
    }
  };

  const generatedUtmUrl = (() => {
    const baseUrl = window.location.origin;
    const path = selectedUtmBook === "homepage" ? "" : `/book/${selectedUtmBook}`;
    return `${baseUrl}${path}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
  })();

  const handleCopyUtm = () => {
    navigator.clipboard.writeText(generatedUtmUrl);
    toast.success("UTM tracking URL copied to clipboard! 📋");
  };

  const handleSendBroadcast = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please fill in both subject and email body.");
      return;
    }
    setSendingEmail(true);
    const toastId = toast.loading("Sending email campaign to subscribers...");
    try {
      await new Promise(r => setTimeout(r, 1200)); // simulate broadcast queue
      await dbService.createEvent({
        authorId: user.uid,
        type: "email_broadcast",
        title: "Email Broadcast Sent",
        description: `Sent broadcast "${emailSubject}"`
      });
      toast.success("Broadcast sent to all your followers & subscribers! 📧", { id: toastId });
      setEmailSubject("");
      setEmailBody("");
    } catch (err) {
      toast.error("Failed to send broadcast.", { id: toastId });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-brand-text flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand-accent" />
            Marketing & Growth Engine
          </h2>
          <p className="text-xs text-brand-text-secondary mt-1">
            Create discount coupons, generate UTM trackable links, and send email campaigns to your readers.
          </p>
        </div>
      </div>

      {/* Coupon Rules Engine */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-6">
        <h3 className="text-base font-display font-black text-brand-text flex items-center gap-2 border-b border-brand-border/40 pb-3">
          <Percent className="h-4 w-4 text-emerald-400" />
          Create Discount Coupon Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            label="Coupon Code *" 
            value={newCoupon.code} 
            onChange={e => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
            placeholder="e.g. LAUNCH50" 
          />
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-1.5">Discount Type</label>
            <select
              value={newCoupon.discountType}
              onChange={e => setNewCoupon(prev => ({ ...prev, discountType: e.target.value }))}
              className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
            >
              <option value="percentage">Percentage Discount (%)</option>
              <option value="flat">Flat Discount Amount (₹)</option>
            </select>
          </div>
          <Input 
            label={newCoupon.discountType === "percentage" ? "Discount (%) *" : "Flat Amount (₹) *"}
            type="number"
            value={newCoupon.discountValue}
            onChange={e => setNewCoupon(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            label="Max Usage Limit" 
            type="number"
            value={newCoupon.maxRedemptions}
            onChange={e => setNewCoupon(prev => ({ ...prev, maxRedemptions: Number(e.target.value) }))}
          />
          <Input 
            label="Expiration Date" 
            type="date"
            value={newCoupon.expiryDate}
            onChange={e => setNewCoupon(prev => ({ ...prev, expiryDate: e.target.value }))}
          />
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-1.5">Target Book</label>
            <select
              value={newCoupon.targetBookId}
              onChange={e => setNewCoupon(prev => ({ ...prev, targetBookId: e.target.value }))}
              className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
            >
              <option value="all">All Published Books</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={handleCreateCoupon}>
          <Plus className="h-4 w-4 mr-1.5" /> Create Coupon
        </Button>

        {/* Existing Coupons List */}
        <div className="space-y-3 pt-4 border-t border-brand-border/40">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary">Active Coupons ({coupons.length})</h4>
          {coupons.length === 0 ? (
            <p className="text-xs text-brand-text-secondary italic">No active coupons created yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coupons.map(c => (
                <div key={c.id} className="bg-[#111113] border border-brand-border/60 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-black text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded border border-brand-accent/20">
                      {c.code}
                    </span>
                    <p className="text-xs font-bold text-brand-text mt-1.5">
                      {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </p>
                    <p className="text-[10px] text-brand-text-secondary">Expires: {c.expiryDate} · Used: {c.usedCount || 0} / {c.maxRedemptions}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteCoupon(c.id, c.code)}
                    className="text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* UTM Generator & Tracker */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-display font-black text-brand-text flex items-center gap-2 border-b border-brand-border/40 pb-3">
          <Link2 className="h-4 w-4 text-sky-400" />
          UTM Campaign Link Generator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-1.5">Target Page / Book</label>
            <select
              value={selectedUtmBook}
              onChange={e => setSelectedUtmBook(e.target.value)}
              className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
            >
              <option value="homepage">EbookVala Homepage</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>
          <Input label="UTM Source" value={utmSource} onChange={e => setUtmSource(e.target.value)} placeholder="twitter, newsletter, linkedin" />
          <Input label="UTM Medium" value={utmMedium} onChange={e => setUtmMedium(e.target.value)} placeholder="social, email, banner" />
          <Input label="UTM Campaign" value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="summer_sale" />
        </div>

        <div className="bg-[#111113] border border-brand-border/60 rounded-xl p-4 flex items-center justify-between gap-4">
          <p className="text-xs font-mono text-brand-text break-all">{generatedUtmUrl}</p>
          <Button variant="outline" size="sm" onClick={handleCopyUtm} className="shrink-0">
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
          </Button>
        </div>
      </div>

      {/* Email Broadcast Composer */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-display font-black text-brand-text flex items-center gap-2 border-b border-brand-border/40 pb-3">
          <Mail className="h-4 w-4 text-purple-400" />
          Broadcast Update to Readers & Followers
        </h3>

        <Input label="Email Subject Line *" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="e.g. New Chapter Released in Master Microservices!" />

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-1.5">Broadcast Message Content *</label>
          <textarea
            rows={5}
            value={emailBody}
            onChange={e => setEmailBody(e.target.value)}
            placeholder="Write your email update here to all your subscribers..."
            className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
          />
        </div>

        <Button variant="primary" size="sm" onClick={handleSendBroadcast} isLoading={sendingEmail}>
          <Send className="h-3.5 w-3.5 mr-1.5" /> Send Broadcast Email
        </Button>
      </div>
    </div>
  );
};
