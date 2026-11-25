/**
 * Standalone Database Catalog Seeder
 * Seeds all 57 services (15 Men's Grooming, 24 Women's Beauty, 18 Mobile Repair)
 * into MongoDB Atlas.
 *
 * Usage: node scripts/seedCatalog.js
 */

const path = require("path");
const fs = require("fs");
const dns = require("dns");

// Ensure apps/backend/node_modules is in module paths if run from root
const backendNodeModules = path.join(__dirname, "../apps/backend/node_modules");
if (fs.existsSync(backendNodeModules)) {
  module.paths.unshift(backendNodeModules);
}

const mongoose = require("mongoose");

// Configure DNS to prevent querySrv ECONNREFUSED on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Sandbox fallback
}

// Load .env
const envPaths = [
  path.join(__dirname, "../apps/backend/.env"),
  path.join(__dirname, "../.env"),
  path.join(process.cwd(), "apps/backend/.env"),
  path.join(process.cwd(), ".env"),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    require("dotenv").config({ path: p });
    break;
  }
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://khushbookumari23074_db_user:uy1QyBemAKoSzk70@cluster0.hu4jmnw.mongodb.net/multiserviceapp?retryWrites=true&w=majority";

// Schemas
const ServiceSchema = new mongoose.Schema(
  {
    serviceId: { type: String, index: true },
    serviceName: { type: String, required: true, index: true, trim: true },
    title: { type: String, index: true, trim: true },
    category: { type: String, required: true, index: true, trim: true },
    subCategory: { type: String, default: "", index: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, default: 0 },
    duration: { type: String, default: "30 min" },
    imageUrl: { type: String, default: "" },
    mediaUrls: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 12 },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    subcategories: { type: Array, default: [] },
    isActive: { type: Boolean, default: true },
    orderIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

// 1. Men's Grooming (15 Services)
const MEN_GROOMING_SERVICES = [
  {
    serviceName: "Hair Cutting",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 100,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
    description: "Professional men's haircut tailored to your style with neck cleanup and hot towel finish.",
  },
  {
    serviceName: "Hair Styling",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 150,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80",
    description: "Trendsetting hair setting using premium matte clay, wax, and blow-dry styling.",
  },
  {
    serviceName: "Beard Trimming",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 80,
    duration: "20 min",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80",
    description: "Even clipper trimming, neckline balancing, and beard oil nourishment.",
  },
  {
    serviceName: "Beard Styling",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 120,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&q=80",
    description: "Sharp straight-razor edging, cheek contouring, and hot foam line styling.",
  },
  {
    serviceName: "Hair Coloring",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 500,
    duration: "60 min",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
    description: "100% ammonia-free natural black/brown grey coverage with herbal scalp shield.",
  },
  {
    serviceName: "Hair Spa",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 500,
    duration: "60 min",
    imageUrl: "https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&q=80",
    description: "Intense hair spa treatment with steaming, keratin cream massage, and anti-dandruff care.",
  },
  {
    serviceName: "Head Massage",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 150,
    duration: "20 min",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
    description: "Traditional Ayurvedic champi with warm almond/navratna oil to relieve stress.",
  },
  {
    serviceName: "Facial",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 400,
    duration: "45 min",
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    description: "Deep cleansing fruit/gold facial to restore lost skin glow, remove dust and sun damage.",
  },
  {
    serviceName: "Cleanup",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 250,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1512290900672-1f02377319e7?w=600&q=80",
    description: "Exfoliating face cleanup removing blackheads, whiteheads, and excessive oil buildup.",
  },
  {
    serviceName: "Detan",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 300,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80",
    description: "Kojic acid & milk protein detan pack for fast removal of stubborn sun tanning.",
  },
  {
    serviceName: "Bleach",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 250,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    description: "Oxy/Gold glow face bleach that blends facial hair perfectly with skin tone.",
  },
  {
    serviceName: "Hair Smoothening",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 1500,
    duration: "120 min",
    imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80",
    description: "Semi-permanent protein treatment that tames rough, frizzy, and unruly hair texture.",
  },
  {
    serviceName: "Hair Straightening",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 1500,
    duration: "120 min",
    imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80",
    description: "Permanent thermal straightening using L'Oreal Professional formula for pin-straight hair.",
  },
  {
    serviceName: "Manicure",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 250,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    description: "Warm soak, cuticle grooming, dead skin scrub, and relaxing hand massage.",
  },
  {
    serviceName: "Pedicure",
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
    price: 350,
    duration: "45 min",
    imageUrl: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80",
    description: "Foot soak, cracked heel scrubbing, nail clipping, and deep moisturizing massage.",
  },
];

// 2. Women's Beauty (24 Services)
const WOMEN_BEAUTY_SERVICES = [
  {
    serviceName: "Hair Cutting",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 200,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80",
    description: "Layered, feather, U-cut, V-cut or straight haircut customized by expert stylists.",
  },
  {
    serviceName: "Hair Styling",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "45 min",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    description: "Blow-dry curls, out-turns, beach waves, or sleek straight setting for special occasions.",
  },
  {
    serviceName: "Hair Coloring",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 800,
    duration: "90 min",
    imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80",
    description: "Root touch-up or global color using L'Oreal / Matrix professional damage-free creams.",
  },
  {
    serviceName: "Hair Spa",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 600,
    duration: "60 min",
    imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80",
    description: "Deep nourishing hair spa with Moroccan argan oil, ozone steam, and head massage.",
  },
  {
    serviceName: "Hair Straightening",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 2000,
    duration: "180 min",
    imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80",
    description: "Salon-grade thermal straightening for permanently glossy, frizz-free, silky straight tresses.",
  },
  {
    serviceName: "Hair Smoothening",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 2500,
    duration: "180 min",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    description: "Keratin-infused smoothening that softens curls, eliminates humidity frizz, and adds mirror shine.",
  },
  {
    serviceName: "Hair Rebonding",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 3000,
    duration: "240 min",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
    description: "Heavy-duty structural chemical rebonding for extreme poker-straight hair that stays flawless.",
  },
  {
    serviceName: "Facial",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 500,
    duration: "60 min",
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    description: "Multi-step herbal/diamond facial: cleansing, scrub, steam, blackhead extraction & glowing mask.",
  },
  {
    serviceName: "Cleanup",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "40 min",
    imageUrl: "https://images.unsplash.com/photo-1512290900672-1f02377319e7?w=600&q=80",
    description: "Gentle yet deep pore clarifying cleanup, toner balancing, and aloe-vera hydration.",
  },
  {
    serviceName: "Detan",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 350,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80",
    description: "Sara / Raaga tan-removal therapy targeting hyperpigmentation, sunspots, and pollution dullness.",
  },
  {
    serviceName: "Bleach",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    description: "VLCC Gold/Diamond bleach giving instant golden radiance and brightening skin complexion.",
  },
  {
    serviceName: "Threading",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 50,
    duration: "10 min",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
    description: "Organic cotton thread hair removal for forehead, chin, or full face touch-up.",
  },
  {
    serviceName: "Eyebrow Shaping",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 40,
    duration: "10 min",
    imageUrl: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600&q=80",
    description: "Precision eyebrow shaping matching your natural facial arch with soothing astringent gel.",
  },
  {
    serviceName: "Upper Lip Threading",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 30,
    duration: "10 min",
    imageUrl: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80",
    description: "Quick, painless upper lip peach-fuzz removal leaving smooth skin for lipstick application.",
  },
  {
    serviceName: "Full Body Waxing",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 1200,
    duration: "120 min",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
    description: "Hygienic chocolate or honey wax for full arms, underarms, full legs, and back.",
  },
  {
    serviceName: "Manicure",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "40 min",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    description: "Cuticle care, nail filing, scrub, hand mask, and relaxing aromatherapeutic massage.",
  },
  {
    serviceName: "Pedicure",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 400,
    duration: "45 min",
    imageUrl: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80",
    description: "Foot bath with Epsom salt, pumice scrubbing, calloused skin softening, and foot massage.",
  },
  {
    serviceName: "Nail Art",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "45 min",
    imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80",
    description: "Creative gel polish accents, glitters, stickers, or French tips on hands.",
  },
  {
    serviceName: "Party Makeup",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 1500,
    duration: "90 min",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
    description: "Flawless HD base, smokey/glitter eye look, eyelashes, contouring, and transfer-proof lips.",
  },
  {
    serviceName: "Bridal Makeup",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 5000,
    duration: "180 min",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    description: "Luxury bridal transformation: HD/Airbrush makeup, hair bun, dupatta styling & jewelry fixing.",
  },
  {
    serviceName: "Saree Draping",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "20 min",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    description: "Pin-drop crisp saree pleating and pallu pinning in traditional, Bengali, or modern styles.",
  },
  {
    serviceName: "Mehndi Design",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
    description: "Pure organic henna Arabic or floral design for front and back hands.",
  },
  {
    serviceName: "Head Massage",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 200,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
    description: "Warm coconut/olive oil deep head massage that stimulates follicles and calms tension.",
  },
  {
    serviceName: "Skin Care",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 500,
    duration: "45 min",
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    description: "Customized dermatological skin ritual balancing skin hydration, pore health, and elasticity.",
  },
];

// 3. Mobile Repair (18 Services)
const MOBILE_REPAIR_SERVICES = [
  {
    serviceName: "Display Replacement",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 800,
    duration: "60 Min",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
    description: "Original OEM AMOLED/IPS LCD screen replacement with responsive touch & vibrant colors.",
  },
  {
    serviceName: "Touch Screen Replacement",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 700,
    duration: "60 Min",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
    description: "Precision outer touch glass digitizer replacement when internal LCD is fully intact.",
  },
  {
    serviceName: "Battery Replacement",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 500,
    duration: "45 Min",
    imageUrl: "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=600&q=80",
    description: "High-capacity certified battery replacement solving fast-draining, swollen, or heating issues.",
  },
  {
    serviceName: "Charging Jack Replacement",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 300,
    duration: "45 Min",
    imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80",
    description: "Type-C or Lightning charging port connector board replacement for loose or non-charging phones.",
  },
  {
    serviceName: "Speaker Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 250,
    duration: "30 Min",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
    description: "Ringer and bottom speaker replacement fixing distorted, crackling, or silent ringtones.",
  },
  {
    serviceName: "Mic Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 250,
    duration: "30 Min",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
    description: "Clear HD voice microphone replacement so callers can hear your voice loudly and clearly.",
  },
  {
    serviceName: "Earpiece Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 250,
    duration: "30 Min",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    description: "Ear speaker mesh cleaning or component replacement fixing very low volume during phone calls.",
  },
  {
    serviceName: "Back Panel Replacement",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 500,
    duration: "60 Min",
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80",
    description: "OEM glass/polycarbonate back body panel with color-matched camera bezel and adhesive seal.",
  },
  {
    serviceName: "Camera Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 400,
    duration: "60 Min",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
    description: "Rear/Front camera module replacement fixing blurry photos, black screen, or broken lens glass.",
  },
  {
    serviceName: "Power Button Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 250,
    duration: "45 Min",
    imageUrl: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&q=80",
    description: "Power key flex cable repair restoring responsive 1-click screen lock and power on/off.",
  },
  {
    serviceName: "Volume Button Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 250,
    duration: "45 Min",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&q=80",
    description: "Volume up/down internal tactile switch replacement for sticky or unresponsive buttons.",
  },
  {
    serviceName: "Software Update",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 150,
    duration: "30 Min",
    imageUrl: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=600&q=80",
    description: "Official Android/iOS system firmware update, security patch, and bug optimization.",
  },
  {
    serviceName: "Software Installation",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 200,
    duration: "45 Min",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
    description: "Fresh OS flashing, bootloop recovery, phone unbricking, and essential utility setup.",
  },
  {
    serviceName: "Network Problem Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 300,
    duration: "90 Min",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
    description: "SIM card tray, antenna flex cable, and baseband network IC diagnosis for 'No Service' faults.",
  },
  {
    serviceName: "Water Damage Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 500,
    duration: "120 Min",
    imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80",
    description: "Ultrasonic chemical motherboard descaling, component drying, and corrosion cleanup.",
  },
  {
    serviceName: "Motherboard Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 800,
    duration: "180 Min",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    description: "Micro-soldering repair for dead phones, short-circuits, power IC and charging IC faults.",
  },
  {
    serviceName: "Fingerprint Sensor Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 400,
    duration: "60 Min",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80",
    description: "In-display or side-mounted fingerprint biometric scanner replacement and calibration.",
  },
  {
    serviceName: "Face Unlock Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 500,
    duration: "90 Min",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    description: "Dot projector, infrared camera sensor, and Face ID flex repair restoring secure unlocking.",
  },
];

const ALL_SEED_SERVICES = [
  ...MEN_GROOMING_SERVICES,
  ...WOMEN_BEAUTY_SERVICES,
  ...MOBILE_REPAIR_SERVICES,
];

async function seed() {
  console.log("==================================================");
  console.log("🌱 [SeedCatalog] Starting catalog seeding...");
  console.log(`📡 Connecting to MongoDB Atlas: ${MONGODB_URI.replace(/:[^:]*@/, ":****@")}`);

  await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
  });

  console.log("✅ [SeedCatalog] Connected to MongoDB.");

  let upsertedCount = 0;
  for (const item of ALL_SEED_SERVICES) {
    const slug = (item.serviceName + "-" + item.subCategory)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await Service.findOne({
      serviceName: item.serviceName,
      category: item.category,
      subCategory: item.subCategory,
    });

    if (existing) {
      existing.price = item.price;
      existing.duration = item.duration;
      existing.imageUrl = item.imageUrl;
      existing.description = item.description;
      existing.isActive = true;
      if (!existing.mediaUrls || existing.mediaUrls.length === 0) {
        existing.mediaUrls = [item.imageUrl];
      }
      await existing.save();
    } else {
      await Service.create({
        serviceId: "srv_" + slug + "_" + Math.floor(1000 + Math.random() * 9000),
        serviceName: item.serviceName,
        title: item.serviceName,
        category: item.category,
        subCategory: item.subCategory,
        price: item.price,
        discountedPrice: Math.round(item.price * 0.9),
        duration: item.duration,
        imageUrl: item.imageUrl,
        mediaUrls: [item.imageUrl],
        description: item.description,
        isActive: true,
        rating: 4.8 + Math.round(Math.random() * 2) / 10,
        reviewCount: Math.floor(15 + Math.random() * 45),
      });
      upsertedCount++;
    }
  }

  // Category syncing
  try {
    let beautyCat = await Category.findOne({ categoryId: "cat_beauty_parlour" });
    const beautySubcats = [
      {
        id: "sub_beauty_men",
        name: "Men's Grooming (15 Services)",
        slug: "mens-grooming",
        description: "Doorstep haircuts, beard grooming, head massage, facials & detan for men.",
        basePrice: 80,
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
      },
      {
        id: "sub_beauty_women",
        name: "Women's Beauty Services (24 Services)",
        slug: "womens-beauty-services",
        description: "Doorstep salon, hair styling, facials, waxing, bridal makeup & saree draping for women.",
        basePrice: 30,
        imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
      },
    ];

    if (!beautyCat) {
      await Category.create({
        categoryId: "cat_beauty_parlour",
        name: "Beauty Parlour",
        slug: "beauty-parlour",
        description: "Doorstep grooming for men and salon beauty services for women by verified professionals.",
        imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
        isActive: true,
        orderIndex: 0,
        subcategories: beautySubcats,
      });
    } else {
      beautyCat.subcategories = beautySubcats;
      beautyCat.isActive = true;
      await beautyCat.save();
    }

    let mobileCat = await Category.findOne({ categoryId: "cat_mobile" });
    const mobileSubcats = [
      {
        id: "sub_mob_doorstep",
        name: "Doorstep Mobile Repair (18 Services)",
        slug: "doorstep-mobile-repair",
        description: "Original screens, battery, charging port, speaker, and motherboard repair within 60 mins.",
        basePrice: 150,
        imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
      },
    ];

    if (!mobileCat) {
      await Category.create({
        categoryId: "cat_mobile",
        name: "Mobile Repair",
        slug: "mobile-repair",
        description: "Doorstep screen, battery, charging, and complete hardware repairs with genuine parts.",
        imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
        isActive: true,
        orderIndex: 1,
        subcategories: mobileSubcats,
      });
    } else {
      mobileCat.subcategories = mobileSubcats;
      mobileCat.isActive = true;
      await mobileCat.save();
    }
  } catch (err) {
    console.warn("⚠️ [SeedCatalog] Category sync note:", err.message);
  }

  const totalMen = await Service.countDocuments({
    category: "Beauty Parlour",
    subCategory: "Men's Grooming",
  });
  const totalWomen = await Service.countDocuments({
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
  });
  const totalMobile = await Service.countDocuments({
    category: "Mobile Repair",
  });
  const total = await Service.countDocuments({
    category: { $in: ["Beauty Parlour", "Mobile Repair"] },
  });

  console.log("==================================================");
  console.log(`✅ [SeedCatalog] Seed completed successfully!`);
  console.log(`   - Men's Grooming Services: ${totalMen} (Expected: 15)`);
  console.log(`   - Women's Beauty Services: ${totalWomen} (Expected: 24)`);
  console.log(`   - Mobile Repair Services:  ${totalMobile} (Expected: 18)`);
  console.log(`   - Total Seeded Services:   ${total} (Expected: 57)`);
  console.log(`   - Newly Upserted:          ${upsertedCount}`);
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ [SeedCatalog] Error during seeding:", err);
  process.exit(1);
});
