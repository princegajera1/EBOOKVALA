import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { READER_SIDEBAR_LINKS } from "./config/sidebarLinks";

const TAB_LABELS = {
  overview: "Overview",
  library: "My Library",
  wishlist: "Wishlist",
  downloads: "Downloads",
  achievements: "Achievements",
  community: "Community",
  settings: "Settings",
};

export const ReaderDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== "logout") setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    if (tabId === "logout") return;
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <DashboardLayout
      requiredRole="reader"
      links={READER_SIDEBAR_LINKS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="flex flex-col gap-2 min-h-[40vh]">
        <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-text-secondary">
          Reader Dashboard
        </p>
        <h1 className="text-2xl font-display font-black text-brand-text tracking-tight">
          {TAB_LABELS[activeTab] || "Overview"}
        </h1>
        <p className="text-sm text-brand-text-secondary max-w-md">
          Phase 1 complete — sidebar navigation is live. Content for this section arrives in the next phases.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default ReaderDashboard;
