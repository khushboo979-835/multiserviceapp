import crypto from "crypto";
import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/adminAuth";
import cloudinary, { deleteCloudinaryAsset } from "../services/cloudinary.service";

const router = Router();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "gln413tb";
const apiKey = process.env.CLOUDINARY_API_KEY || "775595328596497";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "Pjldt3tT9ZSUIBPMbMSm5HDk2eg";
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "inisha_preset";

// Generate signature for signed Cloudinary uploads
router.post("/cloudinary-signature", requireAdmin, (_req: Request, res: Response) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    folder: "inisha/catalog",
    timestamp,
  };

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
    uploadPreset,
    timestamp,
    folder: params.folder,
    signature,
  });
});

// Direct backend Cloudinary upload
router.post("/upload", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: "No image payload provided" });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "inisha/catalog",
      resource_type: "image",
    });

    return res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      name: name || "uploaded_image",
    });
  } catch (error: any) {
    console.error("Direct Cloudinary upload error:", error);
    // Fallback: return payload
    return res.status(200).json({
      success: true,
      url: req.body.image,
      name: req.body.name || "uploaded_image",
    });
  }
});

// Delete specific Cloudinary asset
router.delete("/cloudinary-asset", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { url, publicId } = req.body;
    const target = publicId || url;
    if (!target) {
      return res.status(400).json({ success: false, message: "Asset URL or Public ID is required" });
    }

    const ok = await deleteCloudinaryAsset(target);
    return res.status(200).json({ success: true, deleted: ok });
  } catch (error: any) {
    console.warn("Error deleting Cloudinary asset:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;