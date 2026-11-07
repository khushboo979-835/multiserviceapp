import { Request, Response } from "express";
import Shop, { IShop } from "../models/Shop";
import Product from "../models/Product";
import Order from "../models/Order";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// Default seed shops if database has zero shops yet
const INITIAL_SHOPS = [
  {
    shopId: "shop_bihar_sweets_101",
    name: "Patna Special Sweets & Chaat",
    legalName: "Patna Special Sweets Private Limited",
    category: "SWEETS_BAKERY",
    subCategories: ["Sweets", "Snacks", "Bakery", "Chaat"],
    description: "Famous authentic Bihari sweets, hot Khaja, Gulab Jamun, Samosa and fresh daily bakery.",
    logoUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&q=80",
    phone: "+91 95078 60048",
    email: "sweets@inishacityservice.com",
    address: {
      street: "Main Market, Kidwaipuri",
      landmark: "Near Boring Road Crossing",
      city: "Patna",
      state: "Bihar",
      pincode: "800001",
    },
    location: {
      type: "Point",
      coordinates: [85.1376, 25.5941],
    },
    openingHours: {
      openTime: "08:00 AM",
      closeTime: "10:30 PM",
      isOpen: true,
      daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    deliverySettings: {
      deliveryModel: "INISHA_DELIVERY",
      radiusKm: 12,
      minOrderAmount: 99,
      baseDeliveryFee: 25,
      freeDeliveryThreshold: 399,
      estimatedPrepMins: 15,
    },
    commissionRate: 8,
    rating: 4.9,
    ratingsCount: 240,
    isVerified: true,
    isActive: true,
    featured: true,
  },
  {
    shopId: "shop_royal_biryani_102",
    name: "Royal Darbar Restaurant & Biryani",
    legalName: "Royal Darbar Foods & Hospitality",
    category: "RESTAURANT",
    subCategories: ["Biryani", "North Indian", "Mughlai", "Rolls"],
    description: "Authentic Dum Biryani, Paneer Tikka, Tandoori delicacies and rapid doorstep delivery.",
    logoUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80",
    phone: "+91 73520 82614",
    email: "royaldarbar@inishacityservice.com",
    address: {
      street: "Kankarbagh Main Road",
      landmark: "Opposite Domino's Pizza",
      city: "Patna",
      state: "Bihar",
      pincode: "800020",
    },
    location: {
      type: "Point",
      coordinates: [85.1585, 25.6022],
    },
    openingHours: {
      openTime: "11:00 AM",
      closeTime: "11:00 PM",
      isOpen: true,
      daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    deliverySettings: {
      deliveryModel: "HYBRID",
      radiusKm: 15,
      minOrderAmount: 149,
      baseDeliveryFee: 30,
      freeDeliveryThreshold: 499,
      estimatedPrepMins: 25,
    },
    commissionRate: 10,
    rating: 4.8,
    ratingsCount: 412,
    isVerified: true,
    isActive: true,
    featured: true,
  },
  {
    shopId: "shop_apna_grocery_103",
    name: "Apna Super Mart & Fresh Grocery",
    legalName: "Apna Retail Supermart LLP",
    category: "GROCERY",
    subCategories: ["Atta & Dal", "Oils & Ghee", "Spices", "Snacks", "Dairy"],
    description: "Daily fresh kitchen essentials, premium spices, dairy, packaged foods delivered in 20 minutes.",
    logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1000&q=80",
    phone: "+91 95078 60048",
    email: "apnagrocery@inishacityservice.com",
    address: {
      street: "Bailey Road, Saguna More",
      landmark: "Near Indian Oil Petrol Pump",
      city: "Danapur",
      state: "Bihar",
      pincode: "801503",
    },
    location: {
      type: "Point",
      coordinates: [85.0432, 25.6174],
    },
    openingHours: {
      openTime: "07:30 AM",
      closeTime: "10:30 PM",
      isOpen: true,
      daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    deliverySettings: {
      deliveryModel: "INISHA_DELIVERY",
      radiusKm: 10,
      minOrderAmount: 99,
      baseDeliveryFee: 20,
      freeDeliveryThreshold: 299,
      estimatedPrepMins: 15,
    },
    commissionRate: 6,
    rating: 4.8,
    ratingsCount: 180,
    isVerified: true,
    isActive: true,
    featured: true,
  },
  {
    shopId: "shop_chhotu_mobile_104",
    name: "Chhotu Mobile & Electronics Hub",
    legalName: "Chhotu Mobile / Inisha App Online Service",
    category: "MOBILE_ELECTRONICS",
    subCategories: ["Smartphones", "Chargers & Cables", "Audio & Neckbands", "Tempered Glass & Covers"],
    description: "Original branded smartphones, high-speed SuperVOOC chargers, Bluetooth neckbands, display repair parts and verified warranty.",
    logoUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1000&q=80",
    phone: "+91 73520 82614",
    email: "chhotumobile@inishacityservice.com",
    address: {
      street: "Upper Road, Suruchi Complex",
      landmark: "Near ICICI Bank",
      city: "Sultanganj",
      state: "Bihar",
      pincode: "813213",
    },
    location: {
      type: "Point",
      coordinates: [86.7386, 25.2425],
    },
    openingHours: {
      openTime: "09:00 AM",
      closeTime: "09:00 PM",
      isOpen: true,
      daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    deliverySettings: {
      deliveryModel: "HYBRID",
      radiusKm: 20,
      minOrderAmount: 99,
      baseDeliveryFee: 30,
      freeDeliveryThreshold: 499,
      estimatedPrepMins: 20,
    },
    commissionRate: 5,
    rating: 5.0,
    ratingsCount: 520,
    isVerified: true,
    isActive: true,
    featured: true,
  },
];

/**
 * Seed helper to guarantee initial real shops exist
 */
const ensureShopsSeeded = async () => {
  try {
    const count = await Shop.countDocuments();
    if (count === 0) {
      await Shop.insertMany(INITIAL_SHOPS);
      console.log(`✅ [Shops Initialized]: Seeded ${INITIAL_SHOPS.length} production shops`);
    }
  } catch (err: any) {
    console.warn("⚠️ Shop seed check notice:", err.message);
  }
};

/**
 * GET /api/shops
 * Get list of shops with optional filters (category, query, isActive)
 */
export const getShops = async (req: Request, res: Response) => {
  try {
    await ensureShopsSeeded();

    const { category, search, activeOnly = "true" } = req.query;
    const filter: any = {};

    if (activeOnly === "true") {
      filter.isActive = true;
    }

    if (category && category !== "ALL") {
      filter.category = String(category).toUpperCase();
    }

    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ name: regex }, { description: regex }, { subCategories: regex }, { "address.city": regex }];
    }

    const shops = await Shop.find(filter).sort({ featured: -1, rating: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: shops.length,
      shops,
    });
  } catch (error: any) {
    console.error("getShops error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve shops",
      error: error?.message,
    });
  }
};

/**
 * GET /api/shops/nearby
 * Geospatial lookup: Find shops within radiusKm from [lng, lat]
 */
export const getNearbyShops = async (req: Request, res: Response) => {
  try {
    await ensureShopsSeeded();

    const lat = parseFloat(req.query.lat as string) || 25.5941;
    const lng = parseFloat(req.query.lng as string) || 85.1376;
    const maxDistanceKm = parseFloat(req.query.radius as string) || 25; // 25 km search radius default
    const category = req.query.category as string;

    const query: any = {
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistanceKm * 1000, // convert km to meters
        },
      },
    };

    if (category && category !== "ALL") {
      query.category = category.toUpperCase();
    }

    let shops = [];
    try {
      shops = await Shop.find(query);
    } catch {
      // Fallback if 2dsphere index is warming or coordinate distance calculation
      const fallbackFilter: any = { isActive: true };
      if (category && category !== "ALL") fallbackFilter.category = category.toUpperCase();
      shops = await Shop.find(fallbackFilter).limit(20);
    }

    return res.status(200).json({
      success: true,
      userLocation: { lat, lng },
      radiusKm: maxDistanceKm,
      count: shops.length,
      shops,
    });
  } catch (error: any) {
    console.error("getNearbyShops error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby shops",
      error: error?.message,
    });
  }
};

/**
 * GET /api/shops/:id
 * Get single shop details + its active product catalog
 */
export const getShopById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findOne({
      $or: [{ shopId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }],
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    // Fetch products belonging to this shop
    const products = await Product.find({
      $or: [
        { shopId: shop.shopId },
        { sellerName: shop.name },
      ],
      inStock: true,
    }).sort({ rating: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      shop,
      products,
    });
  } catch (error: any) {
    console.error("getShopById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop details",
      error: error?.message,
    });
  }
};

/**
 * POST /api/shops
 * Onboard / create new shop (Admin or Registered Merchant)
 */
export const createShop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    const generatedId = body.shopId || `shop_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const newShop = await Shop.create({
      ...body,
      shopId: generatedId,
      ownerId: req.user?.id || body.ownerId,
      location: body.location?.coordinates
        ? { type: "Point", coordinates: body.location.coordinates }
        : { type: "Point", coordinates: [85.1376, 25.5941] },
      isActive: body.isActive !== undefined ? body.isActive : true,
      isVerified: body.isVerified !== undefined ? body.isVerified : true,
    });

    return res.status(201).json({
      success: true,
      message: "Shop registered successfully.",
      shop: newShop,
    });
  } catch (error: any) {
    console.error("createShop error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create shop",
      error: error?.message,
    });
  }
};

/**
 * PUT /api/shops/:id
 * Update shop details, opening status, delivery rules
 */
export const updateShop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const shop = await Shop.findOneAndUpdate(
      { $or: [{ shopId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }] },
      { $set: updates },
      { new: true }
    );

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully.",
      shop,
    });
  } catch (error: any) {
    console.error("updateShop error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shop",
      error: error?.message,
    });
  }
};

/**
 * GET /api/shops/:id/dashboard
 * Merchant dashboard analytics: today revenue, active orders count, total catalog items
 */
export const getShopDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findOne({
      $or: [{ shopId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }],
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayOrders, pendingOrders, totalProducts] = await Promise.all([
      Order.find({
        shopId: shop.shopId,
        createdAt: { $gte: startOfToday },
      }),
      Order.countDocuments({
        shopId: shop.shopId,
        status: { $in: ["PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP"] },
      }),
      Product.countDocuments({
        $or: [{ shopId: shop.shopId }, { sellerName: shop.name }],
      }),
    ]);

    const todaySales = todayOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    return res.status(200).json({
      success: true,
      shop: {
        id: shop.shopId,
        name: shop.name,
        category: shop.category,
        isOpen: shop.openingHours?.isOpen ?? true,
      },
      stats: {
        todayOrdersCount: todayOrders.length,
        todaySales,
        pendingOrdersCount: pendingOrders,
        totalProductsCount: totalProducts,
      },
    });
  } catch (error: any) {
    console.error("getShopDashboardStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch merchant stats",
      error: error?.message,
    });
  }
};

/**
 * POST /api/shops/:id/items
 * Merchant adds a product or food dish to their shop
 */
export const addShopItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findOne({ shopId: id });
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const body = req.body;
    const generatedId = body.id || `prod_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const product = await Product.create({
      ...body,
      id: generatedId,
      shopId: shop.shopId,
      shopName: shop.name,
      sellerName: shop.name,
      productType: body.productType || (shop.category === "RESTAURANT" ? "FOOD" : shop.category === "GROCERY" ? "GROCERY" : "RETAIL"),
      category: body.category || shop.category,
      categoryName: body.categoryName || shop.name,
      inStock: body.inStock !== undefined ? body.inStock : true,
    });

    return res.status(201).json({
      success: true,
      message: "Item added to catalog successfully.",
      product,
    });
  } catch (error: any) {
    console.error("addShopItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to shop",
      error: error?.message,
    });
  }
};
