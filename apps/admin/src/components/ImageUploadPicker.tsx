import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Link, Check, Sparkles, Loader2 } from "lucide-react";
import apiClient from "../api/apiClient";

interface ImageUploadPickerProps {
  value: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  placeholderText?: string;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "gln413tb";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "inisha_preset";
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "775595328596497";

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

    setUploading(true);
    setUploadError("");

    try {
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

      const formData = new FormData();
      formData.append("file", file);

      if (signatureData?.signature) {
        formData.append("api_key", signatureData.apiKey || API_KEY);
        formData.append("timestamp", String(signatureData.timestamp));
        formData.append("folder", signatureData.folder || "inisha/catalog");
        formData.append("signature", signatureData.signature);
      } else {
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
        onChange(result.secure_url);
        return;
      }

      // Fallback to data URL
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Image upload error:", error);
      setUploadError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemoveImage = async () => {
    const oldUrl = value;
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (oldUrl && oldUrl.includes("cloudinary.com")) {
      try {
        await apiClient.delete("/media/cloudinary-asset", { data: { url: oldUrl } });
      } catch (err) {
        console.warn("Background asset deletion warning:", err);
      }
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 p-2 flex items-center gap-3">
          <img
            src={value}
            alt="Preview"
            className="w-16 h-16 rounded-xl object-contain border border-slate-200 shadow-sm bg-white p-1"
            onError={(event) => {
              event.currentTarget.src = "/brand-logo.png";
            }}
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" /> Image Selected
            </span>
            <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
              {value.startsWith("data:") ? "Local File / Gallery Photo" : value}
            </p>
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                {uploading ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  "Change Photo"
                )}
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
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer group text-center transition ${
            uploading
              ? "bg-red-50/40 border-red-300 cursor-not-allowed"
              : "border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/20"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
          </div>
          <span className="text-xs font-black text-slate-800">
            {uploading ? "Uploading to Cloudinary..." : "Click to Select from Gallery / File Manager"}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">
            Cloudinary gln413tb CDN (PNG, JPG, JPEG, WebP)
          </span>
        </div>
      ) : (
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
