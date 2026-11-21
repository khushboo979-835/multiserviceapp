import { Schema, model, Document } from "mongoose";

export interface IRepairIssue {
  name: string;
  price: number;
  estimatedMins?: number;
  description?: string;
}

export interface IMobileRepair extends Document {
  brandId: string;
  brandName: string;
  logoUrl: string;
  models: string[];
  repairs: IRepairIssue[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const RepairIssueSchema = new Schema<IRepairIssue>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    estimatedMins: { type: Number, default: 45 },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const MobileRepairSchema = new Schema<IMobileRepair>(
  {
    brandId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    models: {
      type: [String],
      default: [],
    },
    repairs: {
      type: [RepairIssueSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const MobileRepair = model<IMobileRepair>("MobileRepair", MobileRepairSchema);

export const DEFAULT_MOBILE_REPAIRS = [
  {
    brandId: "brand_apple",
    brandName: "Apple",
    logoUrl: "https://res.cloudinary.com/gln413tb/image/upload/f_png,w_300/v1795239017/inisha/brands/apple_logo.png",
    sortOrder: 1,
    models: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11"],
    repairs: [
      { name: "Original Retina OLED Screen", price: 3499, estimatedMins: 45, description: "100% genuine OLED panel with TrueTone" },
      { name: "Original Battery (100% Health)", price: 1899, estimatedMins: 30, description: "Grade-A original battery replacement" },
      { name: "Back Glass & Housing Replacement", price: 1299, estimatedMins: 40, description: "Laser separation and original glass finish" },
      { name: "Camera Lens & FaceID Repair", price: 1499, estimatedMins: 35, description: "Sapphire lens and true sensor calibration" },
      { name: "Charging Port & Mic Repair", price: 699, estimatedMins: 30, description: "Lightning / USB-C flex replacement" },
    ],
  },
  {
    brandId: "brand_samsung",
    brandName: "Samsung",
    logoUrl: "https://res.cloudinary.com/gln413tb/image/upload/f_png,w_400/v1795239019/inisha/brands/samsung_logo.png",
    sortOrder: 2,
    models: ["Galaxy S24 Ultra", "Galaxy S24", "Galaxy S23 Ultra", "Galaxy S23", "Galaxy Z Fold 5", "Galaxy A55 5G", "Galaxy M34 5G", "Galaxy F54"],
    repairs: [
      { name: "Dynamic AMOLED 2X Display", price: 2999, estimatedMins: 45, description: "Vivid 120Hz original Samsung panel" },
      { name: "Super Fast Charging Port Fix", price: 499, estimatedMins: 25, description: "Type-C 45W fast charge restoration" },
      { name: "6000mAh Battery Replacement", price: 999, estimatedMins: 30, description: "Certified high-density original cell" },
      { name: "Motherboard & IC Repair", price: 1199, estimatedMins: 60, description: "Precision micro-soldering & power IC" },
      { name: "Back Glass & Frame Restoration", price: 799, estimatedMins: 35, description: "Clean OEM back panel fitting" },
    ],
  },
  {
    brandId: "brand_xiaomi",
    brandName: "Xiaomi / Redmi",
    logoUrl: "https://res.cloudinary.com/gln413tb/image/upload/f_png,w_300/v1795239021/inisha/brands/xiaomi_logo.png",
    sortOrder: 3,
    models: ["Redmi Note 13 Pro+", "Redmi Note 13 5G", "Redmi Note 12 Pro", "Redmi 13C", "Xiaomi 14", "Xiaomi 13 Pro", "Poco X6 Pro"],
    repairs: [
      { name: "120Hz AMOLED Screen Glass", price: 1499, estimatedMins: 40, description: "Gorilla Glass protected smooth display" },
      { name: "Battery & 67W Turbo Charge Board", price: 799, estimatedMins: 30, description: "Genuine high-cycle battery & flex" },
      { name: "Earpiece Speaker & Mic", price: 349, estimatedMins: 20, description: "Clear loud sound and dual-mic replacement" },
      { name: "Back Cover / Frame Replacement", price: 499, estimatedMins: 25, description: "Original color matched back panel" },
    ],
  },
  {
    brandId: "brand_oneplus",
    brandName: "OnePlus",
    logoUrl: "https://res.cloudinary.com/gln413tb/image/upload/f_png,w_300/v1795239023/inisha/brands/oneplus_logo.png",
    sortOrder: 4,
    models: ["OnePlus 12", "OnePlus 12R", "OnePlus 11 5G", "OnePlus Nord CE 4", "OnePlus Nord 3", "OnePlus 10T", "OnePlus 9 Pro"],
    repairs: [
      { name: "Fluid AMOLED Display (No Green Line)", price: 2799, estimatedMins: 45, description: "Original refresh rate display without line issues" },
      { name: "Warp / SUPERVOOC Battery", price: 1099, estimatedMins: 30, description: "Dual-cell 100W/80W fast charging battery" },
      { name: "Alert Slider & Volume Button Fix", price: 399, estimatedMins: 25, description: "Hardware 3-position slider restoration" },
      { name: "Motherboard Thermal Pasting & IC", price: 899, estimatedMins: 50, description: "Cooling chamber re-paste and power fix" },
    ],
  },
  {
    brandId: "brand_realme",
    brandName: "Realme",
    logoUrl: "https://res.cloudinary.com/gln413tb/image/upload/f_png,w_400/v1795239025/inisha/brands/realme_logo.png",
    sortOrder: 5,
    models: ["Realme 12 Pro+ 5G", "Realme 12+ 5G", "Realme GT 6", "Realme Narzo 70 Pro", "Realme 11 Pro", "Realme C67"],
    repairs: [
      { name: "Curved Vision Display Replacement", price: 1699, estimatedMins: 40, description: "Vibrant curved OLED screen replacement" },
      { name: "DART / SuperVOOC Port Replacement", price: 449, estimatedMins: 25, description: "Fast charge sub-board replacement" },
      { name: "Massive 5000mAh Battery Fix", price: 799, estimatedMins: 30, description: "OEM standard high capacity battery" },
      { name: "Periscope Camera Lens Glass", price: 499, estimatedMins: 25, description: "Crystal clear optical zoom glass" },
    ],
  },
  {
    brandId: "brand_vivo",
    brandName: "Vivo",
    logoUrl: "https://res.cloudinary.com/gln413tb/image/upload/f_png,w_400/v1795239026/inisha/brands/vivo_logo.png",
    sortOrder: 6,
    models: ["Vivo V30 Pro", "Vivo V30", "Vivo X100 Pro", "Vivo T3 5G", "Vivo Y200 5G", "Vivo V29 5G", "iQOO Neo 9 Pro"],
    repairs: [
      { name: "3D Curved AMOLED Screen", price: 1999, estimatedMins: 45, description: "Ultra-slim bezel OLED original assembly" },
      { name: "ZEISS Camera Sensor Module", price: 1299, estimatedMins: 35, description: "Sensor lens alignment and glass fix" },
      { name: "Battery & FlashCharge Motherboard", price: 849, estimatedMins: 30, description: "Original FlashCharge verified battery" },
      { name: "Aura Ring Light & Flash Repair", price: 399, estimatedMins: 25, description: "Color-temperature LED repair" },
    ],
  },
  {
    brandId: "brand_oppo",
    brandName: "OPPO",
    logoUrl: "https://res.cloudinary.com/gln413tb/image/upload/f_png,w_400/v1795239027/inisha/brands/oppo_logo.png",
    sortOrder: 7,
    models: ["OPPO Reno 11 Pro", "OPPO Find X7", "OPPO F25 Pro", "OPPO A79 5G", "OPPO K12x", "OPPO Reno 10"],
    repairs: [
      { name: "AMOLED Natural Color Display", price: 1799, estimatedMins: 40, description: "High brightness original replacement" },
      { name: "SuperVOOC 67W Port & Battery", price: 899, estimatedMins: 30, description: "Dual-charge high safety power unit" },
      { name: "Selfie Portrait Camera Sensor", price: 699, estimatedMins: 25, description: "Front camera module replacement" },
      { name: "Back Glass Cover & Frame", price: 549, estimatedMins: 25, description: "Glow texture scratch-free rear panel" },
    ],
  },
];

export async function ensureDefaultMobileRepairs() {
  try {
    const count = await MobileRepair.countDocuments();
    if (count === 0) {
      await MobileRepair.insertMany(DEFAULT_MOBILE_REPAIRS);
      console.log("Seeded default MobileRepair catalog successfully with Cloudinary logos");
    }
  } catch (err) {
    console.warn("ensureDefaultMobileRepairs skipped/failed:", err);
  }
}
