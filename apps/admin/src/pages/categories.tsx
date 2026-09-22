import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  ChevronRight,
  Check,
  Settings,
  ShoppingBag,
  Search,
  RefreshCw,
  X,
  IndianRupee,
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface FormFieldAdmin {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  basePrice: number;
  description: string;
  fields: FormFieldAdmin[];
  isActive: boolean;
}

interface StoreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  imageUrl: string;
}

export default function AdminCategoriesAndServices() {
  const [activeTab, setActiveTab] = useState<"SERVICES" | "STORE">("SERVICES");
  const [searchQuery, setSearchQuery] = useState("");

  const defaultServices: ServiceCategory[] = [
    {
      id: "srv_mobile",
      name: "Mobile Repair",
      iconName: "smartphone",
      basePrice: 499,
      description: "Screen replacement, battery swap, charging port fix at doorstep",
      fields: [
        { id: "brand_model", label: "Phone Brand & Model", type: "TEXT", required: true },
        { id: "fault_type", label: "Issue / Broken Part", type: "SELECT", required: true },
        { id: "visit_slot", label: "Service Time Slot", type: "TIME_SLOT", required: true },
        { id: "gps_addr", label: "Service Address", type: "ADDRESS_GPS", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_ac",
      name: "AC Repair & Servicing",
      iconName: "air-vent",
      basePrice: 399,
      description: "Power foam jet cleaning, gas charging & PCB repair",
      fields: [
        { id: "ac_type", label: "AC Type (Split/Window)", type: "SELECT", required: true },
        { id: "service_type", label: "Foam Jet / Gas / Repair", type: "SELECT", required: true },
        { id: "slot", label: "Visit Slot", type: "TIME_SLOT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_electrician",
      name: "Electrician",
      iconName: "zap",
      basePrice: 199,
      description: "Fan, switchboard, MCB tripping, chandelier installation",
      fields: [
        { id: "work_scope", label: "Electrical Work Needed", type: "SELECT", required: true },
        { id: "urgency", label: "Emergency / Scheduled", type: "SELECT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_plumber",
      name: "Plumber",
      iconName: "droplet",
      basePrice: 199,
      description: "Tap leakage, washbasin, toilet cistern & water motor repair",
      fields: [
        { id: "leak_type", label: "Plumbing Fixture", type: "SELECT", required: true },
        { id: "slot", label: "Preferred Time", type: "TIME_SLOT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_carpenter",
      name: "Carpenter",
      iconName: "hammer",
      basePrice: 249,
      description: "Door lock, cupboard hinges, bed assembly & furniture repair",
      fields: [
        { id: "wood_item", label: "Furniture Item", type: "TEXT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_cleaning",
      name: "Home Cleaning",
      iconName: "sparkles",
      basePrice: 799,
      description: "Deep bathroom, kitchen chimney and full villa cleaning",
      fields: [
        { id: "bhk_size", label: "Home Size (1/2/3/4 BHK)", type: "SELECT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_salon",
      name: "Home Salon & Parlor",
      iconName: "scissors",
      basePrice: 599,
      description: "Waxing, facial, manicure, pedicure & hair spa at home",
      fields: [
        { id: "salon_package", label: "Select Beauty Package", type: "SELECT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_appliance",
      name: "Appliance Repair",
      iconName: "tv",
      basePrice: 299,
      description: "Microwave, geyser, mixer grinder & chimney repair",
      fields: [
        { id: "appliance_item", label: "Appliance Name & Brand", type: "TEXT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_painting",
      name: "Painting",
      iconName: "paint-bucket",
      basePrice: 1499,
      description: "Interior wall painting, waterproof coating & texture designs",
      fields: [
        { id: "rooms_count", label: "Number of Rooms", type: "SELECT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_cctv",
      name: "CCTV Installation",
      iconName: "camera",
      basePrice: 499,
      description: "HD camera setup, DVR cabling, WiFi remote view configuration",
      fields: [
        { id: "cam_count", label: "Number of Cameras", type: "SELECT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_ro",
      name: "RO Service & Filter Change",
      iconName: "filter",
      basePrice: 299,
      description: "Sediment, carbon filter change, membrane repair & TDS calibration",
      fields: [
        { id: "ro_brand", label: "RO Brand (Kent/Aquaguard)", type: "TEXT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_computer",
      name: "Computer/Laptop Repair",
      iconName: "laptop",
      basePrice: 399,
      description: "Windows installation, SSD upgrade, keyboard & motherboard repair",
      fields: [
        { id: "laptop_brand", label: "Laptop Model & Issue", type: "TEXT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_washing_machine",
      name: "Washing Machine Repair",
      iconName: "disc",
      basePrice: 349,
      description: "Front load, top load motor, drum noise and drain pump fixes",
      fields: [
        { id: "wm_type", label: "Front/Top Load Semi-Auto", type: "SELECT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_refrigerator",
      name: "Refrigerator Repair",
      iconName: "snowflake",
      basePrice: 349,
      description: "Single/Double door gas refill, thermostat & compressor fixes",
      fields: [
        { id: "fridge_brand", label: "Fridge Brand & Capacity", type: "TEXT", required: true },
      ],
      isActive: true,
    },
    {
      id: "srv_pest_control",
      name: "Pest Control",
      iconName: "shield",
      basePrice: 699,
      description: "Cockroach herbal gel, termite treatment, bedbug & mosquito spray",
      fields: [
        { id: "pest_type", label: "Target Pests", type: "SELECT", required: true },
      ],
      isActive: true,
    },
  ];

  const [services, setServices] = useState<ServiceCategory[]>(defaultServices);
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(defaultServices[0]);
  const [editingPrice, setEditingPrice] = useState<number>(defaultServices[0].basePrice);
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState(299);
  const [newServiceDesc, setNewServiceDesc] = useState("");

  // Store Products state
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([
    {
      id: "prod_1",
      name: "iPhone 13 / 14 OLED Display Screen (OEM)",
      category: "Mobile Accessories",
      price: 2499,
      mrp: 3999,
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80",
    },
    {
      id: "prod_2",
      name: "Universal Split AC Copper Coil Jet Spray",
      category: "AC Spares",
      price: 450,
      mrp: 699,
      stock: 120,
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
    },
    {
      id: "prod_3",
      name: "RO Sediment & Carbon Filter Membrane Kit",
      category: "Home Spares",
      price: 899,
      mrp: 1499,
      stock: 80,
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    },
    {
      id: "prod_4",
      name: "Heavy Duty 16A Modular Switch & Socket Box",
      category: "Electrical",
      price: 220,
      mrp: 350,
      stock: 200,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
    },
  ]);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    category: "Mobile Accessories",
    price: 499,
    mrp: 799,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
  });

  const handleSelectService = (srv: ServiceCategory) => {
    setSelectedService(srv);
    setEditingPrice(srv.basePrice);
  };

  const handleSavePrice = () => {
    if (!selectedService) return;
    setServices((prev) =>
      prev.map((s) => (s.id === selectedService.id ? { ...s, basePrice: editingPrice } : s))
    );
    setSelectedService((prev) => (prev ? { ...prev, basePrice: editingPrice } : null));
    alert(`Base rate for ${selectedService.name} updated to ₹${editingPrice}!`);
  };

  const handleCreateNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newSrv: ServiceCategory = {
      id: `srv_${Date.now()}`,
      name: newServiceName.trim(),
      iconName: "tool",
      basePrice: Number(newServicePrice),
      description: newServiceDesc.trim() || "Expert professional doorstep service",
      fields: [
        { id: "details", label: "Requirement Details", type: "TEXT", required: true },
        { id: "slot", label: "Visit Time Slot", type: "TIME_SLOT", required: true },
      ],
      isActive: true,
    };

    setServices((prev) => [...prev, newSrv]);
    setSelectedService(newSrv);
    setEditingPrice(newSrv.basePrice);
    setNewServiceModalOpen(false);
    setNewServiceName("");
    setNewServiceDesc("");
    alert(`New service "${newSrv.name}" created and added to live catalog!`);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) return;

    const prod: StoreProduct = {
      id: `prod_${Date.now()}`,
      name: newProd.name.trim(),
      category: newProd.category,
      price: Number(newProd.price),
      mrp: Number(newProd.mrp),
      stock: Number(newProd.stock),
      imageUrl: newProd.imageUrl,
    };

    setStoreProducts((prev) => [prod, ...prev]);
    setProductModalOpen(false);
    setNewProd({
      name: "",
      category: "Mobile Accessories",
      price: 499,
      mrp: 799,
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    });
    alert(`Product "${prod.name}" added to Quick Store catalog!`);
  };

  const handleDeleteProduct = (id: string) => {
    setStoreProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Layers className="text-red-600" size={24} />
            Category, Services & Store Catalog Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage all 15 home repair categories, custom dynamic services & quick-commerce spare parts
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          {/* Tabs */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("SERVICES")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "SERVICES"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers size={13} />
              15 Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab("STORE")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "STORE"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShoppingBag size={13} />
              Quick Store ({storeProducts.length})
            </button>
          </div>

          {activeTab === "SERVICES" ? (
            <button
              onClick={() => setNewServiceModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Plus size={14} />
              + Add Service
            </button>
          ) : (
            <button
              onClick={() => setProductModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Plus size={14} />
              + Add Product
            </button>
          )}
        </div>
      </div>

      {activeTab === "SERVICES" ? (
        /* Services View */
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: All 15 Services List */}
          <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                All Available Services ({services.length})
              </h3>
              <span className="text-[11px] text-slate-400">Click to configure rate & fields</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {services.map((srv) => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleSelectService(srv)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-red-50 border-red-500 shadow-sm"
                        : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        {srv.name}
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          ({srv.fields.length} dynamic fields)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{srv.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-black text-xs text-slate-900">₹{srv.basePrice}</span>
                      <ChevronRight size={14} className={isSelected ? "text-red-600" : "text-slate-400"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Service Configuration */}
          <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-6 h-fit">
            {selectedService ? (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-slate-900">
                      {selectedService.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedService.description}</p>
                  </div>
                  <Settings size={18} className="text-red-600" />
                </div>

                {/* Pricing Editor */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                    Starting Base Price (₹)
                  </label>
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-slate-900 font-black text-lg">
                        <span>₹</span>
                        <input
                          type="number"
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(Number(e.target.value))}
                          className="bg-transparent text-lg font-black focus:outline-none w-full border-b border-slate-300 focus:border-red-500 pb-0.5"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSavePrice}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-600/20"
                    >
                      <Check size={14} />
                      Save Rate
                    </button>
                  </div>
                </div>

                {/* Form Schema Parameters */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">
                    Customer Booking Form Schema ({selectedService.fields.length} Fields)
                  </h4>
                  <div className="space-y-2">
                    {selectedService.fields.map((f) => (
                      <div
                        key={f.id}
                        className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={15} className="text-emerald-600" />
                          <span className="font-bold text-slate-900">{f.label}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {f.type} • {f.required ? "REQUIRED" : "OPTIONAL"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* Store Products View */
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-black text-base text-slate-900">
              Quick Commerce Spare Parts & Inventory ({storeProducts.length} Items)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storeProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
              >
                <div className="h-32 bg-white rounded-xl overflow-hidden border border-slate-200">
                  <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                    {prod.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-2 mt-0.5">{prod.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-black text-slate-900 font-mono text-sm">₹{prod.price}</span>
                    <span className="text-[10px] text-slate-400 line-through font-mono">₹{prod.mrp}</span>
                    <span className="text-[10px] text-emerald-700 font-bold ml-auto">
                      {prod.stock} in stock
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {newServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Plus className="text-red-600" size={18} />
                  Create New Service
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Add new service vertical to customer app</p>
              </div>
              <button
                onClick={() => setNewServiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewService} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Panel Cleaning & Maintenance"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Starting Base Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Certified solar technician visit at doorstep"
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewServiceModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20"
                >
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="text-red-600" size={18} />
                  Add Quick Store Spare Part
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">List product in store catalog</p>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung 25W Fast Charger Type-C"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={newProd.mrp}
                    onChange={(e) => setNewProd({ ...newProd, mrp: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
