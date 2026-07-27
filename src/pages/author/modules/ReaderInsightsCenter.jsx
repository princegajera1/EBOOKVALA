import React, { useState, useEffect } from "react";
import { Users, Globe, Smartphone, Monitor, Compass, Award, BarChart2 } from "lucide-react";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { dbService } from "../../../services/db";

export const ReaderInsightsCenter = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const demo = await dbService.getReaderDemographics();
      setData(demo);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-12 text-center text-xs text-brand-text-secondary">
        Loading reader demographics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-black text-brand-text flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-accent" />
            Reader Audience Insights & Demographics
          </h2>
          <p className="text-xs text-brand-text-secondary mt-1">
            Real-time breakdown of reader age groups, geographic locations, devices, and traffic acquisition channels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country Heat Distribution */}
        <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-display font-black text-brand-text flex items-center gap-2 border-b border-brand-border/40 pb-3">
            <Globe className="h-4 w-4 text-emerald-400" />
            Geographic Reader Distribution
          </h3>

          <div className="space-y-3">
            {data.countries.map((c, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-brand-text font-bold flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.country}</span>
                  </span>
                  <span className="text-brand-text-secondary">{c.readers.toLocaleString()} readers ({c.percentage}%)</span>
                </div>
                <ProgressBar value={c.percentage} color="emerald" />
              </div>
            ))}
          </div>
        </div>

        {/* Age Groups & Gender Split */}
        <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-display font-black text-brand-text flex items-center gap-2 border-b border-brand-border/40 pb-3">
              <Users className="h-4 w-4 text-sky-400" />
              Age Demographics
            </h3>

            <div className="space-y-3">
              {data.ageGroups.map((a, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-brand-text font-bold">{a.group} years old</span>
                    <span className="text-brand-text-secondary">{a.percentage}%</span>
                  </div>
                  <ProgressBar value={a.percentage} color="blue" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-brand-border/40 pt-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary">Reading Devices</h4>
            <div className="space-y-2">
              {data.topDevices.map((d, idx) => (
                <div key={idx} className="bg-[#111113] border border-brand-border/60 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-text">{d.device}</span>
                  <span className="font-mono text-brand-accent">{d.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
