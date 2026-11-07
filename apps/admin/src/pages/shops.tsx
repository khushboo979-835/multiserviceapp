import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import {
  Store,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Truck,
  Percent,
  RefreshCw,
  X,
  Eye,
  AlertTriangle,
  Building,
  Star,
} from "lucide-react";
import apiClient from "../api/apiClient";

interface ShopItem {
  _id?: string;
  shopId: string;
  name: string;
  legalName?: string;
  category: string;
  subCategories: string[];
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  openingHours: {
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  };
  deliverySettings: {
    deliveryModel: "SHOP_DELIVERY" | "INISHA_DELIVERY" | "HYBRID";
    radiusKm: number;
    minOrderAmount: number;
    baseDeliveryFee: number;
    freeDeliveryThreshold: number;
    estimatedPrepMins: number;
  };
  commissionRate: number;
  rating: number;
  ratingsCount: number;
  isActive: boolean;
  featured: boolean;
}

const CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "RESTAURANT", label: "Food & Restaurant" },
  { id: "GROCERY", label: "Grocery & Mart" },
  { id: "MOBILE_ELECTRONICS", label: "Mobile & Electronics" },
  { id: "SWEETS_BAKERY", label: "Sweets & Bakery" },
  { id: "BEAUTY_WELLNESS", label: "Beauty & Wellness" },
  { id: "GENERAL", label: "General Retail" },
];

export default function ShopsManagementPage() {
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<ShopItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Form State
  const [formData, setFormData] = useState<Partial<ShopItem>>({
    name: "",
    legalName: "",
    category: "RESTAURANT",
    description: "",
    logoUrl: "",
    coverImageUrl: "",
    phone: "",
    email: "",
    address: {
      street: "",
      landmark: "",
      city: "Patna",
      state: "Bihar",
      pincode: "800001",
    },
    location: {
      type: "Point",
      coordinates: [85.1376, 25.5941],
    },
    openingHours: {
      openTime: "09:00 AM",
      closeTime: "10:00 PM",
      isOpen: true,
    },
    deliverySettings: {
      deliveryModel: "INISHA_DELIVERY",
      radiusKm: 10,
      minOrderAmount: 99,
      baseDeliveryFee: 25,
      freeDeliveryThreshold: 499,
      estimatedPrepMins: 20,
    },
    commissionRate: 8,
    isActive: true,
    featured: false,
  });

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/shops?activeOnly=false");
      if (res.data?.success && Array.isArray(res.data?.shops)) {
        setShops(res.data.shops);
      }
    } catch (err: any) {
      console.error("Failed to fetch shops:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleOpenAddModal = () => {
    setEditingShop(null);
    setFormData({
      name: "",
      legalName: "",
      category: "RESTAURANT",
      description: "",
      logoUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&q=80",
      phone: "+91 95078 60048",
      email: "",
      address: {
        street: "Boring Road",
        landmark: "",
        city: "Patna",
        state: "Bihar",
        pincode: "800001",
      },
      location: {
        type: "Point",
        coordinates: [85.1376, 25.5941],
      },
      openingHours: {
        openTime: "09:00 AM",
        closeTime: "10:00 PM",
        isOpen: true,
      },
      deliverySettings: {
        deliveryModel: "INISHA_DELIVERY",
        radiusKm: 12,
        minOrderAmount: 99,
        baseDeliveryFee: 25,
        freeDeliveryThreshold: 499,
        estimatedPrepMins: 20,
      },
      commissionRate: 8,
      isActive: true,
      featured: false,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shop: ShopItem) => {
    setEditingShop(shop);
    setFormData({
      ...shop,
      address: { ...shop.address },
      location: { ...shop.location },
      openingHours: { ...shop.openingHours },
      deliverySettings: { ...shop.deliverySettings },
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      if (editingShop) {
        await apiClient.put(`/shops/${editingShop.shopId}`, formData);
        setSuccessToast(`Shop "${formData.name}" updated successfully!`);
      } else {
        await apiClient.post("/shops", formData);
        setSuccessToast(`Shop "${formData.name}" onboarded successfully!`);
      }

      setIsModalOpen(false);
      fetchShops();
      setTimeout(() => setSuccessToast(""), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to save shop");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (shop: ShopItem) => {
    try {
      await apiClient.put(`/shops/${shop.shopId}`, { isActive: !shop.isActive });
      setShops((prev) =>
        prev.map((s) => (s.shopId === shop.shopId ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (err: any) {
      alert("Failed to toggle shop status");
    }
  };

  const handleToggleStoreOpen = async (shop: ShopItem) => {
    try {
      const newIsOpen = !shop.openingHours?.isOpen;
      await apiClient.put(`/shops/${shop.shopId}`, {
        "openingHours.isOpen": newIsOpen,
      });
      setShops((prev) =>
        prev.map((s) =>
          s.shopId === shop.shopId
            ? { ...s, openingHours: { ...s.openingHours, isOpen: newIsOpen } }
            : s
        )
      );
    } catch (err: any) {
      alert("Failed to toggle shop opening status");
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      const matchesSearch =
        searchQuery === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        s.address.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || s.category === selectedCategory;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && s.isActive) ||
        (statusFilter === "INACTIVE" && !s.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [shops, searchQuery, selectedCategory, statusFilter]);

  return (
    <>
      <Head>
        <title>Local Shops & Merchants | Inisha Super Admin</title>
      </Head>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Store className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Local Shops & Marketplace Vendors
                </h1>
                <p className="text-sm text-slate-500">
                  Manage multi-vendor onboarded shops, restaurants, grocery marts, and electronics partners.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchShops}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-sm transition"
            >
              <Plus className="w-5 h-5" />
              Onboard New Shop
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search shop by name, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Shops Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Shop Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Contact & Location</th>
                  <th className="py-4 px-6">Delivery Model</th>
                  <th className="py-4 px-6">Commission</th>
                  <th className="py-4 px-6">Live Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
                      Loading verified shops...
                    </td>
                  </tr>
                ) : filteredShops.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      No shops found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredShops.map((shop) => (
                    <tr key={shop.shopId} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={shop.logoUrl || "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=100&q=80"}
                            alt={shop.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {shop.name}
                              {shop.featured && (
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">ID: {shop.shopId}</div>
                            <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-semibold">{shop.rating || 4.8}</span>
                              <span className="text-slate-400">({shop.ratingsCount || 0})</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                          {shop.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-600">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {shop.phone}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {shop.address.street}, {shop.address.city}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                          <Truck className="w-4 h-4 text-blue-500" />
                          {shop.deliverySettings?.deliveryModel === "SHOP_DELIVERY"
                            ? "Shop Rider"
                            : shop.deliverySettings?.deliveryModel === "INISHA_DELIVERY"
                            ? "Inisha Pool"
                            : "Hybrid"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Radius: {shop.deliverySettings?.radiusKm || 10} km
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800">
                          {shop.commissionRate || 8}%
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => handleToggleActive(shop)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 w-fit ${
                              shop.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                shop.isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {shop.isActive ? "Approved" : "Disabled"}
                          </button>

                          <button
                            onClick={() => handleToggleStoreOpen(shop)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium w-fit ${
                              shop.openingHours?.isOpen
                                ? "text-emerald-600 bg-emerald-50"
                                : "text-rose-600 bg-rose-50"
                            }`}
                          >
                            {shop.openingHours?.isOpen ? "● Store Open" : "○ Store Closed"}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenEditModal(shop)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Edit Shop"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add/Edit Shop */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                  <Store className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingShop ? "Edit Shop Profile" : "Onboard New Partner Shop"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveShop} className="p-6 space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Shop Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Royal Sweets & Snacks"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category || "RESTAURANT"}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="RESTAURANT">Food & Restaurant</option>
                      <option value="GROCERY">Grocery & Mart</option>
                      <option value="MOBILE_ELECTRONICS">Mobile & Electronics</option>
                      <option value="SWEETS_BAKERY">Sweets & Bakery</option>
                      <option value="BEAUTY_WELLNESS">Beauty & Wellness</option>
                      <option value="GENERAL">General Retail</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 95078 60048"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Delivery Model
                    </label>
                    <select
                      value={formData.deliverySettings?.deliveryModel || "INISHA_DELIVERY"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliverySettings: {
                            ...formData.deliverySettings!,
                            deliveryModel: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="INISHA_DELIVERY">Inisha Delivery Fleet Pool</option>
                      <option value="SHOP_DELIVERY">Shop's Own Delivery Boy</option>
                      <option value="HYBRID">Hybrid (Both)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Delivery Radius (KM)
                    </label>
                    <input
                      type="number"
                      value={formData.deliverySettings?.radiusKm || 10}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliverySettings: {
                            ...formData.deliverySettings!,
                            radiusKm: parseFloat(e.target.value) || 10,
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Platform Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.commissionRate || 8}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commissionRate: parseFloat(e.target.value) || 8,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.deliverySettings?.minOrderAmount || 99}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliverySettings: {
                            ...formData.deliverySettings!,
                            minOrderAmount: parseFloat(e.target.value) || 99,
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Base Delivery Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.deliverySettings?.baseDeliveryFee ?? 25}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliverySettings: {
                            ...formData.deliverySettings!,
                            baseDeliveryFee: parseFloat(e.target.value) || 25,
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address?.street || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, street: e.target.value },
                      })
                    }
                    placeholder="Boring Road, Kidwaipuri"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.address?.city || "Patna"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, city: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.address?.pincode || "800001"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, pincode: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.logoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the store specialty..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    Shop Verified & Active
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    Featured on Home Screen
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-sm transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingShop ? "Update Shop" : "Complete Onboarding"}
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
