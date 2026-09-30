import { Router, Request, Response } from "express";
import Product from "../models/Product";
import Coupon from "../models/Coupon";

const router = Router();

// Default initial store products
const DEFAULT_PRODUCTS = [
  {
    id: "prod_1",
    name: "iPhone 13 / 14 OLED Display Screen (OEM)",
    category: "MOBILE_ACCESSORIES",
    categoryName: "Mobile Accessories",
    description: "Original replacement OLED panel with true tone support",
    price: 2499,
    originalPrice: 3999,
    discountPercentage: 38,
    unit: "1 Pc",
    imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80",
    inStock: true,
    rating: 4.8,
    deliveryTimeMins: 30,
  },
  {
    id: "prod_2",
    name: "Universal Split AC Copper Coil Jet Spray",
    category: "HOME_NEEDS",
    categoryName: "AC Spares",
    description: "Deep foam coil cleaner bottle with jet nozzle",
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
    description: "100 GPD high TDS filtration membrane set",
    price: 899,
    originalPrice: 1499,
    discountPercentage: 40,
    unit: "1 Set",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    inStock: true,
    rating: 4.7,
    deliveryTimeMins: 30,
  },
  {
    id: "prod_4",
    name: "Heavy Duty 16A Modular Switch & Socket Box",
    category: "ELECTRONICS",
    categoryName: "Electrical",
    description: "Polycarbonate fire-resistant modular switch board",
    price: 220,
    originalPrice: 350,
    discountPercentage: 37,
    unit: "1 Unit",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
    inStock: true,
    rating: 4.9,
    deliveryTimeMins: 30,
  },
];

// GET /api/ecommerce/products - Get all products with optional category filter
router.get("/products", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let query: any = {};

    if (category && category !== "ALL") {
      query.$or = [{ category }, { categoryName: category }];
    }
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { description: { $regex: search as string, $options: "i" } },
      ];
    }

    let products = await Product.find(query).sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      try {
        await Product.insertMany(DEFAULT_PRODUCTS);
        products = await Product.find(query).sort({ createdAt: -1 });
      } catch {
        // Fallback
      }
    }

    return res.status(200).json(products && products.length > 0 ? products : DEFAULT_PRODUCTS);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(200).json(DEFAULT_PRODUCTS);
  }
});

// POST /api/ecommerce/products - Admin create product
router.post("/products", async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const prodId = productData.id || `prod_${Date.now()}`;
    const product = await Product.findOneAndUpdate(
      { id: prodId },
      {
        ...productData,
        id: prodId,
        inStock: productData.inStock ?? true,
        category: productData.category || "MOBILE_ACCESSORIES",
        categoryName: productData.categoryName || productData.category || "General",
        price: Number(productData.price || 0),
        originalPrice: Number(productData.originalPrice || productData.mrp || productData.price || 0),
      },
      { upsert: true, new: true }
    );
    return res.status(201).json(product);
  } catch (error: any) {
    console.error("Error creating product:", error);
    return res.status(500).json({ error: error.message || "Failed to create product" });
  }
});

// PUT /api/ecommerce/products/:id - Admin update product
router.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const updated = await Product.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      {
        $set: {
          ...productData,
          price: productData.price !== undefined ? Number(productData.price) : undefined,
          originalPrice: productData.mrp !== undefined ? Number(productData.mrp) : (productData.originalPrice !== undefined ? Number(productData.originalPrice) : undefined),
          stock: productData.stock !== undefined ? Number(productData.stock) : undefined,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json(updated);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: error.message || "Failed to update product" });
  }
});

// DELETE /api/ecommerce/products/:id - Admin delete product
router.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Product.findOneAndDelete({ $or: [{ id }, { _id: id }] });
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
