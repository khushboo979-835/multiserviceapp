import crypto from "crypto";
import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();

router.post("/cloudinary-signature", requireAdmin, (_req: Request, res: Response) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(503).json({ success: false, message: "Cloudinary image upload is not configured" });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: "inisha/catalog", timestamp };
  const signatureInput = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const signature = crypto.createHmac("sha1", apiSecret).update(signatureInput).digest("hex");

  return res.status(200).json({
    success: true,
    cloudName,
    apiKey,
    timestamp,
    folder: params.folder,
    signature,
  });
});

export default router;