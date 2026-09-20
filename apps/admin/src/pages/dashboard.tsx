import React, { useState, useEffect, useRef } from "react";
import {
  DollarSign,
  Briefcase,
  Users,
  Hammer,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Phone,
  Layers,
  Inbox,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  getDocs,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { apiClient } from "../api/apiClient";

interface LiveBooking {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone?: string;
  serviceTitle: string;
  partnerName?: string | null;
  partnerId?: string | null;
  amount: number;
  status: "PENDING" | "ACCEPTED" | "EN_ROUTE" | "ARRIVED" | "IN_PROGRESS" | "SUCCESS" | "COMPLETED" | "CANCELLED";
  createdAt: string | number;
}

interface DashboardMetrics {
  totalGMV: number;
  platformEarnings: number;
  activeBookingsCount: number;
  totalBookingsCount: number;
  totalCustomersCount: number;
  onlinePartnersCount: number;
  totalPartnersCount: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalGMV: 0,
    platformEarnings: 0,
    activeBookingsCount: 0,
    totalBookingsCount: 0,
    totalCustomersCount: 0,
    onlinePartnersCount: 0,
    totalPartnersCount: 0,
  });

  const [bookings, setBookings] = useState<LiveBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  const unsubscribersRef = useRef<Unsubscribe[]>([]);

  // 1. Production Real-Time Firestore Listeners
  const setupRealtimeListeners = () => {
    // Clean up existing listeners
    unsubscribersRef.current.forEach((unsub) => {
      try {
        unsub();
      } catch {}
    });
    unsubscribersRef.current = [];

    try {
      // Listener A: Live Operations & Dispatch Feed (Latest 20 Bookings)
      const bookingsQuery = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const unsubBookings = onSnapshot(
        bookingsQuery,
        (snapshot) => {
          const liveList: LiveBooking[] = [];
          let gmvSum = 0;
          let activeCount = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            const bookingStatus = (data.status || "PENDING").toUpperCase() as LiveBooking["status"];
            const amount = Number(data.pricing?.finalAmount || data.amount || 0);

            liveList.push({
              id: doc.id,
              bookingId: data.bookingId || `BK-${doc.id.slice(-6).toUpperCase()}`,
              customerName: data.customerName || data.user?.name || data.customer?.name || "Verified Customer",
              customerPhone: data.customerPhone || data.user?.phone || data.customer?.phone,
              serviceTitle: data.serviceName || data.serviceTitle || data.category || "Doorstep Service",
              partnerName: data.providerName || data.partnerName || data.partner?.name || (data.assignedPartner ? data.assignedPartner.name : null),
              partnerId: data.providerId || data.partnerId,
              amount,
              status: bookingStatus,
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt || Date.now(),
            });

            if (bookingStatus === "SUCCESS" || bookingStatus === "COMPLETED") {
              gmvSum += amount;
            }
            if (["PENDING", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "PENDING_PROVIDER"].includes(bookingStatus)) {
              activeCount++;
            }
          });

          setBookings(liveList);
          setMetrics((prev) => ({
            ...prev,
            totalGMV: gmvSum > 0 ? gmvSum : prev.totalGMV,
            platformEarnings: Math.round((gmvSum > 0 ? gmvSum : prev.totalGMV) * 0.15),
            activeBookingsCount: activeCount,
            totalBookingsCount: Math.max(liveList.length, prev.totalBookingsCount),
          }));

          setLoading(false);
          setLastSyncTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        },
        (error) => {
          console.warn("[Firestore Bookings Listener Notice]:", error.message);
          fetchBackendFallbackMetrics();
        }
      );

      unsubscribersRef.current.push(unsubBookings);

      // Listener B: Registered Customers Count
      const usersQuery = query(collection(db, "users"));
      const unsubUsers = onSnapshot(
        usersQuery,
        (snapshot) => {
          let customerCount = 0;
          snapshot.forEach((doc) => {
            const role = String(doc.data().role || "").toLowerCase();
            if (role === "customer" || role === "" || !role) {
              customerCount++;
            }
          });
          setMetrics((prev) => ({ ...prev, totalCustomersCount: Math.max(customerCount, snapshot.size) }));
        },
        (err) => console.warn("[Firestore Users Notice]:", err.message)
      );
      unsubscribersRef.current.push(unsubUsers);

      // Listener C: Active & Online Partners Fleet
      const providersQuery = query(collection(db, "providers"));
      const unsubProviders = onSnapshot(
        providersQuery,
        (snapshot) => {
          let onlineCount = 0;
          let verifiedCount = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.isApproved !== false && data.kycStatus !== "REJECTED") {
              verifiedCount++;
              if (data.isOnline === true) {
                onlineCount++;
              }
            }
          });
          setMetrics((prev) => ({
            ...prev,
            totalPartnersCount: verifiedCount || snapshot.size,
            onlinePartnersCount: onlineCount,
          }));
        },
        (err) => console.warn("[Firestore Providers Notice]:", err.message)
      );
      unsubscribersRef.current.push(unsubProviders);

    } catch (err: any) {
      console.warn("Real-time listener setup error, switching to backend sync:", err);
      fetchBackendFallbackMetrics();
    }
  };

  // 2. Dual Fallback: MongoDB Backend Telemetry Sync
  const fetchBackendFallbackMetrics = async () => {
    try {
      const [metricsRes, bookingsRes] = await Promise.allSettled([
        apiClient.get("/admin/metrics"),
        apiClient.get("/bookings/admin/all"),
      ]);

      if (metricsRes.status === "fulfilled" && metricsRes.value?.data?.metrics) {
        const m = metricsRes.value.data.metrics;
        setMetrics((prev) => ({
          ...prev,
          totalGMV: m.totalGMV ?? prev.totalGMV,
          platformEarnings: m.platformEarnings ?? Math.round((m.totalGMV || 0) * 0.15),
          activeBookingsCount: m.activeBookings ?? prev.activeBookingsCount,
          totalBookingsCount: m.totalBookings ?? prev.totalBookingsCount,
          totalCustomersCount: m.totalCustomers ?? prev.totalCustomersCount,
          onlinePartnersCount: m.liveProviders ?? prev.onlinePartnersCount,
          totalPartnersCount: m.totalProviders ?? prev.totalPartnersCount,
        }));
      }

      if (bookingsRes.status === "fulfilled" && bookingsRes.value?.data?.bookings) {
        const backendBookings = bookingsRes.value.data.bookings.map((b: any) => ({
          id: b._id || b.id,
          bookingId: b.bookingId || `BK-${String(b._id || b.id).slice(-6).toUpperCase()}`,
          customerName: b.customerName || b.user?.name || "Customer",
          customerPhone: b.customerPhone || b.user?.phoneNumber,
          serviceTitle: b.serviceName || b.serviceId || "Doorstep Service",
          partnerName: b.providerName || b.provider?.name || null,
          partnerId: b.providerId,
          amount: b.pricing?.finalAmount || b.amount || 0,
          status: (b.status || "PENDING").toUpperCase(),
          createdAt: b.createdAt || Date.now(),
        }));
        setBookings((prev) => (prev.length === 0 ? backendBookings : prev));
      }
    } catch (apiErr) {
      console.warn("Backend API sync notice:", apiErr);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setLastSyncTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
  };

  // Lifecycle
  useEffect(() => {
    setupRealtimeListeners();
    fetchBackendFallbackMetrics();

    return () => {
      // Unsubscribe all active listeners on component unmount
      unsubscribersRef.current.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
      unsubscribersRef.current = [];
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setupRealtimeListeners();
    await fetchBackendFallbackMetrics();
  };

  // Dynamic KPI Stats Cards
  const stats = [
    {
      name: "Total Gross GMV",
      value: `₹${metrics.totalGMV.toLocaleString("en-IN")}`,
      change: `Platform earnings (15%): ₹${metrics.platformEarnings.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      name: "Active Service Bookings",
      value: `${metrics.activeBookingsCount} Jobs Live`,
      change: `${metrics.totalBookingsCount} lifetime total bookings`,
      icon: Briefcase,
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      name: "Registered Customers",
      value: `${metrics.totalCustomersCount} Users`,
      change: "Direct OTP verified mobile users",
      icon: Users,
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      name: "Active Partners",
      value: `${metrics.onlinePartnersCount} Online / ${metrics.totalPartnersCount}`,
      change: "Verified field technicians & pros",
      icon: Hammer,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <CheckCircle2 size={10} />
            SUCCESS
          </span>
        );
      case "IN_PROGRESS":
      case "ARRIVED":
      case "EN_ROUTE":
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
            <Clock size={10} />
            {status.replace("_", " ")}
          </span>
        );
      case "CANCELLED":
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-950/40 text-rose-400 border border-rose-500/20 whitespace-nowrap">
            <XCircle size={10} />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-950/40 text-amber-400 border border-amber-500/20 whitespace-nowrap">
            <AlertCircle size={10} />
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Responsive Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <TrendingUp className="text-indigo-400" size={24} />
            System Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span>Live production telemetry from Firestore & MongoDB</span>
            {lastSyncTime && (
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                • Synced at {lastSyncTime}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 transition"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-indigo-400" : "text-slate-400"}
            />
            {isRefreshing ? "Syncing..." : "Refresh"}
          </button>
          <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden xs:inline">Real-time</span> Live
          </div>
        </div>
      </div>

      {/* KPI Cards Grid with Skeleton Loader */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-5 shadow-lg animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 w-24 bg-slate-800 rounded" />
                  <div className="w-9 h-9 bg-slate-800 rounded-xl" />
                </div>
                <div className="h-7 w-32 bg-slate-800 rounded" />
                <div className="h-2.5 w-40 bg-slate-800 rounded" />
              </div>
            ))
          : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {stat.name}
                    </span>
                    <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">{stat.change}</div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Live Operations & Dispatch Feed Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Briefcase className="text-indigo-400" size={18} />
              Live Operations & Dispatch Feed
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time incoming customer bookings across Delhi NCR & India ({bookings.length} orders)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-12 bg-slate-800/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-[#020617]/50">
            <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="text-white font-bold text-sm">No active orders right now</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Incoming bookings from customer app will stream here automatically in real-time via Firestore
            </p>
          </div>
        ) : (
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
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-3.5 px-3 font-mono text-indigo-400 font-bold whitespace-nowrap">
                        {booking.bookingId}
                      </td>
                      <td className="py-3.5 px-3 text-white font-bold whitespace-nowrap">
                        <div>{booking.customerName}</div>
                        {booking.customerPhone && (
                          <div className="text-[10px] text-slate-500 font-mono font-normal">
                            {booking.customerPhone}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                        {booking.serviceTitle}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {booking.partnerName ? (
                          <span className="text-slate-200 font-medium">{booking.partnerName}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-500/20">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-white font-bold whitespace-nowrap">
                        ₹{booking.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
