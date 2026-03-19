import React, { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2, ImageIcon } from "lucide-react";

interface ProductImageUploadProps {
  productId: string;
  currentImages: string[];
  productName: string;
  onUploadSuccess: (newUrl: string) => void;
}

function getFallbackGradient(name: string): { gradient: string; emoji: string } {
  const t = name.toLowerCase();
  if (t.includes("marigold")) return { gradient: "from-amber-100 to-orange-200", emoji: "🌼" };
  if (t.includes("lotus")) return { gradient: "from-pink-100 to-purple-200", emoji: "🪷" };
  if (t.includes("rose")) return { gradient: "from-rose-100 to-pink-200", emoji: "🌹" };
  if (t.includes("jasmine") || t.includes("mogra") || t.includes("gajra")) return { gradient: "from-white to-yellow-50", emoji: "🌸" };
  if (t.includes("sunflower")) return { gradient: "from-yellow-100 to-amber-200", emoji: "🌻" };
  if (t.includes("orchid")) return { gradient: "from-purple-100 to-violet-200", emoji: "🌸" };
  if (t.includes("peony")) return { gradient: "from-pink-50 to-rose-100", emoji: "🌸" };
  if (t.includes("cherry") || t.includes("sakura")) return { gradient: "from-pink-100 to-rose-50", emoji: "🌸" };
  if (t.includes("chrysanthemum")) return { gradient: "from-yellow-50 to-amber-100", emoji: "💮" };
  if (t.includes("carnation")) return { gradient: "from-pink-100 to-red-100", emoji: "🌸" };
  return { gradient: "from-rose-50 to-pink-100", emoji: "🌸" };
}

export function ProductImageUpload({ productId, currentImages, productName, onUploadSuccess }: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImages?.[0] || null);
  const [imgError, setImgError] = useState(false);
  const fallback = getFallbackGradient(productName);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setImgError(false);
    setUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${productId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("fp-product-images")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("fp-product-images")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      const { error: updateErr } = await supabase
        .from("fp_products")
        .update({ images: [publicUrl] })
        .eq("id", productId);

      if (updateErr) throw updateErr;

      setPreview(publicUrl);
      onUploadSuccess(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error("Upload failed: " + (err?.message || "Unknown error"));
      setPreview(currentImages?.[0] || null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {/* Image preview */}
      <div
        className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer group"
        style={{ borderColor: "hsl(var(--fp-blush))" }}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {preview && !imgError ? (
          <img
            src={preview}
            alt={productName}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${fallback.gradient} flex flex-col items-center justify-center gap-2`}>
            <span className="text-5xl opacity-60">{fallback.emoji}</span>
            <p className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>No image yet</p>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-white" />
              <span className="text-white text-sm font-medium">Click to upload</span>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-colors disabled:opacity-50"
        style={{
          borderColor: "hsl(var(--fp-blush))",
          color: "hsl(var(--fp-forest)/0.7)",
        }}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        {uploading ? "Uploading…" : preview ? "Replace image" : "Upload image"}
      </button>
    </div>
  );
}
