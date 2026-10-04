import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Link as LinkIcon,
  Check,
  Star,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import apiClient from "../api/apiClient";

interface MultiImageUploadPickerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "gln413tb";
const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "inisha_preset";
const API_KEY =
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "775595328596497";

// Helper to compress image client-side before upload to speed up network transfer (<2 seconds)
const compressImageFile = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function MultiImageUploadPicker({
  images = [],
  onChange,
  maxImages = 6,
  label = "Product Gallery (Multi-Image)",
}: MultiImageUploadPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<"UPLOAD" | "URL">("UPLOAD");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`You can upload a maximum of ${maxImages} images per product.`);
      return;
    }

    // Validate image types
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`File "${file.name}" is not a supported image format.`);
        return;
      }
    }

    setUploading(true);
    setUploadError("");
    setUploadProgress(`Compressing & Uploading ${files.length} photo(s)...`);

    try {
      // 1. Fetch signature or unsigned preset configuration
      let signatureData: any = null;
      try {
        const { data } = await apiClient.post("/media/cloudinary-signature");
        if (data && data.success) {
          signatureData = data;
        }
      } catch {
        signatureData = null;
      }

      const activeCloud = signatureData?.cloudName || CLOUD_NAME;
      const activePreset = signatureData?.uploadPreset || UPLOAD_PRESET;

      // 2. Upload all images concurrently via Promise.all
      const uploadPromises = files.map(async (file, index) => {
        const compressedBlob = await compressImageFile(file);
        const formData = new FormData();
        formData.append("file", compressedBlob, file.name);

        if (signatureData?.signature) {
          // Signed upload
          formData.append("api_key", signatureData.apiKey || API_KEY);
          formData.append("timestamp", String(signatureData.timestamp));
          formData.append("folder", signatureData.folder || "inisha/catalog");
          formData.append("signature", signatureData.signature);
        } else {
          // Unsigned preset upload
          formData.append("upload_preset", activePreset);
          formData.append("folder", "inisha/catalog");
        }

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${encodeURIComponent(activeCloud)}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        if (response.ok && result.secure_url) {
          return result.secure_url as string;
        }

        // Fallback: Read as optimized Base64 data URL
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve("");
          reader.readAsDataURL(compressedBlob);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => typeof url === "string" && url.trim().length > 0);

      onChange([...images, ...validUrls].slice(0, maxImages));
    } catch (err: any) {
      console.error("Multi-image upload error:", err);
      setUploadError(err?.message || "Upload encountered an issue. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (images.length >= maxImages) {
      alert(`Maximum of ${maxImages} images allowed.`);
      return;
    }
    onChange([...images, trimmed]);
    setUrlInput("");
  };

  const handleRemoveImage = async (indexToRemove: number) => {
    const urlToRemove = images[indexToRemove];
    onChange(images.filter((_, idx) => idx !== indexToRemove));

    // Cleanup from Cloudinary storage in background if it's a Cloudinary asset
    if (urlToRemove && urlToRemove.includes("cloudinary.com")) {
      try {
        await apiClient.delete("/media/cloudinary-asset", {
          data: { url: urlToRemove },
        });
      } catch (err) {
        console.warn("Background asset cleanup warning:", err);
      }
    }
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const item = images[indexToCover];
    const rest = images.filter((_, idx) => idx !== indexToCover);
    onChange([item, ...rest]);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[index - 1];
    newImages[index - 1] = newImages[index];
    newImages[index] = temp;
    onChange(newImages);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index + 1];
    newImages[index + 1] = newImages[index];
    newImages[index] = temp;
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
            {label}
          </label>
          <span className="text-[10px] text-slate-500">
            {images.length}/{maxImages} Photos uploaded • First image is the Main Cover
          </span>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("UPLOAD")}
            className={`px-2.5 py-1 rounded-md transition ${
              activeTab === "UPLOAD"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            📁 Device Files
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("URL")}
            className={`px-2.5 py-1 rounded-md transition ${
              activeTab === "URL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🔗 Web URL
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Upload Box if under limit */}
      {images.length < maxImages && (
        <>
          {activeTab === "UPLOAD" ? (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                uploading
                  ? "bg-red-50/40 border-red-300 cursor-not-allowed"
                  : "border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/20"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1.5">
                {uploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <UploadCloud size={20} />
                )}
              </div>
              <span className="text-xs font-black text-slate-800">
                {uploading
                  ? uploadProgress || "Uploading images to Cloudinary..."
                  : "Click to select 3–5 high-res product photos"}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                High-Speed Cloudinary Upload Preset (PNG, JPG, WebP)
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          )}
        </>
      )}

      {/* Uploaded Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {images.map((url, idx) => (
            <div
              key={idx}
              className={`relative group rounded-2xl border-2 overflow-hidden bg-slate-100 flex flex-col shadow-sm transition ${
                idx === 0
                  ? "border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="aspect-square w-full relative bg-white flex items-center justify-center">
                <img
                  src={url}
                  alt={`Product view ${idx + 1}`}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.src = "/brand-logo.png";
                  }}
                />

                {/* Primary Cover Badge */}
                {idx === 0 ? (
                  <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                    <Star size={10} fill="#FFFFFF" /> Cover Photo
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    className="absolute top-1.5 left-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    Make Cover
                  </button>
                )}

                {/* Reorder Buttons (Move Left / Right) */}
                <div className="absolute bottom-1.5 left-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveLeft(idx)}
                      className="w-5 h-5 rounded bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center text-[10px]"
                      title="Move Left"
                    >
                      <ChevronLeft size={12} />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveRight(idx)}
                      className="w-5 h-5 rounded bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center text-[10px]"
                      title="Move Right"
                    >
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-lg flex items-center justify-center opacity-80 hover:opacity-100 transition shadow"
                  title="Remove Image"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="p-1.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 font-mono truncate text-center flex items-center justify-between px-2">
                <span>Photo {idx + 1}</span>
                {url.includes("cloudinary.com") && (
                  <span className="text-[8px] bg-sky-100 text-sky-700 px-1 rounded font-bold">
                    Cloudinary
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadError && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {uploadError}
        </p>
      )}
    </div>
  );
}
