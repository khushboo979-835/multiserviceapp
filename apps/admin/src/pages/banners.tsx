import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  X,
  Inbox,
  Eye,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  imageUrl: string;
  targetCategory?: string;
  isActive: boolean;
  order?: number;
  createdAt?: any;
}

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    tag: "SPECIAL OFFER",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    targetCategory: "Mobile Repair",
  });

  const unsubRef = useRef<Unsubscribe | null>(null);

  // 1. Fast On-Demand Banners Loader (Eliminates continuous channel ping loops)
  const fetchBanners = async () => {
    try {
      const snap = await getDocs(query(collection(db, "banners"), orderBy("createdAt", "desc")));
      const list: BannerItem[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || "Special Promotional Offer",
          subtitle: d.subtitle || "Book verified professionals at home",
          tag: d.tag || "OFFER",
          imageUrl: d.imageUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
          targetCategory: d.targetCategory || "All Services",
          isActive: d.isActive !== false,
          order: d.order || 1,
          createdAt: d.createdAt || Date.now(),
        });
      });

      if (list.length > 0) {
        setBanners(list);
      }
    } catch (e) {
      console.warn("Banners fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);


  const handleToggleActive = async (id: string, current: boolean) => {
    const nextVal = !current;
    try {
      await updateDoc(doc(db, "banners", id), { isActive: nextVal });
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: nextVal } : b)));
    } catch {
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: nextVal } : b)));
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to remove this promo banner?")) return;
    try {
      await deleteDoc(doc(db, "banners", id));
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      alert("Please provide title and image URL");
      return;
    }

    setIsSaving(true);
    const docId = `banner_${Date.now()}`;

    try {
      const bannerData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        tag: formData.tag.trim().toUpperCase(),
        imageUrl: formData.imageUrl.trim(),
        targetCategory: formData.targetCategory,
        isActive: true,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "banners", docId), bannerData);

      setModalOpen(false);
      setFormData({
        title: "",
        subtitle: "",
        tag: "SPECIAL OFFER",
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
        targetCategory: "Mobile Repair",
      });
      alert("Promotional banner added successfully!");
    } catch (err: any) {
      alert("Error saving banner: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <ImageIcon className="text-red-600" size={24} />
            Home Banner & Offer Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Control the promotional hero carousel on the customer mobile app home screen
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={() => {
              setLoading(true);
              fetchBanners();
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
            + Add New Banner
          </button>
        </div>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))
        ) : banners.length === 0 ? (
          <div className="col-span-full text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white">
            <Inbox size={24} className="mx-auto text-slate-400 mb-2" />
            <h4 className="text-slate-900 font-bold text-sm">No Active Banners</h4>
            <p className="text-xs text-slate-500 mt-1">Add banners to highlight promotional discounts in mobile app.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition ${
                banner.isActive ? "border-slate-200 hover:border-slate-300" : "border-slate-200 opacity-60"
              }`}
            >
              {/* Banner Image Preview */}
              <div className="relative h-36 bg-slate-100 overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80";
                  }}
                />
                {banner.tag && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                    {banner.tag}
                  </span>
                )}
              </div>

              {/* Banner Text Details */}
              <div className="p-4 space-y-1.5 flex-1">
                <h4 className="font-bold text-slate-900 text-sm">{banner.title}</h4>
                {banner.subtitle && (
                  <p className="text-xs text-slate-500 line-clamp-2">{banner.subtitle}</p>
                )}
                <div className="pt-2 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono font-bold">
                  <span>Linked Target:</span>
                  <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {banner.targetCategory}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 pt-2 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                <button
                  onClick={() => handleToggleActive(banner.id, banner.isActive)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition ${
                    banner.isActive
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-200 text-slate-700 border border-slate-300"
                  }`}
                >
                  {banner.isActive ? "ACTIVE ON HOME" : "HIDDEN"}
                </button>

                <button
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete Banner"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl my-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <ImageIcon className="text-red-600" size={18} />
                  Add Promotional Banner
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Publish promo banner to customer app</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Banner Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50% Off on AC Servicing & Jet Cleaning"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Subtitle / Promo Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Certified pros at your doorstep in 30 mins"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="LIMITED OFFER"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Target Category
                  </label>
                  <select
                    value={formData.targetCategory}
                    onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="Mobile Repair">Mobile Repair</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Home Salon">Home Salon</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Home Cleaning">Home Cleaning</option>
                    <option value="All Services">All Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                />
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
                  {isSaving ? "Saving..." : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
