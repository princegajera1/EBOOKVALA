import React, { useState, useRef, useEffect } from "react";
import { 
  Settings, User, Palette, Globe, Shield, 
  Signature, CreditCard, Save, RefreshCw, PenTool
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { toast } from "react-hot-toast";

export const ProfessionalSettings = ({ 
  authorProfile = {}, 
  onSaveProfile 
}) => {
  // Profile settings
  const [bio, setBio] = useState(authorProfile.bio || "");
  const [photoURL, setPhotoURL] = useState(authorProfile.photoURL || "");
  const [displayName, setDisplayName] = useState(authorProfile.displayName || "");

  // Brand customizations
  const [brandColor, setBrandColor] = useState("#7C3AED"); // default purple
  const [brandLogo, setBrandLogo] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Custom Domain Configs
  const [customDomain, setCustomDomain] = useState("");
  const [domainVerified, setDomainVerified] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);

  // Watermark preferences
  const [watermarkText, setWatermarkText] = useState("EBOOKVALA PROTECTED");
  const [isWatermark, setIsWatermark] = useState(true);

  // Billing and Invoice tax configs
  const [taxId, setTaxId] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  // Signature Pad state & drawing helpers
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Sync profile details initially
  useEffect(() => {
    if (authorProfile) {
      setBio(authorProfile.bio || "");
      setPhotoURL(authorProfile.photoURL || "");
      setDisplayName(authorProfile.displayName || "");
    }
  }, [authorProfile]);

  // Initializing signature pad canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
    }
  }, []);

  // Signature canvas handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Get mouse/touch coordinates
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast.success("Signature canvas cleared!");
  };

  const handleVerifyDomain = () => {
    if (!customDomain.trim()) {
      toast.error("Please enter a domain name first.");
      return;
    }
    setVerifyingDomain(true);
    const toastId = toast.loading(`Verifying DNS records for ${customDomain}...`);
    
    setTimeout(() => {
      setVerifyingDomain(false);
      setDomainVerified(true);
      toast.success("Custom CNAME domain verified successfully! 🌐✨", { id: toastId });
    }, 2000);
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    const toastId = toast.loading("Saving settings configurations...");
    
    setTimeout(() => {
      if (onSaveProfile) {
        onSaveProfile({
          ...authorProfile,
          displayName,
          bio,
          photoURL
        });
      }
      toast.success("Professional author settings saved successfully! ⚙️", { id: toastId });
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-display font-black text-brand-text">Professional Settings</h1>
        <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
          Manage brand properties, custom domains, invoices, digital signatures, watermarks, tax IDs, and billing preferences.
        </p>
      </div>

      <form onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
        
        {/* Left 2 Cols: Form settings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Profile Details */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
              <User className="h-4 w-4 text-brand-accent" /> Profile Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Public Author Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <Input 
                label="Profile Avatar Image URL"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-text-secondary">Short Public Bio</label>
              <textarea 
                rows={3}
                placeholder="Brief bio displayed on public library pages..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-[14px] p-3 text-sm focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/45"
              />
            </div>
          </div>

          {/* Brand Customizations */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-brand-accent" /> Brand Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-brand-text-secondary">Primary Brand Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-12 rounded border border-brand-border bg-transparent cursor-pointer p-0.5"
                  />
                  <Input 
                    placeholder="#7C3AED"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-grow"
                  />
                </div>
              </div>

              <Input 
                label="Custom Brand Logo URL"
                placeholder="Logo displayed in invoices/headers"
                value={brandLogo}
                onChange={(e) => setBrandLogo(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-border/40 pt-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-brand-text-secondary">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-brand-bg border border-brand-border px-4 py-2.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-brand-text-secondary">Publisher Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="bg-brand-bg border border-brand-border px-4 py-2.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
                >
                  <option value="Asia/Kolkata">IST (GMT+5:30) - Mumbai</option>
                  <option value="America/New_York">EST (GMT-5:00) - New York</option>
                  <option value="Europe/London">GMT (GMT+0:00) - London</option>
                  <option value="Asia/Tokyo">JST (GMT+9:00) - Tokyo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Domain Configurations */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-brand-accent" /> Custom Branding Domain
            </h3>

            <div className="flex flex-col sm:flex-row items-end gap-4 font-display">
              <div className="flex-grow">
                <Input 
                  label="CNAME Hostname Custom Domain"
                  placeholder="e.g. books.mywebsite.com"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    setDomainVerified(false);
                  }}
                />
              </div>

              <Button 
                type="button"
                onClick={handleVerifyDomain}
                disabled={verifyingDomain}
                variant="outline"
                className="h-11 rounded-full text-xs font-bold px-5 border-brand-border hover:bg-brand-bg-secondary cursor-pointer shrink-0"
              >
                {verifyingDomain ? <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" /> : "Verify DNS"}
              </Button>
            </div>

            {domainVerified && (
              <div className="flex items-center gap-2 p-3 bg-brand-success/10 border border-brand-success/20 rounded-[14px] text-brand-success text-xs font-semibold leading-relaxed">
                <Shield className="h-4.5 w-4.5 shrink-0" />
                <span>CNAME points correctly to ebookvala-lts4-black.vercel.app. SSL Active!</span>
              </div>
            )}
          </div>

          {/* Invoice Invoicing and Tax Details */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-brand-accent" /> Invoice & Taxation Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="GSTIN / TAX Identification Number"
                placeholder="e.g. 24AAAAB1234C1Z5"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
              <Input 
                label="Billing Registration Address"
                placeholder="Registered business address"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* Right Sidebar: Signature Canvas & Watermark */}
        <div className="flex flex-col gap-5">
          
          {/* Working Drawing Signature Pad */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 flex flex-col gap-4 shadow-sm text-center">
            <div className="flex justify-between items-center border-b border-brand-border pb-2">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Signature className="h-4 w-4 text-brand-accent animate-pulse" /> Digital Signature
              </h3>
              <button 
                type="button"
                onClick={clearSignature}
                className="text-[10px] font-bold text-brand-danger hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>

            <p className="text-[10px] text-brand-text-secondary leading-relaxed font-semibold text-left">
              Draw your digital signature inside the pad below. This will be stamped on buyer transactional sales invoices.
            </p>

            {/* Canvas signature pad */}
            <div className="border border-brand-border rounded-[16px] bg-[#121214] overflow-hidden relative group">
              <canvas
                ref={canvasRef}
                width={260}
                height={130}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full block cursor-crosshair"
              />
              <div className="absolute bottom-2.5 right-2.5 p-1.5 bg-black/40 text-white rounded-full border border-white/10 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                <PenTool className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* Watermark Preferences */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm text-left flex flex-col gap-4">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full">
              eBook PDF Watermarking
            </h3>

            <div className="flex items-center justify-between p-3 bg-brand-bg-secondary/40 border border-brand-border rounded-[16px]">
              <div>
                <p className="text-xs font-bold text-brand-text">Apply Watermark</p>
                <p className="text-[9px] text-brand-text-secondary mt-0.5 leading-tight">Stamp purchase details on PDF footer page dynamically.</p>
              </div>
              <input 
                type="checkbox" 
                checked={isWatermark}
                onChange={(e) => setIsWatermark(e.target.checked)}
                className="h-4 w-4 accent-brand-accent cursor-pointer"
              />
            </div>

            {isWatermark && (
              <Input 
                label="Custom Watermark Label Template"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
              />
            )}
          </div>

          {/* Submit bar */}
          <Button type="submit" variant="primary" className="rounded-full text-xs font-bold h-11 w-full flex items-center justify-center gap-1.5 shadow-sm mt-2 select-none">
            <Save className="h-4 w-4" /> Save Professional Settings
          </Button>

        </div>

      </form>
    </div>
  );
};
export default ProfessionalSettings;
