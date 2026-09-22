import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Layers,
  ArrowUpRight,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { apiClient } from "../api/apiClient";

export default function AnalyticsAndReportsPage() {
  const [timeRange, setTimeRange] = useState("30D");
  const [loading, setLoading] = useState(false);

  const summary = {
    totalRevenue: 284500,
    platformEarnings: 42675,
    totalOrders: 428,
    avgOrderValue: 664,
    repeatRate: "34.8%",
    customerSatisfaction: "4.8 / 5.0",
  };

  const categoryPerformance = [
    { name: "Mobile Repair", orders: 142, revenue: 112000, growth: "+24%" },
    { name: "AC Servicing & Jet Cleaning", orders: 118, revenue: 84000, growth: "+38%" },
    { name: "Home Salon & Spa", orders: 68, revenue: 42500, growth: "+15%" },
    { name: "Electrician & Wiring", orders: 54, revenue: 26000, growth: "+12%" },
    { name: "Home Deep Cleaning", orders: 46, revenue: 20000, growth: "+18%" },
  ];

  const cityDistribution = [
    { city: "New Delhi (Central & North)", share: "42%", orders: 180 },
    { city: "Noida & Greater Noida", share: "28%", orders: 120 },
    { city: "Gurugram (Cyber City)", share: "18%", orders: 77 },
    { city: "Ghaziabad & Faridabad", share: "12%", orders: 51 },
  ];

  const handleExportCSV = () => {
    const csvRows = [
      ["Category", "Total Orders", "Revenue (INR)", "Growth"],
      ...categoryPerformance.map((c) => [c.name, c.orders, c.revenue, c.growth]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inisha_city_revenue_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="text-red-600" size={24} />
            Reports & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Deep dive into gross merchandise volume (GMV), service category splits & city performance
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          {/* Time Filter */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {["7D", "30D", "90D", "1Y"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeRange === range
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross GMV</span>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{summary.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} />
            +22.4% vs last period
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Net Take</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            ₹{summary.platformEarnings.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">15% commission + convenience fees</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfilled Orders</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{summary.totalOrders} Bookings</div>
          <div className="text-[11px] text-slate-500 mt-1">Avg Ticket: ₹{summary.avgOrderValue}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repeat User Rate</span>
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-200">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{summary.repeatRate}</div>
          <div className="text-[11px] text-slate-500 mt-1">Rating: {summary.customerSatisfaction} ⭐</div>
        </div>
      </div>

      {/* Analytics Charts / Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Revenue Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Service Category Revenue Share</h3>
              <p className="text-xs text-slate-500 mt-0.5">Top performing service verticals across Delhi NCR</p>
            </div>
            <Layers size={18} className="text-red-600" />
          </div>

          <div className="space-y-4">
            {categoryPerformance.map((item) => {
              const maxRev = 112000;
              const percent = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-slate-900">
                        ₹{item.revenue.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {item.growth}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.orders} completed service orders
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* City Distribution (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 h-fit">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">City Order Share</h3>
            <p className="text-xs text-slate-500 mt-0.5">Regional market penetration</p>
          </div>

          <div className="space-y-3">
            {cityDistribution.map((city) => (
              <div
                key={city.city}
                className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{city.city}</div>
                  <div className="text-[10px] text-slate-500">{city.orders} completed jobs</div>
                </div>
                <div className="font-black text-red-600 font-mono text-sm">{city.share}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
