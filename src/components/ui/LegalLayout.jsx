import React from "react";

export const LegalLayout = ({ title, lastUpdated, toc = [], children }) => {
  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen py-10 md:py-14 select-none text-left transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="border-b border-brand-border pb-8 mb-10">
          <span className="text-[10px] font-mono text-brand-accent font-bold tracking-widest uppercase mb-2 block">
            Legal Information
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-brand-text tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-brand-text-secondary mt-2.5 font-mono">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* 2-Column Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Table of Contents: Left Column (3 cols) */}
          {toc.length > 0 && (
            <aside className="lg:col-span-3 lg:sticky lg:top-28 bg-brand-card border border-brand-border rounded-brand-card p-5 shadow-sm hidden lg:block text-left select-none">
              <h5 className="text-[10px] font-bold font-mono text-brand-text uppercase tracking-widest pb-3 border-b border-brand-border mb-4">
                Table of Contents
              </h5>
              <ul className="flex flex-col gap-3 text-xs text-brand-text-secondary font-medium">
                {toc.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleScrollToSection(item.id)}
                      className="hover:text-brand-accent text-left transition-colors cursor-pointer w-full"
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Legal Text: Right Column (9 cols or 12 cols if no TOC) */}
          <main className={`${toc.length > 0 ? "lg:col-span-9" : "lg:col-span-12"} bg-brand-card border border-brand-border rounded-brand-card p-6 md:p-10 shadow-brand text-xs sm:text-sm text-brand-text-secondary leading-relaxed font-normal space-y-8 select-text`}>
            
            {/* Mobile TOC Quick Links */}
            {toc.length > 0 && (
              <div className="lg:hidden bg-brand-bg-secondary border border-brand-border rounded-[16px] p-4 mb-6 text-left select-none">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-text mb-2 block">Quick Links</span>
                <div className="flex flex-wrap gap-2">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleScrollToSection(item.id)}
                      className="text-[11px] font-bold text-brand-accent bg-brand-accent/5 hover:bg-brand-accent/10 border border-brand-accent/10 py-1 px-3.5 rounded-full transition-all cursor-pointer"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {children}
          </main>

        </div>

      </div>
    </div>
  );
};

export default LegalLayout;
