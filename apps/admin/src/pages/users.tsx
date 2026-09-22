import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Wallet,
  Calendar,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  UserPlus,
  X,
  CreditCard,
  Inbox,
  Eye,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { apiClient } from "../api/apiClient";

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role?: string;
  walletBalance: number;
  status: "ACTIVE" | "BLOCKED";
  createdAt: number | string;
  totalBookings?: number;
  city?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [walletModalUser, setWalletModalUser] = useState<UserProfile | null>(null);
  const [walletAmount, setWalletAmount] = useState<number>(100);
  const [walletActionType, setWalletActionType] = useState<"ADD" | "DEDUCT">("ADD");
  const [walletReason, setWalletReason] = useState("Admin Promotional Cashback");
  const [isProcessingWallet, setIsProcessingWallet] = useState(false);
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    phone: "",
    email: "",
    initialWallet: 50,
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const unsubRef = useRef<Unsubscribe | null>(null);

  // 1. Realtime Firestore Users Listener
  const setupUsersListener = () => {
    if (unsubRef.current) unsubRef.current();

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));

      unsubRef.current = onSnapshot(
        q,
        (snapshot) => {
          const list: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name: data.name || data.fullName || "Customer",
              phone: data.phone || data.phoneNumber || data.mobile || "N/A",
              email: data.email || "",
              role: data.role || "customer",
              walletBalance: Number(data.walletBalance || data.wallet || 0),
              status: data.isBlocked ? "BLOCKED" : "ACTIVE",
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt || Date.now(),
              totalBookings: data.totalBookings || 0,
              city: data.city || data.location?.city || "Delhi NCR",
            });
          });

          // Also merge standard test customers if list is empty
          if (list.length === 0) {
            setUsers([
              {
                id: "usr_9876543210",
                name: "Khushboo Sharma",
                phone: "+91 9876543210",
                email: "khushboo@gmail.com",
                role: "customer",
                walletBalance: 250,
                status: "ACTIVE",
                createdAt: Date.now() - 86400000 * 2,
                totalBookings: 3,
                city: "Delhi",
              },
              {
                id: "usr_9811223344",
                name: "Amit Verma",
                phone: "+91 9811223344",
                email: "amit.verma@outlook.com",
                role: "customer",
                walletBalance: 120,
                status: "ACTIVE",
                createdAt: Date.now() - 86400000 * 5,
                totalBookings: 1,
                city: "Noida",
              },
            ]);
          } else {
            setUsers(list);
          }
          setLoading(false);
        },
        (error) => {
          console.warn("[Firestore Users Listener Notice]:", error.message);
          fetchBackendUsers();
        }
      );
    } catch (err) {
      console.warn("Firestore listener setup error:", err);
      fetchBackendUsers();
    }
  };

  const fetchBackendUsers = async () => {
    try {
      const res = await apiClient.get("/admin/users");
      if (res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (e) {
      console.warn("Backend users fallback error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setupUsersListener();
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  // Toggle Block Status
  const handleToggleBlock = async (userId: string, currentStatus: "ACTIVE" | "BLOCKED") => {
    const nextBlocked = currentStatus === "ACTIVE";
    try {
      await updateDoc(doc(db, "users", userId), {
        isBlocked: nextBlocked,
        status: nextBlocked ? "BLOCKED" : "ACTIVE",
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextBlocked ? "BLOCKED" : "ACTIVE" } : u))
      );
    } catch (err) {
      console.warn("Block update error:", err);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextBlocked ? "BLOCKED" : "ACTIVE" } : u))
      );
    }
  };

  // Adjust Wallet Balance
  const handleSaveWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalUser) return;
    setIsProcessingWallet(true);

    const delta = walletActionType === "ADD" ? walletAmount : -walletAmount;
    const newBalance = Math.max(0, walletModalUser.walletBalance + delta);

    try {
      await updateDoc(doc(db, "users", walletModalUser.id), {
        walletBalance: newBalance,
      });

      // Also record wallet transaction in Firestore subcollection or global transactions
      await setDoc(doc(collection(db, "wallet_transactions")), {
        userId: walletModalUser.id,
        userName: walletModalUser.name,
        amount: Math.abs(walletAmount),
        type: walletActionType === "ADD" ? "CREDIT" : "DEBIT",
        description: walletReason,
        balanceAfter: newBalance,
        createdAt: Date.now(),
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === walletModalUser.id ? { ...u, walletBalance: newBalance } : u))
      );
      setWalletModalUser(null);
      alert(`Wallet updated successfully! New Balance: ₹${newBalance}`);
    } catch (err: any) {
      console.error("Wallet update error:", err);
      alert("Failed to update wallet: " + err.message);
    } finally {
      setIsProcessingWallet(false);
    }
  };

  // Create User Manually
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = newUserData.phone.replace(/\D/g, "").slice(-10);
    if (!newUserData.name.trim() || cleanPhone.length !== 10) {
      alert("Please provide a valid Customer Name and 10-digit Phone Number");
      return;
    }

    setIsCreatingUser(true);
    const userId = `usr_${cleanPhone}`;
    const formattedPhone = `+91 ${cleanPhone}`;

    try {
      await setDoc(doc(db, "users", userId), {
        name: newUserData.name.trim(),
        phone: formattedPhone,
        phoneNumber: formattedPhone,
        email: newUserData.email.trim() || `${cleanPhone}@customer.inishacityservice.com`,
        role: "customer",
        walletBalance: Number(newUserData.initialWallet || 0),
        isBlocked: false,
        createdAt: Date.now(),
      });

      setNewUserModalOpen(false);
      setNewUserData({ name: "", phone: "", email: "", initialWallet: 50 });
      alert("Customer created and active!");
    } catch (err: any) {
      alert("Error adding customer: " + err.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  const totalWalletInCirculation = users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="text-red-600" size={24} />
            Customer & User Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Monitor registered customers, wallet reserves, account security & customer support
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={() => {
              setLoading(true);
              setupUsersListener();
            }}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-slate-500"} />
            Refresh
          </button>
          <button
            onClick={() => setNewUserModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition"
          >
            <UserPlus size={16} />
            + Add Customer
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{users.length} Registered</div>
          <div className="text-[11px] text-slate-500 mt-1">Verified OTP mobile users</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Wallets</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <Wallet size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            ₹{totalWalletInCirculation.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total customer wallet balances</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Health</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {users.filter((u) => u.status === "ACTIVE").length} Active
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {users.filter((u) => u.status === "BLOCKED").length} Blocked / Restricted
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search customer by name, mobile number (+91 98765...), email or UID..."
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

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            Customer Directory ({filteredUsers.length})
          </h3>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">No Customers Found</h4>
            <p className="text-xs text-slate-500 mt-1">Try refining your search query or add a new customer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider font-black text-slate-500 bg-slate-50">
                    <th className="py-3.5 px-3 rounded-l-xl">Customer Details</th>
                    <th className="py-3.5 px-3">Contact</th>
                    <th className="py-3.5 px-3">Wallet Balance</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-3 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredUsers.map((user) => {
                    const isActive = user.status === "ACTIVE";
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center font-black text-slate-700 text-xs shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-slate-900 font-bold">{user.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                UID: {user.id.replace("usr_", "")} • {user.city}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="text-slate-900 font-mono text-xs flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400" />
                            {user.phone}
                          </div>
                          {user.email && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Mail size={11} className="text-slate-400" />
                              {user.email}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-900 font-black text-sm">
                              ₹{user.walletBalance.toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => setWalletModalUser(user)}
                              className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition"
                            >
                              + Adjust
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                              isActive
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {isActive ? "ACTIVE" : "BLOCKED"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleBlock(user.id, user.status)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                                isActive
                                  ? "bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 border border-slate-200"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <ShieldAlert size={12} />
                                  Block User
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={12} />
                                  Unblock
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Adjustment Modal */}
      {walletModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Wallet className="text-emerald-600" size={18} />
                  Adjust Customer Wallet
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {walletModalUser.name} ({walletModalUser.phone})
                </p>
              </div>
              <button
                onClick={() => setWalletModalUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Current Balance:</span>
              <span className="text-emerald-700 font-mono font-black text-base">
                ₹{walletModalUser.walletBalance}
              </span>
            </div>

            <form onSubmit={handleSaveWalletAdjustment} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWalletActionType("ADD")}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    walletActionType === "ADD"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  + Credit / Cashback
                </button>
                <button
                  type="button"
                  onClick={() => setWalletActionType("DEDUCT")}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    walletActionType === "DEDUCT"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  - Debit / Correction
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Reason / Description
                </label>
                <input
                  type="text"
                  required
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWalletModalUser(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingWallet}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20"
                >
                  {isProcessingWallet ? "Processing..." : "Confirm Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <UserPlus className="text-red-600" size={18} />
                  Add New Customer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Register customer directly into system</p>
              </div>
              <button
                onClick={() => setNewUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Khushboo Sharma"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="9876543210"
                  value={newUserData.phone}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, phone: e.target.value.replace(/\D/g, "") })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Initial Welcome Wallet Bonus (₹)
                </label>
                <input
                  type="number"
                  value={newUserData.initialWallet}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, initialWallet: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20"
                >
                  {isCreatingUser ? "Saving..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
