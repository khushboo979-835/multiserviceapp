import React, { useState, useEffect } from "react";
import { UserCheck, Eye, Check, X, ShieldAlert, FileText, UserPlus, RefreshCw, Key, Phone, CheckCircle2 } from "lucide-react";
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
  status?: "PENDING" | "APPROVED" | "REJECTED";
}

export default function AdminProviders() {
  const [providers, setProviders] = useState<ProviderData[]>([
    {
      id: "prov_1",
      partnerId: "INP-8842",
      name: "Rohan Sharma",
      phone: "+91 98123 45678",
      email: "rohan.partner@inishacityservice.com",
      skills: ["Mobile Repair", "AC Jet Cleaning"],
      rating: 4.9,
      isApproved: true,
      isOnline: true,
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
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "",
    phone: "",
    skills: "Mobile Repair, AC Cleaning",
    password: "partner123",
  });
  const [createdPartnerSuccess, setCreatedPartnerSuccess] = useState<any>(null);

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
      alert("Please fill in Name and Phone Number");
      return;
    }

    try {
      const skillsArray = newPartner.skills.split(",").map((s) => s.trim());
      const res = await apiClient.post("/admin/providers/create", {
        name: newPartner.name,
        phone: newPartner.phone,
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
        skills: newPartner.skills.split(",").map((s) => s.trim()),
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
        (p._id === id || p.id === id) ? { ...p, isApproved: nextVal } : p
      )
    );
  };

  return (
    <div className="p-8">
      {/* Heading */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Partner Management & Verification</h2>
          <p className="text-sm text-slate-400 mt-1">
            Authorize service technicians, issue Partner IDs, and manage partner credentials
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProviders}
            className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-800 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-indigo-400" : "text-slate-400"} />
            Refresh
          </button>
          <button
            onClick={() => {
              setCreatedPartnerSuccess(null);
              setOnboardModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <UserPlus size={16} />
            Onboard New Partner
          </button>
        </div>
      </div>

      {/* Partner Table Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                <th className="py-4 px-4">Partner ID</th>
                <th className="py-4 px-4">Partner Name</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Specialized Skills</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => {
                const provId = p._id || p.id || "";
                const isApproved = p.isApproved !== false;
                return (
                  <tr key={provId} className="border-b border-slate-800/50 hover:bg-slate-800/20 text-xs font-semibold text-slate-300">
                    <td className="py-4 px-4">
                      <span className="font-mono text-indigo-400 font-extrabold bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        {p.partnerId || "INP-8842"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white font-bold">{p.name}</td>
                    <td className="py-4 px-4 font-mono">{p.phone}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(p.skills) ? p.skills : [p.skills]).map((skill, idx) => (
                          <span key={idx} className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        isApproved
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                      }`}>
                        {isApproved ? "VERIFIED & ACTIVE" : "PENDING REVIEW"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleApproval(provId, isApproved)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-2xs flex items-center gap-1.5 ml-auto ${
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
                            Approve
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Partner Modal */}
      {onboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-white">Onboard Service Partner</h3>
                <p className="text-2xs text-slate-400 mt-0.5">Generate technician login credentials</p>
              </div>
              <button
                onClick={() => {
                  setOnboardModalOpen(false);
                  setCreatedPartnerSuccess(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition"
              >
                <X size={14} className="text-slate-300" />
              </button>
            </div>

            {createdPartnerSuccess ? (
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-5 rounded-2xl mb-4 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-white font-extrabold text-base mb-1">Partner Successfully Onboarded!</h4>
                <p className="text-xs text-slate-300 mb-4">Share these credentials with the service technician:</p>
                <div className="bg-[#020617] border border-slate-800 p-4 rounded-xl text-left font-mono text-xs space-y-2 mb-4">
                  <p><span className="text-slate-500">Partner ID:</span> <span className="text-indigo-400 font-bold">{createdPartnerSuccess.partnerId}</span></p>
                  <p><span className="text-slate-500">Password:</span> <span className="text-emerald-400 font-bold">{createdPartnerSuccess.temporaryPassword}</span></p>
                  <p><span className="text-slate-500">Name:</span> <span className="text-white font-bold">{createdPartnerSuccess.name}</span></p>
                  <p><span className="text-slate-500">Mobile:</span> <span className="text-white font-bold">{createdPartnerSuccess.phone}</span></p>
                </div>
                <button
                  onClick={() => {
                    setOnboardModalOpen(false);
                    setCreatedPartnerSuccess(null);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreatePartner} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Technician Full Name
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

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    10-Digit Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9812345678"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value.replace(/\D/g, "") })}
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Assigned Skills (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Mobile Repair, AC Cleaning, Electrician"
                    value={newPartner.skills}
                    onChange={(e) => setNewPartner({ ...newPartner, skills: e.target.value })}
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Temporary Password
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

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOnboardModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20"
                  >
                    Create & Issue ID
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

