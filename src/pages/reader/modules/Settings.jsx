import React, { useState } from "react";
import { Settings as SettingsIcon, Save, User, Bell, Shield, Mail, CheckCircle2, BookOpen, KeyRound, Download, Moon, Sun, Sliders } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { toast } from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export const Settings = ({ user, onSaveProfile }) => {
  const [name, setName] = useState(user?.displayName || user?.name || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [bio, setBio] = useState(user?.bio || "Avid tech and business reader on EBOOKVALA.");
  const [dailyGoalMins, setDailyGoalMins] = useState(user?.dailyGoalMins || 15);
  const [defaultReaderTheme, setDefaultReaderTheme] = useState(user?.readerTheme || "dark");
  const [fontFamily, setFontFamily] = useState(user?.fontFamily || "sans");
  const [saving, setSaving] = useState(false);

  const [notifications, setNotifications] = useState(() => ({
    readingAlerts: user?.notificationSettings?.readingAlerts ?? true,
    weeklyStreak: user?.notificationSettings?.weeklyStreak ?? true,
    newReleases: user?.notificationSettings?.newReleases ?? true
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a valid display name.");
      return;
    }
    
    setSaving(true);
    const toastId = toast.loading("Saving reader settings...");
    try {
      if (onSaveProfile) {
        await onSaveProfile({
          displayName: name,
          name: name,
          photoURL,
          bio,
          dailyGoalMins: Number(dailyGoalMins),
          readerTheme: defaultReaderTheme,
          fontFamily,
          notificationSettings: notifications
        });
      }
      toast.success("Settings updated successfully! ⚙️", { id: toastId });
    } catch {
      toast.error("Failed to save settings.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      toast.error("No account email found.");
      return;
    }
    const toastId = toast.loading("Sending password reset email...");
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success(`Password reset email sent to ${user.email}! 📧`, { id: toastId });
    } catch (err) {
      toast.error(err.message || "Failed to send reset email.", { id: toastId });
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `ebookvala_user_data_${user?.uid || "profile"}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    toast.success("Account data exported successfully!");
  };

  return (
    <div className="flex flex-col gap-6 text-left select-none font-sans transition-colors duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-black text-brand-text">Reader Settings</h1>
        <p className="text-[11px] text-brand-text-secondary mt-0.5 font-semibold">
          Customize your profile, reading preferences, notifications, and privacy options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main Settings Form (Left 2 columns) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Personal Profile */}
          <div className="bg-brand-card border border-brand-border/70 rounded-[24px] p-6 shadow-brand flex flex-col gap-5 text-left">
            <div className="border-b border-brand-border/45 pb-3 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-brand-accent shrink-0" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Personal Profile</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider">Bio / Motto</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Share a short bio..."
                  className="w-full bg-brand-bg text-xs font-semibold rounded-xl p-3 border border-brand-border/60 focus:border-brand-accent focus:outline-none text-brand-text"
                />
              </div>

              <div className="flex flex-col gap-1.5 opacity-70">
                <label className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider">Email Address</label>
                <Input 
                  type="email" 
                  value={user?.email || ""} 
                  disabled 
                  className="w-full bg-brand-bg-secondary/40 text-xs font-semibold rounded-xl border border-brand-border/40 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Reading Preferences */}
          <div className="bg-brand-card border border-brand-border/70 rounded-[24px] p-6 shadow-brand flex flex-col gap-5 text-left">
            <div className="border-b border-brand-border/45 pb-3 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-brand-accent shrink-0" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Reading Preferences</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider">Daily Goal (Minutes)</label>
                <select
                  value={dailyGoalMins}
                  onChange={(e) => setDailyGoalMins(Number(e.target.value))}
                  className="w-full bg-brand-bg text-xs font-semibold rounded-xl p-2.5 border border-brand-border/60 focus:border-brand-accent outline-none text-brand-text"
                >
                  <option value={10}>10 Mins / Day</option>
                  <option value={15}>15 Mins / Day (Default)</option>
                  <option value={30}>30 Mins / Day</option>
                  <option value={60}>60 Mins / Day (Master)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-brand-text-secondary uppercase tracking-wider">Reader Background Theme</label>
                <select
                  value={defaultReaderTheme}
                  onChange={(e) => setDefaultReaderTheme(e.target.value)}
                  className="w-full bg-brand-bg text-xs font-semibold rounded-xl p-2.5 border border-brand-border/60 focus:border-brand-accent outline-none text-brand-text"
                >
                  <option value="dark">Dark Theme (Deep Slate)</option>
                  <option value="sepia">Sepia Theme (Warm Paper)</option>
                  <option value="light">Light Theme (Pure White)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
              className="rounded-full text-[11px] font-bold h-10 px-6 bg-brand-accent flex items-center gap-1.5 hover:scale-102 shadow-sm shrink-0 cursor-pointer"
            >
              <Save className="h-4 w-4" /> Save All Preferences
            </Button>
          </div>
        </form>

        {/* Notifications & Security Widgets (Right 1 column) */}
        <div className="space-y-6">
          
          {/* Notifications Panel */}
          <div className="bg-brand-card/40 backdrop-blur-md border border-brand-border/60 rounded-[24px] p-6 shadow-brand flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-brand-border/45 pb-2">
              <Bell className="h-4.5 w-4.5 text-brand-accent shrink-0" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Notification Control</h3>
            </div>
            
            <div className="flex flex-col gap-4">
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

          {/* Security & Account Management */}
          <div className="bg-brand-card/40 backdrop-blur-md border border-brand-border/60 rounded-[24px] p-6 shadow-brand flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-brand-border/45 pb-2">
              <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Account Security & Data</h3>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleResetPassword}
                variant="outline" 
                className="w-full h-9 rounded-xl text-xs font-bold border-brand-border text-brand-text hover:bg-brand-bg-secondary flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5 text-brand-accent" /> Reset Account Password
              </Button>

              <Button 
                onClick={handleExportData}
                variant="outline" 
                className="w-full h-9 rounded-xl text-xs font-bold border-brand-border text-brand-text hover:bg-brand-bg-secondary flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-purple-400" /> Export Account JSON Data
              </Button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

