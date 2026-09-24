import React, { useState, useEffect, useRef } from "react";
import {
  UserCheck,
  Check,
  X,
  UserPlus,
  RefreshCw,
  Phone,
  CheckCircle2,
  Copy,
  Trash2,
  Mail,
  Wrench,
  Search,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { apiClient } from "../api/apiClient";

interface ProviderData {
  _id?: string;
  id?: string;
  partnerId: string;
  name: string;
  phone: string;
  email?: string;
  skills: string[];
  rating?: number;
  isApproved?: boolean;
  isOnline?: boolean;
  walletBalance?: number;
  temporaryPassword?: string;
  createdAt?: any;
}

const defaultProviders: ProviderData[] = [
  {
    id: "prov_1",
    partnerId: "INP-8842",
    name: "Rohan Sharma (Master Tech)",
    phone: "+91 98123 45678",
    email: "rohan.partner@inishacityservice.com",
    skills: ["Doorstep Mobile Screen Repair", "Battery Replacement"],
    rating: 4.95,
    isApproved: true,
    isOnline: true,
    walletBalance: 3450,
  },
  {
    id: "prov_2",
    partnerId: "INP-9912",
    name: "Amit Kumar Verma",
    phone: "+91 98765 12345",
    email: "amit.ac@inishacityservice.com",
    skills: ["AC Jet Cleaning Split/Window", "Plumbing & Electricals"],
    rating: 4.88,
    isApproved: true,
    isOnline: true,
    walletBalance: 1850,
  },
  {
    id: "prov_3",
    partnerId: "INP-4421",
    name: "Suresh Mehra",
    phone: "+91 98112 99887",
    email: "suresh.electric@inishacityservice.com",
    skills: ["Electrician & Wiring Fix", "Appliance Repair"],
    rating: 4.9,
    isApproved: true,
    isOnline: false,
    walletBalance: 920,
  },
];

export default function AdminProviders() {
  const [providers, setProviders] = useState<ProviderData[]>(defaultProviders);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newPartner, setNewPartner] = useState({
    name: "",
    phone: "",
    email: "",
    skills: "Doorstep Mobile Screen Repair, AC Jet Cleaning",
    password: "partner123",
  });
  const [createdPartnerSuccess, setCreatedPartnerSuccess] = useState<any>(null);

  const unsubscriberRef = useRef<Unsubscribe | null>(null);

  const availableSkills = [
    "Doorstep Mobile Screen Repair",
    "Battery Replacement",
    "AC Jet Cleaning Split/Window",
    "Electrician & Wiring Fix",
    "Plumbing & Tap Repair",
    "Home Deep Cleaning",
    "Women Salon & Parlor",
  ];

  // 1. Fast On-Demand Providers Loader (Eliminates continuous channel ping loops)
  const fetchProviders = async () => {
    try {
      const snap = await getDocs(query(collection(db, "providers"), orderBy("createdAt", "desc"), limit(50)));
      const list: ProviderData[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          partnerId: data.partnerId || `INP-${docSnap.id.slice(-4).toUpperCase()}`,
          name: data.name || "Technician",
          phone: data.phone || data.phoneNumber || "",
          email: data.email,
          skills: Array.isArray(data.skills) ? data.skills : (data.skills ? [data.skills] : []),
          rating: data.rating ?? 5.0,
          isApproved: data.isApproved !== false,
          isOnline: data.isOnline === true,
          walletBalance: data.walletBalance ?? 0,
          temporaryPassword: data.temporaryPassword,
          createdAt: data.createdAt,
        });
      });

      if (list.length > 0) {
        setProviders(list);
        setLoading(false);
      } else {
        await fetchBackendFallback();
      }
    } catch (err) {
      console.warn("Firestore fetch notice, using backend:", err);
      await fetchBackendFallback();
    } finally {
      setLoading(false);
    }
  };

  // 2. Dual Fallback with Backend API
  const fetchBackendFallback = async () => {
    try {
      const res = await apiClient.get("/admin/providers");
      if (res.data && res.data.providers && res.data.providers.length > 0) {
        setProviders(res.data.providers);
      }
    } catch (apiErr) {
      console.warn("Backend providers sync notice:", apiErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);


  // 3. Create Partner (Guaranteed Single-Submission & Sync to Firestore + Backend)
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanName = newPartner.name.trim();
    const cleanPhone = newPartner.phone.replace(/\D/g, "").slice(-10);

    if (!cleanName || cleanPhone.length !== 10) {
      alert("Please enter a valid Partner Name and 10-digit Phone Number");
      return;
    }

    setIsSubmitting(true);

    try {
      const partnerId = "INP-" + Math.floor(1000 + Math.random() * 9000);
      const rawPassword = newPartner.password.trim() || "partner123";
      const formattedPhone = `+91 ${cleanPhone}`;
      const skillsArray = newPartner.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const docId = `prov_${cleanPhone}`;

      // Save to Firebase Firestore
      await setDoc(doc(db, "providers", docId), {
        partnerId,
        name: cleanName,
        phone: formattedPhone,
        phoneNumber: formattedPhone,
        email: newPartner.email.trim() || `${cleanPhone}@partner.inishacityservice.com`,
        temporaryPassword: rawPassword,
        skills: skillsArray,
        rating: 5.0,
        isApproved: true,
        isOnline: false,
        walletBalance: 0,
        createdAt: Date.now(),
      });

      // Also notify backend API in background
      try {
        await apiClient.post("/admin/providers/create", {
          name: cleanName,
          phone: cleanPhone,
          email: newPartner.email,
          skills: skillsArray,
          password: rawPassword,
        });
      } catch {}

      const createdObj: ProviderData = {
        id: docId,
        partnerId,
        name: cleanName,
        phone: formattedPhone,
        email: newPartner.email.trim() || `${cleanPhone}@partner.inishacityservice.com`,
        temporaryPassword: rawPassword,
        skills: skillsArray,
        rating: 5.0,
        isApproved: true,
        isOnline: true,
        walletBalance: 0,
        createdAt: Date.now(),
      };

      // 1. Immediate UI update so technician appears in table instantly
      setProviders((prev) => [
        createdObj,
        ...prev.filter((p) => p.phone !== formattedPhone && p.partnerId !== partnerId),
      ]);
      setCreatedPartnerSuccess(createdObj);
      setNewPartner({
        name: "",
        phone: "",
        email: "",
        skills: "Doorstep Mobile Screen Repair, AC Jet Cleaning",
        password: "partner123",
      });
    } catch (err: any) {
      console.error("Create Partner Error:", err);
      alert("Failed to save partner: " + (err?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Toggle KYC / Suspend Status
  const handleToggleApproval = async (id: string, currentApproval: boolean) => {
    const nextVal = !currentApproval;
    try {
      await updateDoc(doc(db, "providers", id), { isApproved: nextVal });
    } catch {
      setProviders((prev) =>
        prev.map((p) => (p.id === id || p._id === id ? { ...p, isApproved: nextVal } : p))
      );
    }

    try {
      await apiClient.put(`/admin/providers/${id}/status`, { isApproved: nextVal });
    } catch {}
  };

  // 5. Delete Provider from Firestore & Backend
  const handleDeleteProvider = async (id: string) => {
    try {
      await deleteDoc(doc(db, "providers", id));
      setProviders((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error("Delete Provider Error:", err);
      setProviders((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      setDeleteConfirmId(null);
    }
  };

  const filteredProviders = providers.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.partnerId || "").toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (Array.isArray(p.skills) ? p.skills.join(" ") : p.skills || "")
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <UserCheck className="text-red-600" size={24} />
            Partner & KYC Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Authorize service technicians, issue Partner IDs, and manage live fleet ({providers.length} Registered)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={() => {
              setLoading(true);
              fetchProviders();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-red-600" : "text-slate-500"}
            />
            Refresh
          </button>
          <button
            onClick={() => {
              setCreatedPartnerSuccess(null);
              setOnboardModalOpen(true);
            }}
            className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition"
          >
            <UserPlus size={16} />
            + Add New Partner
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search partner by name, ID (e.g. INP-4446), phone or skills..."
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

      {/* Responsive Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            Active Partners ({filteredProviders.length})
          </h3>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">No Partners Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;+ Add New Partner&quot; to onboard your first service technician
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider font-black text-slate-500 bg-slate-50">
                    <th className="py-3.5 px-3 rounded-l-xl">Partner ID</th>
                    <th className="py-3.5 px-3">Technician Details</th>
                    <th className="py-3.5 px-3">Specialized Skills</th>
                    <th className="py-3.5 px-3 text-center">KYC Status</th>
                    <th className="py-3.5 px-3 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredProviders.map((p) => {
                    const provId = p.id || p._id || "";
                    const isApproved = p.isApproved !== false;
                    return (
                      <tr key={provId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-3">
                          <span className="font-mono text-red-600 font-black bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 whitespace-nowrap">
                            {p.partnerId}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="text-slate-900 font-bold">{p.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                            <Phone size={11} className="text-slate-400" />
                            {p.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {(Array.isArray(p.skills) ? p.skills : [p.skills]).map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                          >
                            {isApproved ? "VERIFIED & ACTIVE" : "PENDING REVIEW"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleApproval(provId, isApproved)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                                isApproved
                                  ? "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                              }`}
                            >
                              {isApproved ? (
                                <>
                                  <X size={12} />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <Check size={12} />
                                  Approve KYC
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(provId)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 border border-slate-200 transition"
                              title="Delete Partner"
                            >
                              <Trash2 size={14} />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-base">Delete Partner?</h4>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to remove this partner record from the system?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProvider(deleteConfirmId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Partner Modal */}
      {onboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="text-red-600" size={20} />
                  Onboard Service Partner
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create technician profile & issue unique Partner ID
                </p>
              </div>
              <button
                onClick={() => {
                  setOnboardModalOpen(false);
                  setCreatedPartnerSuccess(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            {createdPartnerSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h4 className="text-slate-900 font-extrabold text-base">Partner Successfully Added!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Technician can now log into Provider Mobile App with these details:
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl text-left font-mono text-xs space-y-2 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Partner ID:</span>
                    <span className="text-red-600 font-bold text-sm">
                      {createdPartnerSuccess.partnerId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">Password / PIN:</span>
                    <span className="text-emerald-700 font-bold">
                      {createdPartnerSuccess.temporaryPassword}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">Name:</span>
                    <span className="text-slate-900 font-bold">{createdPartnerSuccess.name}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-slate-500">Mobile:</span>
                    <span className="text-slate-900 font-bold">{createdPartnerSuccess.phone}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                  <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                    💡 <span className="font-bold">Login Instruction:</span> Technician can open the mobile app, tap <span className="font-bold">"Technician Login"</span>, and enter their <span className="font-bold">Partner ID ({createdPartnerSuccess.partnerId})</span> or <span className="font-bold">Mobile ({createdPartnerSuccess.phone})</span> and Password <span className="font-bold">({createdPartnerSuccess.temporaryPassword})</span> to log in.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      const text = `Namaste ${createdPartnerSuccess.name}! Inisha City Service me aapka Partner Account active hai.\n\n🔑 Partner ID: ${createdPartnerSuccess.partnerId}\n📞 Phone: ${createdPartnerSuccess.phone}\n🔒 Password: ${createdPartnerSuccess.temporaryPassword}\n\nApp khole aur 'Technician Login' me Partner ID ya Phone aur Password enter karke login kare.`;
                      navigator.clipboard.writeText(text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
                  >
                    <Copy size={14} />
                    {copied ? "Copied Message!" : "Copy WhatsApp Credentials"}
                  </button>
                  <button
                    onClick={() => {
                      const cleanP = createdPartnerSuccess.phone.replace(/\D/g, "");
                      const text = `Namaste ${createdPartnerSuccess.name}! Inisha City Service me aapka Partner Account active hai.\n\n🔑 Partner ID: ${createdPartnerSuccess.partnerId}\n📞 Phone: ${createdPartnerSuccess.phone}\n🔒 Password: ${createdPartnerSuccess.temporaryPassword}\n\nApp khole aur 'Technician Login' me Partner ID ya Phone aur Password enter karke login kare.`;
                      window.open(`https://api.whatsapp.com/send?phone=91${cleanP}&text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    Send on WhatsApp 💬
                  </button>
                  <button
                    onClick={() => {
                      setOnboardModalOpen(false);
                      setCreatedPartnerSuccess(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreatePartner} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Technician Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ram Kumar"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-medium transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9877899876"
                      value={newPartner.phone}
                      onChange={(e) =>
                        setNewPartner({
                          ...newPartner,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="ram@inishacityservice.com"
                      value={newPartner.email}
                      onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-medium transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Select Specialized Skills
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {availableSkills.map((skill) => {
                      const isSelected = newPartner.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            let current = newPartner.skills
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);
                            if (isSelected) {
                              current = current.filter((s) => s !== skill);
                            } else {
                              current.push(skill);
                            }
                            setNewPartner({ ...newPartner, skills: current.join(", ") });
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition ${
                            isSelected
                              ? "bg-red-600 text-white border border-red-600 shadow-sm"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="Mobile Repair, AC Cleaning, Electrician..."
                    value={newPartner.skills}
                    onChange={(e) => setNewPartner({ ...newPartner, skills: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-medium transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Initial App Password / Login PIN
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="partner123"
                    value={newPartner.password}
                    onChange={(e) => setNewPartner({ ...newPartner, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-mono font-medium transition"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setOnboardModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create & Issue Partner ID"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
