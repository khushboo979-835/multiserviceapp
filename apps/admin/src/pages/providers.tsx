import React, { useState } from "react";
import { UserCheck, Eye, Check, X, ShieldAlert, FileText } from "lucide-react";

interface ProviderKyc {
  id: string;
  name: string;
  phone: string;
  category: string;
  documents: { type: string; url: string }[];
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function AdminProviders() {
  const [providers, setProviders] = useState<ProviderKyc[]>([
    {
      id: "prov_9823",
      name: "Ramesh Sharma",
      phone: "+919876543210",
      category: "Mobile Repair",
      documents: [
        { type: "Aadhaar Card", url: "https://s3.amazonaws.com/mock-kyc/aadhaar.jpg" },
        { type: "PAN Card", url: "https://s3.amazonaws.com/mock-kyc/pan.jpg" }
      ],
      status: "PENDING",
    },
    {
      id: "prov_1092",
      name: "Priya Nair",
      phone: "+919911223344",
      category: "Home Parlor",
      documents: [
        { type: "Aadhaar Card", url: "https://s3.amazonaws.com/mock-kyc/aadhaar_p.jpg" },
        { type: "Skill Certificate", url: "https://s3.amazonaws.com/mock-kyc/salon_cert.jpg" }
      ],
      status: "PENDING",
    },
    {
      id: "prov_8471",
      name: "Karan Gupta",
      phone: "+919988776655",
      category: "Home Utilities (AC Tech)",
      documents: [
        { type: "Aadhaar Card", url: "https://s3.amazonaws.com/mock-kyc/aadhaar_k.jpg" },
        { type: "Electrician License", url: "https://s3.amazonaws.com/mock-kyc/elec_lic.jpg" }
      ],
      status: "APPROVED",
    },
  ]);

  const [selectedProvider, setSelectedProvider] = useState<ProviderKyc | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleReviewDocs = (provider: ProviderKyc) => {
    setSelectedProvider(provider);
    setReviewModalOpen(true);
  };

  const handleUpdateStatus = (providerId: string, nextStatus: "APPROVED" | "REJECTED") => {
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, status: nextStatus } : p))
    );
    setReviewModalOpen(false);
    setSelectedProvider(null);
  };

  return (
    <div className="p-8">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-white">KYC Verification Hub</h2>
        <p className="text-sm text-slate-400 mt-1">Review, authorize, and verify service partner registration profiles</p>
      </div>

      {/* Verification Table Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                <th className="py-4 px-4">Partner Name</th>
                <th className="py-4 px-4">Phone Number</th>
                <th className="py-4 px-4">Offering Category</th>
                <th className="py-4 px-4 text-center">KYC Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 text-xs font-semibold text-slate-300">
                  <td className="py-4 px-4 text-white font-bold">{p.name}</td>
                  <td className="py-4 px-4">{p.phone}</td>
                  <td className="py-4 px-4">{p.category}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      p.status === "APPROVED"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                        : p.status === "PENDING"
                        ? "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                        : "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleReviewDocs(p)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold text-2xs flex items-center gap-1.5 ml-auto shadow-md shadow-indigo-600/10"
                    >
                      <Eye size={12} />
                      Review Docs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Documents review modal overlay */}
      {reviewModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-white">Review Documents</h3>
                <p className="text-2xs text-slate-400 mt-0.5">Verification details for {selectedProvider.name}</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition"
              >
                <X size={14} className="text-slate-300" />
              </button>
            </div>

            {/* Document details */}
            <div className="space-y-4 mb-6">
              {selectedProvider.documents.map((doc, idx) => (
                <div key={idx} className="bg-[#020617] border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{doc.type}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Scanned attachment copy</p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline text-2xs font-extrabold flex items-center gap-1.5"
                  >
                    <Eye size={12} />
                    View File
                  </a>
                </div>
              ))}
            </div>

            {/* Confirm Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateStatus(selectedProvider.id, "REJECTED")}
                className="flex-1 border border-rose-500/30 text-rose-500 hover:bg-rose-950/20 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5"
              >
                <X size={16} />
                Reject Partner
              </button>
              
              <button
                onClick={() => handleUpdateStatus(selectedProvider.id, "APPROVED")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Check size={16} />
                Verify & Approve
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
