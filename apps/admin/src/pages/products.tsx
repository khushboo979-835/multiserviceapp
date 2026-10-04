import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag,
  Store,
  RefreshCw,
  X,
  Eye,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import apiClient from "../api/apiClient";
import MultiImageUploadPicker from "../components/MultiImageUploadPicker";

interface ProductVariant {
  name: string;
  options: string[];
  price?: number;
  mrp?: number;
  image?: string;
}

interface ProductSpecification {
  label: string;
  value: string;
}

interface ProductItem {
  id: string;
  _id?: string;
  name: string;
  category: string;
  categoryName: string;
  description: string;
  price: number;
  originalPrice: number;
  mrp?: number;
  discountPercentage: number;
  unit: string;
  imageUrl: string;
  images: string[];
  inStock: boolean;
  stock?: number;
  rating: number;
  ratingsCount?: number;
  deliveryTimeMins: number;
  sellerName?: string;
  brand?: string;
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  createdAt?: string;
}

const CATEGORY_OPTIONS = [
  { label: "Mobile Accessories", value: "MOBILE_ACCESSORIES" },
  { label: "Mobile Phones & Devices", value: "MOBILE_PHONES" },
  { label: "Grocery & Kitchen Staples", value: "GROCERY" },
  { label: "Beauty & Personal Parlour", value: "BEAUTY_PARLOUR" },
  { label: "Electronics & Appliances", value: "ELECTRONICS" },
  { label: "Home Needs & Spares", value: "HOME_NEEDS" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "MOBILE_ACCESSORIES",
    categoryName: "Mobile Accessories",
    brand: "",
    sellerName: "Inisha Retail Partner",
    unit: "1 Pc",
    price: 0,
    mrp: 0,
    stock: 100,
    inStock: true,
    deliveryTimeMins: 30,
    description: "",
    images: [] as string[],
    variants: [] as ProductVariant[],
    specifications: [] as ProductSpecification[],
  });

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data } = await apiClient.get("/ecommerce/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load products:", err);
      setErrorMsg(err.message || "Failed to load products catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by search & category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        p.category === selectedCategory ||
        p.categoryName === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle open modal for new product
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "MOBILE_ACCESSORIES",
      categoryName: "Mobile Accessories",
      brand: "",
      sellerName: "Inisha Retail Partner",
      unit: "1 Unit",
      price: 0,
      mrp: 0,
      stock: 100,
      inStock: true,
      deliveryTimeMins: 30,
      description: "",
      images: [],
      variants: [],
      specifications: [
        { label: "Brand", value: "" },
        { label: "Warranty", value: "1 Year Brand Warranty" },
      ],
    });
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEditModal = (p: ProductItem) => {
    setEditingId(p.id);
    const existingImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : p.imageUrl ? [p.imageUrl] : [];

    setFormData({
      name: p.name || "",
      category: p.category || "MOBILE_ACCESSORIES",
      categoryName: p.categoryName || "Mobile Accessories",
      brand: p.brand || "",
      sellerName: p.sellerName || "Inisha Retail Partner",
      unit: p.unit || "1 Unit",
      price: p.price || 0,
      mrp: p.mrp || p.originalPrice || p.price || 0,
      stock: p.stock !== undefined ? p.stock : 100,
      inStock: p.inStock !== false,
      deliveryTimeMins: p.deliveryTimeMins || 30,
      description: p.description || "",
      images: existingImages,
      variants: Array.isArray(p.variants) ? p.variants : [],
      specifications: Array.isArray(p.specifications) && p.specifications.length > 0
        ? p.specifications
        : [{ label: "Brand", value: p.brand || "" }],
    });
    setIsModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Product name is required.");
      return;
    }
    if (formData.price <= 0) {
      alert("Please enter a valid price greater than 0.");
      return;
    }
    if (formData.images.length === 0) {
      alert("Please upload at least one product photo.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        imageUrl: formData.images[0] || "",
        originalPrice: formData.mrp || formData.price,
        discountPercentage:
          formData.mrp > formData.price
            ? Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)
            : 0,
      };

      if (editingId) {
        await apiClient.put(`/ecommerce/products/${encodeURIComponent(editingId)}`, payload);
      } else {
        await apiClient.post("/ecommerce/products", payload);
      }

      setIsModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  // Quick In-Stock Toggle
  const handleToggleStock = async (product: ProductItem) => {
    try {
      const updatedStockStatus = !product.inStock;
      await apiClient.put(`/ecommerce/products/${encodeURIComponent(product.id)}`, {
        inStock: updatedStockStatus,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, inStock: updatedStockStatus } : p
        )
      );
    } catch (err: any) {
      alert("Failed to toggle stock status: " + err.message);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/ecommerce/products/${encodeURIComponent(productToDelete.id)}`);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Variant Helpers
  const handleAddVariantGroup = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "Color", options: ["Pink", "Blue", "Black"] }],
    }));
  };

  const handleUpdateVariant = (index: number, updated: ProductVariant) => {
    setFormData((prev) => {
      const next = [...prev.variants];
      next[index] = updated;
      return { ...prev, variants: next };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index),
    }));
  };

  // Specifications Helpers
  const handleAddSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { label: "", value: "" }],
    }));
  };

  const handleUpdateSpecification = (index: number, label: string, value: string) => {
    setFormData((prev) => {
      const next = [...prev.specifications];
      next[index] = { label, value };
      return { ...prev, specifications: next };
    });
  };

  const handleRemoveSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, idx) => idx !== index),
    }));
  };

  const calculatedDiscount = useMemo(() => {
    if (formData.mrp > formData.price && formData.mrp > 0) {
      return Math.round(((formData.mrp - formData.price) / formData.mrp) * 100);
    }
    return 0;
  }, [formData.price, formData.mrp]);

  return (
    <>
      <Head>
        <title>Products & Inventory Management | Inisha Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
              <Package size={26} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Products & Multi-Image Inventory
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Manage e-commerce products, Flipkart-style multi-image galleries, variants & live stock
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-red-600/20"
            >
              <Plus size={16} />
              Add New Product
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Total Products
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {products.length}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              In Stock Items
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {products.filter((p) => p.inStock).length}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="text-2xl font-black text-red-600 mt-1">
              {products.filter((p) => !p.inStock).length}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Categories Active
            </span>
            <div className="text-2xl font-black text-indigo-600 mt-1">
              {new Set(products.map((p) => p.categoryName || p.category)).size}
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by product name, brand, SKU or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-red-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500 transition w-full sm:w-auto"
            >
              <option value="ALL">All Categories ({products.length})</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold text-sm">
              <RefreshCw className="animate-spin inline mr-2 text-red-600" size={18} />
              Loading products inventory...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package size={40} className="mx-auto text-slate-300" />
              <h3 className="text-base font-black text-slate-800">No Products Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your search filters. Click Add New Product to create your first listing.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Product & Gallery</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price & MRP</th>
                    <th className="py-3.5 px-4">Stock & Status</th>
                    <th className="py-3.5 px-4">Variants</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const gallery = Array.isArray(product.images) && product.images.length > 0
                      ? product.images
                      : product.imageUrl ? [product.imageUrl] : [];
                    const primaryThumb = gallery[0] || "/brand-logo.png";
                    const extraCount = gallery.length > 1 ? gallery.length - 1 : 0;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/70 transition">
                        {/* Product Photo & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 shadow-sm">
                              <img
                                src={primaryThumb}
                                alt={product.name}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  e.currentTarget.src = "/brand-logo.png";
                                }}
                              />
                              {extraCount > 0 && (
                                <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[8px] font-black px-1 rounded-tl-md">
                                  +{extraCount}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 max-w-xs">
                              <span className="font-bold text-slate-900 text-xs line-clamp-1">
                                {product.name}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                {product.brand && (
                                  <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {product.brand}
                                  </span>
                                )}
                                <span>{product.unit}</span>
                                <span>• ID: {product.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-bold text-[10px] whitespace-nowrap">
                            {product.categoryName || product.category}
                          </span>
                        </td>

                        {/* Price & MRP */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-sm">
                            ₹{product.price}
                          </div>
                          {product.originalPrice > product.price && (
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="text-slate-400 line-through">
                                ₹{product.originalPrice}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {product.discountPercentage}% OFF
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Stock & Status Toggle */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStock(product)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black transition flex items-center gap-1 ${
                                product.inStock
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {product.inStock ? (
                                <>
                                  <CheckCircle2 size={12} /> In Stock
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} /> Out of Stock
                                </>
                              )}
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({product.stock ?? 100} units)
                            </span>
                          </div>
                        </td>

                        {/* Variants Count */}
                        <td className="py-3.5 px-4">
                          {product.variants && product.variants.length > 0 ? (
                            <div className="space-y-1">
                              {product.variants.map((v, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[9px] font-bold mr-1"
                                >
                                  {v.name}: {v.options?.length || 0} options
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Standard</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              title="Edit Product"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setProductToDelete(product)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                              title="Delete Product"
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
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingId ? "Edit Product Listing" : "Add New Product"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure multi-image carousel, dynamic variants & specifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
              {/* Basic Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={14} className="text-red-600" /> Basic Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Product Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 65W SuperVOOC Fast Charger Type-C Cable"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const sel = CATEGORY_OPTIONS.find((c) => c.value === e.target.value);
                        setFormData({
                          ...formData,
                          category: e.target.value,
                          categoryName: sel ? sel.label : e.target.value,
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Brand (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apple, Samsung, Fortune"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Unit / Pack Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Pc, 500ml, 1 Kg"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Seller Partner Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inisha Retail Partner"
                      value={formData.sellerName}
                      onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes size={14} className="text-emerald-600" /> Pricing & Inventory
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 499"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-black focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Original MRP (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 999"
                      value={formData.mrp || ""}
                      onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Discount %
                    </label>
                    <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-black px-3 py-2 rounded-xl text-xs flex items-center justify-between">
                      <span>{calculatedDiscount}% OFF</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="inStockCheck"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <label htmlFor="inStockCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Mark Available / In Stock for Instant Fast Delivery
                  </label>
                </div>
              </div>

              {/* Multi-Image Upload Gallery */}
              <div className="pt-2 border-t border-slate-100">
                <MultiImageUploadPicker
                  images={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                  maxImages={6}
                />
              </div>

              {/* Dynamic Product Variants */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-purple-600" /> Product Variants (e.g. Color, Size)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddVariantGroup}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Variant Group
                  </button>
                </div>

                {formData.variants.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No variants added. Click Add Variant Group to configure options like Colors (Pink, Blue) or Sizes (Small, Large).
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {formData.variants.map((v, vIdx) => (
                      <div
                        key={vIdx}
                        className="bg-purple-50/50 border border-purple-200 p-3 rounded-2xl flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between"
                      >
                        <div className="flex-1 w-full sm:w-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Variant Name (e.g. Color, Size)"
                            value={v.name}
                            onChange={(e) =>
                              handleUpdateVariant(vIdx, { ...v, name: e.target.value })
                            }
                            className="bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                          />
                          <input
                            type="text"
                            placeholder="Comma-separated options (e.g. Pink, Blue, Black)"
                            value={v.options.join(", ")}
                            onChange={(e) =>
                              handleUpdateVariant(vIdx, {
                                ...v,
                                options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            className="bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(vIdx)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition self-end sm:self-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Specifications */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blue-600" /> Specifications & Highlights
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSpecification}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.specifications.map((spec, sIdx) => (
                    <div key={sIdx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Label (e.g. Material, Warranty)"
                        value={spec.label}
                        onChange={(e) =>
                          handleUpdateSpecification(sIdx, e.target.value, spec.value)
                        }
                        className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Polycarbonate, 1 Year)"
                        value={spec.value}
                        onChange={(e) =>
                          handleUpdateSpecification(sIdx, spec.label, e.target.value)
                        }
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecification(sIdx)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed product features, highlights, and bullet points..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-md shadow-red-600/20"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save & Broadcast Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="font-black text-base text-slate-900">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">{productToDelete.name}</span>? This action is permanent.
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition flex-1 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
