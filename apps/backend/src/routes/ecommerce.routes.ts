import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import Coupon from "../models/Coupon";
import { requireAdmin } from "../middleware/adminAuth";
import { deleteCloudinaryAssets } from "../services/cloudinary.service";

const router = Router();

const buildProductQuery = (id: string) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ id }, { _id: id }] };
  }
  return { id };
};

const normalizeProductCategory = (value: unknown) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("foot") || normalized.includes("slipper") || normalized.includes("sandal") || normalized.includes("shoe")) return "FOOTWEAR";
  if (normalized.includes("saree") || normalized.includes("women") || normalized.includes("kurti") || normalized.includes("dress")) return "WOMENS_FASHION";
  if (normalized.includes("men") || normalized.includes("shirt") || normalized.includes("sock") || normalized.includes("t-shirt") || normalized.includes("pant")) return "MENS_FASHION";
  if (normalized.includes("groc") || normalized.includes("staple") || normalized.includes("dairy")) return "GROCERY";
  if (normalized.includes("accessor") || normalized.includes("wallet") || normalized.includes("cover") || normalized.includes("cable") || normalized.includes("glass")) return "MOBILE_ACCESSORIES";
  if (normalized.includes("phone") || normalized.includes("mobile")) return "MOBILE_PHONES";
  if (normalized.includes("beauty") || normalized.includes("salon") || normalized.includes("parlour") || normalized.includes("serum") || normalized.includes("facial")) return "BEAUTY_PARLOUR";
  if (normalized.includes("elect")) return "ELECTRONICS";
  if (normalized.includes("home")) return "HOME_NEEDS";
  return "MOBILE_ACCESSORIES";
};

// Default initial store products across all categories
const DEFAULT_PRODUCTS = [
  // 🩴 Reference App Footwear, Sarees & Lifestyle (Matching Client Mockup)
  {
    id: "prod_foot_1",
    name: "Slippers for Men (Black, 10)",
    category: "FOOTWEAR",
    categoryName: "Footwear & Slippers",
    description: "Comfortable ultra-light daily wear flip flops and slippers for men with soft anti-slip rubber sole.",
    price: 196,
    originalPrice: 499,
    mrp: 499,
    discountPercentage: 61,
    unit: "1 Pair",
    imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&q=80"],
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 25,
    sellerName: "Bansal Trading Co.",
    brand: "Footstar",
    offerTitle: "% Off up to ₹150",
    couponCode: "PREPAID_12",
    offerDescription: "Valid on prepaid orders • Tap for details",
    badgeText: "₹303 OFF",
  },
  {
    id: "prod_saree_1",
    name: "Jimmy Choo Solid Saree For Women, Yellow",
    category: "WOMENS_FASHION",
    categoryName: "Women's Sarees & Ethnic",
    description: "Elegant lightweight Jimmy Choo silk fabric saree with designer border and matching unstitched blouse piece.",
    price: 473,
    originalPrice: 799,
    mrp: 799,
    discountPercentage: 41,
    unit: "1 Pcs",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80"],
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 30,
    sellerName: "Pooja Sarees Varanasi",
    brand: "Ethnic Weaves",
    offerTitle: "% Off up to ₹150",
    couponCode: "PREPAID_12",
    offerDescription: "Valid on prepaid orders • Tap for details",
    badgeText: "₹326 OFF",
  },
  {
    id: "prod_acc_wallet",
    name: "Leather Wallet for Men (Multicolor)",
    category: "MOBILE_ACCESSORIES",
    categoryName: "Accessories & Wallets",
    description: "Premium handcrafted bifold leather wallet with RFID blocking, multiple card slots and coin pocket.",
    price: 177,
    originalPrice: 899,
    mrp: 899,
    discountPercentage: 80,
    unit: "1 Pcs",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80"],
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 20,
    sellerName: "Bansal Trading Co.",
    brand: "Urban Leather",
    offerTitle: "% Off up to ₹150",
    couponCode: "PREPAID_12",
    offerDescription: "Valid on prepaid orders • Tap for details",
    badgeText: "₹722 OFF",
  },
  {
    id: "prod_saree_2",
    name: "Georgette Solid Saree For Women, Purple",
    category: "WOMENS_FASHION",
    categoryName: "Women's Sarees & Ethnic",
    description: "Rich party wear georgette saree featuring intricate silver lace work and contrasting blouse.",
    price: 473,
    originalPrice: 799,
    mrp: 799,
    discountPercentage: 41,
    unit: "1 Pcs",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80"],
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 30,
    sellerName: "Kashi Textiles",
    brand: "Varanasi Silk Hub",
    badgeText: "₹326 OFF",
  },
  {
    id: "prod_mens_socks",
    name: "Cotton Socks for Men (Multicolor, Set of 6)",
    category: "MENS_FASHION",
    categoryName: "Men's Fashion",
    description: "Breathable combed cotton ankle socks with cushioned sole and anti-sweat mesh weave.",
    price: 160,
    originalPrice: 599,
    mrp: 599,
    discountPercentage: 73,
    unit: "Set of 6",
    imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&q=80"],
    inStock: true,
    rating: 4.7,
    deliveryTimeMins: 20,
    sellerName: "Bansal Trading Co.",
    brand: "ComfyFeet",
    badgeText: "₹439 OFF",
  },
  {
    id: "prod_saree_3",
    name: "Organza Embellished Saree For Women, Pink",
    category: "WOMENS_FASHION",
    categoryName: "Women's Sarees & Ethnic",
    description: "Soft organza floral printed festive saree with scalloped hand-embroidered border.",
    price: 474,
    originalPrice: 799,
    mrp: 799,
    discountPercentage: 41,
    unit: "1 Pcs",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80"],
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 30,
    sellerName: "Kashi Textiles",
    brand: "Shubhika Sarees",
    badgeText: "₹325 OFF",
  },
  {
    id: "prod_beauty_serum",
    name: "Turmeric Dark Spot Corrector Face Serum",
    category: "BEAUTY_PARLOUR",
    categoryName: "Beauty & Personal Care",
    description: "Natural turmeric and vitamin C oil glow serum for fading dark spots, pigmentation and brightening skin tone.",
    price: 256,
    originalPrice: 499,
    mrp: 499,
    discountPercentage: 49,
    unit: "30ml Dropper Bottle",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"],
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 20,
    sellerName: "PureAura Wellness",
    brand: "Glow Botanicals",
    offerTitle: "% Off up to ₹150",
    couponCode: "PREPAID_12",
    offerDescription: "Valid on prepaid orders • Tap for details",
    badgeText: "₹243 OFF",
  },
  {
    id: "prod_foot_2",
    name: "Casual Comfort Men's Sandals (Tan Brown)",
    category: "FOOTWEAR",
    categoryName: "Footwear & Slippers",
    description: "Durable adjustable strap outdoor walking sandals with contoured arch support footbed.",
    price: 349,
    originalPrice: 899,
    mrp: 899,
    discountPercentage: 61,
    unit: "1 Pair",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80"],
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 25,
    sellerName: "Bansal Trading Co.",
    brand: "Walkmate",
    badgeText: "₹550 OFF",
  },
  // 🛒 Grocery & Instant Essentials (10-Min Delivery)
  {
    id: "prod_groc_1",
    name: "Fortune Premium Kachi Ghani Pure Mustard Oil (1L)",
    category: "GROCERY",
    categoryName: "Grocery & Staples",
    description: "Cold pressed rich aroma authentic mustard oil for healthy everyday Indian cooking.",
    price: 145,
    originalPrice: 175,
    discountPercentage: 17,
    unit: "1 Litre Pouch",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 10,
  },
  {
    id: "prod_groc_2",
    name: "Aashirvaad Shudh Chakki Fresh Atta (10kg)",
    category: "GROCERY",
    categoryName: "Grocery & Staples",
    description: "100% whole wheat grain flour, high dietary fiber for ultra soft rotis.",
    price: 435,
    originalPrice: 490,
    discountPercentage: 11,
    unit: "10 kg Bag",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 15,
  },
  {
    id: "prod_groc_3",
    name: "India Gate Super Basmati Rice (5kg)",
    category: "GROCERY",
    categoryName: "Grocery & Staples",
    description: "Aged long grain aromatic basmati rice for royal biryani, pulao and daily meals.",
    price: 520,
    originalPrice: 650,
    discountPercentage: 20,
    unit: "5 kg Bag",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 15,
  },
  {
    id: "prod_groc_4",
    name: "Amul Pasteurised Pure Salted Butter (500g)",
    category: "GROCERY",
    categoryName: "Dairy & Breakfast",
    description: "The classic Utterly Butterly Delicious taste of pure cow & buffalo milk butter.",
    price: 275,
    originalPrice: 295,
    discountPercentage: 7,
    unit: "500g Block",
    imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 10,
  },
  {
    id: "prod_groc_5",
    name: "Amul Taaza Homogenised Toned Milk (1 Litre Tetra Pack)",
    category: "GROCERY",
    categoryName: "Dairy & Breakfast",
    description: "Fresh toned milk, rich in calcium and protein, zero preservatives.",
    price: 72,
    originalPrice: 76,
    discountPercentage: 5,
    unit: "1 Litre",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 10,
  },
  {
    id: "prod_groc_6",
    name: "Maggi 2-Minute Masala Instant Noodles (Pack of 12)",
    category: "GROCERY",
    categoryName: "Snacks & Instant Food",
    description: "India's favorite noodle with goodness of iron and signature aromatic spice mix.",
    price: 168,
    originalPrice: 192,
    discountPercentage: 12,
    unit: "840g (12 x 70g)",
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 10,
  },
  {
    id: "prod_groc_7",
    name: "Tata Salt Vacuum Evaporated Iodised Salt (1kg)",
    category: "GROCERY",
    categoryName: "Grocery & Staples",
    description: "Desh ka namak, vacuum evaporated pure white salt enriched with iodine.",
    price: 28,
    originalPrice: 30,
    discountPercentage: 7,
    unit: "1 kg Pouch",
    imageUrl: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 10,
  },

  // 📱 Mobile Phones & Devices
  {
    id: "prod_mob_1",
    name: "Apple iPhone 15 (128GB - Blue)",
    category: "MOBILE_PHONES",
    categoryName: "Mobile Phones",
    description: "Dynamic Island, 48MP Main Camera, A16 Bionic Chip, USB-C Charging with 1 Year Apple Warranty.",
    price: 65999,
    originalPrice: 79900,
    discountPercentage: 17,
    unit: "1 Unit",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 30,
    brand: "Apple",
  },
  {
    id: "prod_mob_2",
    name: "Samsung Galaxy S24 5G (8GB / 256GB)",
    category: "MOBILE_PHONES",
    categoryName: "Mobile Phones",
    description: "Galaxy AI, Circle to Search, 50MP Pro-visual Engine, Armor Aluminum with Gorilla Armor.",
    price: 74999,
    originalPrice: 84999,
    discountPercentage: 12,
    unit: "1 Unit",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 30,
    brand: "Samsung",
  },
  {
    id: "prod_mob_3",
    name: "OnePlus 12R 5G (16GB RAM / 256GB)",
    category: "MOBILE_PHONES",
    categoryName: "Mobile Phones",
    description: "Snapdragon 8 Gen 2, 4th Gen LTPO 120Hz ProXDR Display, 5500mAh Battery with 100W SUPERVOOC.",
    price: 42999,
    originalPrice: 45999,
    discountPercentage: 7,
    unit: "1 Unit",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 30,
    brand: "OnePlus",
  },
  {
    id: "prod_mob_4",
    name: "Redmi Note 13 Pro 5G (8GB / 128GB)",
    category: "MOBILE_PHONES",
    categoryName: "Mobile Phones",
    description: "200MP OIS Camera, 1.5K 120Hz Curved AMOLED, 67W Turbo Charge with 1 Year Warranty.",
    price: 18999,
    originalPrice: 23999,
    discountPercentage: 21,
    unit: "1 Unit",
    imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80",
    inStock: true,
    rating: 4.7,
    deliveryTimeMins: 30,
    brand: "Xiaomi / Redmi",
  },

  // 🔌 Mobile Accessories & Peripherals
  {
    id: "prod_acc_1",
    name: "65W SuperVOOC / Dash Fast Charger with Type-C Cable",
    category: "MOBILE_ACCESSORIES",
    categoryName: "Mobile Accessories",
    description: "Ultra-fast charging for OnePlus, Realme, Oppo, Samsung, Xiaomi with multi-layer surge protection.",
    price: 699,
    originalPrice: 1499,
    discountPercentage: 53,
    unit: "1 Pack",
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 15,
  },
  {
    id: "prod_acc_2",
    name: "9D Edge-to-Edge Tempered Glass (All Models)",
    category: "MOBILE_ACCESSORIES",
    categoryName: "Mobile Accessories",
    description: "Oleophobic coating, anti-fingerprint, scratch resistant, high touch sensitivity.",
    price: 199,
    originalPrice: 499,
    discountPercentage: 60,
    unit: "1 Piece",
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&q=80",
    inStock: true,
    rating: 4.7,
    deliveryTimeMins: 15,
  },
  {
    id: "prod_acc_3",
    name: "Shockproof Airbag Silicon Back Cover (Clear Anti-Yellow)",
    category: "MOBILE_ACCESSORIES",
    categoryName: "Mobile Accessories",
    description: "Military grade drop protection with raised camera bumper and crystal transparency.",
    price: 149,
    originalPrice: 399,
    discountPercentage: 63,
    unit: "1 Piece",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&q=80",
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 15,
  },

  // 💄 Beauty & Parlour Kits
  {
    id: "prod_beau_1",
    name: "VLCC Natural Science Gold Facial Kit (Salon Glow)",
    category: "BEAUTY_PARLOUR",
    categoryName: "Beauty & Parlour",
    description: "6-step gold radiance facial kit enriched with 24k gold bhasma for instant wedding glow.",
    price: 299,
    originalPrice: 375,
    discountPercentage: 20,
    unit: "60g Single Use Kit",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80",
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 20,
  },
  {
    id: "prod_beau_2",
    name: "L'Oreal Paris Mythic Oil Hair Spa Nourishing Cream (500ml)",
    category: "BEAUTY_PARLOUR",
    categoryName: "Beauty & Parlour",
    description: "Deep conditioning argan oil spa cream for silky smooth frizz-free salon hair at home.",
    price: 649,
    originalPrice: 850,
    discountPercentage: 24,
    unit: "500ml Tub",
    imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 20,
  },

  // 🏠 Home Needs & Appliances Spares
  {
    id: "prod_2",
    name: "Universal Split AC Copper Coil Jet Spray",
    category: "HOME_NEEDS",
    categoryName: "AC Spares",
    description: "Deep foam coil cleaner bottle with jet nozzle for instant cooling improvement.",
    price: 450,
    originalPrice: 699,
    discountPercentage: 35,
    unit: "500ml",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 30,
  },
  {
    id: "prod_3",
    name: "RO Sediment & Carbon Filter Membrane Kit",
    category: "HOME_NEEDS",
    categoryName: "Home Spares",
    description: "100 GPD high TDS filtration membrane set for pure drinking water.",
    price: 899,
    originalPrice: 1499,
    discountPercentage: 40,
    unit: "1 Set",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    inStock: true,
    rating: 4.7,
    deliveryTimeMins: 30,
  },

  // 🎧 Electronics & Electrical
  {
    id: "prod_4",
    name: "Heavy Duty 16A Modular Switch & Socket Box",
    category: "ELECTRONICS",
    categoryName: "Electrical",
    description: "Polycarbonate fire-resistant modular switch board with LED surge indicator.",
    price: 220,
    originalPrice: 350,
    discountPercentage: 37,
    unit: "1 Unit",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 30,
  },
  {
    id: "prod_elec_2",
    name: "Syska 12W B22 LED Cool White Light Bulb (Pack of 4)",
    category: "ELECTRONICS",
    categoryName: "Electrical",
    description: "6500K bright white daylight, 90% energy saving with 2 years warranty.",
    price: 349,
    originalPrice: 799,
    discountPercentage: 56,
    unit: "Pack of 4",
    imageUrl: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=500&q=80",
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 20,
  },
];

// Auto-seed initial catalog products if they do not exist
let isCatalogSeeded = false;
const seedInitialCatalog = async () => {
  if (isCatalogSeeded) return;
  try {
    for (const p of DEFAULT_PRODUCTS) {
      await Product.updateOne({ id: p.id }, { $setOnInsert: p }, { upsert: true });
    }
    // Automatically rectify mushroom category to GROCERY in database
    await Product.updateMany(
      { $or: [{ name: /mashroom/i }, { name: /mushroom/i }] },
      { $set: { category: "GROCERY", categoryName: "Grocery & Fresh Vegetables" } }
    );
    isCatalogSeeded = true;
    console.log("✅ [E-Commerce Seeder]: Multi-category live catalog seeded successfully in MongoDB Atlas.");
  } catch (err: any) {
    console.warn("⚠️ Catalog seed notice:", err.message);
  }
};
seedInitialCatalog();

// GET /api/ecommerce/products (and /api/products) - Get all products with optional category filter
router.get("/products", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let query: any = {};

    if (category && category !== "ALL" && category !== "all") {
      const catStr = String(category).trim();
      const catEscaped = catStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const catRegex = new RegExp(catEscaped, "i");
      
      const orConditions: any[] = [
        { category: catRegex },
        { categoryName: catRegex },
      ];
      
      const normalized = normalizeProductCategory(catStr);
      if (normalized) {
        orConditions.push({ category: normalized });
      }
      
      query.$or = orConditions;
    }
    if (search) {
      const searchRegex = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        ...(query.$or || []),
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(503).json({ success: false, message: "Unable to load products from the database" });
  }
});

// GET /api/ecommerce/products/:id - Get single product details
router.get("/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne(buildProductQuery(id));
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    return res.status(500).json({ success: false, message: "Failed to load product details" });
  }
});

// POST /api/ecommerce/products - Admin create product
router.post("/products", requireAdmin, async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const prodId = productData.id || `prod_${Date.now()}`;
    const images = Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : productData.imageUrl ? [productData.imageUrl] : [];
    const primaryImage = images[0] || productData.imageUrl || "";
    const price = Number(productData.price || 0);
    const originalPrice = Number(productData.originalPrice || productData.mrp || productData.price || 0);
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const product = await Product.findOneAndUpdate(
      { id: prodId },
      {
        ...productData,
        id: prodId,
        imageUrl: primaryImage,
        images: images.length > 0 ? images : [primaryImage],
        inStock: productData.inStock ?? true,
        stock: productData.stock !== undefined ? Number(productData.stock) : 100,
        category: normalizeProductCategory(productData.categoryName || productData.category),
        categoryName: productData.categoryName || productData.category || "General",
        price,
        originalPrice,
        mrp: originalPrice,
        discountPercentage: discount,
        variants: Array.isArray(productData.variants) ? productData.variants : [],
        specifications: Array.isArray(productData.specifications) ? productData.specifications : [],
        sellerName: productData.sellerName || "Inisha Retail Partner",
        brand: productData.brand || "",
      },
      { upsert: true, new: true }
    );

    const io = req.app.get("io");
    if (io) {
      const event = { action: "CREATE", id: prodId, product, timestamp: Date.now() };
      io.emit("product:change", event);
      io.emit("product:updated", { ...event, action: "CREATED" });
      io.emit("catalog_updated", { type: "PRODUCT_CREATED", ...event });
    }

    return res.status(201).json(product);
  } catch (error: any) {
    console.error("Error creating product:", error);
    return res.status(500).json({ error: error.message || "Failed to create product" });
  }
});

// PUT /api/ecommerce/products/:id - Admin update product
router.put("/products/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const existing = await Product.findOne({ $or: [{ id }, { _id: id }] });

    const images = Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : productData.imageUrl ? [productData.imageUrl] : undefined;
    const primaryImage = images ? images[0] : productData.imageUrl;

    // Check if any old images were removed in this update and clean up Cloudinary storage
    if (existing && Array.isArray(existing.images) && images) {
      const removedImages = existing.images.filter((oldImg: string) => !images.includes(oldImg));
      if (removedImages.length > 0) {
        deleteCloudinaryAssets(removedImages).catch((err) =>
          console.warn("Background asset cleanup warning:", err)
        );
      }
    }

    const price = productData.price !== undefined ? Number(productData.price) : undefined;
    const originalPrice = productData.mrp !== undefined
      ? Number(productData.mrp)
      : productData.originalPrice !== undefined
      ? Number(productData.originalPrice)
      : undefined;

    const updatePayload: any = {
      ...productData,
      category: productData.category !== undefined
        ? normalizeProductCategory(productData.categoryName || productData.category)
        : undefined,
      categoryName: productData.categoryName || productData.category || undefined,
      price,
      originalPrice,
      mrp: originalPrice,
      stock: productData.stock !== undefined ? Number(productData.stock) : undefined,
    };

    if (images) {
      updatePayload.images = images;
      if (primaryImage) updatePayload.imageUrl = primaryImage;
    } else if (productData.imageUrl) {
      updatePayload.imageUrl = productData.imageUrl;
    }

    if (price !== undefined && originalPrice !== undefined && originalPrice > 0) {
      updatePayload.discountPercentage = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    }

    const updated = await Product.findOneAndUpdate(
      buildProductQuery(id),
      { $set: updatePayload },
      { upsert: true, new: true }
    );

    const io = req.app.get("io");
    if (io) {
      const event = { action: "UPDATE", id, product: updated, timestamp: Date.now() };
      io.emit("product:change", event);
      io.emit("product:updated", { ...event, action: "UPDATED" });
      io.emit("catalog_updated", { type: "PRODUCT_UPDATED", ...event });
    }

    return res.status(200).json(updated);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: error.message || "Failed to update product" });
  }
});

// DELETE /api/ecommerce/products/:id - Admin delete product
router.delete("/products/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await Product.findOne(buildProductQuery(id));

    if (existing) {
      const allImages = [
        ...(Array.isArray(existing.images) ? existing.images : []),
        existing.imageUrl,
      ].filter((img): img is string => typeof img === "string" && Boolean(img));

      if (allImages.length > 0) {
        deleteCloudinaryAssets(allImages).catch((err) =>
          console.warn("Background asset cleanup warning:", err)
        );
      }
    }

    await Product.findOneAndDelete(buildProductQuery(id));

    const io = req.app.get("io");
    if (io) {
      const event = { action: "DELETE", id, timestamp: Date.now() };
      io.emit("product:change", event);
      io.emit("product:updated", { ...event, action: "DELETED" });
      io.emit("catalog_updated", { type: "PRODUCT_DELETED", ...event });
    }

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ error: error.message || "Failed to delete product" });
  }
});

// POST /api/ecommerce/coupons/apply - Validate and calculate discount
router.post("/coupons/apply", async (req: Request, res: Response) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    if (orderAmount < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = Math.round((orderAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    return res.status(200).json({
      valid: true,
      code: coupon.code,
      discountAmount: discount,
      finalAmount: Math.max(0, orderAmount - discount),
      description: coupon.description,
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return res.status(500).json({ error: "Failed to apply coupon" });
  }
});

export default router;
