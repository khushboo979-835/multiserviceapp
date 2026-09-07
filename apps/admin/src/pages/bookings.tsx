import React, { useState } from "react";
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  User, 
  Phone, 
  MapPin, 
  Eye, 
  Check, 
  X,
  ChevronRight,
  TrendingUp,
  CreditCard,
  ShieldCheck
} from "lucide-react";

interface AdminBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  category: string;
  date: string;
  timeSlot: string;
  address: string;
  amount: number;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  providerName?: string;
  providerPhone?: string;
  otp: string;
  paymentStatus: "PAID" | "COD" | "PENDING";
}

const INITIAL_BOOKINGS: AdminBooking[] = [
  {
    id: "bk_98234",
    customerName: "Aman Sharma",
    customerPhone: "+91 98765 43210",
    serviceName: "AC Foam Jet Service & Gas Refill",
    category: "Home Repair & Utilities",
    date: "Today, Sep 3",
    timeSlot: "11:00 AM - 01:00 PM",
    address: "Tower 4, Apt 802, DLF Phase 2, Cyber City, Gurugram",
    amount: 588,
    status: "IN_PROGRESS",
    providerName: "Vikram Singh (Technician)",
    providerPhone: "+91 99887 76655",
    otp: "4821",
    paymentStatus: "PAID",
  },
  {
    id: "bk_10923",
    customerName: "Priya Malhotra",
    customerPhone: "+91 98112 34567",
    serviceName: "Express 30-Min City Parcel Delivery",
    category: "Quick Delivery & Courier",
    date: "Today, Sep 3",
    timeSlot: "02:00 PM - 04:00 PM",
    address: "Flat 301, Sector 29, Gurugram",
    amount: 116,
    status: "PENDING",
    otp: "7103",
    paymentStatus: "COD",
  },
  {
    id: "bk_84712",
    customerName: "Rahul Verma",
    customerPhone: "+91 99554 11223",
    serviceName: "Full Home Deep Cleaning",
    category: "Home Cleaning & Housekeeping",
    date: "Tomorrow, Sep 4",
    timeSlot: "09:00 AM - 11:00 AM",
    address: "Villa 12, Golf Course Road, Gurugram",
    amount: 2358,
    status: "ACCEPTED",
    providerName: "Sanjay Kumar",
    providerPhone: "+91 98223 34455",
    otp: "9940",
    paymentStatus: "PAID",
  },
  {
    id: "bk_39234",
    customerName: "Dr. Sunita Sen",
    customerPhone: "+91 97110 99887",
    serviceName: "Doorstep Blood Sample Collection & Lab Test",
    category: "Healthcare & Medical Care",
    date: "Sep 2, 2026",
    timeSlot: "08:00 AM - 10:00 AM",
    address: "B-44, South City 1, Gurugram",
    amount: 706,
    status: "COMPLETED",
    providerName: "Anil Phlebotomist",
    providerPhone: "+91 96554 33221",
    otp: "2234",
    paymentStatus: "PAID",
  },
  {
    id: "bk_55102",
    customerName: "Megha Rao",
    customerPhone: "+91 98991 22334",
    serviceName: "Salon Classic Glow Facial, Waxing",
    category: "Salon, Beauty & Spa",
    date: "Sep 1, 2026",
    timeSlot: "04:00 PM - 06:00 PM",
    address: "Block C, Sushant Lok, Gurugram",
    amount: 1060,
    status: "CANCELLED",
    otp: "1856",
    paymentStatus: "COD",
  }
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>(INITIAL_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  const filterTabs = ["ALL", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = selectedStatus === "ALL" || b.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (bookingId: string, newStatus: AdminBooking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  const getStatusBadge = (status: AdminBooking["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-950/50 text-emerald-400 border-emerald-500/30";
      case "IN_PROGRESS":
        return "bg-blue-950/50 text-blue-400 border-blue-500/30";
      case "ACCEPTED":
        return "bg-teal-950/50 text-teal-400 border-teal-500/30";
      case "CANCELLED":
        return "bg-rose-950/50 text-rose-400 border-rose-500/30";
      default:
        return "bg-amber-950/50 text-amber-400 border-amber-500/30";
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const inProgressCount = bookings.filter((b) => b.status === "IN_PROGRESS" || b.status === "ACCEPTED").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "IN_PROGRESS")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="p-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Calendar className="text-purple-400" size={26} />
            Live Bookings Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time customer dispatch, tracking, and partner order assignments
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#0f172a] border border-slate-800 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-300">
          <ShieldCheck size={16} className="text-purple-400" />
          <span>Inisha Live Dispatch Engine Active</span>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
          <h3 className="text-2xl font-black text-white mt-1">{bookings.length}</h3>
          <p className="text-2xs text-slate-500 mt-1 font-semibold">Across all 6 service categories</p>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Orders</span>
          <h3 className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</h3>
          <p className="text-2xs text-amber-500/80 mt-1 font-semibold">Awaiting technician match</p>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Active In-Progress</span>
          <h3 className="text-2xl font-black text-blue-300 mt-1">{inProgressCount}</h3>
          <p className="text-2xs text-blue-500/80 mt-1 font-semibold">Technicians en route & working</p>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gross Value</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{totalRevenue.toLocaleString()}</h3>
          <p className="text-2xs text-emerald-500/80 mt-1 font-semibold">{completedCount} successfully delivered</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 shadow-xl mb-6 flex flex-col md:flex-row justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedStatus === tab
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="flex items-center bg-[#020617] border border-slate-800 rounded-xl px-4 py-2 w-full md:w-80">
          <Search size={16} className="text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Search ID, customer, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X size={14} className="text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
                <th className="py-4 px-4">Booking ID</th>
                <th className="py-4 px-4">Customer Details</th>
                <th className="py-4 px-4">Service & Slot</th>
                <th className="py-4 px-4">Assigned Partner</th>
                <th className="py-4 px-4 text-right">Amount</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm font-semibold">
                    No bookings found matching your search or filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/20 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-purple-400">
                      #{b.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-white font-bold">{b.customerName}</div>
                      <div className="text-slate-400 text-2xs mt-0.5">{b.customerPhone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-200 font-bold">{b.serviceName}</div>
                      <div className="text-slate-400 text-2xs mt-0.5">{b.date} • {b.timeSlot}</div>
                    </td>
                    <td className="py-4 px-4">
                      {b.providerName ? (
                        <div>
                          <span className="text-teal-400 font-bold">{b.providerName}</span>
                          <div className="text-slate-400 text-2xs">{b.providerPhone}</div>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-bold bg-amber-950/40 border border-amber-500/20 px-2.5 py-1 rounded-lg text-2xs">
                          Auto-Searching...
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="text-white font-extrabold text-sm">₹{b.amount}</div>
                      <div className="text-2xs text-slate-500 uppercase">{b.paymentStatus}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details / Management Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-lg font-black text-white">Manage Booking #{selectedBooking.id}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Order controls and status dispatch</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-[#020617] border border-slate-800/80 rounded-2xl p-4">
                <div className="text-2xs uppercase tracking-wider text-slate-500 font-bold">Service Info</div>
                <div className="text-white font-bold text-sm mt-1">{selectedBooking.serviceName}</div>
                <div className="text-xs text-slate-400 mt-1">{selectedBooking.date} • {selectedBooking.timeSlot}</div>
                <div className="text-xs text-slate-400 mt-2 flex items-start gap-1.5">
                  <MapPin size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  <span>{selectedBooking.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#020617] border border-slate-800/80 rounded-2xl p-3">
                  <div className="text-2xs uppercase tracking-wider text-slate-500 font-bold">Customer</div>
                  <div className="text-white font-bold text-xs mt-1">{selectedBooking.customerName}</div>
                  <div className="text-slate-400 text-2xs mt-0.5">{selectedBooking.customerPhone}</div>
                </div>

                <div className="bg-[#020617] border border-slate-800/80 rounded-2xl p-3">
                  <div className="text-2xs uppercase tracking-wider text-slate-500 font-bold">Security OTP</div>
                  <div className="text-purple-400 font-mono font-black text-base mt-0.5">{selectedBooking.otp}</div>
                  <div className="text-2xs text-slate-500">Customer handover code</div>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="bg-[#020617] border border-slate-800/80 rounded-2xl p-4">
                <div className="text-2xs uppercase tracking-wider text-slate-500 font-bold mb-3">Update Order Status</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "ACCEPTED")}
                    className="bg-teal-950/40 hover:bg-teal-900/60 border border-teal-500/30 text-teal-300 py-2 rounded-xl text-xs font-bold"
                  >
                    Mark Accepted
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "IN_PROGRESS")}
                    className="bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 py-2 rounded-xl text-xs font-bold"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "COMPLETED")}
                    className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 py-2 rounded-xl text-xs font-bold"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "CANCELLED")}
                    className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 py-2 rounded-xl text-xs font-bold"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
