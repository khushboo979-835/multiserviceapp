import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Smartphone,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Wrench,
  Tag,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import apiClient from "../api/apiClient";
import ImageUploadPicker from "../components/ImageUploadPicker";

interface RepairIssue {
  name: string;
  price: number;
  estimatedMins?: number;
  description?: string;
}

interface MobileRepairBrand {
  _id?: string;
  brandId: string;
  brandName: string;
  logoUrl: string;
  models: string[];
  repairs: RepairIssue[];
  isActive: boolean;
  sortOrder: number;
}

export default function MobileRepairsAdminPage() {
  const [brands, setBrands] = useState<MobileRepairBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBrand, setEditingBrand] = useState<MobileRepairBrand | null>(null);

  // Form State
  const [formBrandName, setFormBrandName] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formModelsInput, setFormModelsInput] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formRepairs, setFormRepairs] = useState<RepairIssue[]>([
    { name: "Screen Replacement", price: 2499, estimatedMins: 45, description: "Original retina display" },
    { name: "Battery Replacement", price: 1199, estimatedMins: 30, description: "100% genuine health battery" },
    { name: "Back Glass Replacement", price: 899, estimatedMins: 35, description: "Laser separation finish" },
    { name: "Charging Port Fix", price: 499, estimatedMins: 25, description: "Fast charge restoration" },
  ]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/mobile-repairs");
      if (res.data?.success && Array.isArray(res.data.repairs)) {
        setBrands(res.data.repairs);
      }
    } catch (err: any) {
      console.error("Error fetching mobile repairs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setFormBrandName("");
    setFormLogoUrl("https://res.cloudinary.com/gln413tb/image/upload/f_png,w_300/v1795239017/inisha/brands/apple_logo.png");
    setFormModelsInput("");
    setFormSortOrder(brands.length + 1);
    setFormIsActive(true);
    setFormRepairs([
      { name: "Retina / AMOLED Screen", price: 2499, estimatedMins: 45, description: "OEM genuine display panel" },
      { name: "Battery Replacement", price: 1199, estimatedMins: 30, description: "High cycle certified battery" },
      { name: "Back Glass & Housing", price: 899, estimatedMins: 35, description: "Original rear glass replacement" },
      { name: "Camera Lens Fix", price: 699, estimatedMins: 25, description: "Clear optical lens replacement" },
    ]);
    setModalOpen(true);
  };

  const openEditModal = (brand: MobileRepairBrand) => {
    setEditingBrand(brand);
    setFormBrandName(brand.brandName);
    setFormLogoUrl(brand.logoUrl);
    setFormModelsInput(brand.models.join(", "));
    setFormSortOrder(brand.sortOrder || 0);
    setFormIsActive(brand.isActive !== false);
    setFormRepairs(brand.repairs && brand.repairs.length > 0 ? brand.repairs : []);
    setModalOpen(true);
  };

  const handleAddRepairRow = () => {
    setFormRepairs([...formRepairs, { name: "", price: 499, estimatedMins: 30, description: "" }]);
  };

  const handleUpdateRepairRow = (index: number, field: keyof RepairIssue, value: any) => {
    const updated = [...formRepairs];
    updated[index] = { ...updated[index], [field]: value };
    setFormRepairs(updated);
  };

  const handleRemoveRepairRow = (index: number) => {
    setFormRepairs(formRepairs.filter((_, i) => i !== index));
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBrandName.trim()) {
      alert("Brand name is required");
      return;
    }

    setIsSaving(true);
    const parsedModels = formModelsInput
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    const validRepairs = formRepairs
      .filter((r) => r.name.trim().length > 0)
      .map((r) => ({
        name: r.name.trim(),
        price: Number(r.price) || 0,
        estimatedMins: Number(r.estimatedMins) || 45,
        description: r.description?.trim() || "",
      }));

    const payload = {
      brandName: formBrandName.trim(),
      logoUrl: formLogoUrl || "https://res.cloudinary.com/gln413tb/image/upload/f_png,w_300/v1795239017/inisha/brands/apple_logo.png",
      models: parsedModels,
      repairs: validRepairs,
      isActive: formIsActive,
      sortOrder: Number(formSortOrder) || 0,
    };

    try {
      if (editingBrand) {
        await apiClient.put(`/admin/mobile-repairs/${editingBrand.brandId || editingBrand._id}`, payload);
      } else {
        await apiClient.post("/admin/mobile-repairs", payload);
      }
      setModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      alert("Failed to save brand: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (brand: MobileRepairBrand) => {
    if (!confirm(`Are you sure you want to delete ${brand.brandName}?`)) return;
    try {
      await apiClient.delete(`/admin/mobile-repairs/${brand.brandId || brand._id}`);
      fetchBrands();
    } catch (err: any) {
      alert("Failed to delete brand: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.models.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Head>
        <title>Mobile Repairs Catalog | Inisha Admin</title>
      </Head>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <Smartphone size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mobile Repairs Catalog</h1>
              <p className="text-sm text-slate-500">
                Manage mobile brands, models, problem types, and doorstep repair pricing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBrands}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition"
          >
            <Plus size={18} />
            <span>Add Brand & Repairs</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by brand name or model (e.g. iPhone 16, Samsung S24, Realme)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading mobile repair catalog...</div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Smartphone size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Brands Found</h3>
          <p className="text-sm text-slate-400 mt-1">Add a new mobile brand to configure repair pricing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand.brandId || brand._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center">
                      <img
                        src={brand.logoUrl}
                        alt={brand.brandName}
                        className="w-full h-full object-contain"
                        onError={(e: any) => {
                          e.target.src = "https://res.cloudinary.com/gln413tb/image/upload/f_png,w_300/v1795239017/inisha/brands/apple_logo.png";
                        }}
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{brand.brandName}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Order: {brand.sortOrder || 0}
                        </span>
                        {brand.isActive !== false ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 flex items-center gap-1">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Popular Models List */}
                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Popular Models ({brand.models?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(brand.models || []).map((model, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Common Repairs & Pricing Table */}
                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Repairs & Pricing ({brand.repairs?.length || 0} Issues)
                  </div>
                  <div className="space-y-2">
                    {(brand.repairs || []).map((repair, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <Wrench size={13} className="text-red-500" />
                          <span className="font-semibold text-slate-800">{repair.name}</span>
                          {repair.description && (
                            <span className="text-slate-400 text-[11px] hidden sm:inline">
                              ({repair.description})
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          ₹{repair.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Smartphone size={20} className="text-red-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {editingBrand ? `Edit ${editingBrand.brandName}` : "Add Mobile Brand & Repairs"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Brand Name & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple, Samsung, OnePlus"
                    value={formBrandName}
                    onChange={(e) => setFormBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Brand Logo URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Logo URL *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://res.cloudinary.com/... or image URL"
                    value={formLogoUrl}
                    onChange={(e) => setFormLogoUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {formLogoUrl && (
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 p-1 flex items-center justify-center shrink-0">
                      <img src={formLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* Popular Models Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Popular Models (Comma Separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="iPhone 16 Pro Max, iPhone 16, iPhone 15 Pro, iPhone 14..."
                  value={formModelsInput}
                  onChange={(e) => setFormModelsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Problem Types & Repair Pricing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Problem Types & Repair Pricing</label>
                  <button
                    type="button"
                    onClick={handleAddRepairRow}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Issue
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formRepairs.map((repair, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Issue Name (e.g. OLED Screen)"
                        value={repair.name}
                        onChange={(e) => handleUpdateRepairRow(idx, "name", e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={repair.price}
                          onChange={(e) => handleUpdateRepairRow(idx, "price", Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRepairRow(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="brandActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <label htmlFor="brandActive" className="text-sm font-semibold text-slate-700">
                  Brand active and visible in Customer Mobile App
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md transition disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingBrand ? "Save Changes" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
