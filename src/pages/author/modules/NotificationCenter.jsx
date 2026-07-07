import React, { useState } from "react";
import { 
  Bell, Mail, MessageSquare, ShieldCheck, 
  Smartphone, Eye, HelpCircle, Save
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

const NOTIFICATION_CHANNELS = [
  { id: "pub", label: "Book Published Successful", desc: "Trigger notifications when review completes and book is live." },
  { id: "rev", label: "New Reader Review", desc: "Notify when reader publishes a rating review or comment." },
  { id: "sal", label: "New Book Purchase Sale", desc: "Notify when customer completes checkout purchase." },
  { id: "wth", label: "Withdrawal Earns Approved", desc: "Notify when admin updates earnings clearance requests." }
];

export const NotificationCenter = () => {
  const [preferences, setPreferences] = useState({
    pub_email: true, pub_push: true, pub_sms: false,
    rev_email: true, rev_push: false, rev_sms: false,
    sal_email: true, sal_push: true, sal_sms: true,
    wth_email: true, wth_push: true, wth_sms: false
  });

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated! 🔔");
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-display font-black text-brand-text">Notification Center</h1>
        <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
          Configure how you receive activity notifications. Toggle channels for email alerts, browser pushes, or SMS texts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
        
        {/* Toggles Panel */}
        <div className="lg:col-span-2 flex flex-col gap-5 bg-brand-card border border-brand-border rounded-[24px] p-6 shadow-sm">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
            <Bell className="h-4 w-4 text-brand-accent animate-pulse" /> Notification Channels Toggles
          </h3>

          <div className="flex flex-col gap-5 divide-y divide-brand-border/40 mt-2">
            {NOTIFICATION_CHANNELS.map((ch) => (
              <div key={ch.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left max-w-sm">
                  <p className="text-xs font-bold text-brand-text">{ch.label}</p>
                  <p className="text-[10px] text-brand-text-secondary mt-0.5 leading-relaxed font-semibold">{ch.desc}</p>
                </div>
                
                {/* Channels buttons */}
                <div className="flex items-center gap-4 shrink-0">
                  
                  {/* Email Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={preferences[`${ch.id}_email`]}
                      onChange={() => togglePreference(`${ch.id}_email`)}
                      className="h-3.5 w-3.5 accent-brand-accent cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-brand-text-secondary flex items-center gap-1 font-mono uppercase">
                      <Mail className="h-3 w-3" /> Email
                    </span>
                  </label>

                  {/* Push Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={preferences[`${ch.id}_push`]}
                      onChange={() => togglePreference(`${ch.id}_push`)}
                      className="h-3.5 w-3.5 accent-brand-accent cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-brand-text-secondary flex items-center gap-1 font-mono uppercase">
                      <Eye className="h-3 w-3" /> Push
                    </span>
                  </label>

                  {/* SMS Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={preferences[`${ch.id}_sms`]}
                      onChange={() => togglePreference(`${ch.id}_sms`)}
                      className="h-3.5 w-3.5 accent-brand-accent cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-brand-text-secondary flex items-center gap-1 font-mono uppercase">
                      <Smartphone className="h-3 w-3" /> SMS
                    </span>
                  </label>

                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-brand-border/60">
            <Button onClick={handleSaveNotifications} variant="primary" className="rounded-full text-xs font-bold h-11 w-full sm:w-fit px-6 shadow-sm">
              Save Notification Preferences
            </Button>
          </div>
        </div>

        {/* Security / System Summary */}
        <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 flex flex-col gap-4 shadow-sm select-none">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand-accent" /> Security Verified
          </h3>

          <div className="p-3.5 bg-brand-bg-secondary/60 rounded-[16px] border border-brand-border/40 text-left">
            <span className="text-[10px] font-bold text-brand-success flex items-center gap-1 uppercase tracking-widest font-mono">
              ● Active Guard
            </span>
            <p className="text-[10px] text-brand-text-secondary mt-1.5 font-semibold leading-relaxed">
              We encrypt phone numbers and email channels. EBOOKVALA adheres to strict spam control guidelines, preventing unsolicited promotional messaging.
            </p>
          </div>

          <div className="p-3 bg-brand-bg-secondary border border-brand-border rounded-[16px] text-left mt-1 flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
            <p className="text-[10px] text-brand-text-secondary font-semibold leading-relaxed">
              Toggling off email notifications does not disable transactional receipts or copyright notifications.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
export default NotificationCenter;
