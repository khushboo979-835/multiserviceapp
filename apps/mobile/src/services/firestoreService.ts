import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  addDoc
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/config/firebaseConfig";
import { User, Booking, ServiceItem, Review, BookingStatus, UserSavedAddress } from "@/types";

const LOCAL_BOOKINGS_KEY = "@inisha_local_bookings";
const LOCAL_USERS_KEY = "@inisha_local_users";

// Helper: Get local bookings
export async function getLocalBookings(): Promise<Booking[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper: Save local booking
export async function saveLocalBooking(booking: Booking): Promise<void> {
  try {
    const list = await getLocalBookings();
    const idx = list.findIndex(b => b.id === booking.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...booking };
    } else {
      list.unshift(booking);
    }
    await AsyncStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("AsyncStorage saveLocalBooking fallback warning:", e);
  }
}


export const INITIAL_SERVICES: Omit<ServiceItem, "id">[] = [
  // 1. Quick Delivery & Courier (Logo Pillar 1)
  {
    title: "Express 30-Min City Parcel Delivery",
    category: "Quick Delivery & Courier",
    price: 99,
    duration: "30-45 mins",
    image: "truck",
    imageUrl: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&w=800&q=80",
    description: "Instant doorstep pickup and direct drop-off for keys, documents, chargers, lunchboxes, medicines, and packages across the city.",
    isAvailable: true,
    rating: 4.9,
    reviewCount: 720,
    warranty: "Live GPS Tracking & Insured Delivery",
    inclusions: [
      "Doorstep pickup within 15 minutes of booking",
      "Tamper-proof waterproof safety pouch sealing",
      "Live real-time rider GPS tracking on map",
      "Digital OTP confirmation upon final delivery handover"
    ],
    exclusions: [
      "Items heavier than 15kg",
      "Hazardous or inflammable liquids"
    ],
    addOns: [
      { id: "add_priority_del", title: "Super Express Priority Slot (Direct Rider)", price: 49, duration: "15 mins" },
      { id: "add_fragile_ins", title: "Fragile Item Bubble Wrapping & Insurance", price: 29, duration: "5 mins" }
    ],
    steps: [
      { step: 1, title: "Rider Assigned", description: "Nearest verified Inisha Delivery Rider accepts the order and reaches pickup spot." },
      { step: 2, title: "Package Verification & Sealed Pouch", description: "Rider verifies package size and seals it in a tamper-evident pouch." },
      { step: 3, title: "Direct Transit", description: "Fast point-to-point delivery with live GPS monitoring on your phone." },
      { step: 4, title: "OTP Handover", description: "Receiver provides 4-digit OTP to complete verified delivery." }
    ],
    faq: [
      { question: "What is the maximum weight allowed for bike delivery?", answer: "Our standard express riders carry parcels up to 15kg with dimensions fitting standard courier bags." },
      { question: "Can I send expensive electronics like phones or laptops?", answer: "Yes, you can add Fragile Item Insurance at checkout for extra safety and padded handling." }
    ],
    reviewsList: [
      { user: "Karan Malhotra", rating: 5, date: "Yesterday", comment: "Delivered office laptop across 14 km in just 32 minutes! Super fast and reliable." },
      { user: "Divya Patel", rating: 5, date: "3 days ago", comment: "The rider was extremely polite and the live map tracking was spot-on." }
    ]
  },
  {
    title: "Cake, Flowers & Fragile Gift Delivery",
    category: "Quick Delivery & Courier",
    price: 149,
    duration: "40 mins",
    image: "gift",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    description: "Specialized gentle handling with thermal insulated carrier bag for delicate cakes, flowers, gift hampers, and surprise deliveries.",
    isAvailable: true,
    rating: 4.8,
    reviewCount: 380,
    warranty: "Zero-Tilt & Freshness Guarantee",
    inclusions: [
      "Thermal insulated bag prevents cake melting",
      "Zero-tilt secure mounting on carrier bike",
      "Surprise doorbell delivery with recipient photo proof",
      "Custom gift note attachment"
    ],
    exclusions: ["Custom cake preparation (pickup & delivery only)"],
    addOns: [
      { id: "add_greeting_card", title: "Handwritten Luxury Greeting Card", price: 49, duration: "5 mins" }
    ],
    steps: [
      { step: 1, title: "Careful Pickup", description: "Rider inspects cake packaging and secures it in cooling thermal box." },
      { step: 2, title: "Smooth Route Transit", description: "Careful driving avoiding harsh speed bumps." },
      { step: 3, title: "Celebration Handover", description: "Doorstep delivery with smile and recipient confirmation." }
    ],
    faq: [
      { question: "Will the cake frosting or shape get damaged?", answer: "No, our riders use specialized flat-bottom stabilizer bags designed specifically for bakery and floral items." }
    ],
    reviewsList: [
      { user: "Sneha Reddy", rating: 5, date: "4 days ago", comment: "Sent a 2-tier birthday cake to my friend in pristine condition. Highly recommended!" }
    ]
  },

  // 2. Home Repair & Maintenance (Logo Pillar 2)
  {
    title: "Emergency Electrician & Switch Repair",
    category: "Home Repair & Utilities",
    price: 249,
    duration: "30-45 mins",
    image: "zap",
    imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
    description: "Fast doorstep fixes for short circuits, tripped MCBs, fancy light hanging, fan installations, and switchboards by certified electricians.",
    isAvailable: true,
    rating: 4.8,
    reviewCount: 560,
    warranty: "30-Day Wiring Safety Guarantee",
    inclusions: [
      "Short circuit & earthing load diagnostics",
      "Up to 3 switch / socket repairs or installation",
      "Safety testing with digital multimeter",
      "Ceiling fan / hanging light mount inspection"
    ],
    exclusions: ["Main power meter replacement", "Concealed wall wiring carving"],
    addOns: [
      { id: "add_mcb", title: "32A Dual Pole MCB Installation", price: 199, duration: "15 mins" }
    ],
    steps: [
      { step: 1, title: "Voltage & Load Test", description: "Testing line voltage and circuit breaker safety." },
      { step: 2, title: "Precision Repair", description: "Rewiring switchboard, replacing burned terminals." },
      { step: 3, title: "Final Load Verification", description: "Testing all appliances on repaired circuit." }
    ],
    faq: [
      { question: "How quickly can the technician arrive?", answer: "Emergency visits are dispatched immediately, with professionals typically arriving within 30 to 45 minutes." }
    ],
    reviewsList: [
      { user: "Rohan Verma", rating: 5, date: "Yesterday", comment: "Arrived in 25 mins during a short circuit emergency. Highly knowledgeable technician." }
    ]
  },
  {
    title: "Tap, Pipe & Tank Leakage Plumber",
    category: "Home Repair & Utilities",
    price: 249,
    duration: "30-45 mins",
    image: "wrench",
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    description: "Instant resolution for leaking taps, washbasin siphon blocks, flush tank faults, and bathroom drain traps.",
    isAvailable: true,
    rating: 4.7,
    reviewCount: 440,
    warranty: "30-Day Zero-Leakage Guarantee",
    inclusions: [
      "Tap washer, ceramic spindle & cartridge replacement",
      "Washbasin siphon / waste pipe unclogging with snake tool",
      "Flush tank siphon & ball-valve adjustment",
      "Water pressure regulator calibration"
    ],
    exclusions: ["Underground main sewer line excavation"],
    addOns: [
      { id: "add_jet", title: "Health Faucet / Jet Spray Fitment", price: 149, duration: "15 mins" }
    ],
    steps: [
      { step: 1, title: "Leak Source Identification", description: "Inspecting pipe joints and gaskets." },
      { step: 2, title: "Sealant & Spindle Replacement", description: "Installing Teflon seals and ceramic cartridges." },
      { step: 3, title: "High-Pressure Water Test", description: "Verifying zero drip under full water pressure." }
    ],
    faq: [
      { question: "Do plumbers bring basic replacement fittings?", answer: "Yes, technicians carry standard Teflon tapes, washers, spindles, and connectors." }
    ],
    reviewsList: [
      { user: "Deepak Nair", rating: 5, date: "2 days ago", comment: "Fixed my leaking Kohler tap in 15 minutes. Very clean work." }
    ]
  },
  {
    title: "AC Foam Jet Service & Gas Refill",
    category: "Home Repair & Utilities",
    price: 499,
    duration: "45-60 mins",
    image: "wind",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    description: "High-pressure 2X power jet foam wash of indoor and outdoor coils, drain pipe flush, gas checkup, and cooling efficiency diagnostics.",
    isAvailable: true,
    rating: 4.9,
    reviewCount: 690,
    warranty: "30-Day Cooling & Leakage Warranty",
    inclusions: [
      "Indoor unit cooling coil jet foam wash with protective spill jacket",
      "Outdoor unit condenser wash with high-pressure pump",
      "Drain tray & outlet pipe anti-fungal flush",
      "Gas pressure, amperage, and compressor voltage test",
      "Pre & post service digital temperature check"
    ],
    exclusions: ["Copper pipe replacement", "PCB board micro-soldering"],
    addOns: [
      { id: "add_gas", title: "Full R32/R410A Eco Gas Top-up", price: 1499, duration: "30 mins" },
      { id: "add_bracket", title: "Outdoor Anti-Vibration Rubber Dampers", price: 199, duration: "10 mins" }
    ],
    steps: [
      { step: 1, title: "Pre-Service Diagnostics", description: "Technician tests initial cooling temp, airflow, and power draw." },
      { step: 2, title: "Spill-Jacket Jet Wash", description: "Indoor unit wrapped in jacket; 2X pressure jet removes deep mold." },
      { step: 3, title: "Condenser Cleansing", description: "Outdoor unit pressure washed to restore optimum heat exchange." },
      { step: 4, title: "Cooling Performance Audit", description: "Post-service temp drop verified on digital laser thermometer." }
    ],
    faq: [
      { question: "Will the water spray make a mess on my wall or floor?", answer: "No, our technicians install a dedicated waterproof spill jacket with drain tube into a bucket." }
    ],
    reviewsList: [
      { user: "Amitabh Roy", rating: 5, date: "Yesterday", comment: "My AC cooling dropped to 17°C within 5 mins after the jet wash. Super professional service." }
    ]
  },

  // 3. Home Cleaning & Deep Hygiene (Logo Pillar 3)
  {
    title: "Full Home Deep Cleaning",
    category: "Home Cleaning & Housekeeping",
    price: 1999,
    duration: "3-4 hours",
    image: "sparkles",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    description: "Intense machine scrubbing, kitchen degreasing, bathroom descaling, floor buffing, and balcony sanitization by certified cleaning experts.",
    isAvailable: true,
    rating: 4.9,
    reviewCount: 520,
    warranty: "100% Spotless Satisfaction Guarantee",
    inclusions: [
      "Kitchen chimney, cabinets & countertop steam degreasing",
      "Bathroom tiles descaling, hard water stain removal & mirror buffing",
      "Living room & bedroom floor single-disc machine scrubbing",
      "Window panes, sliding channels, and balcony high-pressure wash",
      "Door handles, switchboards & fan sanitization"
    ],
    exclusions: [
      "Interior appliance deep cleaning (available as add-on)",
      "Wall painting or structural repair"
    ],
    addOns: [
      { id: "add_fridge", title: "Refrigerator Interior Deep Clean & Disinfection", price: 299, duration: "30 mins" },
      { id: "add_chimney", title: "Heavy Oil Chimney Filter Degrease & Steam", price: 349, duration: "30 mins" },
      { id: "add_mattress", title: "King Size Mattress Vacuum & UV Sterilization", price: 449, duration: "40 mins" }
    ],
    steps: [
      { step: 1, title: "Inspection & Dusting", description: "Technicians inspect areas and perform high-suction HEPA dry vacuuming." },
      { step: 2, title: "Eco-Chemical Application", description: "Eco-friendly, child-safe degreasers applied to tough grease and scale." },
      { step: 3, title: "Machine Scrubbing & Buffing", description: "Single-disc scrubbers and steam nozzles buff tiles and countertops." },
      { step: 4, title: "Inspection & Final Sanitization", description: "Manager quality audit with customer sign-off and digital invoice." }
    ],
    faq: [
      { question: "Do I need to provide cleaning liquids or equipment?", answer: "No, our team arrives fully equipped with professional single-disc machines, vacuum cleaners, and premium eco-friendly chemicals." },
      { question: "How long does full home deep cleaning take?", answer: "A 2BHK/3BHK typically takes 3 to 4 hours with a 2-3 member team." }
    ],
    reviewsList: [
      { user: "Rahul Mehta", rating: 5, date: "2 days ago", comment: "My kitchen looks brand new! The team spent 3.5 hours and didn't miss a single corner." }
    ]
  },
  {
    title: "Sofa & Carpet Foam Shampooing",
    category: "Home Cleaning & Housekeeping",
    price: 799,
    duration: "60-90 mins",
    image: "sparkles",
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
    description: "Deep injection-extraction foam shampooing for fabric/leather sofas, cushions, and wool carpets to eliminate 99.9% dust mites and odor.",
    isAvailable: true,
    rating: 4.8,
    reviewCount: 310,
    warranty: "Quick-Dry & Fabric Safety Assurance",
    inclusions: [
      "High-power HEPA dry vacuuming of fabric seams",
      "German foam chemical treatment for tough stain breakdown",
      "Injection-extraction moisture suction (leaves fabric 90% dry)",
      "Fabric freshener and anti-allergen misting"
    ],
    exclusions: ["Torn fabric stitching or leather dye touch-up"],
    addOns: [
      { id: "add_cushion", title: "5 Extra Cushion Covers Shampoo", price: 199, duration: "20 mins" }
    ],
    steps: [
      { step: 1, title: "Dry Dust Extraction", description: "Deep extraction of embedded pet hair and dust mites." },
      { step: 2, title: "Foam Scrubbing", description: "Gentle mechanized brush scrubbing with pH-neutral shampoo." },
      { step: 3, title: "High-Power Extraction", description: "Powerful vacuum extracts moisture for rapid drying." }
    ],
    faq: [
      { question: "How long does the sofa take to dry completely?", answer: "Due to our high-suction extraction machines, the sofa dries completely within 2 to 3 hours under normal fan ventilation." }
    ],
    reviewsList: [
      { user: "Ananya Sen", rating: 5, date: "3 days ago", comment: "Coffee stain from 6 months ago vanished completely! Outstanding work." }
    ]
  },

  // 4. Salon, Beauty & Spa (Logo Pillar 4)
  {
    title: "Salon Classic Glow Facial, Waxing & Threading",
    category: "Salon, Beauty & Spa",
    price: 899,
    duration: "75 mins",
    image: "scissors",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    description: "Premium fruit/gold facial, full arms & legs honey waxing, painless threading, and relaxing face acupressure by certified beauticians.",
    isAvailable: true,
    rating: 4.9,
    reviewCount: 790,
    warranty: "100% Sealed Monodose Kit Hygiene Guarantee",
    inclusions: [
      "Deep cleansing, exfoliating walnut scrub & ozone steam",
      "Full arms & legs RICA/Honey wax with post-wax soothing oil",
      "Eyebrow shaping & upper lip threading",
      "Hydrating face mask with 15-min lymphatic drainage massage"
    ],
    exclusions: ["Bridal heavy makeup"],
    addOns: [
      { id: "add_detan", title: "O3+ Insta Glow De-Tan Pack", price: 299, duration: "20 mins" },
      { id: "add_pedi", title: "Express Pedicure & Foot Scrub", price: 399, duration: "30 mins" }
    ],
    steps: [
      { step: 1, title: "Sanitized Setup", description: "Beautician lays out disposable sheet, sterilized tools, and sealed kit." },
      { step: 2, title: "Painless Waxing & Scrub", description: "Gentle waxing followed by rejuvenating facial scrub and steam." },
      { step: 3, title: "Acupressure Face Massage", description: "Herbal cream massage to boost blood flow and natural glow." }
    ],
    faq: [
      { question: "Do you use single-use sealed kits?", answer: "Yes! Every client receives an individual sealed kit opened in front of them." }
    ],
    reviewsList: [
      { user: "Simran Gill", rating: 5, date: "2 days ago", comment: "The beautician was super hygienic and gentle. My skin is glowing!" }
    ]
  },
  {
    title: "Men's Haircut, Beard & Head Massage",
    category: "Salon, Beauty & Spa",
    price: 399,
    duration: "45 mins",
    image: "scissors",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    description: "Stylist haircut, beard shaping with warm towel steam, charcoal face scrub, and 15-minute Ayurvedic head massage.",
    isAvailable: true,
    rating: 4.8,
    reviewCount: 610,
    warranty: "Sterilized Scissor & Trimmer Kit Guarantee",
    inclusions: [
      "Custom trend haircut with precision neck taper",
      "Beard trimming & razor sharp outline",
      "Herbal hot oil head & shoulder massage",
      "Cooling face wash & aftershave splash with clean-up"
    ],
    exclusions: ["Hair color dye (can be added)"],
    addOns: [
      { id: "add_color", title: "L'Oreal Natural Black Beard Color", price: 199, duration: "15 mins" }
    ],
    steps: [
      { step: 1, title: "Consultation & Haircut", description: "Personalized styling based on face shape." },
      { step: 2, title: "Beard Grooming & Steam", description: "Precision trimmer outline and warm towel steam." },
      { step: 3, title: "Ayurvedic Massage", description: "15-min stress-relief hot oil massage." }
    ],
    faq: [
      { question: "Does the barber clean up afterwards?", answer: "Yes, our barbers carry disposable floor sheets and perform complete vacuum cleanup after the cut." }
    ],
    reviewsList: [
      { user: "Arjun Dixit", rating: 5, date: "Yesterday", comment: "Best haircut I've had in months, right in my living room. Zero mess left behind." }
    ]
  },

  // 5. Grocery & Daily Essentials (Logo Pillar 5)
  {
    title: "Fresh Farm Fruits & Veggies Basket",
    category: "Grocery & Daily Essentials",
    price: 499,
    duration: "25-35 mins",
    image: "shopping-bag",
    imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80",
    description: "Hand-picked, ozone-washed fresh seasonal vegetables (Potatoes, Onions, Tomatoes, Greens) and premium fruits delivered in eco-crates.",
    isAvailable: true,
    rating: 4.9,
    reviewCount: 840,
    warranty: "100% Freshness or Free Instant Replacement",
    inclusions: [
      "Fresh farm harvest sorted by quality experts",
      "Ozone sanitized surface cleaning",
      "Delivered in insulated eco-friendly paper bags",
      "Weight verified digital scale receipt"
    ],
    exclusions: ["Cooked ready-to-eat meals"],
    addOns: [
      { id: "add_exotic_fruit", title: "Imported Kiwi & Avocado Pair", price: 149, duration: "5 mins" }
    ],
    steps: [
      { step: 1, title: "Farm Sorting", description: "Selected fresh from verified organic farms at 5 AM." },
      { step: 2, title: "Quality Check & Pack", description: "Inspection for zero bruises and sealed in breathable bags." },
      { step: 3, title: "Doorstep Express Delivery", description: "Delivered within 30 minutes at your door." }
    ],
    faq: [
      { question: "What if any fruit is damaged upon arrival?", answer: "Simply show the rider or request a 1-tap instant replacement or refund on the app." }
    ],
    reviewsList: [
      { user: "Pooja Singhania", rating: 5, date: "Yesterday", comment: "Crisp and fresh vegetables, better quality than the local supermarket!" }
    ]
  },
  {
    title: "Daily Dairy, Milk & Bakery Essentials",
    category: "Grocery & Daily Essentials",
    price: 299,
    duration: "20-30 mins",
    image: "shopping-cart",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    description: "Farm fresh A2 pasteurized milk, unsalted butter, artisanal sourdough bread, paneer, and eggs delivered before breakfast.",
    isAvailable: true,
    rating: 4.8,
    reviewCount: 510,
    warranty: "Chilled Temperature Insulated Transit",
    inclusions: [
      "Cold-chain temperature maintained below 4°C",
      "Fresh morning baked bread from top bakeries",
      "Organic free-range brown eggs in protective cartons",
      "Contactless doorstep drop option"
    ],
    exclusions: ["Raw meat items"],
    addOns: [
      { id: "add_paneer", title: "200g Fresh Malai Paneer", price: 89, duration: "5 mins" }
    ],
    steps: [
      { step: 1, title: "Cold Storage Pick", description: "Directly taken from chilled temperature hubs." },
      { step: 2, title: "Speed Dispatch", description: "Rider dispatched immediately with insulated cold box." },
      { step: 3, title: "Fresh Handover", description: "Delivered fresh to your kitchen counter." }
    ],
    faq: [
      { question: "Can I schedule recurring daily morning deliveries?", answer: "Yes, you can schedule morning slots between 6:00 AM and 8:00 AM." }
    ],
    reviewsList: [
      { user: "Manish Aggarwal", rating: 5, date: "3 days ago", comment: "The sourdough bread and fresh milk arrived chilled and perfectly on time." }
    ]
  },

  // 6. Healthcare & Medical Care (Logo Pillar 6)
  {
    title: "Doorstep Blood Sample Collection & Lab Test",
    category: "Healthcare & Medical Care",
    price: 599,
    duration: "30 mins",
    image: "activity",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    description: "Certified NABL phlebotomist visit for full body checkup, CBC, lipid profile, sugar testing, and digital reports within 12 hours.",
    isAvailable: true,
    rating: 4.9,
    reviewCount: 460,
    warranty: "NABL-Accredited Lab Diagnostic Quality",
    inclusions: [
      "Painless butterfly needle blood drawing by certified phlebotomist",
      "Barcoded vacuum vacutainer vials to prevent mix-ups",
      "Temperature-controlled sample transport box",
      "Digital lab report PDF sent directly to WhatsApp & app within 12 hours",
      "Free 10-minute doctor report consultation"
    ],
    exclusions: ["MRI / CT scans (lab visit required)"],
    addOns: [
      { id: "add_vitamin_d", title: "Vitamin D3 & B12 Add-on Test", price: 499, duration: "5 mins" },
      { id: "add_ecg", title: "Doorstep Portable 12-Lead ECG", price: 349, duration: "15 mins" }
    ],
    steps: [
      { step: 1, title: "Phlebotomist Arrival", description: "Arrives with sanitized PPE kit and vacuum sealed single-use needles." },
      { step: 2, title: "Painless Sample Draw", description: "Gentle butterfly needle draw with barcoded patient labeling." },
      { step: 3, title: "Cold Transit to NABL Lab", description: "Samples kept at 2-8°C during transit for accurate diagnostics." },
      { step: 4, title: "Instant Report & Tele-consult", description: "Verified pathologist report delivered online." }
    ],
    faq: [
      { question: "Do I need to fast before the test?", answer: "For full body lipid and fasting blood sugar tests, 8 to 10 hours of overnight fasting is recommended." },
      { question: "Are your phlebotomists vaccinated and certified?", answer: "Yes, 100% of our sample collectors hold DMLT degrees with certified background checks." }
    ],
    reviewsList: [
      { user: "Dr. Sunita Sen", rating: 5, date: "2 days ago", comment: "Painless prick and received detailed 68-parameter report by evening. Excellent service." }
    ]
  },
  {
    title: "Elderly Nursing & Physiotherapy at Home",
    category: "Healthcare & Medical Care",
    price: 699,
    duration: "60 mins",
    image: "heart",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    description: "Certified physiotherapist and nursing care for post-surgery recovery, knee/back pain relief, vital monitoring, and mobility exercises.",
    isAvailable: true,
    rating: 4.9,
    reviewCount: 390,
    warranty: "Certified BPT Physiotherapist Guarantee",
    inclusions: [
      "Targeted ultrasound / TENS electro-therapy for pain relief",
      "Postural correction and manual muscle mobilization",
      "Blood pressure, SPO2, pulse, and ECG vital monitoring",
      "Personalized rehabilitation exercise plan"
    ],
    exclusions: ["ICU ventilator maintenance"],
    addOns: [
      { id: "add_cupping", title: "Therapeutic Dry Needling / Cupping", price: 299, duration: "20 mins" }
    ],
    steps: [
      { step: 1, title: "Assessment & Pain Mapping", description: "Doctor checks range of motion, muscle strength, and pain points." },
      { step: 2, title: "TENS & Modality Therapy", description: "Advanced portable modalities for immediate nerve pain reduction." },
      { step: 3, title: "Guided Exercise & Ergonomics", description: "Hands-on guided rehabilitation exercises." }
    ],
    faq: [
      { question: "Does the therapist bring their own electrotherapy machine?", answer: "Yes, our physiotherapists carry certified portable TENS, ultrasound, and heat therapy equipment." }
    ],
    reviewsList: [
      { user: "Rameshwar Prasad", rating: 5, date: "4 days ago", comment: "My mother's knee pain improved significantly in 3 sessions. The therapist was very patient and knowledgeable." }
    ]
  },

  // 7. Gadgets & Laptop Repair (Popular Tech Utility)
  {
    title: "Doorstep Mobile Screen & Battery Replace",
    category: "Gadgets & Laptop Repair",
    price: 1499,
    duration: "45 mins",
    image: "smartphone",
    imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80",
    description: "OEM-grade touch display & certified Li-ion battery replacement done at your doorstep with 6-month warranty.",
    isAvailable: true,
    rating: 4.9,
    reviewCount: 810,
    warranty: "6-Month Doorstep Replacement Warranty",
    inclusions: [
      "Complete screen display replacement in front of you",
      "High-capacity certified battery swap with health calibration",
      "Water-resistant sealant re-application",
      "6-Month doorstep replacement warranty card"
    ],
    exclusions: ["Motherboard CPU reballing (requires lab pickup)"],
    addOns: [
      { id: "add_tempered", title: "9H Edge-to-Edge Gorilla Glass", price: 199, duration: "5 mins" }
    ],
    steps: [
      { step: 1, title: "Diagnostic Touch Test", description: "Testing digitizer, color reproduction and battery health." },
      { step: 2, title: "Clean Room Disassembly", description: "Precision heating mat and anti-static tools for safe disassembly." },
      { step: 3, title: "OEM Display Bonding", description: "Installing certified panel with factory adhesive." },
      { step: 4, title: "Warranty Card Issue", description: "Digital warranty certificate activated on your phone." }
    ],
    faq: [
      { question: "Is my personal data safe during the screen change?", answer: "Yes! The repair is done right in front of you. You do not need to share your passcode or unlock your phone." }
    ],
    reviewsList: [
      { user: "Nitin Verma", rating: 5, date: "2 days ago", comment: "Replaced my iPhone 13 screen in 30 minutes in my office. 100% genuine quality." }
    ]
  },
  {
    title: "Laptop Diagnostics, SSD & Thermal Paste",
    category: "Gadgets & Laptop Repair",
    price: 599,
    duration: "60 mins",
    image: "monitor",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    description: "Complete fan dust cleaning, Arctic MX-4 thermal paste re-application, NVMe SSD speed upgrade, and OS tuning.",
    isAvailable: true,
    rating: 4.8,
    reviewCount: 340,
    warranty: "90-Day Performance & Thermal Warranty",
    inclusions: [
      "Complete laptop internal fan & heat sink cleaning",
      "Fresh premium thermal compound on CPU/GPU",
      "SSD cloning and boot speed optimization",
      "Hardware health diagnostic report"
    ],
    exclusions: ["SSD hardware purchase price (if not provided by customer)"],
    addOns: [
      { id: "add_ram", title: "8GB/16GB DDR4/DDR5 RAM Installation", price: 199, duration: "15 mins" }
    ],
    steps: [
      { step: 1, title: "Thermal Benchmark", description: "Benchmarking CPU temps under load." },
      { step: 2, title: "Repasting & Dust Out", description: "Cleaning dried paste and applying Arctic MX-4." },
      { step: 3, title: "Performance Re-test", description: "Confirming 15-20°C temperature reduction." }
    ],
    faq: [
      { question: "Will repasting fix my laptop heating and fan noise?", answer: "Yes, replacing dried thermal paste typically reduces CPU temps by 15°C to 20°C and eliminates fan whining." }
    ],
    reviewsList: [
      { user: "Tanmay Bhatia", rating: 5, date: "3 days ago", comment: "My Dell laptop went from 92°C to 68°C while gaming. Fantastic service." }
    ]
  }
];

/**
 * Seed initial services into Firestore if the collection is empty or incomplete
 */
export async function seedInitialServicesIfEmpty(): Promise<ServiceItem[]> {
  try {
    const servicesRef = collection(db, "services");
    const snapshot = await getDocs(servicesRef);

    // If Firestore has all 12 services, return them merged with seedMatch
    if (snapshot.size >= INITIAL_SERVICES.length) {
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<ServiceItem, "id">;
        const seedMatch = INITIAL_SERVICES.find(s => s.title.toLowerCase() === data.title?.toLowerCase());
        return {
          id: docSnap.id,
          ...data,
          ...seedMatch, // seedMatch takes precedence to ensure real photos and correct categories
          imageUrl: seedMatch?.imageUrl || data.imageUrl || INITIAL_SERVICES[0].imageUrl,
          category: seedMatch?.category || data.category,
          steps: seedMatch?.steps || data.steps,
          faq: seedMatch?.faq || data.faq,
          reviewsList: seedMatch?.reviewsList || data.reviewsList,
          warranty: seedMatch?.warranty || data.warranty,
        };
      });
    }

    // Populate / Refresh full 12 services catalog in Firestore
    const createdServices: ServiceItem[] = [];
    for (const service of INITIAL_SERVICES) {
      // Find if doc already exists by title
      const existingDoc = snapshot.docs.find(d => d.data().title?.toLowerCase() === service.title.toLowerCase());
      const targetDocRef = existingDoc ? doc(db, "services", existingDoc.id) : doc(servicesRef);
      
      await setDoc(targetDocRef, {
        ...service,
        updatedAt: new Date().toISOString(),
        createdAt: existingDoc ? (existingDoc.data().createdAt || new Date().toISOString()) : new Date().toISOString(),
      }, { merge: true });

      createdServices.push({
        id: targetDocRef.id,
        ...service,
      });
    }

    return createdServices;
  } catch (error) {
    console.warn("Firestore seed/fetch fallback to default services:", error);
    return INITIAL_SERVICES.map((s, idx) => ({ id: `srv_${idx + 1}`, ...s }));
  }
}

/**
 * Fetch all available services with guaranteed rich images and correct category mapping
 */
export async function fetchServices(): Promise<ServiceItem[]> {
  try {
    const servicesRef = collection(db, "services");
    const snapshot = await getDocs(servicesRef);
    if (snapshot.empty || snapshot.size < INITIAL_SERVICES.length) {
      return await seedInitialServicesIfEmpty();
    }
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<ServiceItem, "id">;
      const seedMatch = INITIAL_SERVICES.find(s => 
        s.title.toLowerCase().trim() === data.title?.toLowerCase().trim() ||
        data.title?.toLowerCase().includes(s.title.toLowerCase())
      );
      return {
        id: docSnap.id,
        ...data,
        ...seedMatch,
        imageUrl: seedMatch?.imageUrl || data.imageUrl || INITIAL_SERVICES[0].imageUrl,
        category: seedMatch?.category || data.category,
        steps: seedMatch?.steps || data.steps,
        faq: seedMatch?.faq || data.faq,
        reviewsList: seedMatch?.reviewsList || data.reviewsList,
        warranty: seedMatch?.warranty || data.warranty,
      };
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return INITIAL_SERVICES.map((s, idx) => ({ id: `srv_${idx + 1}`, ...s }));
  }
}

/**
 * Create or sync user profile in Firestore
 */
export async function syncUserProfile(user: Partial<User> & { id: string }): Promise<void> {
  try {
    const userRef = doc(db, "users", user.id);
    const userSnap = await getDoc(userRef);

    const payload: Record<string, any> = {
      uid: user.id,
      fullName: user.name || user.fullName || "User",
      name: user.name || user.fullName || "User",
      email: user.email || "",
      phone: user.phoneNumber || user.phone || "",
      phoneNumber: user.phoneNumber || user.phone || "",
      role: user.role || "CUSTOMER",
      avatarUrl: user.avatarUrl || "",
      address: user.address || [],
      savedAddresses: user.savedAddresses || [],
      selectedLocation: user.selectedLocation || "Cyber City, Gurugram",
      isVerified: true,
      updatedAt: new Date().toISOString(),
    };

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        ...payload,
        createdAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(userRef, payload);
    }
  } catch (error) {
    console.warn("Firestore syncUserProfile error (permission/network fallback handled):", error);
  }
}

/**
 * Fetch user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: uid,
      uid: uid,
      name: data.fullName || data.name || "User",
      fullName: data.fullName || data.name || "User",
      email: data.email || "",
      phoneNumber: data.phone || data.phoneNumber || "",
      phone: data.phone || data.phoneNumber || "",
      role: data.role || "CUSTOMER",
      avatarUrl: data.avatarUrl || "",
      address: data.address || [],
      savedAddresses: data.savedAddresses || [],
      selectedLocation: data.selectedLocation || "Cyber City, Gurugram",
      isVerified: data.isVerified ?? true,
      verified: data.isVerified ?? true,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Firestore getUserProfile fallback:", error);
    return null;
  }
}

/**
 * Update User Profile (Name, Email, Phone, Avatar)
 */
export async function updateUserProfileData(
  uid: string, 
  data: Partial<User>
): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Firestore updateUserProfileData fallback:", error);
  }
}

/**
 * Save User Address in Firestore
 */
export async function saveUserAddressInFirestore(
  uid: string, 
  address: UserSavedAddress
): Promise<UserSavedAddress[]> {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    const existingAddresses: UserSavedAddress[] = snap.exists() ? (snap.data().savedAddresses || []) : [];
    
    const existingIndex = existingAddresses.findIndex(a => a.id === address.id);
    let updatedList: UserSavedAddress[];
    if (existingIndex >= 0) {
      updatedList = existingAddresses.map(a => a.id === address.id ? address : a);
    } else {
      updatedList = [...existingAddresses, address];
    }

    await updateDoc(userRef, {
      savedAddresses: updatedList,
      updatedAt: new Date().toISOString(),
    });

    return updatedList;
  } catch (error) {
    console.warn("Firestore saveUserAddressInFirestore fallback:", error);
    return [address];
  }
}

/**
 * Delete User Address in Firestore
 */
export async function deleteUserAddressInFirestore(
  uid: string, 
  addressId: string
): Promise<UserSavedAddress[]> {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return [];

    const existingAddresses: UserSavedAddress[] = snap.data().savedAddresses || [];
    const updatedList = existingAddresses.filter(a => a.id !== addressId);

    await updateDoc(userRef, {
      savedAddresses: updatedList,
      updatedAt: new Date().toISOString(),
    });

    return updatedList;
  } catch (error) {
    console.warn("Firestore deleteUserAddressInFirestore fallback:", error);
    return [];
  }
}

/**
 * Create a live booking in Firestore (with automatic local storage persistence)
 */
export async function createFirestoreBooking(booking: Omit<Booking, "id"> & { id?: string }): Promise<string> {
  const bookingId = booking.id || `bk_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
  const bookingRef = doc(db, "bookings", bookingId);

  const formattedAddress = typeof booking.address === "string" 
    ? booking.address 
    : booking.address?.formattedAddress || "7A, Cyber City, Gurugram";

  const bookingPayload: Booking = {
    id: bookingId,
    customerId: booking.customerId,
    customerName: booking.customerName || "Customer",
    customerPhone: booking.customerPhone || "",
    providerId: booking.providerId || undefined,
    providerName: booking.providerName || undefined,
    providerPhone: booking.providerPhone || undefined,
    serviceId: booking.serviceId || "srv_default",
    serviceName: booking.serviceName || "On-Demand Service",
    categoryId: (booking as any).categoryId || "General Service",
    subcategoryId: (booking as any).subcategoryId || booking.serviceId || "srv_default",
    bookingDate: booking.bookingDate || booking.scheduledDate || new Date().toISOString().split("T")[0],
    timeSlot: booking.timeSlot || booking.scheduledTime || "10:00 AM - 12:00 PM",
    scheduledDate: booking.bookingDate || booking.scheduledDate || new Date().toISOString().split("T")[0],
    scheduledTime: booking.timeSlot || booking.scheduledTime || "10:00 AM - 12:00 PM",
    status: (booking.status as BookingStatus) || "PENDING",
    totalAmount: booking.totalAmount || booking.pricing?.finalAmount || 499,
    paymentStatus: (booking.paymentStatus as any) || "PENDING",
    paymentMethod: booking.paymentMethod || "COD",
    address: formattedAddress,
    otp: booking.otp || `${Math.floor(1000 + Math.random() * 9000)}`,
    pricing: booking.pricing || {
      basePrice: booking.totalAmount || 499,
      tax: Math.round((booking.totalAmount || 499) * 0.18),
      commission: Math.round((booking.totalAmount || 499) * 0.15),
      couponDiscount: 0,
      addOnPrice: 0,
      providerEarnings: Math.round((booking.totalAmount || 499) * 0.85),
      finalAmount: Math.round((booking.totalAmount || 499) * 1.18),
    },
    timeline: booking.timeline || [
      { status: "PENDING", timestamp: new Date().toISOString(), note: "Booking placed successfully. Searching for nearby provider." }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Always persist locally first so booking is immediately available
  await saveLocalBooking(bookingPayload);

  // Attempt Firestore sync
  try {
    await setDoc(bookingRef, bookingPayload);
  } catch (error) {
    console.warn("Firestore setDoc booking warning (local fallback active):", error);
  }

  return bookingId;
}

/**
 * Real-time subscription to Customer Bookings
 * Uses local AsyncStorage cache first, then Firestore snapshot with silent fallback
 */
export function subscribeCustomerBookings(
  customerId: string, 
  onUpdate: (bookings: Booking[]) => void
) {
  // 1. Immediately provide cached local bookings
  getLocalBookings().then((localList) => {
    const userBookings = localList.filter(b => b.customerId === customerId || b.customerId === "demo_customer_inisha" || !b.customerId);
    if (userBookings.length > 0) {
      onUpdate(userBookings);
    }
  });

  const bookingsRef = collection(db, "bookings");
  const q = query(
    bookingsRef,
    where("customerId", "==", customerId)
  );

  try {
    return onSnapshot(
      q,
      async (snapshot) => {
        const firestoreItems: Booking[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Booking),
          id: docSnap.id,
        }));

        // Merge with any offline local bookings
        const localList = await getLocalBookings();
        const mergedMap = new Map<string, Booking>();
        
        localList.filter(b => b.customerId === customerId).forEach(b => mergedMap.set(b.id, b));
        firestoreItems.forEach(b => mergedMap.set(b.id, b));

        const allItems = Array.from(mergedMap.values());
        allItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onUpdate(allItems);
      },
      async (err) => {
        console.warn("Firestore subscription notice (using local storage fallback):", err?.message || err);
        const localList = await getLocalBookings();
        const userBookings = localList.filter(b => b.customerId === customerId || b.customerId === "demo_customer_inisha" || !b.customerId);
        onUpdate(userBookings);
      }
    );
  } catch (err) {
    getLocalBookings().then(list => {
      onUpdate(list.filter(b => b.customerId === customerId));
    });
    return () => {};
  }
}

/**
 * Real-time subscription to Pending Bookings for Providers (Radar)
 */
export function subscribePendingBookings(onUpdate: (bookings: Booking[]) => void) {
  getLocalBookings().then((localList) => {
    const pendingList = localList.filter(b => b.status === "PENDING" || b.status === "PENDING_PROVIDER");
    if (pendingList.length > 0) {
      onUpdate(pendingList);
    }
  });

  const bookingsRef = collection(db, "bookings");
  const q = query(
    bookingsRef,
    where("status", "in", ["PENDING", "PENDING_PROVIDER"])
  );

  try {
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Booking[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Booking),
          id: docSnap.id,
        }));
        onUpdate(items);
      },
      async (error) => {
        console.warn("Pending bookings subscription notice (using local fallback):", error?.message || error);
        const localList = await getLocalBookings();
        onUpdate(localList.filter(b => b.status === "PENDING" || b.status === "PENDING_PROVIDER"));
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Real-time subscription to Provider's Assigned Bookings
 */
export function subscribeProviderBookings(
  providerId: string,
  onUpdate: (bookings: Booking[]) => void
) {
  getLocalBookings().then((localList) => {
    const assigned = localList.filter(b => b.providerId === providerId);
    if (assigned.length > 0) {
      onUpdate(assigned);
    }
  });

  const bookingsRef = collection(db, "bookings");
  const q = query(
    bookingsRef,
    where("providerId", "==", providerId)
  );

  try {
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Booking[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Booking),
          id: docSnap.id,
        }));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(items);
      },
      async (error) => {
        console.warn("Provider bookings subscription notice:", error?.message || error);
        const localList = await getLocalBookings();
        onUpdate(localList.filter(b => b.providerId === providerId));
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Real-time subscription to a single booking document
 */
export function subscribeSingleBooking(
  bookingId: string,
  onUpdate: (booking: Booking | null) => void
) {
  // Check local cache first
  getLocalBookings().then((list) => {
    const found = list.find(b => b.id === bookingId);
    if (found) onUpdate(found);
  });

  const bookingRef = doc(db, "bookings", bookingId);
  try {
    return onSnapshot(
      bookingRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const item = {
            ...(snapshot.data() as Booking),
            id: snapshot.id,
          };
          saveLocalBooking(item);
          onUpdate(item);
        }
      },
      async (error) => {
        console.warn(`Booking ${bookingId} subscription notice (local active):`, error?.message || error);
        const list = await getLocalBookings();
        const found = list.find(b => b.id === bookingId);
        if (found) onUpdate(found);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Update Booking Status (e.g. ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED)
 */
export async function updateBookingStatusInFirestore(
  bookingId: string,
  newStatus: BookingStatus,
  extraData?: Partial<Booking> & { note?: string }
): Promise<void> {
  // Update local storage first
  const list = await getLocalBookings();
  const existing = list.find(b => b.id === bookingId);
  if (existing) {
    const updatedTimeline = existing.timeline || [];
    updatedTimeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: extraData?.note || `Status updated to ${newStatus}`,
    });
    const updatedBooking: Booking = {
      ...existing,
      status: newStatus,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
      ...(extraData?.providerId ? { providerId: extraData.providerId } : {}),
      ...(extraData?.providerName ? { providerName: extraData.providerName } : {}),
      ...(extraData?.providerPhone ? { providerPhone: extraData.providerPhone } : {}),
      ...(extraData?.paymentStatus ? { paymentStatus: extraData.paymentStatus as any } : {}),
    };
    await saveLocalBooking(updatedBooking);
  }

  // Update in Firestore
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const snap = await getDoc(bookingRef);
    
    if (snap.exists()) {
      const currentData = snap.data() as Booking;
      const currentTimeline = currentData.timeline || [];
      const newTimelineEvent = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: extraData?.note || `Status updated to ${newStatus}`,
      };

      const updatePayload: Record<string, any> = {
        status: newStatus,
        timeline: [...currentTimeline, newTimelineEvent],
        updatedAt: new Date().toISOString(),
      };

      if (extraData?.providerId) updatePayload.providerId = extraData.providerId;
      if (extraData?.providerName) updatePayload.providerName = extraData.providerName;
      if (extraData?.providerPhone) updatePayload.providerPhone = extraData.providerPhone;
      if (extraData?.paymentStatus) updatePayload.paymentStatus = extraData.paymentStatus;

      await updateDoc(bookingRef, updatePayload);
    }
  } catch (error) {
    console.warn("Firestore updateBookingStatus notice (local fallback updated):", error);
  }
}

/**
 * Submit Review for a completed booking
 */
export async function submitReviewToFirestore(review: Omit<Review, "id" | "createdAt">): Promise<string> {
  const reviewsRef = collection(db, "reviews");
  const docRef = await addDoc(reviewsRef, {
    ...review,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}
