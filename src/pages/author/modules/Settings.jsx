import React, { useState, useRef, useEffect } from "react";
import { 
  User, Bell, Globe, Users, Shield, AlertTriangle, 
  Save, RefreshCw, Key, Check, Plus, Trash2, Mail, Info,
  ShieldAlert, CheckCircle, ExternalLink
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { toast } from "react-hot-toast";

// Seed languages dictionary
const LOCALIZATION_MOCK = {
  gu: {
    title: "સ્કેલ માટે ડિઝાઇનિંગ",
    description: "ઉચ્ચ સ્થિતિસ્થાપક વેબ એપ્લિકેશન્સ બનાવવા માટે એક વ્યવહારુ માર્ગદર્શિકા. આ પુસ્તક અદ્યતન ફ્રેમવર્ક લેઆઉટ, સ્પેસિંગ ગ્રીડ અને ડાયનેમિક સ્ટેટ સ્ટ્રક્ચર્સને આવરી લે છે."
  },
  hi: {
    title: "स्केल के लिए डिज़ाइनिंग",
    description: "अत्यधिक लचीला वेब एप्लिकेशन बनाने के लिए एक व्यावहारिक गाइड। यह पुस्तक उन्नत फ्रेमवर्क लेआउट, स्पेसिंग ग्रिड और गतिशील स्थिति संरचनाओं को शामिल करती है।"
  },
  es: {
    title: "Diseño para Escalar",
    description: "Una guía práctica para crear aplicaciones web altamente resilientes. Este libro cubre diseños de frameworks avanzados, cuadrículas de espaciado y estructuras de estado dinámicas."
  },
  fr: {
    title: "Conception pour la Mise à l'Échelle",
    description: "Un guide pratique pour créer des applications web hautement résilientes. Ce livre couvre les mises en page de frameworks avancés, les grilles d'espacement et les structures d'état dynamiques."
  },
  ja: {
    title: "スケール向け設計ガイド",
    description: "非常に復元力の高いWebアプリケーションを構築するための実用的なガイド。この本では、高度なフレームワークレイアウト、間隔グリッド、および動的状態構造について説明します。"
  }
};

const LANGUAGES_LIST = [
  { code: "en", name: "English", native: "English", status: "Active (Default)" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", status: "Draft available" },
  { code: "hi", name: "Hindi", native: "हिन्दी", status: "Draft available" },
  { code: "es", name: "Spanish", native: "Español", status: "Not translated" },
  { code: "fr", name: "French", native: "Français", status: "Not translated" },
  { code: "ja", name: "Japanese", native: "日本語", status: "Not translated" }
];

const ROLES_LIST = [
  { id: "admin", name: "Co-Admin", desc: "Full controls over configurations, uploads, and library." },
  { id: "editor", name: "Editor", desc: "Can manage and draft chapters in the Book Builder." },
  { id: "designer", name: "Designer", desc: "Can upload cover images, design metadata assets." },
  { id: "translator", name: "Translator", desc: "Can edit and compile multi-language localizations." },
  { id: "proofreader", name: "Proofreader", desc: "Can review drafts and submit proof comments." }
];

const PERMISSIONS_MATRIX = [
  { action: "Edit Book Chapters", admin: true, editor: true, designer: false, translator: false, proofreader: false },
  { action: "Upload Cover Files", admin: true, editor: true, designer: true, translator: false, proofreader: false },
  { action: "Manage SEO Center", admin: true, editor: true, designer: false, translator: false, proofreader: false },
  { action: "Edit Localizations", admin: true, editor: false, designer: false, translator: true, proofreader: false },
  { action: "Moderate Reader Reviews", admin: true, editor: false, designer: false, translator: false, proofreader: true }
];

export const Settings = ({ 
  authorProfile = {}, 
  onSaveProfile,
  books = []
}) => {
  const [activeSubTab, setActiveSubTab] = useState("profile");

  // --- 1. PROFILE SECTION ---
  const [displayName, setDisplayName] = useState(authorProfile.displayName || "");
  const [photoURL, setPhotoURL] = useState(authorProfile.photoURL || "");
  const [bio, setBio] = useState(authorProfile.bio || "");
  const [twitter, setTwitter] = useState("");
  const [github, setGithubLink] = useState("");
  const [website, setWebsite] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState("unverified"); // unverified | pending | verified

  useEffect(() => {
    if (authorProfile) {
      setDisplayName(authorProfile.displayName || "");
      setPhotoURL(authorProfile.photoURL || "");
      setBio(authorProfile.bio || "");
    }
  }, [authorProfile]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onSaveProfile) {
      onSaveProfile({
        ...authorProfile,
        displayName,
        bio,
        photoURL
      });
    }
    toast.success("Profile details saved! 👤");
  };

  const handleRequestVerification = () => {
    setIsVerifying(true);
    const toastId = toast.loading("Submitting verification request details...");
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedStatus("pending");
      toast.success("Verification request submitted! 🛡️", { id: toastId });
    }, 1500);
  };

  // --- 2. NOTIFICATIONS SECTION ---
  const [notifications, setNotifications] = useState({
    pub_email: true, pub_push: true, pub_sms: false,
    rev_email: true, rev_push: false, rev_sms: false
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated! 🔔");
  };

  // --- 3. LANGUAGES LOCALIZATION ---
  const [targetLang, setTargetLang] = useState("gu");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedDesc, setTranslatedDesc] = useState("");
  const [translating, setTranslating] = useState(false);
  const [activeTranslations, setActiveTranslations] = useState(["en"]);

  useEffect(() => {
    if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0].id);
    }
  }, [books]);

  const handleAiTranslate = () => {
    const book = books.find(b => b.id === selectedBookId);
    if (!book) return;
    setTranslating(true);
    const toastId = toast.loading(`AI Translating into ${LANGUAGES_LIST.find(l => l.code === targetLang)?.name}...`);

    setTimeout(() => {
      const mockResult = LOCALIZATION_MOCK[targetLang] || {
        title: `${book.title} [${targetLang.toUpperCase()}]`,
        description: `[Translated] ${book.description || ""}`
      };
      
      setTranslatedTitle(mockResult.title);
      setTranslatedDesc(mockResult.description);
      setTranslating(false);
      
      if (!activeTranslations.includes(targetLang)) {
        setActiveTranslations([...activeTranslations, targetLang]);
      }
      
      toast.success("AI Translation Completed! 🌍✨", { id: toastId });
    }, 1500);
  };

  const handleSaveTranslation = () => {
    toast.success("Localization entries saved! 💾");
  };

  // --- 4. TEAM WORKSPACE ---
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [teamMembers, setTeamMembers] = useState([
    { id: "t-1", name: "Jay Patel", email: "jay@designlabs.in", role: "designer", status: "Active" },
    { id: "t-2", name: "Sarah Connor", email: "sarah@localize.net", role: "translator", status: "Pending Invite" }
  ]);

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const newMember = {
      id: `t-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "Pending Invite"
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail("");
    toast.success(`Invite link dispatched to ${inviteEmail}! ✉️`);
  };

  const handleRemoveMember = (id, name) => {
    if (!window.confirm(`Remove ${name} from your team workspace?`)) return;
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.success(`Revoked workspace access for ${name}`);
  };

  // --- 5. SECURITY & API KEYS ---
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState({ google: true, github: false });
  const [apiKeys, setApiKeys] = useState([
    { key: "ev_live_7c3aed9b2cc5487a9b0", createdAt: "2026-06-15" }
  ]);

  const handleGenerateApiKey = () => {
    const newKey = {
      key: `ev_live_${Math.random().toString(36).substring(2, 11)}${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setApiKeys([...apiKeys, newKey]);
    toast.success("New developer API Key generated! 🔑");
  };

  const handleRevokeApiKey = (keyToRevoke) => {
    setApiKeys(apiKeys.filter(k => k.key !== keyToRevoke));
    toast.success("API Key successfully revoked!");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Account password changed successfully! 🔐");
  };

  // --- 6. DANGER ZONE ---
  const handleDeleteAccount = () => {
    const confirmation = window.prompt("To delete your account, type 'DELETE ACCOUNT' below:");
    if (confirmation === "DELETE ACCOUNT") {
      toast.success("Account deleted. Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      toast.error("Incorrect verification string. Deletion cancelled.");
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left select-none font-display">
      <div>
        <h1 className="text-2xl font-display font-black text-brand-text">Settings</h1>
        <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
          Configure profile properties, notifications, translation localizations, security credentials, and workspaces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Local Settings Sidebar */}
        <div className="flex flex-col gap-1.5 p-2 bg-brand-card border border-brand-border rounded-[20px] shadow-sm font-display text-xs">
          {[
            { id: "profile", label: "Public Profile", icon: User },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "languages", label: "Languages", icon: Globe },
            { id: "team", label: "Team Workspace", icon: Users },
            { id: "security", label: "Security & API", icon: Shield },
            { id: "danger", label: "Danger Zone", icon: AlertTriangle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-2.5 transition-all text-left font-bold cursor-pointer ${
                  isTabActive 
                    ? "bg-brand-accent/15 text-brand-accent" 
                    : "text-brand-text-secondary hover:bg-brand-bg-secondary hover:text-brand-text"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Local Tab Content Area */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: PROFILE */}
          {activeSubTab === "profile" && (
            <div className="flex flex-col gap-5 bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
                <span className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Public Identity Settings</span>
                
                {/* Verification Badge requests */}
                {verifiedStatus === "unverified" && (
                  <button 
                    onClick={handleRequestVerification}
                    className="text-[10px] font-bold text-brand-accent border border-brand-accent/30 hover:bg-brand-accent/5 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1.5"
                  >
                    Request Verified Badge 🛡️
                  </button>
                )}
                {verifiedStatus === "pending" && (
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25">
                    Verification Pending Review
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Author Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                  <Input 
                    label="Public Photo/Avatar URL"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold text-brand-text-secondary">Public Creator Bio</label>
                  <textarea 
                    rows={3}
                    placeholder="Tell your readers about your work..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-[14px] p-3 text-sm focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/45"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-brand-border/40 pt-4">
                  <Input 
                    label="Twitter Username" 
                    placeholder="e.g. twitter_handle"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                  <Input 
                    label="GitHub Username" 
                    placeholder="e.g. github_handle"
                    value={github}
                    onChange={(e) => setGithubLink(e.target.value)}
                  />
                  <Input 
                    label="Personal Website Link" 
                    placeholder="e.g. mywebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <Button type="submit" variant="primary" className="rounded-full text-xs font-bold h-11 w-full sm:w-fit px-6 shadow-sm mt-2">
                  <Save className="mr-1.5 h-4 w-4" /> Save Profile Details
                </Button>
              </form>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeSubTab === "notifications" && (
            <div className="flex flex-col gap-5 bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-brand-accent" /> Notification Preferences
              </h3>

              <div className="flex flex-col gap-4 divide-y divide-brand-border/40 mt-1">
                
                {/* Notification Item 1 */}
                <div className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-left max-w-sm">
                    <p className="text-xs font-bold text-brand-text">Book Published Notifications</p>
                    <p className="text-[10px] text-brand-text-secondary mt-0.5 leading-normal">Alert when checkups complete and book goes live.</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] uppercase font-bold text-brand-text-secondary">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifications.pub_email} onChange={() => toggleNotification("pub_email")} className="h-3.5 w-3.5 accent-brand-accent cursor-pointer" /> Email
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifications.pub_push} onChange={() => toggleNotification("pub_push")} className="h-3.5 w-3.5 accent-brand-accent cursor-pointer" /> Push
                    </label>
                  </div>
                </div>

                {/* Notification Item 2 */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-left max-w-sm">
                    <p className="text-xs font-bold text-brand-text">New Reviews Alerts</p>
                    <p className="text-[10px] text-brand-text-secondary mt-0.5 leading-normal">Notify when reader publishes a rating review or comment.</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] uppercase font-bold text-brand-text-secondary">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifications.rev_email} onChange={() => toggleNotification("rev_email")} className="h-3.5 w-3.5 accent-brand-accent cursor-pointer" /> Email
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={notifications.rev_push} onChange={() => toggleNotification("rev_push")} className="h-3.5 w-3.5 accent-brand-accent cursor-pointer" /> Push
                    </label>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-brand-border/60">
                <Button onClick={handleSaveNotifications} variant="primary" className="rounded-full text-xs font-bold h-10 px-5 shadow-sm">
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: LANGUAGES LOCALIZATION */}
          {activeTab === "settings" && activeSubTab === "languages" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Localization Form */}
              <div className="md:col-span-2 flex flex-col gap-4 bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-brand-border/50">
                  <span className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono">Book Localizations</span>
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-brand-bg border border-brand-border px-3 py-1 text-[11px] rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
                  >
                    {LANGUAGES_LIST.filter(l => l.code !== "en").map(l => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </div>

                {books.length === 0 ? (
                  <p className="text-xs text-brand-text-secondary py-8 text-center">No publications available to localize.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-brand-text-secondary">Source Book:</span>
                      <select 
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                        className="bg-brand-bg border border-brand-border px-3.5 py-1 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
                      >
                        {books.map(b => (
                          <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                      </select>

                      <Button 
                        onClick={handleAiTranslate} 
                        disabled={translating}
                        variant="primary" 
                        size="sm" 
                        className="h-8 rounded-full text-[10px] font-bold ml-auto"
                      >
                        {translating ? "Translating..." : "AI Translate"}
                      </Button>
                    </div>

                    <Input 
                      label="Translated Title"
                      value={translatedTitle}
                      onChange={(e) => setTranslatedTitle(e.target.value)}
                      placeholder="e.g. localized title"
                    />

                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-bold text-brand-text-secondary">Translated Description</label>
                      <textarea 
                        rows={4}
                        value={translatedDesc}
                        onChange={(e) => setTranslatedDesc(e.target.value)}
                        placeholder="localized description..."
                        className="w-full bg-brand-bg border border-brand-border rounded-[14px] p-3 text-sm focus:outline-none focus:border-brand-accent text-brand-text placeholder:text-brand-text-secondary/45"
                      />
                    </div>

                    <Button onClick={handleSaveTranslation} variant="primary" className="rounded-full text-xs font-bold h-10 px-5 shadow-sm mt-2 self-start">
                      Save Localization
                    </Button>
                  </div>
                )}
              </div>

              {/* Languages List */}
              <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm flex flex-col gap-3">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2">Active Languages</h4>
                <div className="flex flex-col gap-2">
                  {LANGUAGES_LIST.map((lang) => {
                    const isActive = activeTranslations.includes(lang.code);
                    return (
                      <div key={lang.code} className="p-2.5 bg-brand-bg-secondary/40 border border-brand-border rounded-[12px] flex items-center justify-between text-left">
                        <div>
                          <p className="text-xs font-bold text-brand-text leading-tight">{lang.name}</p>
                          <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${isActive ? "text-brand-success" : "text-brand-text-secondary/60"}`}>
                            {isActive ? "Active" : "Not Active"}
                          </span>
                        </div>
                        {isActive && <CheckCircle className="h-4 w-4 text-brand-success" />}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: TEAM WORKSPACE */}
          {activeSubTab === "team" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Role Matrix and Invites */}
              <div className="md:col-span-2 flex flex-col gap-5 bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-brand-accent" /> Invite Co-Author / Editor
                </h3>

                <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row items-end gap-3 font-display">
                  <div className="flex-grow">
                    <Input 
                      label="Workspace Invite Email" 
                      placeholder="editor@myteam.com" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left shrink-0">
                    <label className="text-xs font-bold text-brand-text-secondary">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="bg-brand-bg border border-brand-border px-3 py-2 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold h-11"
                    >
                      {ROLES_LIST.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" variant="primary" className="h-11 rounded-full text-xs font-bold px-5 shadow-sm">
                    Invite
                  </Button>
                </form>

                {/* Table permissions */}
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border/60 text-brand-text-secondary font-bold uppercase tracking-wider font-mono text-[9px]">
                        <th className="py-2.5">Workspace Permissions</th>
                        <th className="py-2.5 text-center">Admin</th>
                        <th className="py-2.5 text-center">Editor</th>
                        <th className="py-2.5 text-center">Proof</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/30 font-semibold text-brand-text-secondary">
                      {PERMISSIONS_MATRIX.map((p, idx) => (
                        <tr key={idx} className="hover:bg-brand-bg-secondary/10">
                          <td className="py-2.5 text-brand-text font-bold">{p.action}</td>
                          <td className="py-2.5 text-center">{p.admin ? <Check className="h-4.5 w-4.5 text-brand-success mx-auto" /> : "—"}</td>
                          <td className="py-2.5 text-center">{p.editor ? <Check className="h-4.5 w-4.5 text-brand-success mx-auto" /> : "—"}</td>
                          <td className="py-2.5 text-center">{p.proofreader ? <Check className="h-4.5 w-4.5 text-brand-success mx-auto" /> : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team list */}
              <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm flex flex-col gap-3">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2">Active Team</h4>
                <div className="flex flex-col gap-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-3 bg-brand-bg-secondary/40 border border-brand-border rounded-[12px] flex items-center justify-between text-left">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-text truncate leading-none">{member.name}</p>
                        <p className="text-[9px] text-brand-text-secondary mt-1 truncate">{member.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 text-[8px] font-mono font-bold bg-brand-accent/15 text-brand-accent rounded-full uppercase">
                          {member.role}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="text-brand-text-secondary hover:text-brand-danger cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: SECURITY & API */}
          {activeSubTab === "security" && (
            <div className="flex flex-col gap-6">
              
              {/* Connected Accounts */}
              <div className="bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
                  Connected Accounts
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 bg-brand-bg-secondary/40 border border-brand-border rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-brand-text" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-brand-text">GitHub Account</p>
                        <p className="text-[10px] text-brand-text-secondary mt-0.5">Link accounts for automated markdown repository pulls.</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={connectedAccounts.github}
                      onChange={() => setConnectedAccounts({ ...connectedAccounts, github: !connectedAccounts.github })}
                      className="h-4 w-4 accent-brand-accent cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-brand-bg-secondary/40 border border-brand-border rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-brand-text" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-brand-text">Google Account</p>
                        <p className="text-[10px] text-brand-text-secondary mt-0.5">Use single sign-on logins via verified credentials.</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={connectedAccounts.google}
                      onChange={() => setConnectedAccounts({ ...connectedAccounts, google: !connectedAccounts.google })}
                      className="h-4 w-4 accent-brand-accent cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Password credentials */}
              <div className="bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full">Update Password Credentials</h3>
                
                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-display">
                    <Input 
                      label="Current Password" 
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <Input 
                      label="New Password" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input 
                      label="Confirm Password" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="primary" className="rounded-full text-xs font-bold h-10 px-5 shadow-sm self-start">
                    Change Password
                  </Button>
                </form>
              </div>

              {/* API Keys Panel */}
              <div className="bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-brand-border/60">
                  <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-brand-accent" /> Developer API Keys
                  </h3>
                  <Button onClick={handleGenerateApiKey} variant="outline" size="sm" className="h-8 rounded-full text-[10px] px-3 font-bold border-brand-border hover:bg-brand-bg-secondary cursor-pointer">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Generate Key
                  </Button>
                </div>

                <p className="text-[10px] text-brand-text-secondary leading-normal font-semibold">
                  API keys allow automated book creation, cover generation, or metadata syncs from your local command line client. Keep these keys private!
                </p>

                {apiKeys.length > 0 ? (
                  <div className="flex flex-col gap-2.5 mt-2">
                    {apiKeys.map((key) => (
                      <div key={key.key} className="p-3 bg-[#121214] border border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-left">
                        <div className="min-w-0">
                          <code className="text-xs font-bold font-mono text-zinc-300 break-all select-all">{key.key}</code>
                          <p className="text-[9px] text-zinc-500 font-mono mt-1 font-bold">Created on {key.createdAt}</p>
                        </div>
                        <button 
                          onClick={() => handleRevokeApiKey(key.key)}
                          className="text-[10px] font-bold text-brand-danger hover:underline cursor-pointer shrink-0"
                          title="Revoke key"
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-text-secondary text-center py-4 italic font-semibold">No API Keys generated yet.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 6: DANGER ZONE */}
          {activeSubTab === "danger" && (
            <div className="bg-brand-card border border-brand-danger/30 rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
              <h3 className="text-xs font-bold text-brand-danger uppercase tracking-widest font-mono border-b border-brand-danger/30 pb-2.5 w-full flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-brand-danger animate-pulse" /> Danger Zone Actions
              </h3>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-brand-border bg-brand-bg-secondary/40 rounded-xl text-left">
                <div className="max-w-md">
                  <h4 className="text-xs font-bold text-brand-text">Erase Publication Library Metadata</h4>
                  <p className="text-[10px] text-brand-text-secondary mt-0.5 leading-relaxed font-semibold">
                    Delete drafts and clear reading histories permanently. This action cannot be reversed, but leaves your account profile intact.
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    if (window.confirm("Permanently erase your publication library?")) {
                      toast.success("Library queue cleaned!");
                    }
                  }}
                  variant="outline" 
                  className="rounded-full text-xs font-bold border-brand-border text-brand-danger hover:bg-brand-danger/5 shrink-0 px-4 h-9"
                >
                  Erase Library
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-brand-danger/25 bg-brand-danger/5 rounded-xl text-left">
                <div className="max-w-md">
                  <h4 className="text-xs font-bold text-brand-danger">Delete EbookVala Creator Account</h4>
                  <p className="text-[10px] text-brand-danger/75 mt-0.5 leading-relaxed font-semibold">
                    Permanently delete all credentials, active API Keys, translations, metadata files, and co-author associations. This actions is completely irreversible.
                  </p>
                </div>
                <Button 
                  onClick={handleDeleteAccount}
                  variant="primary" 
                  className="bg-brand-danger hover:bg-brand-danger/90 text-white rounded-full text-xs font-bold shrink-0 px-4 h-9 shadow-sm"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default Settings;
