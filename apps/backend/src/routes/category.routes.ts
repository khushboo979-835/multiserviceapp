import { Router, Request, Response } from "express";
import { CategoryModel } from "../models/Category";

const router = Router();

// Default 15 service categories seed template
const SEED_CATEGORIES = [
  {
    categoryId: "cat_mobile",
    name: "Mobile Repair",
    slug: "mobile-repair",
    description: "Doorstep screen replacement, battery, charging port, and hardware repair within 60 mins.",
    imageUrl: "phone",
    isActive: true,
    orderIndex: 1,
    subcategories: [
      {
        id: "sub_mob_doorstep",
        name: "Doorstep Mobile Screen & Hardware Repair",
        slug: "doorstep-mobile-repair",
        description: "Certified technicians fix your phone right in front of you at your home or office.",
        basePrice: 499,
        imageUrl: "smartphone",
        formConfig: {
          fields: [
            { id: "device_model", label: "Mobile Brand & Model", type: "TEXT", placeholder: "e.g., iPhone 13, Samsung S23", validation: { required: true, min: 2 } },
            { id: "repair_type", label: "Required Repair Service", type: "SELECT", options: [
              { label: "Original Screen Replacement", value: "screen", priceModifier: 1499 },
              { label: "Battery Replacement", value: "battery", priceModifier: 799 },
              { label: "Charging Port Fix", value: "charging", priceModifier: 399 },
              { label: "Motherboard Diagnosis", value: "motherboard", priceModifier: 599 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Preferred Visit Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Preferred Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Doorstep Service Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_ac_repair",
    name: "AC Repair & Service",
    slug: "ac-repair",
    description: "Deep jet foam cleaning, gas refill, installation, cooling issues & PCB breakdown repairs.",
    imageUrl: "wind",
    isActive: true,
    orderIndex: 2,
    subcategories: [
      {
        id: "sub_ac_service",
        name: "Split & Window AC Complete Service",
        slug: "split-window-ac-service",
        description: "Power jet deep cleaning with foam spray, coil check & cooling optimization.",
        basePrice: 399,
        imageUrl: "wind",
        formConfig: {
          fields: [
            { id: "ac_type", label: "AC Type", type: "SELECT", options: [{ label: "Split AC", value: "split", priceModifier: 100 }, { label: "Window AC", value: "window", priceModifier: 0 }], validation: { required: true }, priceModifierField: true },
            { id: "service_required", label: "Service Needed", type: "SELECT", options: [
              { label: "Power Jet Deep Cleaning", value: "jet_service", priceModifier: 250 },
              { label: "Gas Leakage & Full Gas Refill", value: "gas_refill", priceModifier: 1400 },
              { label: "AC Not Cooling Check", value: "not_cooling", priceModifier: 199 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Service Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Service Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_electrician",
    name: "Electrician",
    slug: "electrician",
    description: "Certified electricians for fan, switchboard, MCB wiring, lights & short-circuit breakdown.",
    imageUrl: "zap",
    isActive: true,
    orderIndex: 3,
    subcategories: [
      {
        id: "sub_electrician_general",
        name: "Electrician Doorstep Visit & Repair",
        slug: "electrician-visit",
        description: "Instant doorstep assistance for domestic & commercial electrical faults.",
        basePrice: 199,
        imageUrl: "zap",
        formConfig: {
          fields: [
            { id: "electrical_job", label: "Choose Electrical Work", type: "SELECT", options: [
              { label: "Fan Repair / Installation", value: "fan", priceModifier: 150 },
              { label: "Switchboard / Socket Replacement", value: "switchboard", priceModifier: 100 },
              { label: "MCB Tripping / Short Circuit Fault", value: "mcb_fault", priceModifier: 350 },
              { label: "Inverter & Battery Wiring", value: "inverter", priceModifier: 400 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Preferred Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Preferred Time", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Home Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_plumber",
    name: "Plumber",
    slug: "plumber",
    description: "Expert plumbers for tap repair, pipe leakages, water tank cleaning, shower & toilet fittings.",
    imageUrl: "droplets",
    isActive: true,
    orderIndex: 4,
    subcategories: [
      {
        id: "sub_plumber_visit",
        name: "Plumbing Inspection & Repair",
        slug: "plumbing-repair",
        description: "Quick doorstep solution for blocked drains, tap leaks & sanitary installations.",
        basePrice: 199,
        imageUrl: "droplets",
        formConfig: {
          fields: [
            { id: "plumbing_issue", label: "Select Plumbing Requirement", type: "SELECT", options: [
              { label: "Tap / Mixer Leakage Repair", value: "tap_leak", priceModifier: 100 },
              { label: "Drain Blockage / Clogged Basin", value: "blockage", priceModifier: 250 },
              { label: "Water Tank Deep Cleaning", value: "tank_clean", priceModifier: 600 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_carpenter",
    name: "Carpenter",
    slug: "carpenter",
    description: "Furniture repair, bed assembly, modular kitchen fittings, door locks, hinges & wood polish.",
    imageUrl: "hammer",
    isActive: true,
    orderIndex: 5,
    subcategories: [
      {
        id: "sub_carpenter_visit",
        name: "Carpentry & Furniture Works",
        slug: "carpentry-works",
        description: "Skilled carpenters for quick repairs, new fittings and custom woodwork.",
        basePrice: 299,
        imageUrl: "hammer",
        formConfig: {
          fields: [
            { id: "carpenter_work", label: "Carpentry Requirement", type: "SELECT", options: [
              { label: "Door Lock / Latch Fitting", value: "lock_fitting", priceModifier: 150 },
              { label: "Bed / Wardrobe Assembly", value: "bed_assembly", priceModifier: 500 },
              { label: "Cabinet Hinge Repair", value: "hinge_fix", priceModifier: 200 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_cleaning",
    name: "Home Cleaning",
    slug: "home-cleaning",
    description: "Full home deep cleaning, kitchen & bathroom sanitation, sofa, carpet & mattress shampoo.",
    imageUrl: "sparkles",
    isActive: true,
    orderIndex: 6,
    subcategories: [
      {
        id: "sub_home_deep_clean",
        name: "Deep Home Cleaning & Sanitation",
        slug: "deep-home-cleaning",
        description: "Eco-friendly chemicals, motorized floor scrubbers and trained cleaners.",
        basePrice: 599,
        imageUrl: "sparkles",
        formConfig: {
          fields: [
            { id: "cleaning_package", label: "Choose Cleaning Package", type: "SELECT", options: [
              { label: "Bathroom Deep Cleaning", value: "bathroom", priceModifier: 299 },
              { label: "Kitchen Deep Degreasing", value: "kitchen", priceModifier: 699 },
              { label: "1 BHK Full Home Deep Cleaning", value: "1bhk", priceModifier: 1499 },
              { label: "2 BHK Full Home Deep Cleaning", value: "2bhk", priceModifier: 2199 },
              { label: "3 BHK Full Home Deep Cleaning", value: "3bhk", priceModifier: 2899 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_salon",
    name: "Home Salon",
    slug: "home-salon",
    description: "Hygienic salon at home for women & men: facials, waxing, manicure, pedicure & hair styling.",
    imageUrl: "scissors",
    isActive: true,
    orderIndex: 7,
    subcategories: [
      {
        id: "sub_salon_package",
        name: "Beauty, Hair & Spa Treatments",
        slug: "beauty-spa-home",
        description: "100% single-use disposable kits and branded premium beauty products.",
        basePrice: 499,
        imageUrl: "scissors",
        formConfig: {
          fields: [
            { id: "salon_package", label: "Select Salon Services", type: "MULTI_SELECT", options: [
              { label: "Diamond Glowing Facial", value: "facial", priceModifier: 699 },
              { label: "Honey Full Waxing", value: "waxing", priceModifier: 499 },
              { label: "Rose Petal Pedicure & Manicure", value: "pedi_mani", priceModifier: 599 },
              { label: "Men Haircut & Beard Grooming", value: "men_grooming", priceModifier: 399 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_appliance",
    name: "Appliance Repair",
    slug: "appliance-repair",
    description: "Doorstep service for Microwave Oven, Geyser, Water Heater, Mixer & Kitchen Chimney.",
    imageUrl: "wrench",
    isActive: true,
    orderIndex: 8,
    subcategories: [
      {
        id: "sub_small_appliance",
        name: "Small & Kitchen Appliance Repair",
        slug: "small-appliance-repair",
        description: "Fast doorstep troubleshooting for all electrical appliances with genuine spares.",
        basePrice: 299,
        imageUrl: "wrench",
        formConfig: {
          fields: [
            { id: "appliance_type", label: "Appliance to Repair", type: "SELECT", options: [
              { label: "Geyser / Water Heater Repair", value: "geyser", priceModifier: 150 },
              { label: "Microwave Oven / OTG Repair", value: "microwave", priceModifier: 200 },
              { label: "Kitchen Chimney Deep Clean & Motor", value: "chimney", priceModifier: 450 },
              { label: "Mixer / Grinder Blade & Motor", value: "mixer", priceModifier: 100 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_painting",
    name: "Painting",
    slug: "painting",
    description: "Interior & exterior wall painting, waterproof damp treatment, texture paint and stencil designs.",
    imageUrl: "paint-brush",
    isActive: true,
    orderIndex: 9,
    subcategories: [
      {
        id: "sub_painting_services",
        name: "House & Wall Painting Services",
        slug: "home-painting",
        description: "Laser measurement, wall putty, primer & premium Asian/Berger paint coating.",
        basePrice: 999,
        imageUrl: "paint-brush",
        formConfig: {
          fields: [
            { id: "painting_scope", label: "Painting Scope", type: "SELECT", options: [
              { label: "Single Room / Accent Wall", value: "single_room", priceModifier: 800 },
              { label: "Complete 1/2/3 BHK Interior", value: "full_interior", priceModifier: 3500 },
              { label: "Waterproofing & Damp Wall Treatment", value: "waterproofing", priceModifier: 1200 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_cctv",
    name: "CCTV Installation",
    slug: "cctv-installation",
    description: "IP & HD CCTV security camera installation, DVR/NVR setup, mobile view and cable routing.",
    imageUrl: "camera",
    isActive: true,
    orderIndex: 10,
    subcategories: [
      {
        id: "sub_cctv_setup",
        name: "CCTV Security Camera Setup",
        slug: "cctv-setup",
        description: "Professional camera alignment, smartphone live remote viewing and night vision config.",
        basePrice: 499,
        imageUrl: "camera",
        formConfig: {
          fields: [
            { id: "cctv_service", label: "CCTV Requirement", type: "SELECT", options: [
              { label: "New CCTV Camera Installation", value: "new_install", priceModifier: 250 },
              { label: "4-Camera Kit with DVR & Hard Disk", value: "4_cam_kit", priceModifier: 1200 },
              { label: "CCTV Mobile View / Network Setup", value: "mobile_view", priceModifier: 200 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_ro_service",
    name: "RO Service",
    slug: "ro-service",
    description: "Water purifier RO filter change, membrane replacement, UV lamp fix and TDS calibration.",
    imageUrl: "droplet",
    isActive: true,
    orderIndex: 11,
    subcategories: [
      {
        id: "sub_ro_filter_change",
        name: "RO Purifier Maintenance & Repair",
        slug: "ro-purifier-repair",
        description: "Genuine Kent, Aquaguard, Livpure filters with strict water TDS testing.",
        basePrice: 299,
        imageUrl: "droplet",
        formConfig: {
          fields: [
            { id: "ro_service_type", label: "Select RO Service", type: "SELECT", options: [
              { label: "General Service & Filter Clean", value: "general_clean", priceModifier: 150 },
              { label: "Sediment + Carbon Filter Set", value: "filter_set", priceModifier: 650 },
              { label: "RO Membrane Replacement", value: "membrane", priceModifier: 1100 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_computer",
    name: "Computer/Laptop Repair",
    slug: "computer-laptop-repair",
    description: "Doorstep diagnostic for slow laptops, Windows/Mac OS install, SSD speedup, keyboard & screen.",
    imageUrl: "monitor",
    isActive: true,
    orderIndex: 12,
    subcategories: [
      {
        id: "sub_computer_repair",
        name: "Laptop & PC Doorstep Diagnostic",
        slug: "laptop-pc-repair",
        description: "Hardware & software fixes for Dell, HP, Lenovo, Asus, Acer & Apple MacBook.",
        basePrice: 499,
        imageUrl: "monitor",
        formConfig: {
          fields: [
            { id: "laptop_issue", label: "Issue / Required Upgrade", type: "SELECT", options: [
              { label: "SSD Upgrade (Make Laptop 10x Faster)", value: "ssd_speedup", priceModifier: 350 },
              { label: "Windows 11 / Mac OS Installation", value: "os_install", priceModifier: 300 },
              { label: "Laptop Screen / Display Replacement", value: "screen_replace", priceModifier: 1800 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_washing_machine",
    name: "Washing Machine Repair",
    slug: "washing-machine-repair",
    description: "Front load & top load washing machine repair: water leakage, drum noise, vibration & PCB.",
    imageUrl: "disc",
    isActive: true,
    orderIndex: 13,
    subcategories: [
      {
        id: "sub_washing_machine_fix",
        name: "Automatic & Semi-Automatic Machine Repair",
        slug: "washing-machine-repair-service",
        description: "Certified technicians for LG, Samsung, Whirlpool, IFB, Bosch & Haier.",
        basePrice: 349,
        imageUrl: "disc",
        formConfig: {
          fields: [
            { id: "machine_type", label: "Machine Type", type: "SELECT", options: [
              { label: "Fully Automatic Front Load", value: "front_load", priceModifier: 150 },
              { label: "Fully Automatic Top Load", value: "top_load", priceModifier: 100 },
              { label: "Semi-Automatic Twin Tub", value: "semi_auto", priceModifier: 0 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_refrigerator",
    name: "Refrigerator Repair",
    slug: "refrigerator-repair",
    description: "Doorstep fridge repair: single & double door, cooling fault, compressor, gas charge & thermostat.",
    imageUrl: "snowflake",
    isActive: true,
    orderIndex: 14,
    subcategories: [
      {
        id: "sub_fridge_repair",
        name: "Refrigerator Cooling & Gas Service",
        slug: "fridge-service",
        description: "Same-day doorstep inspection for Samsung, LG, Whirlpool, Godrej & Haier.",
        basePrice: 349,
        imageUrl: "snowflake",
        formConfig: {
          fields: [
            { id: "fridge_type", label: "Refrigerator Type", type: "SELECT", options: [
              { label: "Single Door Refrigerator", value: "single_door", priceModifier: 0 },
              { label: "Double Door Frost-Free", value: "double_door", priceModifier: 150 },
              { label: "Side-by-Side Fridge", value: "side_by_side", priceModifier: 400 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
  {
    categoryId: "cat_pest_control",
    name: "Pest Control",
    slug: "pest-control",
    description: "Safe & herbal pest control for cockroaches, termites, bed bugs, ants and mosquitoes.",
    imageUrl: "bug",
    isActive: true,
    orderIndex: 15,
    subcategories: [
      {
        id: "sub_pest_control_service",
        name: "Herbal & Odorless Pest Control",
        slug: "home-pest-control",
        description: "100% kid & pet-safe odorless gel and spray with warranty guarantee.",
        basePrice: 699,
        imageUrl: "bug",
        formConfig: {
          fields: [
            { id: "pest_type", label: "Pest Treatment Type", type: "SELECT", options: [
              { label: "Cockroach & Ant Herbal Gel", value: "cockroach", priceModifier: 300 },
              { label: "Bed Bugs Complete Treatment", value: "bed_bugs", priceModifier: 900 },
              { label: "Termite (Deemak) Drilling", value: "termite", priceModifier: 1500 },
            ], validation: { required: true }, priceModifierField: true },
            { id: "preferred_date", label: "Date", type: "DATE", validation: { required: true } },
            { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
            { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
          ],
        },
      },
    ],
  },
];

/**
 * GET /api/categories
 * Returns all active categories & subcategories from MongoDB
 * (Auto-seeds if database collection is empty)
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    let categories = await CategoryModel.find({ isActive: true }).sort({ orderIndex: 1 }).lean();

    // If database is empty, seed with all default 15 categories
    if (!categories || categories.length === 0) {
      try {
        await CategoryModel.insertMany(SEED_CATEGORIES);
        categories = await CategoryModel.find({ isActive: true }).sort({ orderIndex: 1 }).lean();
      } catch (seedErr) {
        console.warn("Seeding error:", seedErr);
      }
    }

    const result = (categories && categories.length > 0) ? categories.map((c) => ({
      id: c.categoryId || (c as any)._id?.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      subcategories: c.subcategories || [],
      isActive: c.isActive,
    })) : SEED_CATEGORIES.map((c) => ({
      id: c.categoryId,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      subcategories: c.subcategories,
      isActive: c.isActive,
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      categories: result,
    });
  } catch (error: any) {
    return res.status(200).json({
      success: true,
      count: SEED_CATEGORIES.length,
      categories: SEED_CATEGORIES.map((c) => ({
        id: c.categoryId,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        subcategories: c.subcategories,
        isActive: c.isActive,
      })),
    });
  }
});

/**
 * POST /api/categories (Admin Dynamic Future Service Addition)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, slug, description, imageUrl, basePrice, subcategories } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const categoryId = "cat_" + cleanSlug.replace(/-/g, "_");

    const newCategory = await CategoryModel.create({
      categoryId,
      name,
      slug: cleanSlug,
      description: description || `Professional ${name} service at your doorstep.`,
      imageUrl: imageUrl || "sparkles",
      orderIndex: 99,
      isActive: true,
      subcategories: subcategories || [
        {
          id: `sub_${cleanSlug.replace(/-/g, "_")}`,
          name: `${name} Standard Visit`,
          slug: `${cleanSlug}-standard`,
          description: `Doorstep ${name} inspection and repair.`,
          basePrice: basePrice || 399,
          imageUrl: imageUrl || "sparkles",
          formConfig: {
            fields: [
              { id: "service_details", label: "Requirement Details", type: "TEXT", placeholder: "Describe your requirement", validation: { required: true } },
              { id: "preferred_date", label: "Service Date", type: "DATE", validation: { required: true } },
              { id: "preferred_time", label: "Time Slot", type: "TIME_SLOT", validation: { required: true } },
              { id: "service_address", label: "Address", type: "ADDRESS_GPS", validation: { required: true } },
            ],
          },
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "New service category created successfully",
      category: newCategory,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
