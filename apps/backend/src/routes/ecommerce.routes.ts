import { Router, Request, Response } from "express";
import Product from "../models/Product";
import Coupon from "../models/Coupon";

const router = Router();

// GET /api/ecommerce/products - Get all products with optional category filter
router.get("/products", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let query: any = { inStock: true };

    if (category && category !== "ALL") {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { description: { $regex: search as string, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /api/ecommerce/products - Admin create product
router.post("/products", async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const newProduct = new Product(productData);
    await newProduct.save();
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ error: "Failed to create product" });
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
