import { Router } from "express";
import {
  getShops,
  getNearbyShops,
  getShopById,
  createShop,
  updateShop,
  getShopDashboardStats,
  addShopItem,
} from "../controllers/shop.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Public routes for customers
router.get("/nearby", getNearbyShops);
router.get("/", getShops);
router.get("/:id", getShopById);

// Merchant / Admin dashboard analytics
router.get("/:id/dashboard", requireAuth, getShopDashboardStats);

// Shop Onboarding and Profile Management (Merchant or Super Admin)
router.post("/", requireAuth, createShop);
router.put("/:id", requireAuth, updateShop);

// Shop Item / Product CRUD
router.post("/:id/items", requireAuth, addShopItem);

export default router;
