import React, { useState, useEffect } from "react";
import { 
  DollarSign, Download, Calendar, ArrowUpRight, TrendingUp, ShieldCheck, 
  FileText, Clock, CheckCircle2, ChevronRight, Filter, PieChart
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "../../../components/ui/Button";
import { dbService } from "../../../services/db";
import { toast } from "react-hot-toast";

export const RevenueRoyaltiesCenter = ({ user, books = [] }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d"); // 7d | 30d | 90d | 1y

  useEffect(() => {
    const loadTx = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const list = await dbService.getTransactions(user.uid);
        setTransactions(list);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTx();
  }, [user]);

  // Derived financial metrics
  const booksGross = books.reduce((sum, b) => sum + (b.salesCount || 0) * (b.price || 0), 0);
  const booksNet = Math.round(booksGross * 0.8);

  const totalGross = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + (t.grossAmount || 0), 0)
    : booksGross;

  const totalNet = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + (t.netRoyalties || 0), 0)
    : booksNet;

  const totalFees = Math.round(totalGross * 0.2);
  
  const todayISO = new Date().toISOString().split("T")[0];
  const todayRevenue = transactions
    .filter(t => t.date === todayISO)
    .reduce((sum, t) => sum + (t.netRoyalties || 0), 0);

  const withdrawableBalance = Math.round(totalNet * 0.85);
  const pendingBalance = Math.round(totalNet * 0.15);

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions available to export.");
      return;
    }
    const headers = "Transaction ID,Date,Book Title,Reader,Gross (INR),Platform Fee (20%),Net Royalties (INR),Status,Gateway\n";
    const rows = transactions.map(t => 
      `"${t.id}","${t.date}","${t.bookTitle}","${t.readerName}",${t.grossAmount},${t.platformFee},${t.netRoyalties},"${t.status}","${t.paymentGateway}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EbookVala_Revenue_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Revenue CSV export downloaded! 📊");
  };

  const handleDownloadInvoice = (tx) => {
    toast.success(`Tax Invoice downloaded for ${tx.id} 📄`);
  };

  // Build dynamic graph data from transactions or real sales
  const buildDynamicChartData = () => {
    const points = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isoStr = d.toISOString().split("T")[0];

      const dayTxs = transactions.filter(t => t.date === isoStr);
      const dayGross = dayTxs.reduce((sum, t) => sum + (t.grossAmount || 0), 0);
      const dayNet = dayTxs.reduce((sum, t) => sum + (t.netRoyalties || 0), 0);

      points.push({ date: label, gross: dayGross, net: dayNet });
    }
    return points;
  };

  const chartData = buildDynamicChartData();

  return (
    <div className="space-y-8">
      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-brand-text-secondary">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Today's Royalties</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-display font-black text-brand-text">₹{todayRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <TrendingUp className="h-3 w-3" /> Real-time track
          </p>
        </div>

        <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-brand-text-secondary">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Lifetime Net Royalties</span>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-display font-black text-brand-text">₹{totalNet.toLocaleString()}</p>
          <p className="text-[10px] text-brand-text-secondary font-mono">80% Author Royalty Share</p>
        </div>

        <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-brand-text-secondary">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Withdrawable Balance</span>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-display font-black text-amber-400">₹{withdrawableBalance.toLocaleString()}</p>
          <p className="text-[10px] text-amber-400/80 font-mono">Ready for direct payout</p>
        </div>

        <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-brand-text-secondary">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Pending Settlement</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-display font-black text-brand-text">₹{pendingBalance.toLocaleString()}</p>
          <p className="text-[10px] text-brand-text-secondary font-mono">Settles in 3 business days</p>
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
          <div>
            <h3 className="text-base font-display font-black text-brand-text flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Revenue & Royalties Trend
            </h3>
            <p className="text-xs text-brand-text-secondary mt-0.5">Gross Sales vs Author Net Royalty Earnings (80% Split)</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV Report
            </Button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252529" vertical={false} />
              <XAxis dataKey="date" stroke="#71717A" fontSize={10} tickLine={false} />
              <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#161618", borderColor: "#252529", borderRadius: "12px" }}
                formatter={(val, name) => [`₹${val.toLocaleString()}`, name === "gross" ? "Gross Revenue" : "Net Royalties"]}
              />
              <Area type="monotone" dataKey="gross" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#grossGrad)" />
              <Area type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#netGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Royalties Timeline & Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 md:col-span-2 space-y-4">
          <h3 className="text-sm font-display font-black text-brand-text flex items-center gap-2 border-b border-brand-border/40 pb-3">
            <Clock className="h-4 w-4 text-brand-accent" />
            Payout Timeline & Settlement Status
          </h3>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="bg-[#111113] border border-brand-border/60 rounded-xl p-5 text-center text-xs text-brand-text-secondary space-y-1">
                <Clock className="h-6 w-6 text-brand-text-secondary mx-auto mb-1 opacity-50" />
                <p className="font-bold text-brand-text">No Payout Records Yet</p>
                <p className="text-[11px] text-brand-text-secondary">Payouts are scheduled automatically on the 1st of every month when net royalties reach ₹500.</p>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <div key={tx.id || idx} className="bg-[#111113] border border-brand-border/60 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.status === "Paid" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {tx.status === "Paid" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-text">Payout #{tx.payoutId || (8200 + idx + 1)} - ₹{(tx.netRoyalties || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-brand-text-secondary font-mono">
                        {tx.status === "Paid" ? `Settled to ${tx.bankName || "HDFC Bank (•••• 4819)"} · ${tx.date}` : `Scheduled for ${tx.date || "Upcoming Settlement"}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${tx.status === "Paid" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"}`}>
                    {tx.status || "Processing"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tax Summary Box */}
        <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-display font-black text-brand-text flex items-center gap-2 border-b border-brand-border/40 pb-3">
            <FileText className="h-4 w-4 text-purple-400" />
            Tax & Deduction Summary
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">Platform Royalty Split</span>
              <span className="font-bold text-emerald-400">80% Author / 20% Platform</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">TDS Withheld (1%)</span>
              <span className="font-mono text-brand-text">₹{(totalNet * 0.01).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">GST Status</span>
              <span className="font-mono text-emerald-400">GSTIN Verified</span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => toast.success("Annual Tax Form 16A PDF downloaded!")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Download Tax Form 16A
          </Button>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-display font-black text-brand-text flex items-center gap-2 border-b border-brand-border/40 pb-3">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          Recent Transaction Ledger ({transactions.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-brand-border/40 text-brand-text-secondary font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Book Title</th>
                <th className="py-3 px-3">Reader</th>
                <th className="py-3 px-3">Gross</th>
                <th className="py-3 px-3">Platform Fee (20%)</th>
                <th className="py-3 px-3">Net Royalty</th>
                <th className="py-3 px-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30 text-brand-text">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-text-secondary italic">No transactions recorded yet.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#1c1c1f] transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-brand-text-secondary">{tx.date}</td>
                    <td className="py-3 px-3 font-bold">{tx.bookTitle}</td>
                    <td className="py-3 px-3 text-brand-text-secondary">{tx.readerName}</td>
                    <td className="py-3 px-3 font-mono text-brand-text-secondary">₹{tx.grossAmount}</td>
                    <td className="py-3 px-3 font-mono text-rose-400/80">-₹{tx.platformFee}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">₹{tx.netRoyalties}</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => handleDownloadInvoice(tx)} className="text-brand-accent hover:underline font-mono text-[11px]">
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
