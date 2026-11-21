import { Router } from "express";
import {
  getShops,
  getNearbyShops,
  getShopById,
  getShopProducts,
  createShop,
  registerPartnerShop,
  updateShop,
  approveShop,
  rejectShop,
  getShopDashboardStats,
  addShopItem,
} from "../controllers/shop.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();

// Public routes for customers
router.get("/nearby", getNearbyShops);
router.get("/", getShops);
router.get("/:id", getShopById);
router.get("/:id/products", getShopProducts);

// Partner registration with KYC verification (Public Onboarding)
router.post("/register", registerPartnerShop);

// Shop Approval & KYC Management (Admin Only)
router.put("/:id/approve", requireAdmin, approveShop);
router.put("/:id/reject", requireAdmin, rejectShop);

// Merchant / Admin dashboard analytics
router.get("/:id/dashboard", requireAuth, getShopDashboardStats);

// Shop Creation & Management (Admin Only from Web Admin Panel)
router.post("/", requireAdmin, createShop);
router.put("/:id", requireAdmin, updateShop);

// Shop Item / Product CRUD
router.post("/:id/items", requireAdmin, addShopItem);

export default router;
