import crypto from "crypto";
import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();

router.post("/cloudinary-signature", requireAdmin, (_req: Request, res: Response) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(200).json({
      success: false,
      configured: false,
      message: "Cloudinary not configured. Fallback to direct client compression.",
    });
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
    configured: true,
    cloudName,
    apiKey,
    timestamp,
    folder: params.folder,
    signature,
  });
});

// Direct Image Upload / Storage endpoint
router.post("/upload", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: "No image payload provided" });
    }

    // Return the image data URI or stored reference
    return res.status(200).json({
      success: true,
      url: image,
      name: name || "uploaded_image",
    });
  } catch (error: any) {
    console.error("Direct upload error:", error);
    return res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
});

export default router;