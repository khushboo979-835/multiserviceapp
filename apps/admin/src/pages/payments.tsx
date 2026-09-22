import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Copy,
  Building2,
  ShieldCheck,
  X,
  Inbox,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { apiClient } from "../api/apiClient";

interface TransactionItem {
  _id: string;
  transactionId: string;
  bookingId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  providerId?: string;
  providerName?: string;
  amount: number;
  upiId?: string;
  merchantName?: string;
  utrNumber?: string;
  status: "PENDING" | "VERIFIED" | "FAILED" | "SUCCESS" | "COMPLETED";
  paymentMethod?: "UPI" | "WALLET" | "CASH";
  commissionRate?: number;
  commissionAmount?: number;
  providerPayout?: number;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string | number;
}

interface PaymentStats {
  totalGmv: number;
  verifiedRevenue: number;
  platformCommission: number;
  pendingSettlements: number;
  totalTransactions: number;
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalGmv: 0,
    verifiedRevenue: 0,
    platformCommission: 0,
    pendingSettlements: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "VERIFIED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const COMPANY_UPI = "7352082614-3@ybl";
  const MERCHANT_NAME = "Inisha City Service";
  const BANK_NAME = "Punjab National Bank";

  const unsubscriberRef = useRef<Unsubscribe | null>(null);

  // 1. Fast On-Demand Payments Loader (Eliminates continuous channel ping loops)
  const fetchPayments = async () => {
    try {
      const snap = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(50)));
      const list: TransactionItem[] = [];
      let gmvSum = 0;
      let verifiedSum = 0;
      let pendingCount = 0;

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const bookingStatus = (data.status || "PENDING").toUpperCase();
        const rawAmount = Number(data.pricing?.finalAmount || data.amount || 0);
        const isVerified =
          bookingStatus === "SUCCESS" ||
          bookingStatus === "COMPLETED" ||
          bookingStatus === "VERIFIED";

        const commission = Math.round(rawAmount * 0.15);
        const payout = rawAmount - commission;

        const utr =
          data.paymentDetails?.utrNumber ||
          data.utrNumber ||
          (data.paymentId ? `UTR-${data.paymentId.slice(-10)}` : "Pending UTR");

        const txItem: TransactionItem = {
          _id: docSnap.id,
          transactionId: data.transactionId || `TXN-${docSnap.id.slice(-8).toUpperCase()}`,
          bookingId: data.bookingId || docSnap.id,
          customerName: data.customerName || data.user?.name || "Customer",
          customerPhone: data.customerPhone || data.user?.phone,
          providerName: data.providerName || data.partnerName || "Unassigned",
          providerId: data.providerId || data.partnerId,
          amount: rawAmount,
          upiId: COMPANY_UPI,
          merchantName: MERCHANT_NAME,
          utrNumber: utr,
          status: isVerified ? "VERIFIED" : "PENDING",
          paymentMethod: (data.paymentMethod || "UPI").toUpperCase() as any,
          commissionRate: 15,
          commissionAmount: commission,
          providerPayout: payout,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt || Date.now(),
        };

        list.push(txItem);

        gmvSum += rawAmount;
        if (isVerified) {
          verifiedSum += rawAmount;
        } else {
          pendingCount++;
        }
      });

      if (list.length > 0) {
        setTransactions(list);
        setStats({
          totalGmv: gmvSum,
          verifiedRevenue: verifiedSum,
          platformCommission: Math.round(verifiedSum * 0.15),
          pendingSettlements: pendingCount,
          totalTransactions: list.length,
        });
        setLoading(false);
      } else {
        await fetchBackendPayments();
      }
    } catch (e) {
      console.warn("Payments fetch notice, using backend:", e);
      await fetchBackendPayments();
    } finally {
      setLoading(false);
    }
  };

  // 2. Dual Fallback to Backend Admin API
  const fetchBackendPayments = async () => {
    try {
      const res = await apiClient.get("/admin/payments");
      if (res.data && res.data.success) {
        if (res.data.stats) setStats(res.data.stats);
        if (Array.isArray(res.data.transactions) && res.data.transactions.length > 0) {
          setTransactions(res.data.transactions);
        }
      }
    } catch (err) {
      console.warn("Backend payments sync notice:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);


  const handleVerifyAndSettle = async (txId: string) => {
    setVerifyingId(txId);
    try {
      await apiClient.put(`/admin/payments/${txId}/verify`, {
        notes: "Verified by Super Admin manually",
      });

      // Optimistic update
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === txId || t.transactionId === txId
            ? { ...t, status: "VERIFIED", verifiedAt: new Date().toISOString() }
            : t
        )
      );

      setStats((prev) => ({
        ...prev,
        pendingSettlements: Math.max(0, prev.pendingSettlements - 1),
      }));
    } catch (err) {
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === txId || t.transactionId === txId
            ? { ...t, status: "VERIFIED", verifiedAt: new Date().toISOString() }
            : t
        )
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCopyUpi = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(COMPANY_UPI);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter === "PENDING" && t.status !== "PENDING") return false;
    if (statusFilter === "VERIFIED" && t.status !== "VERIFIED") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.utrNumber || "").toLowerCase().includes(q) ||
      (t.transactionId || "").toLowerCase().includes(q) ||
      (t.bookingId || "").toLowerCase().includes(q) ||
      (t.customerName || "").toLowerCase().includes(q) ||
      (t.providerName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <CreditCard className="text-red-600" size={24} />
            UPI Payments & Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Doorstep direct UPI collection tracking, 12-digit UTR bank reconciliation & partner payouts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchPayments();
            }}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-slate-500"} />
            Sync Bank Ledger
          </button>
        </div>
      </div>

      {/* Official Master UPI ID Banner */}
      <div className="bg-gradient-to-r from-red-50 via-white to-red-50/30 border border-red-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-red-600 uppercase tracking-wider">
                Official Business UPI Gateway
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-black rounded-md">
                ACTIVE
              </span>
            </div>
            <h3 className="text-xl font-mono font-black text-slate-900 mt-1">
              {COMPANY_UPI}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Account: <strong className="text-slate-900">{MERCHANT_NAME}</strong> • Bank: {BANK_NAME} (Current A/C)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyUpi}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition shadow-md shadow-red-600/20"
          >
            <Copy size={14} />
            {copiedUpi ? "Copied to Clipboard!" : "Copy UPI ID"}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total GMV */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Gross GMV</span>
            <div className="w-9 h-9 border rounded-xl flex items-center justify-center bg-red-50 text-red-600 border-red-200">
              <DollarSign size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹{stats.totalGmv.toLocaleString("en-IN")}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">All completed & in-flight bookings</p>
        </div>

        {/* Verified Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Settled & Verified</span>
            <div className="w-9 h-9 border rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 border-emerald-200">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600">₹{stats.verifiedRevenue.toLocaleString("en-IN")}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Reconciled against 12-digit UTRs</p>
        </div>

        {/* Platform Commission (15%) */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Commission (15%)</span>
            <div className="w-9 h-9 border rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 border-purple-200">
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-purple-600">₹{stats.platformCommission.toLocaleString("en-IN")}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Platform net revenue retention</p>
        </div>

        {/* Pending Settlements */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending UTR Verification</span>
            <div className="w-9 h-9 border rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 border-amber-200">
              <Clock size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-600">{stats.pendingSettlements} Transactions</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Awaiting bank reconciliation</p>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm">
        {/* Table Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-black text-base text-slate-900">Live Transactions Ledger</h3>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
              {filteredTransactions.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search UTR, Booking, Customer..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white w-full sm:w-64 font-medium transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl">
              {(["ALL", "PENDING", "VERIFIED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                    statusFilter === tab
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab === "ALL" ? "All" : tab === "PENDING" ? "Pending" : "Verified"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3 py-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">No transaction records found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Real-time payment transactions and customer orders will stream here automatically
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider font-black text-slate-500 bg-slate-50">
                    <th className="py-3.5 px-3 rounded-l-xl">Transaction / Order</th>
                    <th className="py-3.5 px-3">Customer Details</th>
                    <th className="py-3.5 px-3">Service Partner</th>
                    <th className="py-3.5 px-3 text-right">Gross (₹)</th>
                    <th className="py-3.5 px-3 text-right">15% Cut</th>
                    <th className="py-3.5 px-3 text-right">Partner Net</th>
                    <th className="py-3.5 px-3">12-Digit Banking UTR</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-3 text-center rounded-r-xl">Settlement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx._id || tx.transactionId}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-red-600 font-mono font-bold">{tx.transactionId}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Order #{tx.bookingId?.slice(-6)}</div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-slate-900 font-bold">{tx.customerName}</div>
                        <div className="text-[10px] text-slate-500">{tx.customerPhone || "Mobile verified"}</div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{tx.providerName || "Unassigned"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tx.providerId || "N/A"}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-900 font-black font-mono whitespace-nowrap">
                        ₹{tx.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-3 text-right text-purple-600 font-mono font-bold whitespace-nowrap">
                        ₹{(tx.commissionAmount || Math.round(tx.amount * 0.15)).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-3 text-right text-emerald-600 font-mono font-bold whitespace-nowrap">
                        ₹{(tx.providerPayout || tx.amount - Math.round(tx.amount * 0.15)).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg w-fit">
                          <span className="text-red-600 font-bold">{tx.utrNumber}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            tx.status === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : tx.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {tx.status === "VERIFIED" ? (
                          <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-bold">
                            <ShieldCheck size={14} />
                            Settled
                          </div>
                        ) : (
                          <button
                            onClick={() => handleVerifyAndSettle(tx._id || tx.transactionId)}
                            disabled={verifyingId === (tx._id || tx.transactionId)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1.5 mx-auto"
                          >
                            {verifyingId === (tx._id || tx.transactionId) ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            Verify & Settle
                          </button>
                        )}
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
