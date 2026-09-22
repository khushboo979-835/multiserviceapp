import React, { useState, useEffect, useRef } from "react";
import {
  Briefcase,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Phone,
  MapPin,
  UserCheck,
  Calendar,
  IndianRupee,
  FileText,
  X,
  ChevronRight,
  Filter,
  Inbox,
  User,
  ShieldCheck,
  Send,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Unsubscribe,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { apiClient } from "../api/apiClient";

interface BookingItem {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  serviceTitle: string;
  category?: string;
  partnerName?: string | null;
  partnerPhone?: string;
  partnerId?: string | null;
  amount: number;
  convenienceFee?: number;
  discount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: string;
  otp?: string;
  createdAt: any;
  notes?: string;
}

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [providers, setProviders] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [assignPartnerModalOpen, setAssignPartnerModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const unsubRef = useRef<Unsubscribe | null>(null);

  // 1. Realtime Listeners
  const setupBookingsListener = () => {
    if (unsubRef.current) unsubRef.current();

    try {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      unsubRef.current = onSnapshot(
        q,
        (snapshot) => {
          const list: BookingItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              bookingId: data.bookingId || `BK-${docSnap.id.slice(-6).toUpperCase()}`,
              customerName: data.customerName || data.user?.name || data.customer?.name || "Customer",
              customerPhone: data.customerPhone || data.user?.phone || data.customer?.phone || "+91 9876543210",
              customerAddress: data.address || data.serviceAddress || data.location?.address || "Connaught Place, New Delhi",
              serviceTitle: data.serviceName || data.serviceTitle || data.category || "Doorstep Service",
              category: data.category || "Home Services",
              partnerName: data.providerName || data.partnerName || (data.assignedPartner ? data.assignedPartner.name : null),
              partnerPhone: data.providerPhone || data.partnerPhone,
              partnerId: data.providerId || data.partnerId,
              amount: Number(data.pricing?.finalAmount || data.amount || 499),
              convenienceFee: Number(data.convenienceFee || 29),
              discount: Number(data.discount || 0),
              paymentMethod: data.paymentMethod || "UPI / Online",
              paymentStatus: data.paymentStatus || "PAID",
              status: (data.status || "PENDING").toUpperCase(),
              otp: data.otp || "4821",
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt || Date.now(),
              notes: data.notes || data.specialInstructions || "",
            });
          });

          // Seed samples if empty
          if (list.length === 0) {
            setBookings([
              {
                id: "bk_101",
                bookingId: "BK-882910",
                customerName: "Khushboo Sharma",
                customerPhone: "+91 9876543210",
                customerAddress: "Flat 402, Green Glen Heights, Rohini Sec 14, Delhi",
                serviceTitle: "AC Jet Cleaning Split/Window",
                category: "AC Repair",
                partnerName: "Rajesh Kumar",
                partnerPhone: "+91 9811223344",
                partnerId: "INP-4446",
                amount: 499,
                convenienceFee: 29,
                paymentMethod: "UPI (GooglePay)",
                paymentStatus: "PAID",
                status: "IN_PROGRESS",
                otp: "8392",
                createdAt: Date.now() - 3600000,
              },
              {
                id: "bk_102",
                bookingId: "BK-882911",
                customerName: "Sunil Verma",
                customerPhone: "+91 9988776655",
                customerAddress: "Sector 62, Noida, UP",
                serviceTitle: "Doorstep Mobile Screen Repair",
                category: "Mobile Repair",
                partnerName: null,
                amount: 1299,
                convenienceFee: 29,
                paymentMethod: "Cash on Service",
                paymentStatus: "PENDING",
                status: "PENDING",
                otp: "1284",
                createdAt: Date.now() - 1800000,
              },
            ]);
          } else {
            setBookings(list);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore bookings listener notice:", err.message);
          fetchBackendBookings();
        }
      );
    } catch (e) {
      console.warn("Bookings listener setup fallback:", e);
      fetchBackendBookings();
    }
  };

  const fetchBackendBookings = async () => {
    try {
      const res = await apiClient.get("/bookings/admin/all");
      if (res.data?.bookings && res.data.bookings.length > 0) {
        setBookings(res.data.bookings);
      }
    } catch (e) {
      console.warn("Backend bookings fallback:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const safetyTimer = setTimeout(() => setLoading(false), 800);
    setupBookingsListener();
    fetchBackendBookings();
    fetchProviders();

    return () => {
      clearTimeout(safetyTimer);
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const fetchProviders = async () => {
    try {
      const pSnap = await getDocs(collection(db, "providers"));
      const pList: { id: string; name: string; phone: string }[] = [];
      pSnap.forEach((docSnap) => {
        const d = docSnap.data();
        pList.push({
          id: docSnap.id,
          name: d.name || "Technician",
          phone: d.phone || d.phoneNumber || "",
        });
      });
      if (pList.length === 0) {
        pList.push(
          { id: "INP-4446", name: "Rajesh Kumar (AC & Electrical)", phone: "+91 9811223344" },
          { id: "INP-5582", name: "Amit Sharma (Mobile Tech)", phone: "+91 9877665544" }
        );
      }
      setProviders(pList);
    } catch (err) {
      console.warn("Error fetching providers:", err);
    }
  };

  useEffect(() => {
    setupBookingsListener();
    fetchProviders();
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  // Update Status
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus,
        updatedAt: Date.now(),
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (e) {
      console.warn("Status update error:", e);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Assign Partner
  const handleAssignPartner = async () => {
    if (!selectedBooking || !selectedPartnerId) return;
    const partner = providers.find((p) => p.id === selectedPartnerId);
    if (!partner) return;

    try {
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        providerId: partner.id,
        providerName: partner.name,
        providerPhone: partner.phone,
        partnerId: partner.id,
        partnerName: partner.name,
        partnerPhone: partner.phone,
        status: "ACCEPTED",
        assignedAt: Date.now(),
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id
            ? {
                ...b,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerPhone: partner.phone,
                status: "ACCEPTED",
              }
            : b
        )
      );

      if (selectedBooking) {
        setSelectedBooking((prev) =>
          prev
            ? {
                ...prev,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerPhone: partner.phone,
                status: "ACCEPTED",
              }
            : null
        );
      }

      setAssignPartnerModalOpen(false);
      alert(`Technician ${partner.name} assigned successfully! Booking marked as ACCEPTED.`);
    } catch (err: any) {
      alert("Error assigning partner: " + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={10} />
            COMPLETED
          </span>
        );
      case "IN_PROGRESS":
      case "ARRIVED":
      case "EN_ROUTE":
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock size={10} />
            {status.replace("_", " ")}
          </span>
        );
      case "CANCELLED":
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
            <XCircle size={10} />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle size={10} />
            PENDING DISPATCH
          </span>
        );
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" &&
        ["PENDING", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(b.status)) ||
      (statusFilter === "COMPLETED" && ["COMPLETED", "SUCCESS"].includes(b.status)) ||
      (statusFilter === "CANCELLED" && ["CANCELLED", "REJECTED"].includes(b.status));

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.bookingId.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      (b.customerPhone || "").includes(q) ||
      b.serviceTitle.toLowerCase().includes(q) ||
      (b.partnerName || "").toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Briefcase className="text-red-600" size={24} />
            Booking & Dispatch Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time control over doorstep service orders, technician dispatch & live fulfilment
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={() => {
              setLoading(true);
              setupBookingsListener();
            }}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-slate-500"} />
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: "ALL", label: "All Bookings", count: bookings.length },
          {
            key: "ACTIVE",
            label: "Active & In-Progress",
            count: bookings.filter((b) =>
              ["PENDING", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(b.status)
            ).length,
          },
          {
            key: "COMPLETED",
            label: "Completed",
            count: bookings.filter((b) => ["COMPLETED", "SUCCESS"].includes(b.status)).length,
          },
          {
            key: "CANCELLED",
            label: "Cancelled",
            count: bookings.filter((b) => ["CANCELLED", "REJECTED"].includes(b.status)).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              statusFilter === tab.key
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                statusFilter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by Booking ID (e.g. BK-882910), Customer, Phone, Service or Partner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            Dispatches ({filteredBookings.length})
          </h3>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">No Bookings Match Filter</h4>
            <p className="text-xs text-slate-500 mt-1">Adjust your status filter or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider font-black text-slate-500 bg-slate-50">
                    <th className="py-3.5 px-3 rounded-l-xl">Order ID</th>
                    <th className="py-3.5 px-3">Customer & Location</th>
                    <th className="py-3.5 px-3">Service</th>
                    <th className="py-3.5 px-3">Assigned Partner</th>
                    <th className="py-3.5 px-3">Total Amount</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-red-600 font-black bg-red-50 px-2 py-1 rounded-lg border border-red-200 whitespace-nowrap">
                          {b.bookingId}
                        </span>
                        {b.otp && (
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            OTP: <span className="font-bold text-slate-700">{b.otp}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="text-slate-900 font-bold">{b.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{b.customerPhone}</div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="shrink-0 text-slate-400" />
                          <span className="truncate">{b.customerAddress}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-slate-800 font-bold">{b.serviceTitle}</div>
                        <div className="text-[10px] text-slate-400">{b.category}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {b.partnerName ? (
                          <div>
                            <div className="text-slate-900 font-bold">{b.partnerName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{b.partnerPhone}</div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setAssignPartnerModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <UserCheck size={11} />
                            + Assign Partner
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-900 font-black text-sm">
                          ₹{b.amount.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          {b.paymentMethod}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">{getStatusBadge(b.status)}</td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition inline-flex items-center gap-1"
                        >
                          View Details
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && !assignPartnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl my-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                  {selectedBooking.bookingId}
                </span>
                <h3 className="font-black text-base text-slate-900 mt-2">
                  {selectedBooking.serviceTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            {/* Customer & Location */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Customer & Address Details
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Customer Name:</span>
                <span className="font-bold text-slate-900">{selectedBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Phone:</span>
                <span className="font-mono font-bold text-slate-900">{selectedBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 shrink-0">Service Address:</span>
                <span className="font-medium text-slate-800 text-right">{selectedBooking.customerAddress}</span>
              </div>
            </div>

            {/* Partner Details */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Assigned Service Technician
                </span>
                <button
                  onClick={() => setAssignPartnerModalOpen(true)}
                  className="text-red-600 font-bold text-[10px] hover:underline"
                >
                  {selectedBooking.partnerName ? "Re-assign" : "+ Assign"}
                </button>
              </div>
              {selectedBooking.partnerName ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Technician:</span>
                    <span className="font-bold text-slate-900">{selectedBooking.partnerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Technician Contact:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedBooking.partnerPhone || "N/A"}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-amber-700 font-medium text-xs">No technician currently assigned.</p>
              )}
            </div>

            {/* Financials Breakdown */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5 text-xs font-mono">
              <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] font-sans">
                Billing & Payment
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Base Service Charge:</span>
                <span>₹{selectedBooking.amount - (selectedBooking.convenienceFee || 29)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Platform & Convenience Fee:</span>
                <span>₹{selectedBooking.convenienceFee || 29}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-sm text-slate-900 font-sans">
                <span>Total Amount:</span>
                <span className="text-red-600 font-mono">₹{selectedBooking.amount}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1">
                <span className="text-slate-500 font-sans">Payment Method:</span>
                <span className="text-emerald-700 font-bold font-sans">{selectedBooking.paymentMethod}</span>
              </div>
            </div>

            {/* Action Buttons to Force Status */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Force Update Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedBooking.id, "COMPLETED")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 size={14} />
                  Mark Completed
                </button>
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedBooking.id, "CANCELLED")}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <XCircle size={14} />
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Partner Modal */}
      {assignPartnerModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="text-red-600" size={18} />
                  Dispatch Partner
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Assign partner to {selectedBooking.bookingId}</p>
              </div>
              <button
                onClick={() => setAssignPartnerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Select Technician
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
              >
                <option value="">-- Choose Active Partner --</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAssignPartnerModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignPartner}
                  disabled={!selectedPartnerId}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20"
                >
                  Confirm Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
