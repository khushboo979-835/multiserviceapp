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
  Smartphone,
  Wind,
  Zap,
  Droplet,
  Hammer,
  Sparkles,
  Scissors,
  Tv,
  Paintbrush,
  Camera,
  Filter,
  Laptop,
  Disc,
  Snowflake,
  Shield,
  Wrench,
  Image as ImageIcon,
  Tag,
  Package,
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import apiClient from "../api/apiClient";
import ImageUploadPicker from "../components/ImageUploadPicker";

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
  imageUrl?: string;
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

const AVAILABLE_ICONS = [
  { id: "smartphone", label: "Mobile Repair", icon: Smartphone },
  { id: "air-vent", label: "AC Repair", icon: Wind },
  { id: "zap", label: "Electrician", icon: Zap },
  { id: "droplet", label: "Plumber", icon: Droplet },
  { id: "hammer", label: "Carpenter", icon: Hammer },
  { id: "sparkles", label: "Home Cleaning", icon: Sparkles },
  { id: "scissors", label: "Salon & Parlor", icon: Scissors },
  { id: "tv", label: "Appliance Repair", icon: Tv },
  { id: "paint-bucket", label: "Painting", icon: Paintbrush },
  { id: "camera", label: "CCTV Installation", icon: Camera },
  { id: "filter", label: "RO Water Purifier", icon: Filter },
  { id: "laptop", label: "Computer / Laptop", icon: Laptop },
  { id: "disc", label: "Washing Machine", icon: Disc },
  { id: "snowflake", label: "Refrigerator", icon: Snowflake },
  { id: "shield", label: "Pest Control", icon: Shield },
  { id: "tool", label: "General Repair", icon: Wrench },
];

export interface CatalogSubService {
  _id?: string;
  serviceId?: string;
  serviceName: string;
  category: string;
  subCategory?: string;
  description: string;
  price: number;
  discountedPrice?: number;
  duration: string;
  imageUrl?: string;
  isActive: boolean;
  rating?: number;
}

export default function AdminCategoriesAndServices() {
  const [activeTab, setActiveTab] = useState<"SUB_SERVICES" | "SERVICES" | "STORE">("SUB_SERVICES");
  const [searchQuery, setSearchQuery] = useState("");
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  // Sub-Services Catalog state (57 Urban Company services)
  const [subServices, setSubServices] = useState<CatalogSubService[]>([]);
  const [subServicesLoading, setSubServicesLoading] = useState(false);
  const [subCategoryFilter, setSubCategoryFilter] = useState("ALL");
  const [subServiceModalOpen, setSubServiceModalOpen] = useState(false);
  const [editingSubService, setEditingSubService] = useState<CatalogSubService | null>(null);
  const [subServiceForm, setSubServiceForm] = useState({
    serviceName: "",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 100,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
    description: "",
  });

  const defaultServices: ServiceCategory[] = [
    {
      id: "cat_mobile",
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
      id: "cat_ac_repair",
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
      id: "cat_electrician",
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
      id: "cat_plumber",
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
      id: "cat_carpenter",
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
      id: "cat_cleaning",
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
      id: "cat_salon",
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
      id: "cat_appliance_repair",
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
      id: "cat_painting",
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
      id: "cat_cctv",
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
      id: "cat_ro_purifier",
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
      id: "cat_computer",
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
      id: "cat_washing_machine",
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
      id: "cat_refrigerator",
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
      id: "cat_pest_control",
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

  const defaultStoreProducts: StoreProduct[] = [
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
  ];

  const [services, setServices] = useState<ServiceCategory[]>(defaultServices);
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(defaultServices[0]);
  const [editingPrice, setEditingPrice] = useState<number>(defaultServices[0].basePrice);

  // Modals state
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState(299);
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServiceIcon, setNewServiceIcon] = useState("tool");
  const [newServiceImageUrl, setNewServiceImageUrl] = useState("");

  // Edit Service Modal state
  const [editServiceModalOpen, setEditServiceModalOpen] = useState(false);
  const [editServiceForm, setEditServiceForm] = useState<ServiceCategory | null>(null);

  // New Field inside Edit Service Modal
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("TEXT");
  const [newFieldRequired, setNewFieldRequired] = useState(true);

  // Store Products state
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(defaultStoreProducts);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  const [newProd, setNewProd] = useState({
    name: "",
    category: "Mobile Accessories",
    price: 499,
    mrp: 799,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
  });

  // Sync with Backend MongoDB & localStorage on mount
  useEffect(() => {
    // 1. Instantly load from localStorage for zero flash
    if (typeof window !== "undefined") {
      try {
        const cachedServices = localStorage.getItem("inisha_admin_services");
        if (cachedServices) {
          const parsed = JSON.parse(cachedServices);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setServices(parsed);
            setSelectedService(parsed[0]);
            setEditingPrice(parsed[0].basePrice);
          }
        }
        const cachedProds = localStorage.getItem("inisha_admin_products");
        if (cachedProds) {
          const parsedP = JSON.parse(cachedProds);
          if (Array.isArray(parsedP) && parsedP.length > 0) {
            setStoreProducts(parsedP);
          }
        }
      } catch (err) {
        console.warn("Local storage cache read error:", err);
      }
    }

    // 2. Fetch Live from Backend REST API (MongoDB)
    const loadLiveBackendData = async () => {
      try {
        const resCat = await apiClient.get("/categories");
        const apiCats = resCat.data?.categories || resCat.data;
        if (Array.isArray(apiCats) && apiCats.length > 0) {
          const formatted: ServiceCategory[] = apiCats.map((c: any) => {
            const firstSub = c.subcategories?.[0];
            const formFields = firstSub?.formConfig?.fields || c.fields || [];
            return {
              id: c.id || c.categoryId,
              name: c.name,
              iconName: c.imageUrl || c.iconName || "sparkles",
              imageUrl: c.imageUrl?.startsWith("http") ? c.imageUrl : undefined,
              basePrice: firstSub?.basePrice || c.basePrice || 299,
              description: c.description || "",
              fields: Array.isArray(formFields)
                ? formFields.map((f: any) => ({
                    id: f.id || `f_${Math.random().toString(36).substring(2, 6)}`,
                    label: f.label || "Requirement",
                    type: f.type || "TEXT",
                    required: f.validation?.required ?? f.required ?? true,
                  }))
                : [],
              isActive: c.isActive !== false,
            };
          });

          setServices(formatted);
          if (typeof window !== "undefined") {
            localStorage.setItem("inisha_admin_services", JSON.stringify(formatted));
          }
          setSelectedService((prev) =>
            prev ? formatted.find((s) => s.id === prev.id) || formatted[0] : formatted[0]
          );
        }
      } catch (catErr) {
        console.warn("Categories backend load error:", catErr);
      }

      try {
        const resProd = await apiClient.get("/ecommerce/products");
        const prods = Array.isArray(resProd.data) ? resProd.data : [];
        if (prods.length > 0) {
          const mapped: StoreProduct[] = prods.map((p: any) => ({
            id: p.id || p._id?.toString(),
            name: p.name,
            category: p.categoryName || p.category || "General",
            price: Number(p.price) || 199,
            mrp: Number(p.originalPrice || p.mrp) || Number(p.price) + 100,
            stock: p.stock !== undefined ? Number(p.stock) : 50,
            imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
          }));
          setStoreProducts(mapped);
          if (typeof window !== "undefined") {
            localStorage.setItem("inisha_admin_products", JSON.stringify(mapped));
          }
        }
      } catch (prodErr) {
        console.warn("Products backend load error:", prodErr);
      }
    };

    loadLiveBackendData();
    fetchSubServices();
  }, []);

  const fetchSubServices = async () => {
    try {
      setSubServicesLoading(true);
      const res = await apiClient.get("/admin/services").catch(() => null);
      if (res?.data?.success && Array.isArray(res.data.services) && res.data.services.length > 0) {
        setSubServices(res.data.services);
      } else {
        const seedRes = await apiClient.post("/admin/services/seed").catch(() => null);
        if (seedRes?.data?.success && Array.isArray(seedRes.data.services)) {
          setSubServices(seedRes.data.services);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch sub-services:", err);
    } finally {
      setSubServicesLoading(false);
    }
  };

  const handleOpenAddSubServiceModal = () => {
    setEditingSubService(null);
    setSubServiceForm({
      serviceName: "",
      category: "Beauty Parlour",
      subCategory: "Men's Grooming",
      price: 100,
      duration: "30 min",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
      description: "",
    });
    setSubServiceModalOpen(true);
  };

  const handleOpenEditSubServiceModal = (service: CatalogSubService) => {
    setEditingSubService(service);
    setSubServiceForm({
      serviceName: service.serviceName,
      category: service.category || "Beauty Parlour",
      subCategory: service.subCategory || "Men's Grooming",
      price: service.price || 100,
      duration: service.duration || "30 min",
      imageUrl: service.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
      description: service.description || "",
    });
    setSubServiceModalOpen(true);
  };

  const handleSaveSubService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingStatus("Saving service...");
      if (editingSubService?._id || editingSubService?.serviceId) {
        const id = editingSubService._id || editingSubService.serviceId;
        await apiClient.put(`/admin/services/${id}`, subServiceForm);
        setSavingStatus("Service updated successfully!");
      } else {
        await apiClient.post("/admin/services", subServiceForm);
        setSavingStatus("Service added successfully!");
      }
      setSubServiceModalOpen(false);
      setEditingSubService(null);
      await fetchSubServices();
      setTimeout(() => setSavingStatus(null), 3000);
    } catch (err: any) {
      alert("Failed to save service: " + (err.response?.data?.message || err.message));
      setSavingStatus(null);
    }
  };

  const handleDeleteSubService = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete service "${name}"?`)) return;
    try {
      setSavingStatus("Deleting service...");
      await apiClient.delete(`/admin/services/${id}`);
      setSubServices((prev) => prev.filter((s) => s._id !== id && s.serviceId !== id));
      setSavingStatus(`Service "${name}" deleted successfully.`);
      setTimeout(() => setSavingStatus(null), 3000);
    } catch (err: any) {
      alert("Failed to delete service: " + (err.response?.data?.message || err.message));
      setSavingStatus(null);
    }
  };

  const handleToggleSubServiceActive = async (service: CatalogSubService) => {
    try {
      const id = service._id || service.serviceId;
      const targetActive = !service.isActive;
      setSubServices((prev) =>
        prev.map((s) => (s._id === id || s.serviceId === id ? { ...s, isActive: targetActive } : s))
      );
      await apiClient.put(`/admin/services/${id}`, { isActive: targetActive });
    } catch (err) {
      console.warn("Failed to toggle service active:", err);
      await fetchSubServices();
    }
  };

  const handleSeed57Services = async () => {
    if (!window.confirm("Seed/Restore all 57 standard Urban Company beauty and mobile repair services to MongoDB?")) return;
    try {
      setSavingStatus("Seeding 57 services...");
      const res = await apiClient.post("/admin/services/seed");
      if (res.data?.success) {
        setSavingStatus("Successfully seeded 57 services!");
        await fetchSubServices();
      }
      setTimeout(() => setSavingStatus(null), 3000);
    } catch (err: any) {
      alert("Failed to seed services: " + (err.response?.data?.message || err.message));
      setSavingStatus(null);
    }
  };

  const handleSelectService = (srv: ServiceCategory) => {
    setSelectedService(srv);
    setEditingPrice(srv.basePrice);
  };

  const handleOpenEditServiceModal = (srv: ServiceCategory) => {
    setEditServiceForm(JSON.parse(JSON.stringify(srv)));
    setEditServiceModalOpen(true);
  };

  const handleSaveInlinePrice = async () => {
    if (!selectedService) return;
    const updated = { ...selectedService, basePrice: Number(editingPrice) };

    setSavingStatus("Saving price change...");
    try {
      await apiClient.put(`/categories/${selectedService.id}`, updated);
      const updatedList = services.map((service) => service.id === selectedService.id ? updated : service);
      setServices(updatedList);
      setSelectedService(updated);
      localStorage.setItem("inisha_admin_services", JSON.stringify(updatedList));
      setSavingStatus("Saved to database!");
      setTimeout(() => setSavingStatus(null), 2500);
    } catch (err: any) {
      console.error("Backend save price error:", err);
      setSavingStatus(null);
      alert(err.response?.data?.message || err.message || "Price was not saved");
      return;
    }

    alert(`Base rate for ${selectedService.name} updated to ₹${editingPrice} (Live across all apps)!`);
  };

  const handleSaveEditedService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editServiceForm) return;

    setSavingStatus("Saving service updates...");
    try {
      await apiClient.put(`/categories/${editServiceForm.id}`, editServiceForm);
      const updatedList = services.map((service) => service.id === editServiceForm.id ? editServiceForm : service);
      setServices(updatedList);
      if (selectedService?.id === editServiceForm.id) {
        setSelectedService(editServiceForm);
        setEditingPrice(editServiceForm.basePrice);
      }
      localStorage.setItem("inisha_admin_services", JSON.stringify(updatedList));
      setSavingStatus("Saved to database!");
      setTimeout(() => setSavingStatus(null), 2500);
    } catch (err: any) {
      console.error("Backend save service error:", err);
      setSavingStatus(null);
      alert(err.response?.data?.message || err.message || "Service was not saved");
      return;
    }

    setEditServiceModalOpen(false);
    alert(`Service "${editServiceForm.name}" updated permanently!`);
  };

  const handleDeleteService = async (serviceId: string) => {
    const srv = services.find((s) => s.id === serviceId);
    if (!window.confirm(`Are you sure you want to remove "${srv?.name || "this service"}" from the catalog?`)) {
      return;
    }

    try {
      await Promise.allSettled([
        apiClient.delete(`/categories/${serviceId}`),
        apiClient.delete(`/admin/services/${serviceId}`),
      ]);
    } catch (err: any) {
      console.warn("Backend delete category warning:", err);
    }

    const filtered = services.filter((service) => service.id !== serviceId);
    setServices(filtered);
    localStorage.setItem("inisha_admin_services", JSON.stringify(filtered));
    if (selectedService?.id === serviceId) {
      setSelectedService(filtered[0] || null);
      setEditingPrice(filtered[0]?.basePrice || 0);
    }
    if (editServiceModalOpen) {
      setEditServiceModalOpen(false);
    }

    alert(`Service removed successfully!`);
  };

  const handleAddFieldToService = () => {
    if (!newFieldLabel.trim() || !editServiceForm) return;
    const newFld: FormFieldAdmin = {
      id: `field_${Date.now()}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
    };
    setEditServiceForm({
      ...editServiceForm,
      fields: [...editServiceForm.fields, newFld],
    });
    setNewFieldLabel("");
  };

  const handleRemoveFieldFromService = (fieldId: string) => {
    if (!editServiceForm) return;
    setEditServiceForm({
      ...editServiceForm,
      fields: editServiceForm.fields.filter((f) => f.id !== fieldId),
    });
  };

  const handleCreateNewService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newSrv: ServiceCategory = {
      id: `cat_${newServiceName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${Date.now().toString(36)}`,
      name: newServiceName.trim(),
      iconName: newServiceIcon || "tool",
      imageUrl: newServiceImageUrl || "",
      basePrice: Number(newServicePrice),
      description: newServiceDesc.trim() || "Expert professional doorstep service",
      fields: [
        { id: "details", label: "Requirement Details", type: "TEXT", required: true },
        { id: "slot", label: "Visit Time Slot", type: "TIME_SLOT", required: true },
      ],
      isActive: true,
    };

    try {
      // 1. Persist to MongoDB Service Catalog
      await apiClient.post("/admin/services", {
        serviceName: newServiceName.trim(),
        title: newServiceName.trim(),
        category: newServiceName.trim(),
        subCategory: "General",
        price: Number(newServicePrice),
        description: newServiceDesc.trim() || "Expert professional doorstep service",
        imageUrl: newServiceImageUrl || "",
        duration: "30-60 mins",
        isActive: true,
      });

      // 2. Also sync to /categories for customer navigation
      await apiClient.post("/categories", newSrv).catch(() => null);
    } catch (err: any) {
      console.warn("Backend create service warning:", err);
      try {
        await apiClient.post("/categories", newSrv);
      } catch (catErr: any) {
        alert(err.response?.data?.message || catErr.response?.data?.message || err.message || "Failed to add service");
        return;
      }
    }

    const updatedList = [...services, newSrv];
    setServices(updatedList);
    setSelectedService(newSrv);
    setEditingPrice(newSrv.basePrice);
    localStorage.setItem("inisha_admin_services", JSON.stringify(updatedList));

    setNewServiceModalOpen(false);
    setNewServiceName("");
    setNewServiceDesc("");
    setNewServiceImageUrl("");
    alert(`New service "${newSrv.name}" created and added permanently to live catalog!`);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) return;

    const prod: StoreProduct = {
      id: `prod_${Date.now()}`,
      name: newProd.name.trim(),
      category: newProd.category,
      price: Number(newProd.price),
      mrp: Number(newProd.mrp),
      stock: Number(newProd.stock),
      imageUrl: newProd.imageUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    };

    try {
      await apiClient.post("/ecommerce/products", prod);
    } catch (err: any) {
      console.warn("Product backend save error:", err);
      alert(err.response?.data?.message || err.message || "Product could not be saved");
      return;
    }

    const updatedProds = [prod, ...storeProducts];
    setStoreProducts(updatedProds);
    localStorage.setItem("inisha_admin_products", JSON.stringify(updatedProds));
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

  const handleOpenEditProduct = (prod: StoreProduct) => {
    setEditingProduct({ ...prod });
    setEditProductModalOpen(true);
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await apiClient.put(`/ecommerce/products/${editingProduct.id}`, editingProduct);
    } catch (err: any) {
      console.warn("Product edit backend error:", err);
      alert(err.response?.data?.message || err.message || "Product could not be updated");
      return;
    }

    const updatedProds = storeProducts.map((product) => product.id === editingProduct.id ? editingProduct : product);
    setStoreProducts(updatedProds);
    localStorage.setItem("inisha_admin_products", JSON.stringify(updatedProds));

    setEditProductModalOpen(false);
    alert(`Product "${editingProduct.name}" updated successfully!`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to remove this product from the store?")) return;

    try {
      await apiClient.delete(`/ecommerce/products/${productId}`);
    } catch (err: any) {
      console.warn("Product delete backend error:", err);
      alert(err.response?.data?.message || err.message || "Product could not be deleted");
      return;
    }

    const filtered = storeProducts.filter((product) => product.id !== productId);
    setStoreProducts(filtered);
    localStorage.setItem("inisha_admin_products", JSON.stringify(filtered));

    alert("Product removed from store!");
  };

  const filteredSubServices = subServices.filter((s) => {
    const matchesCategory =
      subCategoryFilter === "ALL" ||
      s.category?.toLowerCase() === subCategoryFilter.toLowerCase() ||
      s.subCategory?.toLowerCase() === subCategoryFilter.toLowerCase() ||
      (subCategoryFilter === "MENS_GROOMING" && s.subCategory?.toLowerCase().includes("men")) ||
      (subCategoryFilter === "WOMENS_BEAUTY" && s.subCategory?.toLowerCase().includes("women"));

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      s.serviceName?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.subCategory?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = storeProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderIconComponent = (iconName: string, size = 18) => {
    const found = AVAILABLE_ICONS.find((i) => i.id === iconName);
    if (found) {
      const IconComp = found.icon;
      return <IconComp size={size} />;
    }
    return <Wrench size={size} />;
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
            Manage all doorstep home repair services, custom pricing, dynamic forms & quick-commerce inventory
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto flex-wrap">
          {/* Tabs */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("SUB_SERVICES")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "SUB_SERVICES"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles size={13} />
              Sub-Services ({subServices.length})
            </button>
            <button
              onClick={() => setActiveTab("SERVICES")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "SERVICES"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers size={13} />
              Main Categories ({services.length})
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

          {activeTab === "SUB_SERVICES" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSeed57Services}
                title="Seed 57 Standard UC Services"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
              >
                <RefreshCw size={13} />
                Restore 57 Services
              </button>
              <button
                onClick={handleOpenAddSubServiceModal}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition"
              >
                <Plus size={14} />
                + Add Sub-Service
              </button>
            </div>
          ) : activeTab === "SERVICES" ? (
            <button
              onClick={() => setNewServiceModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition"
            >
              <Plus size={14} />
              + Add Category
            </button>
          ) : (
            <button
              onClick={() => setProductModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition"
            >
              <Plus size={14} />
              + Add Product
            </button>
          )}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-slate-400 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === "SUB_SERVICES"
              ? "Search sub-services (e.g. Hair Cutting, Facial, Display, Battery, AC Cleaning)..."
              : activeTab === "SERVICES"
              ? "Search service by name (e.g. RO, AC, Mobile, Washing Machine)..."
              : "Search store product (e.g. Screen, Coil, Filter, Switch)..."
          }
          className="flex-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg"
          >
            Clear
          </button>
        )}
      </div>

      {activeTab === "SUB_SERVICES" ? (
        /* Sub-Services View */
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: "ALL", label: `All Services (${subServices.length})` },
              { id: "MENS_GROOMING", label: "Men's Grooming" },
              { id: "WOMENS_BEAUTY", label: "Women's Beauty" },
              { id: "Mobile Repair", label: "Mobile Repair" },
              { id: "AC Repair", label: "AC Repair" },
              { id: "Electrician", label: "Electrician" },
              { id: "Plumber", label: "Plumber" },
              { id: "Carpenter", label: "Carpenter" },
              { id: "Cleaning", label: "Cleaning" },
            ].map((chip) => {
              const isActive = subCategoryFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSubCategoryFilter(chip.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Sub-Services Grid */}
          {subServicesLoading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading sub-services...</div>
          ) : filteredSubServices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <Sparkles size={40} className="mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-800">No Services Found</h3>
              <p className="text-xs text-slate-500">Click "+ Add Sub-Service" or "Restore 57 Services" to populate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSubServices.map((svc) => (
                <div
                  key={svc._id || svc.serviceId}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img
                      src={svc.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80"}
                      alt={svc.serviceName}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100">
                          {svc.category}
                        </span>
                        {svc.subCategory && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {svc.subCategory}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 truncate">{svc.serviceName}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {svc.description || "Expert doorstep service"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-emerald-600">₹{svc.price}</span>
                      <span className="text-xs text-slate-400 ml-2 font-medium">⏱ {svc.duration}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleSubServiceActive(svc)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                          svc.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {svc.isActive !== false ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => handleOpenEditSubServiceModal(svc)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        title="Edit Service"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteSubService(svc._id || svc.serviceId || "", svc.serviceName)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                        title="Delete Service"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "SERVICES" ? (
        /* Services View */
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: All Services List */}
          <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                All Available Services ({filteredServices.length})
              </h3>
              <span className="text-[11px] text-slate-400">Select to manage rate or customize</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredServices.map((srv) => {
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
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isSelected
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        {renderIconComponent(srv.iconName, 18)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          {srv.name}
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            ({srv.fields.length} dynamic fields)
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{srv.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        ₹{srv.basePrice}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditServiceModal(srv);
                        }}
                        title="Edit Service Settings"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300 transition"
                      >
                        <Settings size={14} />
                      </button>
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
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center">
                      {renderIconComponent(selectedService.iconName, 22)}
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-slate-900">
                        {selectedService.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedService.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditServiceModal(selectedService)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Settings size={13} className="text-red-600" />
                      Settings & Form
                    </button>
                    <button
                      onClick={() => handleDeleteService(selectedService.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition"
                      title="Delete Service"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Instant Pricing Editor */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                    Starting Base Rate (₹)
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
                      onClick={handleSaveInlinePrice}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-600/20 transition"
                    >
                      <Check size={14} />
                      Save Rate
                    </button>
                  </div>
                </div>

                {/* Form Schema Parameters */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Customer Booking Form Schema ({selectedService.fields.length} Fields)
                    </h4>
                    <button
                      onClick={() => handleOpenEditServiceModal(selectedService)}
                      className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Edit3 size={12} />
                      Manage Fields
                    </button>
                  </div>
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
                        <span className="font-mono text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
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
              Quick Commerce Spare Parts & Products ({filteredProducts.length} Items)
            </h3>
            <span className="text-[11px] text-slate-400">Live products purchasable via app</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
              >
                <div className="h-32 bg-white rounded-xl overflow-hidden border border-slate-200 relative group">
                  <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm">
                    {prod.stock} IN STOCK
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                    {prod.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-2 mt-0.5">{prod.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-black text-slate-900 font-mono text-sm">₹{prod.price}</span>
                    <span className="text-[10px] text-slate-400 line-through font-mono">₹{prod.mrp}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <button
                    onClick={() => handleOpenEditProduct(prod)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                  >
                    <Edit3 size={12} className="text-red-600" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition"
                    title="Delete product"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Add Service Modal */}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    Category Icon
                  </label>
                  <select
                    value={newServiceIcon}
                    onChange={(e) => setNewServiceIcon(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  >
                    {AVAILABLE_ICONS.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>
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

              {/* Service Display Image Picker (Gallery / File / URL) */}
              <ImageUploadPicker
                value={newServiceImageUrl}
                onChange={setNewServiceImageUrl}
                label="Service Photo (Gallery / File / URL)"
              />

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

      {/* 2. Edit Service Configuration & Settings Modal */}
      {editServiceModalOpen && editServiceForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Edit Service: {editServiceForm.name}
                  </h3>
                  <p className="text-xs text-slate-500">Configure name, rate, theme & booking form fields</p>
                </div>
              </div>
              <button
                onClick={() => setEditServiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedService} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={editServiceForm.name}
                  onChange={(e) =>
                    setEditServiceForm({ ...editServiceForm, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Base Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editServiceForm.basePrice}
                    onChange={(e) =>
                      setEditServiceForm({
                        ...editServiceForm,
                        basePrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Category Icon
                  </label>
                  <select
                    value={editServiceForm.iconName}
                    onChange={(e) =>
                      setEditServiceForm({ ...editServiceForm, iconName: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500"
                  >
                    {AVAILABLE_ICONS.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Service Description
                </label>
                <textarea
                  rows={2}
                  value={editServiceForm.description}
                  onChange={(e) =>
                    setEditServiceForm({ ...editServiceForm, description: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Service Display Image Picker (Gallery / File / URL) */}
              <ImageUploadPicker
                value={editServiceForm.imageUrl || ""}
                onChange={(url) => setEditServiceForm({ ...editServiceForm, imageUrl: url })}
                label="Service Photo (Gallery / File / URL)"
              />

              {/* Dynamic Form Schema Field Editor */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                    Dynamic Form Fields ({editServiceForm.fields.length})
                  </h4>
                </div>

                {/* Existing Fields List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {editServiceForm.fields.map((fld) => (
                    <div
                      key={fld.id}
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{fld.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({fld.type} • {fld.required ? "REQ" : "OPT"})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFieldFromService(fld.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Field Row */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 block">
                    + Add Form Question / Field:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Model / Capacity / Scope"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-medium"
                    />
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700"
                    >
                      <option value="TEXT">Text</option>
                      <option value="SELECT">Select Dropdown</option>
                      <option value="TIME_SLOT">Time Slot</option>
                      <option value="ADDRESS_GPS">Address GPS</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddFieldToService}
                      className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteService(editServiceForm.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <div className="flex-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditServiceModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="text-red-600" size={18} />
                  Add Quick Store Product
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">List spare part in store catalog</p>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Product Photo Picker (Gallery / File / URL) */}
              <ImageUploadPicker
                value={newProd.imageUrl}
                onChange={(url) => setNewProd({ ...newProd, imageUrl: url })}
                label="Product Photo (Phone Gallery / File)"
              />

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

      {/* 4. Edit Product Modal */}
      {editProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Edit3 className="text-red-600" size={18} />
                  Edit Product Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Modify price, stock and image</p>
              </div>
              <button
                onClick={() => setEditProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-500"
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
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.mrp}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Product Photo Picker (Gallery / File / URL) */}
              <ImageUploadPicker
                value={editingProduct.imageUrl}
                onChange={(url) => setEditingProduct({ ...editingProduct, imageUrl: url })}
                label="Product Photo (Phone Gallery / File)"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProductModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Service Add / Edit Modal */}
      {subServiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900">
                {editingSubService ? "Edit Sub-Service" : "Add New Sub-Service"}
              </h3>
              <button
                onClick={() => setSubServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubService} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hair Cutting, Facial, Display Replacement"
                  value={subServiceForm.serviceName}
                  onChange={(e) => setSubServiceForm({ ...subServiceForm, serviceName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Category *
                  </label>
                  <select
                    value={subServiceForm.category}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="Beauty Parlour">Beauty Parlour</option>
                    <option value="Mobile Repair">Mobile Repair</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Sub-Category
                  </label>
                  <select
                    value={subServiceForm.subCategory}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, subCategory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="Men's Grooming">Men's Grooming</option>
                    <option value="Women's Beauty Services">Women's Beauty Services</option>
                    <option value="Doorstep Mobile Repair">Doorstep Mobile Repair</option>
                    <option value="Home Repair">Home Repair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={subServiceForm.price}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30 min, 60 min"
                    value={subServiceForm.duration}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, duration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <ImageUploadPicker
                value={subServiceForm.imageUrl}
                onChange={(url) => setSubServiceForm({ ...subServiceForm, imageUrl: url })}
                label="Service Photo (Phone Gallery / File / Unsplash)"
              />

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Service highlights, materials used, warranty..."
                  value={subServiceForm.description}
                  onChange={(e) => setSubServiceForm({ ...subServiceForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubServiceModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20"
                >
                  {editingSubService ? "Save Changes" : "Create Sub-Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
