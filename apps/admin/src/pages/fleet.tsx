import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import {
  Bike,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  User,
  Store,
  MapPin,
  X,
  AlertTriangle,
  Award,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import apiClient from "../api/apiClient";

interface RiderData {
  _id?: string;
  userId: string;
  assignedPartnerId: string;
  name: string;
  phoneNumber: string;
  role: "SHOP_DELIVERY" | "INISHA_DELIVERY";
  shopId?: string;
  shopName?: string;
  deliveryVehicleType: string;
  deliveryVehicleNumber: string;
  isOnline: boolean;
  walletBalance: number;
  totalTrips?: number;
  rating?: number;
  createdAt?: string;
}

const DEFAULT_RIDERS: RiderData[] = [
  {
    userId: "rider_101",
    assignedPartnerId: "INP-7001",
    name: "Ramesh Kumar",
    phoneNumber: "+91 98123 45678",
    role: "INISHA_DELIVERY",
    deliveryVehicleType: "BIKE",
    deliveryVehicleNumber: "BR-01-AB-4819",
    isOnline: true,
    walletBalance: 1450,
    totalTrips: 84,
    rating: 4.9,
  },
  {
    userId: "rider_102",
    assignedPartnerId: "SHP-3021",
    name: "Amit Sharma",
    phoneNumber: "+91 98765 12345",
    role: "SHOP_DELIVERY",
    shopId: "shop_royal_biryani_102",
    shopName: "Royal Darbar Restaurant",
    deliveryVehicleType: "SCOOTER",
    deliveryVehicleNumber: "BR-01-EF-9214",
    isOnline: true,
    walletBalance: 820,
    totalTrips: 42,
    rating: 4.8,
  },
  {
    userId: "rider_103",
    assignedPartnerId: "INP-7002",
    name: "Vikash Singh",
    phoneNumber: "+91 91234 56789",
    role: "INISHA_DELIVERY",
    deliveryVehicleType: "BIKE",
    deliveryVehicleNumber: "BR-01-CD-1192",
    isOnline: false,
    walletBalance: 2100,
    totalTrips: 112,
    rating: 5.0,
  },
];

export default function DeliveryFleetPage() {
  const [riders, setRiders] = useState<RiderData[]>(DEFAULT_RIDERS);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<"ALL" | "INISHA_DELIVERY" | "SHOP_DELIVERY">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [newRider, setNewRider] = useState({
    name: "",
    phoneNumber: "",
    role: "INISHA_DELIVERY" as "INISHA_DELIVERY" | "SHOP_DELIVERY",
    shopId: "",
    deliveryVehicleType: "BIKE",
    deliveryVehicleNumber: "",
    password: "InishaRider@2026",
    initialBalance: 500,
  });

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users?role=DELIVERY").catch(() => null);
      if (res?.data?.success && Array.isArray(res.data.users) && res.data.users.length > 0) {
        setRiders(res.data.users);
      }
    } catch {
      // Keep state
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const cleanPhone = newRider.phoneNumber.replace(/\D/g, "").slice(-10);
      const partnerId = `${newRider.role === "SHOP_DELIVERY" ? "SHP" : "INP"}-${cleanPhone.slice(-4) || "8812"}`;

      const created: RiderData = {
        userId: `rider_${Date.now()}`,
        assignedPartnerId: partnerId,
        name: newRider.name,
        phoneNumber: `+91 ${cleanPhone}`,
        role: newRider.role,
        shopId: newRider.shopId,
        deliveryVehicleType: newRider.deliveryVehicleType,
        deliveryVehicleNumber: newRider.deliveryVehicleNumber || "BR-01-XX-0000",
        isOnline: true,
        walletBalance: newRider.initialBalance,
        totalTrips: 0,
        rating: 5.0,
      };

      setRiders((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setToastMessage(`Rider "${newRider.name}" onboarded with ID ${partnerId}!`);
      setTimeout(() => setToastMessage(""), 4000);
    } catch (err: any) {
      alert("Failed to onboard rider: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleRiderOnline = (partnerId: string) => {
    setRiders((prev) =>
      prev.map((r) =>
        r.assignedPartnerId === partnerId ? { ...r, isOnline: !r.isOnline } : r
      )
    );
  };

  const filteredRiders = useMemo(() => {
    return riders.filter((r) => {
      const matchesRole = filterRole === "ALL" || r.role === filterRole;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        r.name.toLowerCase().includes(q) ||
        r.assignedPartnerId.toLowerCase().includes(q) ||
        r.phoneNumber.includes(q);

      return matchesRole && matchesSearch;
    });
  }, [riders, filterRole, searchQuery]);

  return (
    <>
      <Head>
        <title>Delivery Fleet & Riders | Inisha Super Admin</title>
      </Head>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Delivery Fleet & Dispatch Network
              </h1>
              <p className="text-sm text-slate-500">
                Manage Inisha Automated Pool Riders and dedicated Shop Delivery Boys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-sm transition"
            >
              <Plus className="w-5 h-5" />
              Onboard Delivery Rider
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search rider by name, Partner ID, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
          </div>

          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            >
              <option value="ALL">All Delivery Models</option>
              <option value="INISHA_DELIVERY">Inisha Central Fleet Pool</option>
              <option value="SHOP_DELIVERY">Dedicated Shop Delivery Boys</option>
            </select>
          </div>
        </div>

        {/* Riders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Rider Profile</th>
                  <th className="py-4 px-6">Delivery Model</th>
                  <th className="py-4 px-6">Vehicle & Reg No.</th>
                  <th className="py-4 px-6">Wallet Balance</th>
                  <th className="py-4 px-6">Performance</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Toggle Duty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRiders.map((rider) => (
                  <tr key={rider.assignedPartnerId} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">
                          {rider.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{rider.name}</div>
                          <div className="text-xs font-mono text-red-600 font-bold">
                            {rider.assignedPartnerId}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {rider.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          rider.role === "INISHA_DELIVERY"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {rider.role === "INISHA_DELIVERY" ? "Inisha Pool Rider" : "Shop Delivery Boy"}
                      </span>
                      {rider.shopName && (
                        <div className="text-xs text-slate-500 mt-1">
                          Store: {rider.shopName}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-700">
                      <div className="font-semibold">{rider.deliveryVehicleType}</div>
                      <div className="font-mono text-slate-500">{rider.deliveryVehicleNumber}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">₹{rider.walletBalance}</div>
                      <div className="text-[11px] text-emerald-600">Active Payout</div>
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <div className="font-semibold text-slate-800">
                        {rider.totalTrips || 0} Trips
                      </div>
                      <div className="text-amber-600 font-bold">
                        ★ {rider.rating || 5.0} Rating
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                          rider.isOnline
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            rider.isOnline ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {rider.isOnline ? "On Duty" : "Offline"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleRiderOnline(rider.assignedPartnerId)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        {rider.isOnline ? "Set Offline" : "Set Online"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Onboard Rider */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bike className="w-6 h-6 text-red-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Onboard Delivery Partner
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRider} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRider.name}
                    onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                    placeholder="e.g. Rahul Kumar"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRider.phoneNumber}
                    onChange={(e) => setNewRider({ ...newRider, phoneNumber: e.target.value })}
                    placeholder="9812345678"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Delivery Fleet Model
                  </label>
                  <select
                    value={newRider.role}
                    onChange={(e) =>
                      setNewRider({ ...newRider, role: e.target.value as any })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="INISHA_DELIVERY">Inisha Central Pool Partner</option>
                    <option value="SHOP_DELIVERY">Shop's Dedicated Delivery Boy</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={newRider.deliveryVehicleType}
                      onChange={(e) =>
                        setNewRider({ ...newRider, deliveryVehicleType: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="BIKE">Motorcycle</option>
                      <option value="SCOOTER">Scooter / Activa</option>
                      <option value="BICYCLE">Bicycle</option>
                      <option value="EV">Electric Scooter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Vehicle Reg No.
                    </label>
                    <input
                      type="text"
                      value={newRider.deliveryVehicleNumber}
                      onChange={(e) =>
                        setNewRider({ ...newRider, deliveryVehicleNumber: e.target.value })
                      }
                      placeholder="BR-01-XX-1234"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-sm"
                  >
                    {saving ? "Saving..." : "Add Rider"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
