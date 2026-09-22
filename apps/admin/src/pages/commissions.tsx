import React, { useState, useEffect } from "react";
import {
  Percent,
  Save,
  RefreshCw,
  Sliders,
  DollarSign,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { apiClient } from "../api/apiClient";

interface CategoryCommission {
  categoryId: string;
  categoryName: string;
  commissionPercentage: number;
  fixedFee: number;
}

export default function CommissionManagementPage() {
  const [convenienceFee, setConvenienceFee] = useState<number>(29);
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [minWithdrawalLimit, setMinWithdrawalLimit] = useState<number>(500);
  const [globalCommission, setGlobalCommission] = useState<number>(15);

  const [categories, setCategories] = useState<CategoryCommission[]>([
    { categoryId: "mobile", categoryName: "Mobile Repair", commissionPercentage: 15, fixedFee: 0 },
    { categoryId: "ac", categoryName: "AC Repair & Jet Servicing", commissionPercentage: 18, fixedFee: 0 },
    { categoryId: "electrician", categoryName: "Electrician & Wiring", commissionPercentage: 12, fixedFee: 0 },
    { categoryId: "plumber", categoryName: "Plumber & Sanitary", commissionPercentage: 12, fixedFee: 0 },
    { categoryId: "carpenter", categoryName: "Carpenter & Woodwork", commissionPercentage: 15, fixedFee: 0 },
    { categoryId: "cleaning", categoryName: "Home Deep Cleaning", commissionPercentage: 20, fixedFee: 0 },
    { categoryId: "salon", categoryName: "Home Salon & Parlor", commissionPercentage: 20, fixedFee: 0 },
    { categoryId: "appliance", categoryName: "Appliance Repair", commissionPercentage: 15, fixedFee: 0 },
    { categoryId: "painting", categoryName: "Painting & Waterproofing", commissionPercentage: 15, fixedFee: 0 },
    { categoryId: "cctv", categoryName: "CCTV Installation & Security", commissionPercentage: 15, fixedFee: 0 },
    { categoryId: "ro", categoryName: "RO Service & Filter Change", commissionPercentage: 15, fixedFee: 0 },
    { categoryId: "computer", categoryName: "Computer & Laptop Repair", commissionPercentage: 15, fixedFee: 0 },
    { categoryId: "washing_machine", categoryName: "Washing Machine Repair", commissionPercentage: 15, fixedFee: 0 },
    { categoryId: "refrigerator", categoryName: "Refrigerator Repair", commissionPercentage: 15, fixedFee: 0 },
    { categoryId: "pest_control", categoryName: "Pest Control", commissionPercentage: 18, fixedFee: 0 },
  ]);

  const [calcAmount, setCalcAmount] = useState<number>(999);
  const [calcCategory, setCalcCategory] = useState<string>("mobile");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing commission configuration from Firestore
  const loadSettings = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "commissions"));
      if (snap.exists()) {
        const data = snap.data();
        if (data.convenienceFee !== undefined) setConvenienceFee(data.convenienceFee);
        if (data.gstPercentage !== undefined) setGstPercentage(data.gstPercentage);
        if (data.minWithdrawalLimit !== undefined) setMinWithdrawalLimit(data.minWithdrawalLimit);
        if (data.globalCommission !== undefined) setGlobalCommission(data.globalCommission);
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      }
    } catch (e) {
      console.warn("Error loading commission configs:", e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveCommissions = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const configData = {
        convenienceFee: Number(convenienceFee),
        gstPercentage: Number(gstPercentage),
        minWithdrawalLimit: Number(minWithdrawalLimit),
        globalCommission: Number(globalCommission),
        categories,
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, "settings", "commissions"), configData, { merge: true });

      try {
        await apiClient.post("/admin/commissions/update", configData);
      } catch {}

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Error saving commissions: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryRateChange = (catId: string, rate: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.categoryId === catId ? { ...c, commissionPercentage: Math.max(0, rate) } : c))
    );
  };

  // Live Calculator Numbers
  const selectedCatObj = categories.find((c) => c.categoryId === calcCategory) || categories[0];
  const activeRate = selectedCatObj?.commissionPercentage || globalCommission;
  const platformCut = Math.round((calcAmount * activeRate) / 100);
  const gstAmount = Math.round((convenienceFee * gstPercentage) / 100);
  const totalCustomerPays = calcAmount + convenienceFee + gstAmount;
  const partnerPayout = calcAmount - platformCut;
  const totalPlatformGross = platformCut + convenienceFee;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Percent className="text-red-600" size={24} />
            Commission & Revenue Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure platform cuts, convenience fees (₹29), technician shares & payout thresholds
          </p>
        </div>

        <button
          onClick={handleSaveCommissions}
          disabled={isSaving}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-md shadow-red-600/20 transition self-stretch sm:self-auto justify-center"
        >
          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? "Saving..." : "Save Commission Rules"}
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          Commission & Fee structures successfully saved and synced live!
        </div>
      )}

      {/* Global Rules Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            Convenience Fee per Booking (₹)
          </label>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={convenienceFee}
              onChange={(e) => setConvenienceFee(Number(e.target.value))}
              className="w-full text-xl font-black text-slate-900 border-b border-slate-200 focus:border-red-500 focus:outline-none py-1"
            />
          </div>
          <p className="text-[11px] text-slate-400">Fixed convenience fee charged to customer</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            GST on Platform Fees (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={gstPercentage}
              onChange={(e) => setGstPercentage(Number(e.target.value))}
              className="w-full text-xl font-black text-slate-900 border-b border-slate-200 focus:border-red-500 focus:outline-none py-1"
            />
            <span className="font-bold text-slate-400">%</span>
          </div>
          <p className="text-[11px] text-slate-400">Government GST tax applied on invoice</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            Min Partner Payout Threshold (₹)
          </label>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={minWithdrawalLimit}
              onChange={(e) => setMinWithdrawalLimit(Number(e.target.value))}
              className="w-full text-xl font-black text-slate-900 border-b border-slate-200 focus:border-red-500 focus:outline-none py-1"
            />
          </div>
          <p className="text-[11px] text-slate-400">Minimum balance required for withdrawal</p>
        </div>
      </div>

      {/* Main Split: Category Rates + Revenue Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category-wise Rates (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="text-red-600" size={18} />
                Category-Wise Platform Commission Rates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set custom percentage cut for each service domain
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat.categoryId} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">{cat.categoryName}</div>
                  <div className="text-[10px] text-slate-400">Category ID: {cat.categoryId}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-red-500">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={cat.commissionPercentage}
                      onChange={(e) => handleCategoryRateChange(cat.categoryId, Number(e.target.value))}
                      className="w-12 bg-transparent text-sm font-black text-slate-900 text-right focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-500 ml-1">%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Calculator Simulator (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 h-fit">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calculator className="text-red-600" size={18} />
              Commission Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Preview splits for a sample booking</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                Select Service
              </label>
              <select
                value={calcCategory}
                onChange={(e) => setCalcCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName} ({c.commissionPercentage}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                Base Service Job Value (₹)
              </label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 font-mono"
              />
            </div>

            {/* Split Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600 font-sans text-[11px]">
                <span>Customer Base Pay:</span>
                <span>₹{calcAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-sans text-[11px]">
                <span>Platform Convenience Fee:</span>
                <span>+ ₹{convenienceFee}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-sans text-[11px]">
                <span>GST ({gstPercentage}% on fee):</span>
                <span>+ ₹{gstAmount}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm font-sans">
                <span>Total Customer Pays:</span>
                <span className="text-red-600 font-mono">₹{totalCustomerPays}</span>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2.5 mt-2 space-y-1.5">
                <div className="flex justify-between text-emerald-700 font-bold font-sans">
                  <span>Partner Payout ({100 - activeRate}%):</span>
                  <span className="font-mono">₹{partnerPayout}</span>
                </div>
                <div className="flex justify-between text-red-600 font-bold font-sans">
                  <span>Inisha Platform Revenue:</span>
                  <span className="font-mono">₹{totalPlatformGross}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
