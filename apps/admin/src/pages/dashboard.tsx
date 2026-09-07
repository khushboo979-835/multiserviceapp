import React from "react";
import { DollarSign, Briefcase, Users, Hammer, ArrowUpRight, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { name: "Total Gross Revenue", value: "₹2,84,500", change: "+14.2% from last week", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { name: "Active Service Bookings", value: "84 Jobs", change: "12 pending professionals", icon: Briefcase, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    { name: "Registered Customers", value: "1,240 Users", change: "+86 joined today", icon: Users, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    { name: "Online Providers", value: "312 Partners", change: "42 en route, 18 busy", icon: Hammer, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  ];

  const recentTransactions = [
    { id: "bk_98234", customer: "Amrita Sen", provider: "Sunil Kumar", service: "AC Service Split", amount: "₹1,599", status: "SUCCESS" },
    { id: "bk_10923", customer: "Vivek Sharma", provider: "Rakesh Gupta", service: "Doorstep Screen Fix", amount: "₹2,359", status: "SUCCESS" },
    { id: "bk_84712", customer: "Megha Rao", provider: "Priya Nair", service: "Salon Blow Dry", amount: "₹1,299", status: "PENDING" },
    { id: "bk_39234", customer: "Karan Johar", provider: "Unassigned", service: "PC Malware Clean", amount: "₹599", status: "FAILED" },
  ];

  return (
    <div className="p-8">
      {/* Page Heading */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">System Overview</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time marketplace monitoring metrics</p>
        </div>
        <div className="flex gap-3 bg-[#0f172a] border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300">
          <TrendingUp size={16} className="text-emerald-400" />
          Marketplace Growth: +24% Year-over-Year
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.name}</span>
                <div className={`w-9 h-9 border rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-white">{stat.value}</h3>
              <p className="text-2xs text-slate-500 mt-1.5 font-medium">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Tables Section */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-base text-white">Recent Transactions Log</h3>
          <span className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer">View All Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                <th className="py-4 px-4">Booking ID</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Service Provider</th>
                <th className="py-4 px-4">Requested Service</th>
                <th className="py-4 px-4 text-right">Amount</th>
                <th className="py-4 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 text-xs font-semibold text-slate-300">
                  <td className="py-4 px-4 text-indigo-400 font-bold">{tx.id}</td>
                  <td className="py-4 px-4 text-white">{tx.customer}</td>
                  <td className="py-4 px-4">{tx.provider}</td>
                  <td className="py-4 px-4">{tx.service}</td>
                  <td className="py-4 px-4 text-right text-white font-bold">{tx.amount}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      tx.status === "SUCCESS"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                        : tx.status === "PENDING"
                        ? "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                        : "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                    }`}>
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
  );
}
