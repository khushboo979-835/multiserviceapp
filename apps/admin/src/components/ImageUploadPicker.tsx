import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Link, Check, Sparkles } from "lucide-react";
import apiClient from "../api/apiClient";

interface ImageUploadPickerProps {
  value: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  placeholderText?: string;
}

// Helper to compress image client-side before upload or base64 storage
const compressImageFile = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
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
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function ImageUploadPicker({
  value,
  onChange,
  label = "Service / Product Image",
  placeholderText = "Upload image from Phone Gallery / Files or paste URL",
}: ImageUploadPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [activeTab, setActiveTab] = useState<"UPLOAD" | "URL">(
    value && value.startsWith("http") && !value.startsWith("data:") ? "URL" : "UPLOAD"
  );
  const [urlInput, setUrlInput] = useState(value && !value.startsWith("data:") ? value : "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WebP, GIF).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("Image size should be less than 15MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const compressedDataUrl = await compressImageFile(file);

      let cloudinarySignature: any = null;
      try {
        const { data } = await apiClient.post("/media/cloudinary-signature");
        if (data && data.configured && data.signature && data.cloudName) {
          cloudinarySignature = data;
        }
      } catch {
        cloudinarySignature = null;
      }

      if (cloudinarySignature) {
        try {
          const body = new FormData();
          body.append("file", file);
          body.append("api_key", cloudinarySignature.apiKey);
          body.append("timestamp", String(cloudinarySignature.timestamp));
          body.append("folder", cloudinarySignature.folder);
          body.append("signature", cloudinarySignature.signature);
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudinarySignature.cloudName)}/image/upload`,
            {
              method: "POST",
              body,
            }
          );
          const result = await response.json();
          if (response.ok && result.secure_url) {
            onChange(result.secure_url);
            return;
          }
        } catch (cloudErr) {
          console.warn("Cloudinary upload failed, using high-speed compressed image:", cloudErr);
        }
      }

      onChange(compressedDataUrl);
    } catch (error: any) {
      console.error("Image processing error:", error);
      setUploadError(error?.message || "Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
          {label}
        </label>
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
            📁 Gallery / File
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

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* If Image is selected: Show Preview Box */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 p-2 flex items-center gap-3">
          <img
            src={value}
            alt="Preview"
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm bg-white"
            onError={(event) => {
              event.currentTarget.src = "/brand-logo.png";
            }}
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" /> Image Selected
            </span>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {value.startsWith("data:") ? "Local File / Gallery Photo" : value}
            </p>
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                {uploading ? "Uploading..." : "Change Photo"}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition mr-1"
            title="Remove Image"
          >
            <X size={16} />
          </button>
        </div>
      ) : activeTab === "UPLOAD" ? (
        /* Upload from Gallery / Device View */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/20 transition rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <UploadCloud size={20} />
          </div>
          <span className="text-xs font-black text-slate-800">
            {uploading ? "Uploading image..." : "Click to Select from Gallery / File Manager"}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">
            Supports PNG, JPG, JPEG, WebP from phone or computer (Max 5MB)
          </span>
        </div>
      ) : (
        /* Paste Web URL View */
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-red-500"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold transition"
          >
            Apply
          </button>
        </div>
      )}
      {uploadError ? <p role="alert" className="text-xs font-medium text-red-600">{uploadError}</p> : null}
    </div>
  );
}
