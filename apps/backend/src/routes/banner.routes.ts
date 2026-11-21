import { Router, Request, Response } from "express";
import { BannerModel } from "../models/Banner";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();

const emitBannerUpdate = (req: Request, action: string, id?: string) => {
  const io = req.app.get("io");
  if (io) {
    const event = { action, id, timestamp: Date.now() };
    io.emit("banner:updated", event);
    io.emit("catalog_updated", { type: `BANNER_${action}`, id, timestamp: event.timestamp });
  }
};

const DEFAULT_OFFERS = [
  {
    title: "Flat 50% Off on Doorstep Mobile Repair",
    subtitle: "Certified technicians with 15 days warranty",
    tag: "MEGA OFFER",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    targetCategory: "Mobile Repair",
    isActive: true,
    order: 1,
  },
  {
    title: "30-Min Instant Food & Restaurant Delivery",
    subtitle: "Hot Biryani, Burgers & Local Delicacies",
    tag: "FOOD FEST",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    targetCategory: "Food",
    isActive: true,
    order: 2,
  },
  {
    title: "Fresh Groceries & Daily Essentials in 10 Mins",
    subtitle: "Fresh vegetables, dairy & staples at wholesale rates",
    tag: "EXPRESS",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    targetCategory: "Grocery",
    isActive: true,
    order: 3,
  },
  {
    title: "AC Deep Cleaning & Gas Refill from ₹499",
    subtitle: "Beat the heat with 100% cooling guarantee",
    tag: "SUMMER SPECIAL",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    targetCategory: "AC Repair",
    isActive: true,
    order: 4,
  },
];

router.get("/", async (_req: Request, res: Response) => {
  try {
    let banners = await BannerModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    if (!banners || banners.length === 0) {
      await BannerModel.insertMany(DEFAULT_OFFERS).catch(() => {});
      banners = await BannerModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    }
    const resultList = banners && banners.length > 0 ? banners : DEFAULT_OFFERS;
    return res.status(200).json({ success: true, banners: resultList, offers: resultList });
  } catch {
    return res.status(200).json({ success: true, banners: DEFAULT_OFFERS, offers: DEFAULT_OFFERS, fallback: true });
  }
});

router.get("/admin", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const banners = await BannerModel.find().sort({ order: 1, createdAt: -1 }).lean();
    return res.status(200).json({ success: true, banners });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to load banners" });
  }
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const banner = await BannerModel.create(req.body);
    emitBannerUpdate(req, "CREATED", banner._id.toString());
    return res.status(201).json({ success: true, banner });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || "Unable to create banner" });
  }
});

router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const banner = await BannerModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
    emitBannerUpdate(req, "UPDATED", banner._id.toString());
    return res.status(200).json({ success: true, banner });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || "Unable to update banner" });
  }
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const banner = await BannerModel.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
    emitBannerUpdate(req, "DELETED", banner._id.toString());
    return res.status(200).json({ success: true, message: "Banner deleted" });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to delete banner" });
  }
});

export default router;