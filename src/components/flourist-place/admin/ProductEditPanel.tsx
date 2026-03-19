import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductImageUpload } from "./ProductImageUpload";
import type { FPCategory } from "@/hooks/useFleuristProducts";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  mrp: string;
  category_id: string;
  tags: string;
  is_perishable: boolean;
  prep_time_days: string;
  inventory_count: string;
  is_active: boolean;
  shipping_class: string;
  images: string[];
}

interface ProductEditPanelProps {
  product: any | null; // null = create mode
  categories: FPCategory[];
  onClose: () => void;
  onSaved: () => void;
}

const defaultForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  mrp: "",
  category_id: "",
  tags: "",
  is_perishable: true,
  prep_time_days: "1",
  inventory_count: "10",
  is_active: true,
  shipping_class: "perishable",
  images: [],
};

export function ProductEditPanel({ product, categories, onClose, onSaved }: ProductEditPanelProps) {
  const isEdit = !!product;
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: String(product.price || ""),
        mrp: String(product.mrp || ""),
        category_id: product.category_id || "",
        tags: (product.tags || []).join(", "),
        is_perishable: product.is_perishable ?? true,
        prep_time_days: String(product.prep_time_days || 1),
        inventory_count: String(product.inventory_count || 0),
        is_active: product.is_active ?? true,
        shipping_class: product.shipping_class || "perishable",
        images: product.images || [],
      });
      setSavedId(product.id);
    } else {
      setForm(defaultForm);
      setSavedId(null);
    }
  }, [product]);

  function set(key: keyof ProductForm, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        mrp: form.mrp ? parseFloat(form.mrp) : null,
        category_id: form.category_id || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        is_perishable: form.is_perishable,
        prep_time_days: parseInt(form.prep_time_days) || 1,
        inventory_count: parseInt(form.inventory_count) || 0,
        is_active: form.is_active,
        shipping_class: form.shipping_class,
        images: form.images,
      };

      if (isEdit && product?.id) {
        const { error } = await supabase.from("fp_products").update(payload).eq("id", product.id);
        if (error) throw error;
        toast.success("Product updated!");
      } else {
        const { data, error } = await supabase.from("fp_products").insert(payload).select("id").single();
        if (error) throw error;
        setSavedId(data.id);
        toast.success("Product created!");
      }
      onSaved();
    } catch (err: any) {
      toast.error("Save failed: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  // Sync shipping_class with is_perishable
  function handlePerishableToggle(val: boolean) {
    set("is_perishable", val);
    set("shipping_class", val ? "perishable" : "lasting");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg h-full overflow-y-auto shadow-2xl"
        style={{ background: "hsl(var(--fp-cream)/0.98)" }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "white", borderColor: "hsl(var(--fp-blush)/0.3)" }}
        >
          <h2 className="font-serif text-xl font-bold" style={{ color: "hsl(var(--fp-forest))" }}>
            {isEdit ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-fp-blush/20 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: "hsl(var(--fp-forest)/0.6)" }} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image upload — only show after product is saved (has an ID) */}
          {(isEdit || savedId) && (
            <div className="space-y-1">
              <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Product Image</Label>
              <ProductImageUpload
                productId={savedId || product?.id}
                currentImages={form.images}
                productName={form.name}
                onUploadSuccess={(url) => set("images", [url])}
              />
            </div>
          )}

          {!isEdit && !savedId && (
            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: "hsl(var(--fp-blush)/0.3)", color: "hsl(var(--fp-forest)/0.7)" }}
            >
              💡 Save the product first, then you can upload an image.
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Product Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Marigold Pooja Garland"
              className="border-fp-blush focus-visible:ring-fp-rose"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the product..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2"
              style={{
                borderColor: "hsl(var(--fp-blush))",
                "--tw-ring-color": "hsl(var(--fp-rose))",
              } as React.CSSProperties}
            />
          </div>

          {/* Price + MRP */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Price ($) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="border-fp-blush focus-visible:ring-fp-rose"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>MRP / Was ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.mrp}
                onChange={(e) => set("mrp", e.target.value)}
                className="border-fp-blush focus-visible:ring-fp-rose"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Category</Label>
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className="w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "hsl(var(--fp-blush))",
                color: "hsl(var(--fp-forest))",
              }}
            >
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Tags (comma-separated)</Label>
            <Input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="wedding, pooja, marigold, fresh"
              className="border-fp-blush focus-visible:ring-fp-rose"
            />
          </div>

          {/* Perishable + Prep time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Type</Label>
              <div className="flex items-center gap-3 h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_perishable}
                    onChange={(e) => handlePerishableToggle(e.target.checked)}
                    className="accent-fp-rose w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: "hsl(var(--fp-forest))" }}>Fresh / Perishable</span>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Prep Time (days)</Label>
              <Input
                type="number"
                min="0"
                value={form.prep_time_days}
                onChange={(e) => set("prep_time_days", e.target.value)}
                className="border-fp-blush focus-visible:ring-fp-rose"
              />
            </div>
          </div>

          {/* Inventory + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Stock Count</Label>
              <Input
                type="number"
                min="0"
                value={form.inventory_count}
                onChange={(e) => set("inventory_count", e.target.value)}
                className="border-fp-blush focus-visible:ring-fp-rose"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Status</Label>
              <div className="flex items-center gap-3 h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => set("is_active", e.target.checked)}
                    className="accent-fp-rose w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: "hsl(var(--fp-forest))" }}>Active / Visible</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-60"
            style={{ background: "hsl(var(--fp-rose))" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
