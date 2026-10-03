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

router.get("/", async (_req: Request, res: Response) => {
  try {
    const banners = await BannerModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    return res.status(200).json({ success: true, banners });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to load banners" });
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