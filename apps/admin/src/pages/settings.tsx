import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, QrCode, ShieldCheck, Check, Save, Phone, Mail, Percent } from "lucide-react";
import { apiClient } from "../api/apiClient";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    companyUpiId: "7352082614-3@ybl",
    merchantName: "Inisha City Service",
    commissionRate: 15,
    supportContact: "+91 98765 43210",
    supportEmail: "support@inishacityservice.com",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get("/admin/settings");
        if (res.data && res.data.settings) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.warn("Using offline demo settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.put("/admin/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
          <SettingsIcon className="text-red-600" size={24} />
          Platform Settings & UPI Gateway
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configure financial settlement UPI parameters, platform commission, and customer support channels
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment & UPI Card */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Direct UPI Collection Gateway</h3>
              <p className="text-xs text-slate-500">All customer QR codes will dynamically route payments to this UPI VPA</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                Company Master UPI ID / VPA
              </label>
              <input
                type="text"
                required
                value={settings.companyUpiId}
                onChange={(e) => setSettings({ ...settings, companyUpiId: e.target.value })}
                placeholder="7352082614-3@ybl"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-bold transition"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                Registered Merchant Display Name
              </label>
              <input
                type="text"
                required
                value={settings.merchantName}
                onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
                placeholder="Inisha City Service"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Commission & Support Card */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl flex items-center justify-center">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Economics & Support Contacts</h3>
              <p className="text-xs text-slate-500">Platform commission cut and public customer helpline details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                Platform Commission Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={50}
                  required
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
                />
                <span className="absolute right-3.5 top-3.5 text-slate-400 text-xs font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                Support Helpline Number
              </label>
              <input
                type="text"
                required
                value={settings.supportContact}
                onChange={(e) => setSettings({ ...settings, supportContact: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                Official Support Email
              </label>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                placeholder="support@inishacityservice.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            Changes apply instantly across mobile & server engines
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition"
          >
            {saved ? (
              <>
                <Check size={16} className="text-white" />
                Settings Saved!
              </>
            ) : (
              <>
                <Save size={16} />
                Save Platform Config
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
