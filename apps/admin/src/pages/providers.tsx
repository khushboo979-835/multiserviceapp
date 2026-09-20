import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { apiClient } from "../api/apiClient";

interface ProviderData {
  _id?: string;
  id?: string;
  partnerId?: string;
  name: string;
  phone: string;
  email?: string;
  skills: string[];
  rating?: number;
  isApproved?: boolean;
  isOnline?: boolean;
  walletBalance?: number;
}

export default function AdminProviders() {
  const [providers, setProviders] = useState<ProviderData[]>([
    {
      id: "prov_1",
      partnerId: "INP-8842",
      name: "Rohan Sharma",
      phone: "+91 98123 45678",
      email: "rohan.partner@inishacityservice.com",
      skills: ["Doorstep Screen Repair", "AC Jet Cleaning"],
      rating: 4.9,
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
      skills: ["AC Servicing", "Plumbing & Electricals"],
      rating: 4.85,
      isApproved: true,
      isOnline: true,
      walletBalance: 1850,
    },
    {
      id: "prov_3",
      partnerId: "INP-3421",
      name: "Priya Nair",
      phone: "+91 99112 23344",
      email: "priya.parlor@inishacityservice.com",
      skills: ["Home Parlor & Salon", "Facial & Hair Care"],
      rating: 4.95,
      isApproved: false,
      isOnline: false,
      walletBalance: 0,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [newPartner, setNewPartner] = useState({
    name: "",
    phone: "",
    email: "",
    skills: "Doorstep Mobile Screen Repair, AC Jet Cleaning",
    password: "partner123",
  });
  const [createdPartnerSuccess, setCreatedPartnerSuccess] = useState<any>(null);

  const availableSkills = [
    "Doorstep Mobile Screen Repair",
    "Battery Replacement",
    "AC Jet Cleaning Split/Window",
    "Electrician & Wiring Fix",
    "Plumbing & Tap Repair",
    "Home Deep Cleaning",
    "Women Salon & Parlor",
  ];

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/providers");
      if (res.data && res.data.providers && res.data.providers.length > 0) {
        setProviders(res.data.providers);
      }
    } catch (err) {
      console.warn("Using offline providers demo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name || !newPartner.phone) {
      alert("Please enter Partner Name and Phone Number");
      return;
    }

    try {
      const skillsArray = newPartner.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await apiClient.post("/admin/providers/create", {
        name: newPartner.name,
        phone: newPartner.phone,
        email: newPartner.email,
        skills: skillsArray,
        password: newPartner.password || "partner123",
      });

      if (res.data && res.data.partner) {
        setCreatedPartnerSuccess(res.data.partner);
        fetchProviders();
      }
    } catch (err: any) {
      // Offline fallback creation
      const mockCreated = {
        partnerId: "INP-" + Math.floor(1000 + Math.random() * 9000),
        name: newPartner.name,
        phone: `+91 ${newPartner.phone.replace(/\D/g, "").slice(-10)}`,
        temporaryPassword: newPartner.password || "partner123",
        skills: newPartner.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      setCreatedPartnerSuccess(mockCreated);
      setProviders((prev) => [
        {
          id: "prov_" + Date.now(),
          partnerId: mockCreated.partnerId,
          name: mockCreated.name,
          phone: mockCreated.phone,
          skills: mockCreated.skills,
          isApproved: true,
          isOnline: false,
          rating: 5.0,
          walletBalance: 0,
        },
        ...prev,
      ]);
    }
  };

  const handleToggleApproval = async (id: string, currentApproval: boolean) => {
    const nextVal = !currentApproval;
    try {
      await apiClient.put(`/admin/providers/${id}/status`, { isApproved: nextVal });
    } catch {}

    setProviders((prev) =>
      prev.map((p) =>
        p._id === id || p.id === id ? { ...p, isApproved: nextVal } : p
      )
    );
  };

  const handleDeleteProvider = (id: string) => {
    if (confirm("Are you sure you want to remove this partner?")) {
      setProviders((prev) => prev.filter((p) => (p._id !== id && p.id !== id)));
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
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <UserCheck className="text-indigo-400" size={24} />
            Partner & KYC Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authorize service technicians, issue Partner IDs, and manage live fleet
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={fetchProviders}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-slate-800 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 transition"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-indigo-400" : "text-slate-400"}
            />
            Refresh
          </button>
          <button
            onClick={() => {
              setCreatedPartnerSuccess(null);
              setOnboardModalOpen(true);
            }}
            className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition"
          >
            <UserPlus size={16} />
            + Add New Partner
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
        <Search size={18} className="text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search partner by name, ID (e.g. INP-8842), phone or skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none w-full font-medium"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Responsive Table Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-extrabold text-white">
            Registered Partners ({filteredProviders.length})
          </h3>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  <th className="py-3 px-3">Partner ID</th>
                  <th className="py-3 px-3">Technician Details</th>
                  <th className="py-3 px-3">Specialized Skills</th>
                  <th className="py-3 px-3 text-center">KYC Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                {filteredProviders.map((p) => {
                  const provId = p._id || p.id || "";
                  const isApproved = p.isApproved !== false;
                  return (
                    <tr key={provId} className="hover:bg-slate-800/20">
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-indigo-400 font-extrabold bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/20 whitespace-nowrap">
                          {p.partnerId || "INP-8842"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-white font-bold">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <Phone size={11} className="text-slate-500" />
                          {p.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {(Array.isArray(p.skills) ? p.skills : [p.skills]).map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isApproved
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
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
                                ? "bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/30"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
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
                            onClick={() => handleDeleteProvider(provId)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-500 transition"
                            title="Remove Partner"
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
      </div>

      {/* Onboard Partner Modal (Fully Responsive) */}
      {onboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <UserPlus className="text-indigo-400" size={20} />
                  Onboard Service Partner
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create technician profile & generate login credentials
                </p>
              </div>
              <button
                onClick={() => {
                  setOnboardModalOpen(false);
                  setCreatedPartnerSuccess(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {createdPartnerSuccess ? (
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-5 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-base">Partner Successfully Added!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Technician can now log into Provider Mobile App with these details:
                  </p>
                </div>

                <div className="bg-[#020617] border border-slate-800 p-4 rounded-xl text-left font-mono text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Partner ID:</span>
                    <span className="text-indigo-400 font-bold text-sm">
                      {createdPartnerSuccess.partnerId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 py-1.5">
                    <span className="text-slate-500">Password / PIN:</span>
                    <span className="text-emerald-400 font-bold">
                      {createdPartnerSuccess.temporaryPassword}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 py-1.5">
                    <span className="text-slate-500">Name:</span>
                    <span className="text-white font-bold">{createdPartnerSuccess.name}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-slate-500">Mobile:</span>
                    <span className="text-white font-bold">{createdPartnerSuccess.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const text = `Inisha City Service Partner Login:\nPartner ID: ${createdPartnerSuccess.partnerId}\nPassword: ${createdPartnerSuccess.temporaryPassword}\nMobile: ${createdPartnerSuccess.phone}`;
                      navigator.clipboard.writeText(text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Copy size={14} />
                    {copied ? "Copied to Clipboard!" : "Copy Details"}
                  </button>
                  <button
                    onClick={() => {
                      setOnboardModalOpen(false);
                      setCreatedPartnerSuccess(null);
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreatePartner} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Technician Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Sharma"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9812345678"
                      value={newPartner.phone}
                      onChange={(e) =>
                        setNewPartner({
                          ...newPartner,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="sunil@inishacityservice.com"
                      value={newPartner.email}
                      onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                      className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Quick Select Specialized Skills
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
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition ${
                            isSelected
                              ? "bg-indigo-600 text-white border border-indigo-500"
                              : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
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
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Initial App Password / Login PIN
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="partner123"
                    value={newPartner.password}
                    onChange={(e) => setNewPartner({ ...newPartner, password: e.target.value })}
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setOnboardModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition"
                  >
                    Create & Issue Partner ID
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
