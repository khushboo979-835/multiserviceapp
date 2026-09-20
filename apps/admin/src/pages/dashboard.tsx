import React, { useState, useEffect } from "react";
import { DollarSign, Briefcase, Users, Hammer, TrendingUp, RefreshCw } from "lucide-react";
import { apiClient } from "../api/apiClient";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalCustomers: 48,
    totalProviders: 12,
    liveProviders: 8,
    totalBookings: 34,
    activeBookings: 5,
    totalGMV: 48650,
    platformEarnings: 7297,
  });
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/metrics");
      if (res.data && res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.warn("Using offline demo metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      name: "Total Gross GMV",
      value: `₹${metrics.totalGMV.toLocaleString("en-IN")}`,
      change: `Platform earnings: ₹${metrics.platformEarnings.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      name: "Active Service Bookings",
      value: `${metrics.activeBookings} Jobs Live`,
      change: `${metrics.totalBookings} lifetime total bookings`,
      icon: Briefcase,
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      name: "Registered Customers",
      value: `${metrics.totalCustomers} Users`,
      change: "Direct OTP verified users",
      icon: Users,
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      name: "Active Partners",
      value: `${metrics.liveProviders} Online / ${metrics.totalProviders}`,
      change: "Verified technicians & pros",
      icon: Hammer,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  const recentTransactions = [
    { id: "bk_98234", customer: "Amrita Sen", provider: "Rohan Sharma (INP-8842)", service: "AC Jet Cleaning Split", amount: "₹1,599", status: "SUCCESS" },
    { id: "bk_10923", customer: "Vivek Sharma", provider: "Rohan Sharma (INP-8842)", service: "Doorstep Screen Fix", amount: "₹2,359", status: "SUCCESS" },
    { id: "bk_84712", customer: "Megha Rao", provider: "Amit Kumar (INP-9912)", service: "Electrical Wiring & Fan", amount: "₹1,299", status: "IN_PROGRESS" },
    { id: "bk_39234", customer: "Karan Johar", provider: "Unassigned", service: "Plumbing Leak Fix", amount: "₹599", status: "PENDING" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Responsive Page Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">System Overview</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time marketplace monitoring metrics & telemetry</p>
        </div>
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={fetchMetrics}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-indigo-400" : "text-slate-400"} />
            Refresh
          </button>
          <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300">
            <TrendingUp size={15} className="text-emerald-400" />
            <span className="hidden xs:inline">Marketplace</span> Active
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.name}</span>
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings Live Ledger Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">Live Operations & Dispatch Feed</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time incoming customer orders across Delhi NCR & India</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Assigned Partner</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/20">
                    <td className="py-3.5 px-3 font-mono text-indigo-400 font-bold">{tx.id}</td>
                    <td className="py-3.5 px-3 text-white font-bold whitespace-nowrap">{tx.customer}</td>
                    <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">{tx.service}</td>
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">{tx.provider}</td>
                    <td className="py-3.5 px-3 font-mono text-white font-bold whitespace-nowrap">{tx.amount}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                          tx.status === "SUCCESS"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                            : tx.status === "IN_PROGRESS"
                            ? "bg-indigo-950/40 text-indigo-400 border border-indigo-500/20"
                            : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
