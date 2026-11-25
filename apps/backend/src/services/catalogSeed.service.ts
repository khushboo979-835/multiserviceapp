import { Service } from "../models/Service";
import { CategoryModel } from "../models/Category";
import { MobileRepair } from "../models/MobileRepair";

export interface CatalogItemDefinition {
  serviceName: string;
  category: "Beauty Parlour" | "Mobile Repair";
  subCategory: "Men's Grooming" | "Women's Beauty Services" | "Doorstep Mobile Repair";
  price: number;
  duration: string;
  imageUrl: string;
  description: string;
}

export const MEN_GROOMING_SERVICES: CatalogItemDefinition[] = [
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

export const WOMEN_BEAUTY_SERVICES: CatalogItemDefinition[] = [
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
    imageUrl: "https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&q=80",
    description: "Cysteine / Keratin smooth therapy that softens rough curls into naturally soft manageable hair.",
  },
  {
    serviceName: "Hair Rebonding",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 3000,
    duration: "240 min",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
    description: "Deep structural rebonding for thick or stubborn curly hair with glass-like shine.",
  },
  {
    serviceName: "Facial",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 500,
    duration: "60 min",
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    description: "VLCC / Lotus premium radiance facial with lymphatic drainage massage and peel-off mask.",
  },
  {
    serviceName: "Cleanup",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "40 min",
    imageUrl: "https://images.unsplash.com/photo-1512290900672-1f02377319e7?w=600&q=80",
    description: "Deep pore cleanup with gentle steam, ultrasonic blackhead extraction, and soothing pack.",
  },
  {
    serviceName: "Detan",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 350,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80",
    description: "Raaga professional anti-tan therapy that instantly removes UV damage and brightens complexion.",
  },
  {
    serviceName: "Bleach",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    description: "Diamond or Oxyglow herbal bleach giving an instant golden radiant glow.",
  },
  {
    serviceName: "Threading",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 50,
    duration: "10 min",
    imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
    description: "Painless organic cotton thread facial hair removal with aloe vera cooling gel.",
  },
  {
    serviceName: "Eyebrow Shaping",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 40,
    duration: "10 min",
    imageUrl: "https://images.unsplash.com/photo-1522337094345-a044afc64716?w=600&q=80",
    description: "Precision eyebrow arch sculpting perfectly matching your eye and facial structure.",
  },
  {
    serviceName: "Upper Lip Threading",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 30,
    duration: "10 min",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
    description: "Quick and hygienic upper lip fine hair removal followed by astringent touch.",
  },
  {
    serviceName: "Full Body Waxing",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 1200,
    duration: "120 min",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    description: "Full arms, full legs, underarms, back and stomach with premium Rica / Honey wax.",
  },
  {
    serviceName: "Manicure",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "40 min",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    description: "Aromatherapy hand soak, skin brightening scrub, cuticle care, and nail polish coat.",
  },
  {
    serviceName: "Pedicure",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 400,
    duration: "45 min",
    imageUrl: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80",
    description: "Relaxing effervescent foot bath, pumice callus removal, foot scrub, and nail shine.",
  },
  {
    serviceName: "Nail Art",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "45 min",
    imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80",
    description: "Creative freehand art, glitter ombre, chrome powder, or floral French tips.",
  },
  {
    serviceName: "Party Makeup",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 1500,
    duration: "90 min",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
    description: "Glamorous party-ready makeup with HD base, eye contours, lashes, and hair setting.",
  },
  {
    serviceName: "Bridal Makeup",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 5000,
    duration: "180 min",
    imageUrl: "https://images.unsplash.com/photo-1522337094345-a044afc64716?w=600&q=80",
    description: "Complete royal bridal package: Airbrush/HD waterproof makeup, false lashes, hairdo & draping.",
  },
  {
    serviceName: "Saree Draping",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "20 min",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    description: "Flawless pleating for Banarasi, silk, chiffon, lehenga style or modern pre-pleated drape.",
  },
  {
    serviceName: "Mehndi Design",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 300,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80",
    description: "Intricate Arabic, Indo-Western, or traditional floral organic henna on both hands.",
  },
  {
    serviceName: "Head Massage",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 200,
    duration: "30 min",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
    description: "Deep pressure point acupressure head and shoulder massage with herbal cooling oil.",
  },
  {
    serviceName: "Skin Care",
    category: "Beauty Parlour",
    subCategory: "Women's Beauty Services",
    price: 500,
    duration: "45 min",
    imageUrl: "https://images.unsplash.com/photo-1512290900672-1f02377319e7?w=600&q=80",
    description: "Hydrating hyaluronic acid and vitamin C brightening therapy for tired or pigmented skin.",
  },
];

export const MOBILE_REPAIR_SERVICES: CatalogItemDefinition[] = [
  {
    serviceName: "Display Replacement",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 800,
    duration: "60 Min",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
    description: "Doorstep screen & combo replacement with 100% genuine glass, high touch response, and warranty.",
  },
  {
    serviceName: "Touch Screen Replacement",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 700,
    duration: "60 Min",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
    description: "High-grade touch digitizer panel replacement when glass is intact but touch is unresponsive.",
  },
  {
    serviceName: "Battery Replacement",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 500,
    duration: "45 Min",
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80",
    description: "Certified high-cycle original battery replacement restoring full-day backup with 6-month warranty.",
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
    imageUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80",
    description: "Ultrasonic PCB cleaning, anti-corrosion chemical wash, and short-circuit board recovery.",
  },
  {
    serviceName: "Motherboard Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 800,
    duration: "180 Min",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    description: "Expert micro-soldering, power IC reballing, and charging chip repair for dead smartphones.",
  },
  {
    serviceName: "Fingerprint Sensor Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 400,
    duration: "60 Min",
    imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80",
    description: "In-display or physical fingerprint scanner replacement with calibration for instant biometric unlock.",
  },
  {
    serviceName: "Face Unlock Repair",
    category: "Mobile Repair",
    subCategory: "Doorstep Mobile Repair",
    price: 500,
    duration: "90 Min",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    description: "Infrared flood illuminator and dot projector sensor alignment for FaceID and 3D face unlock.",
  },
];

export const ALL_SEED_SERVICES = [
  ...MEN_GROOMING_SERVICES,
  ...WOMEN_BEAUTY_SERVICES,
  ...MOBILE_REPAIR_SERVICES,
];

/**
 * Idempotently seeds the complete catalog into MongoDB
 */
export async function ensureCatalogSeeded(): Promise<{
  success: boolean;
  upsertedServices: number;
  totalServices: number;
}> {
  console.log("🌱 [SeedCatalog] Checking and syncing 57 master services into MongoDB...");

  let upsertedCount = 0;

  for (const item of ALL_SEED_SERVICES) {
    const existing = await Service.findOne({
      serviceName: item.serviceName,
      subCategory: item.subCategory,
    });

    if (!existing) {
      const serviceId = `srv_${item.category.slice(0, 3).toLowerCase()}_${item.serviceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")}`;

      await Service.create({
        serviceId,
        serviceName: item.serviceName,
        title: item.serviceName,
        category: item.category,
        subCategory: item.subCategory,
        price: item.price,
        discountedPrice: Math.round(item.price * 0.85),
        duration: item.duration,
        imageUrl: item.imageUrl,
        mediaUrls: [item.imageUrl],
        description: item.description,
        isActive: true,
        rating: 4.9,
        reviewCount: 38,
      });
      upsertedCount++;
    } else {
      // Ensure prices and images stay in exact sync with prompt specifications
      existing.price = item.price;
      existing.duration = item.duration;
      existing.imageUrl = item.imageUrl;
      existing.mediaUrls = [item.imageUrl];
      existing.description = item.description;
      existing.isActive = true;
      await existing.save();
    }
  }

  // Also ensure CategoryModel has the Beauty Parlour and Mobile Repair hierarchies
  try {
    // 1. Beauty Parlour Category
    let beautyCat = await CategoryModel.findOne({ categoryId: "cat_beauty_parlour" });
    const beautySubcats = [
      {
        id: "sub_beauty_men",
        name: "Men's Grooming",
        slug: "mens-grooming",
        description: "15 doorstep grooming services for men including haircuts, beard styling, detan & facials.",
        basePrice: 80,
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
        formConfig: {
          fields: [
            { id: "selected_services", label: "Select Grooming Services", type: "MULTI_SELECT", validation: { required: true } },
            { id: "preferred_date", label: "Service Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Doorstep Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
      {
        id: "sub_beauty_women",
        name: "Women's Beauty Services",
        slug: "womens-beauty-services",
        description: "24 salon-at-home services for women including waxing, facials, bridal makeup, hair spa & manicure.",
        basePrice: 30,
        imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80",
        formConfig: {
          fields: [
            { id: "selected_services", label: "Select Beauty Services", type: "MULTI_SELECT", validation: { required: true } },
            { id: "preferred_date", label: "Service Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Home Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ];

    if (!beautyCat) {
      await CategoryModel.create({
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

    // 2. Mobile Repair Category
    let mobileCat = await CategoryModel.findOne({ categoryId: "cat_mobile" });
    const mobileSubcats = [
      {
        id: "sub_mob_doorstep",
        name: "Doorstep Mobile Repair (18 Services)",
        slug: "doorstep-mobile-repair",
        description: "Original screens, battery, charging port, speaker, and motherboard repair within 60 mins.",
        basePrice: 150,
        imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
        formConfig: {
          fields: [
            { id: "brand", label: "Mobile Brand", type: "SELECT", validation: { required: true } },
            { id: "model", label: "Phone Model", type: "TEXT", validation: { required: true } },
            { id: "issues", label: "Select Problem(s)", type: "MULTI_SELECT", validation: { required: true } },
            { id: "preferred_date", label: "Visit Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Doorstep Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ];

    if (!mobileCat) {
      await CategoryModel.create({
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
  } catch (cErr) {
    console.warn("Category model sync warning in seed:", cErr);
  }

  const total = await Service.countDocuments({
    category: { $in: ["Beauty Parlour", "Mobile Repair"] },
  });

  console.log(`✅ [SeedCatalog] Successfully synced ${total} services (${upsertedCount} new added).`);

  return {
    success: true,
    upsertedServices: upsertedCount,
    totalServices: total,
  };
}
