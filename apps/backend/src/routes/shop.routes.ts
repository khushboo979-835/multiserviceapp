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

const router = Router();

// Public routes for customers
router.get("/nearby", getNearbyShops);
router.get("/", getShops);
router.get("/:id", getShopById);
router.get("/:id/products", getShopProducts);

// Partner registration with KYC verification
router.post("/register", registerPartnerShop);

// Shop Approval & KYC Management (Admin / Internal)
router.put("/:id/approve", approveShop);
router.put("/:id/reject", rejectShop);

// Merchant / Admin dashboard analytics
router.get("/:id/dashboard", requireAuth, getShopDashboardStats);

// Shop Onboarding and Profile Management (Merchant or Super Admin)
router.post("/", createShop);
router.put("/:id", updateShop);

// Shop Item / Product CRUD
router.post("/:id/items", addShopItem);

export default router;
