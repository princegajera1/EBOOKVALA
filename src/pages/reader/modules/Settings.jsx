import React, { useState } from "react";
import { Settings as SettingsIcon, Save, User, Bell, Shield, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { toast } from "react-hot-toast";

export const Settings = ({ user, onSaveProfile }) => {
  const [name, setName] = useState(user?.displayName || user?.name || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [saving, setSaving] = useState(false);

  const [notifications, setNotifications] = useState({
    readingAlerts: true,
    weeklyStreak: true,
    newReleases: false
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a valid display name.");
      return;
    }
    
    setSaving(true);
    const toastId = toast.loading("Saving reader profile settings...");
    try {
      if (onSaveProfile) {
        await onSaveProfile({
          displayName: name,
          name: name,
          photoURL
        });
      }
      toast.success("Profile settings updated successfully!", { id: toastId });
    } catch {
      toast.error("Failed to save settings.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text">Reader Settings</h1>
        <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">
          Customize your profile, notifications, and reading dashboard preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Profile Settings form (Left 2 columns) */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-brand-card border border-brand-border/70 rounded-[24px] p-6 shadow-brand flex flex-col gap-5 text-left">
          <div className="border-b border-brand-border/45 pb-3 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-brand-accent shrink-0" />
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Personal Information</h3>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider">Display Name</label>
              <Input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name" 
                className="w-full bg-brand-bg text-xs font-semibold rounded-xl border border-brand-border/60 focus:border-brand-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider">Profile Photo URL</label>
              <Input 
                type="text" 
                value={photoURL} 
                onChange={(e) => setPhotoURL(e.target.value)} 
                placeholder="https://api.dicebear.com/..." 
                className="w-full bg-brand-bg text-xs font-semibold rounded-xl border border-brand-border/60 focus:border-brand-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5 opacity-60">
              <label className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider">Email Address</label>
              <Input 
                type="email" 
                value={user?.email || ""} 
                disabled 
                className="w-full bg-brand-bg-secondary/40 text-xs font-semibold rounded-xl border border-brand-border/40 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="border-t border-brand-border/45 pt-4 mt-2 flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
              className="rounded-full text-[11px] font-bold h-9 px-5 bg-brand-accent flex items-center gap-1.5 hover:scale-102 shadow-sm shrink-0 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        </form>

        {/* Dashboard preferences (Right 1 column) */}
        <div className="bg-brand-card/40 backdrop-blur-md border border-brand-border/60 rounded-[24px] p-6 shadow-brand flex flex-col justify-between gap-5 h-full">
          <div>
            <div className="flex items-center gap-2 border-b border-brand-border/45 pb-2">
              <Bell className="h-4.5 w-4.5 text-brand-accent shrink-0" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Notification Settings</h3>
            </div>
            
            <div className="flex flex-col gap-4 mt-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold text-brand-text leading-tight">Daily Reading Reminders</p>
                  <p className="text-[9px] text-brand-text-secondary mt-0.5 leading-normal">Alerts to maintain streak consistency</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.readingAlerts} 
                  onChange={(e) => setNotifications(prev => ({ ...prev, readingAlerts: e.target.checked }))} 
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent h-4 w-4 cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold text-brand-text leading-tight">Weekly Summary Alerts</p>
                  <p className="text-[9px] text-brand-text-secondary mt-0.5 leading-normal">Receive details of pages read weekly</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.weeklyStreak} 
                  onChange={(e) => setNotifications(prev => ({ ...prev, weeklyStreak: e.target.checked }))} 
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent h-4 w-4 cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold text-brand-text leading-tight">New Release Digests</p>
                  <p className="text-[9px] text-brand-text-secondary mt-0.5 leading-normal">Updates when authors publish new books</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.newReleases} 
                  onChange={(e) => setNotifications(prev => ({ ...prev, newReleases: e.target.checked }))} 
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent h-4 w-4 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <div className="bg-brand-bg-secondary/40 border border-brand-border/40 p-3 rounded-[16px] text-left">
            <p className="text-[10px] font-bold text-brand-text flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-brand-accent shrink-0" />
              <span>Data Protection</span>
            </p>
            <p className="text-[9px] text-brand-text-secondary mt-1 leading-relaxed">
              Your reading profile data is fully encrypted and stored securely. EbookVala does not sell nor share your personal metadata.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
