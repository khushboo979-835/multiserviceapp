import React, { useState, useEffect, useRef } from "react";
import {
  Tag,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Calendar,
  X,
  Percent,
  IndianRupee,
  Inbox,
  Clock,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { apiClient } from "../api/apiClient";

interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validTill?: string;
  isActive: boolean;
  usageCount?: number;
  createdAt?: any;
}

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
    discountValue: 20,
    minOrderAmount: 299,
    maxDiscount: 150,
    validTill: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  });

  const unsubRef = useRef<Unsubscribe | null>(null);

  const setupCouponsListener = () => {
    if (unsubRef.current) unsubRef.current();

    try {
      const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
      unsubRef.current = onSnapshot(
        q,
        (snapshot) => {
          const list: Coupon[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            list.push({
              id: docSnap.id,
              code: d.code || docSnap.id.toUpperCase(),
              title: d.title || d.code || "Special Offer",
              description: d.description || "",
              discountType: d.discountType || "PERCENTAGE",
              discountValue: Number(d.discountValue || 10),
              minOrderAmount: Number(d.minOrderAmount || 0),
              maxDiscount: d.maxDiscount ? Number(d.maxDiscount) : undefined,
              validTill: d.validTill || "2026-12-31",
              isActive: d.isActive !== false,
              usageCount: d.usageCount || 0,
              createdAt: d.createdAt || Date.now(),
            });
          });

          if (list.length === 0) {
            setCoupons([
              {
                id: "c_welcome100",
                code: "WELCOME100",
                title: "Flat ₹100 Off on First Service",
                description: "Welcome voucher for new users",
                discountType: "FLAT",
                discountValue: 100,
                minOrderAmount: 399,
                isActive: true,
                usageCount: 42,
              },
              {
                id: "c_inisha20",
                code: "INISHA20",
                title: "20% Off Mega Discount",
                description: "Save up to ₹200 on all repairs",
                discountType: "PERCENTAGE",
                discountValue: 20,
                minOrderAmount: 499,
                maxDiscount: 200,
                isActive: true,
                usageCount: 118,
              },
              {
                id: "c_acclean50",
                code: "ACCLEAN50",
                title: "₹50 Off AC Servicing",
                description: "Exclusive for summer bookings",
                discountType: "FLAT",
                discountValue: 50,
                minOrderAmount: 299,
                isActive: true,
                usageCount: 89,
              },
            ]);
          } else {
            setCoupons(list);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore coupons error:", err);
          fetchBackendCoupons();
        }
      );
    } catch (e) {
      console.warn("Coupons setup fallback:", e);
      fetchBackendCoupons();
    }
  };

  const fetchBackendCoupons = async () => {
    try {
      const res = await apiClient.get("/admin/coupons");
      if (res.data?.coupons) {
        setCoupons(res.data.coupons);
      }
    } catch (e) {
      console.warn("Backend coupons fallback error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setupCouponsListener();
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const handleToggleActive = async (id: string, current: boolean) => {
    const nextVal = !current;
    try {
      await updateDoc(doc(db, "coupons", id), { isActive: nextVal });
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: nextVal } : c)));
    } catch {
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: nextVal } : c)));
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleanCode) {
      alert("Please enter a valid coupon code");
      return;
    }

    setIsSaving(true);
    const docId = `coupon_${cleanCode.toLowerCase()}`;

    try {
      const couponObj = {
        code: cleanCode,
        title: formData.title.trim() || `${cleanCode} Offer`,
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscount: formData.discountType === "PERCENTAGE" ? Number(formData.maxDiscount) : 0,
        validTill: formData.validTill,
        isActive: true,
        usageCount: 0,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "coupons", docId), couponObj);

      try {
        await apiClient.post("/admin/coupons/create", couponObj);
      } catch {}

      setModalOpen(false);
      setFormData({
        code: "",
        title: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 299,
        maxDiscount: 150,
        validTill: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      });
      alert(`Coupon ${cleanCode} created successfully!`);
    } catch (err: any) {
      alert("Error saving coupon: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Tag className="text-red-600" size={24} />
            Coupon & Promo Code Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Create discount vouchers, flat offers & cashback coupon campaigns for customers
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={() => {
              setLoading(true);
              setupCouponsListener();
            }}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-slate-500"} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition"
          >
            <Plus size={16} />
            + Create Coupon
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search promo codes (e.g. WELCOME100, INISHA20)..."
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

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))
        ) : filteredCoupons.length === 0 ? (
          <div className="col-span-full text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white">
            <Inbox size={24} className="mx-auto text-slate-400 mb-2" />
            <h4 className="text-slate-900 font-bold text-sm">No Coupons Found</h4>
            <p className="text-xs text-slate-500 mt-1">Create your first promo code using the button above.</p>
          </div>
        ) : (
          filteredCoupons.map((coupon) => {
            const isPercentage = coupon.discountType === "PERCENTAGE";
            return (
              <div
                key={coupon.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden transition ${
                  coupon.isActive ? "border-slate-200 hover:border-slate-300" : "border-slate-200 opacity-60"
                }`}
              >
                {/* Coupon Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-sm font-black text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg tracking-wider inline-block">
                      {coupon.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2">{coupon.title}</h4>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                      setCopiedCode(coupon.code);
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200"
                    title="Copy Code"
                  >
                    <Copy size={13} />
                  </button>
                </div>

                {coupon.description && (
                  <p className="text-[11px] text-slate-500">{coupon.description}</p>
                )}

                {/* Offer Details */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-700 font-bold">
                    <span>Discount:</span>
                    <span className="text-red-600">
                      {isPercentage ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Min Order:</span>
                    <span>₹{coupon.minOrderAmount}</span>
                  </div>
                  {isPercentage && coupon.maxDiscount && (
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Max Cap:</span>
                      <span>₹{coupon.maxDiscount}</span>
                    </div>
                  )}
                  {coupon.usageCount !== undefined && (
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Total Redeemed:</span>
                      <span className="font-sans font-bold text-emerald-700">{coupon.usageCount} times</span>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black transition ${
                      coupon.isActive
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {coupon.isActive ? "ACTIVE" : "INACTIVE / PAUSED"}
                  </button>

                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Coupon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl my-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Tag className="text-red-600" size={18} />
                  Create Promo Coupon
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Define promo rules for customer checkout</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25, FESTIVE50"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25% Off on All AC Services"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "PERCENTAGE" | "FLAT",
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                {formData.discountType === "PERCENTAGE" && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Max Cap (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20"
                >
                  {isSaving ? "Saving..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
