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
  MoveLeft,
  MoveRight,
} from "lucide-react";
import apiClient from "../api/apiClient";

interface MultiImageUploadPickerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export default function MultiImageUploadPicker({
  images = [],
  onChange,
  maxImages = 6,
  label = "Product Gallery (Multi-Image)",
}: MultiImageUploadPickerProps) {
  const [uploading, setUploading] = useState(false);
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

    // Validate types & sizes
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} is not a valid image format.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB size limit.`);
        return;
      }
    }

    setUploading(true);
    setUploadError("");

    try {
      const { data: signature } = await apiClient.post("/media/cloudinary-signature");

      const uploadPromises = files.map(async (file) => {
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", signature.apiKey);
        body.append("timestamp", String(signature.timestamp));
        body.append("folder", signature.folder);
        body.append("signature", signature.signature);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
          {
            method: "POST",
            body,
          }
        );
        const result = await response.json();
        if (!response.ok || !result.secure_url) {
          throw new Error(result.error?.message || "Cloudinary upload failed");
        }
        return result.secure_url as string;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload images. Please check network.");
    } finally {
      setUploading(false);
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

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const item = images[indexToCover];
    const rest = images.filter((_, idx) => idx !== indexToCover);
    onChange([item, ...rest]);
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
                  ? "bg-slate-100 border-slate-300 cursor-not-allowed opacity-75"
                  : "border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/20"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1.5">
                <UploadCloud size={20} />
              </div>
              <span className="text-xs font-black text-slate-800">
                {uploading ? "Uploading images to Cloudinary..." : "Click to select multiple product photos"}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                PNG, JPG, WebP up to 5MB each
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
              className={`relative group rounded-xl border-2 overflow-hidden bg-slate-100 flex flex-col shadow-sm transition ${
                idx === 0 ? "border-emerald-500 bg-emerald-50/20" : "border-slate-200"
              }`}
            >
              <div className="aspect-square w-full relative bg-white">
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
                    <Star size={10} fill="#FFFFFF" /> Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    className="absolute top-1.5 left-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    Make Cover
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-lg flex items-center justify-center opacity-80 hover:opacity-100 transition shadow"
                  title="Remove Image"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="p-1.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 font-mono truncate text-center">
                Image {idx + 1}
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
