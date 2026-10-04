import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "gln413tb";
const apiKey = process.env.CLOUDINARY_API_KEY || "775595328596497";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "Pjldt3tT9ZSUIBPMbMSm5HDk2eg";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Extracts Cloudinary public_id from a full URL
 * e.g., https://res.cloudinary.com/gln413tb/image/upload/v12345/inisha/catalog/sample.jpg
 * returns: inisha/catalog/sample
 */
export const extractPublicId = (imageUrl: string): string | null => {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  if (!imageUrl.includes("cloudinary.com")) return null;

  try {
    const parts = imageUrl.split("/upload/");
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1];
    // Remove version tag if present (e.g. v1728000000/)
    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    // Remove file extension (.jpg, .png, .webp, etc.)
    const publicId = withoutVersion.replace(/\.[^/.]+$/, "");
    return publicId;
  } catch (err) {
    console.warn("Failed to extract Cloudinary public_id:", err);
    return null;
  }
};

/**
 * Destroys a single asset on Cloudinary storage
 */
export const deleteCloudinaryAsset = async (urlOrPublicId: string): Promise<boolean> => {
  if (!urlOrPublicId) return false;
  const publicId = urlOrPublicId.includes("http") ? extractPublicId(urlOrPublicId) : urlOrPublicId;
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.warn(`Failed to destroy Cloudinary asset "${publicId}":`, error);
    return false;
  }
};

/**
 * Deletes multiple Cloudinary assets concurrently
 */
export const deleteCloudinaryAssets = async (urlsOrPublicIds: string[]): Promise<void> => {
  if (!Array.isArray(urlsOrPublicIds) || urlsOrPublicIds.length === 0) return;
  const validIds = urlsOrPublicIds
    .map((item) => (item.includes("http") ? extractPublicId(item) : item))
    .filter((id): id is string => Boolean(id));

  if (validIds.length === 0) return;

  try {
    await Promise.allSettled(validIds.map((id) => cloudinary.uploader.destroy(id)));
  } catch (error) {
    console.warn("Error in bulk Cloudinary deletion:", error);
  }
};

export default cloudinary;
