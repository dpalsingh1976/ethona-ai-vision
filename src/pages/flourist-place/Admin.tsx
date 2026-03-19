import React, { useState, useEffect, useCallback } from "react";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { supabase } from "@/integrations/supabase/client";
import {
  Settings, MapPin, Package, RefreshCw, Save, Plus, Trash2,
  Edit2, ChevronDown, ChevronUp, ShoppingBag, LayoutGrid, Loader2,
  Check, X, Minus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProductEditPanel } from "@/components/flourist-place/admin/ProductEditPanel";
import { ProductImageUpload } from "@/components/flourist-place/admin/ProductImageUpload";
import type { FPCategory } from "@/hooks/useFleuristProducts";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "products" | "settings" | "locations" | "inventory" | "orders";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  hours: string | null;
  is_active: boolean;
}

const emptyLocation: Omit<Location, "id" | "is_active"> = {
  name: "", address: "", city: "", state: "", zip: "", phone: "", hours: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFallbackGradient(name: string = ""): { gradient: string; emoji: string } {
  const t = name.toLowerCase();
  if (t.includes("marigold")) return { gradient: "from-amber-100 to-orange-200", emoji: "🌼" };
  if (t.includes("lotus")) return { gradient: "from-pink-100 to-purple-200", emoji: "🪷" };
  if (t.includes("rose")) return { gradient: "from-rose-100 to-pink-200", emoji: "🌹" };
  if (t.includes("sunflower")) return { gradient: "from-yellow-100 to-amber-200", emoji: "🌻" };
  if (t.includes("orchid")) return { gradient: "from-purple-100 to-violet-200", emoji: "🌸" };
  if (t.includes("jasmine") || t.includes("mogra")) return { gradient: "from-white to-yellow-50", emoji: "🌸" };
  return { gradient: "from-rose-50 to-pink-100", emoji: "🌸" };
}

function stockColor(count: number) {
  if (count <= 5) return "text-red-600 bg-red-50";
  if (count <= 10) return "text-amber-600 bg-amber-50";
  return "text-green-700 bg-green-50";
}

function statusColor(status: string) {
  switch (status) {
    case "confirmed": return "bg-blue-100 text-blue-700";
    case "shipped": return "bg-purple-100 text-purple-700";
    case "delivered": return "bg-green-100 text-green-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-amber-100 text-amber-700";
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FlouristPlaceAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [loading, setLoading] = useState(true);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<FPCategory[]>([]);
  const [editProduct, setEditProduct] = useState<any | null>(undefined); // undefined=closed, null=create
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<Record<string, any>>({});

  // Pickup locations
  const [locations, setLocations] = useState<Location[]>([]);
  const [editLoc, setEditLoc] = useState<string | null>(null); // id being edited
  const [editLocForm, setEditLocForm] = useState<Omit<Location, "id" | "is_active">>(emptyLocation);
  const [addingLoc, setAddingLoc] = useState(false);
  const [newLocForm, setNewLocForm] = useState<Omit<Location, "id" | "is_active">>(emptyLocation);

  // Inventory
  const [invProducts, setInvProducts] = useState<any[]>([]);
  const [invChanges, setInvChanges] = useState<Record<string, number>>({});

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [
      { data: settingsRows },
      { data: locs },
      { data: prods },
      { data: cats },
      { data: ords },
    ] = await Promise.all([
      supabase.from("fp_admin_settings").select("key, value"),
      supabase.from("fp_pickup_locations").select("*").order("name"),
      supabase.from("fp_products").select("*, fp_categories(id,name,slug,icon)").order("name"),
      supabase.from("fp_categories").select("*").order("display_order"),
      supabase.from("fp_orders").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    const s: Record<string, any> = {};
    for (const row of settingsRows || []) {
      s[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    }
    setSettings(s);
    setLocations(locs || []);
    setProducts(prods || []);
    setInvProducts(prods?.filter((p) => p.is_active) || []);
    setCategories(cats || []);
    setOrders(ords || []);
    setLoading(false);
  }

  // ─── Settings ───────────────────────────────────────────────────────────────

  const [blackoutDate, setBlackoutDate] = useState<Date | undefined>(undefined);

  async function saveSettings() {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from("fp_admin_settings")
          .upsert({ key, value: typeof value === "object" ? value : value }, { onConflict: "key" });
      }
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  }

  function addBlackout() {
    if (!blackoutDate) return;
    const iso = format(blackoutDate, "yyyy-MM-dd");
    const existing: string[] = settings.holiday_blackouts || [];
    if (existing.includes(iso)) return;
    setSettings((s) => ({ ...s, holiday_blackouts: [...existing, iso].sort() }));
    setBlackoutDate(undefined);
  }

  function removeBlackout(date: string) {
    setSettings((s) => ({
      ...s,
      holiday_blackouts: (s.holiday_blackouts || []).filter((d: string) => d !== date),
    }));
  }

  // ─── Locations ──────────────────────────────────────────────────────────────

  async function saveNewLocation() {
    if (!newLocForm.name || !newLocForm.address) { toast.error("Name and address required"); return; }
    const { error } = await supabase.from("fp_pickup_locations").insert({ ...newLocForm, is_active: true });
    if (error) { toast.error("Failed to add location"); return; }
    toast.success("Location added!");
    setAddingLoc(false);
    setNewLocForm(emptyLocation);
    loadAll();
  }

  async function saveEditLocation(id: string) {
    const { error } = await supabase.from("fp_pickup_locations").update(editLocForm).eq("id", id);
    if (error) { toast.error("Failed to update location"); return; }
    toast.success("Location updated!");
    setEditLoc(null);
    loadAll();
  }

  async function deleteLocation(id: string) {
    const { error } = await supabase.from("fp_pickup_locations").delete().eq("id", id);
    if (error) { toast.error("Failed to delete location"); return; }
    toast.success("Location deleted");
    loadAll();
  }

  async function toggleLocation(id: string, isActive: boolean) {
    await supabase.from("fp_pickup_locations").update({ is_active: isActive }).eq("id", id);
    setLocations((prev) => prev.map((l) => l.id === id ? { ...l, is_active: isActive } : l));
  }

  // ─── Products ───────────────────────────────────────────────────────────────

  async function deleteProduct(id: string) {
    const { error } = await supabase.from("fp_products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete product"); return; }
    toast.success("Product deleted");
    setDeleteConfirm(null);
    loadAll();
  }

  // ─── Inventory ──────────────────────────────────────────────────────────────

  function changeInv(id: string, delta: number) {
    const current = invChanges[id] ?? invProducts.find((p) => p.id === id)?.inventory_count ?? 0;
    setInvChanges((prev) => ({ ...prev, [id]: Math.max(0, current + delta) }));
  }

  function setInvDirect(id: string, val: number) {
    setInvChanges((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  }

  async function saveAllInventory() {
    const entries = Object.entries(invChanges);
    if (!entries.length) { toast.info("No changes to save"); return; }
    let ok = 0;
    for (const [id, count] of entries) {
      const { error } = await supabase.from("fp_products").update({ inventory_count: count }).eq("id", id);
      if (!error) ok++;
    }
    toast.success(`Updated ${ok} product(s)`);
    setInvChanges({});
    loadAll();
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────

  async function updateOrderStatus(id: string, status: string) {
    const { error } = await supabase.from("fp_orders").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    toast.success("Order status updated");
  }

  // ─── Tabs config ────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "products", label: "Products", icon: LayoutGrid },
    { id: "settings", label: "Business Rules", icon: Settings },
    { id: "locations", label: "Pickup Locations", icon: MapPin },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: "hsl(var(--fp-cream)/0.3)" }}>
      <FPNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold" style={{ color: "hsl(var(--fp-forest))" }}>
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
              Manage your FlouristPlace catalog & business rules
            </p>
          </div>
          <button
            onClick={loadAll}
            className="p-2 rounded-xl border transition-colors"
            style={{ borderColor: "hsl(var(--fp-blush))" }}
          >
            <RefreshCw className="w-4 h-4" style={{ color: "hsl(var(--fp-forest))" }} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 border-b overflow-x-auto"
          style={{ borderColor: "hsl(var(--fp-blush)/0.3)" }}
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id ? "border-fp-rose" : "border-transparent"
              }`}
              style={{
                color: activeTab === id ? "hsl(var(--fp-rose))" : "hsl(var(--fp-forest)/0.5)",
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(var(--fp-rose))" }} />
          </div>
        ) : (
          <>
            {/* ── Products Tab ── */}
            {activeTab === "products" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
                    {products.length} products total
                  </p>
                  <button
                    onClick={() => setEditProduct(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                    style={{ background: "hsl(var(--fp-rose))" }}
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: "hsl(var(--fp-blush)/0.25)" }}
                >
                  <table className="w-full text-sm">
                    <thead style={{ background: "hsl(var(--fp-cream)/0.6)" }}>
                      <tr className="border-b" style={{ borderColor: "hsl(var(--fp-blush)/0.2)" }}>
                        <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Product</th>
                        <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Category</th>
                        <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Price</th>
                        <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Stock</th>
                        <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {products.map((p) => {
                        const fb = getFallbackGradient(p.name);
                        const img = p.images?.[0];
                        return (
                          <tr
                            key={p.id}
                            className="border-b last:border-0 hover:bg-fp-cream/20"
                            style={{ borderColor: "hsl(var(--fp-blush)/0.12)" }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                                  {img ? (
                                    <img src={img} alt={p.name} className="w-full h-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                  ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${fb.gradient} flex items-center justify-center text-lg`}>
                                      {fb.emoji}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium line-clamp-1" style={{ color: "hsl(var(--fp-forest))" }}>{p.name}</p>
                                  <p className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.4)" }}>
                                    {p.is_perishable ? "🌿 Fresh" : "📦 Lasting"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                              {p.fp_categories ? `${p.fp_categories.icon} ${p.fp_categories.name}` : "—"}
                            </td>
                            <td className="px-4 py-3 font-medium" style={{ color: "hsl(var(--fp-forest))" }}>
                              ${Number(p.price).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockColor(p.inventory_count)}`}>
                                {p.inventory_count}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {p.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 justify-end">
                                <button
                                  onClick={() => setEditProduct(p)}
                                  className="p-1.5 rounded-lg hover:bg-fp-blush/20 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" style={{ color: "hsl(var(--fp-forest)/0.6)" }} />
                                </button>
                                {deleteConfirm === p.id ? (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100">
                                      <Check className="w-3.5 h-3.5 text-red-600" />
                                    </button>
                                    <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                                      <X className="w-3.5 h-3.5 text-gray-500" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(p.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Business Rules Tab ── */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl border p-6 space-y-6" style={{ borderColor: "hsl(var(--fp-blush)/0.2)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Delivery Radius (miles)</Label>
                    <Input type="number" value={settings.delivery_radius_miles || 30}
                      onChange={(e) => setSettings((s) => ({ ...s, delivery_radius_miles: Number(e.target.value) }))}
                      className="border-fp-blush focus-visible:ring-fp-rose" />
                    <p className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.4)" }}>Orders within this radius get local delivery</p>
                  </div>
                  <div className="space-y-1">
                    <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Local Delivery Price ($)</Label>
                    <Input type="number" value={settings.local_delivery_price || 15}
                      onChange={(e) => setSettings((s) => ({ ...s, local_delivery_price: Number(e.target.value) }))}
                      className="border-fp-blush focus-visible:ring-fp-rose" />
                  </div>
                  <div className="space-y-1">
                    <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Min Perishable Advance Days</Label>
                    <Input type="number" value={settings.min_perishable_advance_days || 8}
                      onChange={(e) => setSettings((s) => ({ ...s, min_perishable_advance_days: Number(e.target.value) }))}
                      className="border-fp-blush focus-visible:ring-fp-rose" />
                    <p className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.4)" }}>Min days ahead for perishable shipping orders</p>
                  </div>
                  <div className="space-y-1">
                    <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Same-Day Cutoff Hour (24h)</Label>
                    <Input type="number" min={0} max={23} value={settings.same_day_cutoff_hour || 10}
                      onChange={(e) => setSettings((s) => ({ ...s, same_day_cutoff_hour: Number(e.target.value) }))}
                      className="border-fp-blush focus-visible:ring-fp-rose" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Warehouse Address</Label>
                    <Input value={settings.warehouse_address || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, warehouse_address: e.target.value }))}
                      placeholder="123 Flower St, Mumbai, MH 400001"
                      className="border-fp-blush focus-visible:ring-fp-rose" />
                  </div>
                </div>

                {/* Carriers */}
                <div className="space-y-2">
                  <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Enabled Carriers</Label>
                  <div className="flex flex-wrap gap-3">
                    {["ups", "fedex", "usps"].map((carrier) => (
                      <label key={carrier} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox"
                          checked={settings.carriers?.[carrier] ?? true}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              carriers: { ...s.carriers, [carrier]: e.target.checked },
                            }))
                          }
                          className="accent-fp-rose w-4 h-4"
                        />
                        <span className="text-sm font-medium uppercase" style={{ color: "hsl(var(--fp-forest))" }}>{carrier}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Holiday Blackouts */}
                <div className="space-y-3">
                  <Label style={{ color: "hsl(var(--fp-forest)/0.7)" }}>Holiday Blackout Dates</Label>
                  <div className="flex items-center gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors"
                          style={{ borderColor: "hsl(var(--fp-blush))", color: "hsl(var(--fp-forest)/0.7)" }}
                        >
                          {blackoutDate ? format(blackoutDate, "dd MMM yyyy") : "Pick a date"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={blackoutDate}
                          onSelect={setBlackoutDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <button
                      onClick={addBlackout}
                      disabled={!blackoutDate}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-colors"
                      style={{ background: "hsl(var(--fp-rose))" }}
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {(settings.holiday_blackouts || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(settings.holiday_blackouts as string[]).map((d) => (
                        <span
                          key={d}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                          style={{ background: "hsl(var(--fp-blush)/0.4)", color: "hsl(var(--fp-forest))" }}
                        >
                          {d}
                          <button onClick={() => removeBlackout(d)} className="hover:opacity-70">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={saveSettings}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-colors"
                  style={{ background: "hsl(var(--fp-rose))" }}
                >
                  <Save className="w-4 h-4" /> Save Settings
                </button>
              </div>
            )}

            {/* ── Pickup Locations Tab ── */}
            {activeTab === "locations" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => { setAddingLoc(true); setNewLocForm(emptyLocation); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "hsl(var(--fp-rose))" }}
                  >
                    <Plus className="w-4 h-4" /> Add Location
                  </button>
                </div>

                {/* Add form */}
                {addingLoc && (
                  <LocationForm
                    form={newLocForm}
                    onChange={setNewLocForm}
                    onSave={saveNewLocation}
                    onCancel={() => setAddingLoc(false)}
                    title="New Pickup Location"
                  />
                )}

                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="bg-white rounded-2xl border p-4 space-y-3"
                    style={{ borderColor: "hsl(var(--fp-blush)/0.2)" }}
                  >
                    {editLoc === loc.id ? (
                      <LocationForm
                        form={editLocForm}
                        onChange={setEditLocForm}
                        onSave={() => saveEditLocation(loc.id)}
                        onCancel={() => setEditLoc(null)}
                        title={`Editing: ${loc.name}`}
                      />
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--fp-rose))" }} />
                          <div>
                            <p className="font-medium" style={{ color: "hsl(var(--fp-forest))" }}>{loc.name}</p>
                            <p className="text-sm" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                              {loc.address}, {loc.city}, {loc.state} {loc.zip}
                            </p>
                            {loc.phone && <p className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>📞 {loc.phone}</p>}
                            {loc.hours && <p className="text-xs mt-0.5" style={{ color: "hsl(var(--fp-rose)/0.8)" }}>🕐 {loc.hours}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-1 rounded-full ${loc.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {loc.is_active ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() => { setEditLoc(loc.id); setEditLocForm({ name: loc.name, address: loc.address, city: loc.city, state: loc.state, zip: loc.zip, phone: loc.phone || "", hours: loc.hours || "" }); }}
                            className="p-1.5 rounded-lg hover:bg-fp-blush/20 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" style={{ color: "hsl(var(--fp-forest)/0.6)" }} />
                          </button>
                          <button
                            onClick={() => toggleLocation(loc.id, !loc.is_active)}
                            className="text-xs hover:opacity-70 underline"
                            style={{ color: "hsl(var(--fp-forest)/0.5)" }}
                          >
                            {loc.is_active ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => deleteLocation(loc.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Inventory Tab ── */}
            {activeTab === "inventory" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> ≤5 critical</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> ≤10 low</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" /> OK</span>
                  </div>
                  <button
                    onClick={saveAllInventory}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                    style={{ background: "hsl(var(--fp-rose))" }}
                  >
                    <Save className="w-4 h-4" />
                    Save All ({Object.keys(invChanges).length} changes)
                  </button>
                </div>

                <div
                  className="bg-white rounded-2xl border overflow-hidden"
                  style={{ borderColor: "hsl(var(--fp-blush)/0.2)" }}
                >
                  <table className="w-full text-sm">
                    <thead style={{ background: "hsl(var(--fp-cream)/0.5)" }}>
                      <tr className="border-b" style={{ borderColor: "hsl(var(--fp-blush)/0.2)" }}>
                        <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Product</th>
                        <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Type</th>
                        <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Price</th>
                        <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invProducts.map((p) => {
                        const current = invChanges[p.id] ?? p.inventory_count;
                        const changed = invChanges[p.id] !== undefined;
                        const fb = getFallbackGradient(p.name);
                        const img = p.images?.[0];
                        return (
                          <tr
                            key={p.id}
                            className={`border-b last:border-0 ${changed ? "bg-amber-50/30" : "hover:bg-fp-cream/20"}`}
                            style={{ borderColor: "hsl(var(--fp-blush)/0.12)" }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                                  {img ? (
                                    <img src={img} alt={p.name} className="w-full h-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                  ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${fb.gradient} flex items-center justify-center text-base`}>
                                      {fb.emoji}
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium line-clamp-1" style={{ color: "hsl(var(--fp-forest))" }}>{p.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_perishable ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-600"}`}>
                                {p.is_perishable ? "Fresh" : "Lasting"}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                              ${Number(p.price).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => changeInv(p.id, -1)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors hover:bg-gray-100"
                                  style={{ borderColor: "hsl(var(--fp-blush))" }}
                                >
                                  <Minus className="w-3 h-3" style={{ color: "hsl(var(--fp-forest)/0.6)" }} />
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  value={current}
                                  onChange={(e) => setInvDirect(p.id, Number(e.target.value))}
                                  className={`w-16 h-7 text-center rounded-lg border text-sm focus:outline-none focus:ring-1 ${stockColor(current)}`}
                                  style={{ borderColor: "hsl(var(--fp-blush))" }}
                                />
                                <button
                                  onClick={() => changeInv(p.id, 1)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors hover:bg-gray-100"
                                  style={{ borderColor: "hsl(var(--fp-blush))" }}
                                >
                                  <Plus className="w-3 h-3" style={{ color: "hsl(var(--fp-forest)/0.6)" }} />
                                </button>
                                {changed && (
                                  <span className="text-xs text-amber-600">●</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Orders Tab ── */}
            {activeTab === "orders" && (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
                  {orders.length} recent orders
                </p>
                {orders.length === 0 ? (
                  <div className="text-center py-16" style={{ color: "hsl(var(--fp-forest)/0.4)" }}>No orders yet</div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border overflow-hidden"
                      style={{ borderColor: "hsl(var(--fp-blush)/0.2)" }}
                    >
                      {/* Order summary row */}
                      <div
                        className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-fp-cream/20 transition-colors"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div>
                            <p className="font-medium text-sm" style={{ color: "hsl(var(--fp-forest))" }}>
                              {order.guest_name || "Guest"}
                              <span className="text-xs font-normal ml-2" style={{ color: "hsl(var(--fp-forest)/0.4)" }}>
                                #{order.id.slice(0, 8)}
                              </span>
                            </p>
                            {order.guest_email && (
                              <p className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>{order.guest_email}</p>
                            )}
                          </div>
                          <div className="hidden sm:block text-xs" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
                            <p>🎉 {order.event_type} — {order.event_date}</p>
                            <p>📦 Delivery: {order.delivery_date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-semibold text-sm" style={{ color: "hsl(var(--fp-forest))" }}>
                            ${Number(order.total_amount).toFixed(2)}
                          </span>
                          <select
                            value={order.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColor(order.status)}`}
                          >
                            {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-4 h-4" style={{ color: "hsl(var(--fp-forest)/0.4)" }} />
                          ) : (
                            <ChevronDown className="w-4 h-4" style={{ color: "hsl(var(--fp-forest)/0.4)" }} />
                          )}
                        </div>
                      </div>

                      {/* Expanded details */}
                      {expandedOrder === order.id && (
                        <div
                          className="px-4 pb-4 border-t pt-4 space-y-3"
                          style={{ borderColor: "hsl(var(--fp-blush)/0.2)" }}
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="font-medium mb-0.5" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>Event</p>
                              <p style={{ color: "hsl(var(--fp-forest))" }}>{order.custom_event_name || order.event_type}</p>
                              <p style={{ color: "hsl(var(--fp-forest)/0.6)" }}>{order.event_date}</p>
                            </div>
                            <div>
                              <p className="font-medium mb-0.5" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>Delivery</p>
                              <p style={{ color: "hsl(var(--fp-forest))" }}>{order.delivery_mode}</p>
                              <p style={{ color: "hsl(var(--fp-forest)/0.6)" }}>{order.delivery_date}</p>
                            </div>
                            <div>
                              <p className="font-medium mb-0.5" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>Order Total</p>
                              <p style={{ color: "hsl(var(--fp-forest))" }}>Subtotal: ${Number(order.subtotal).toFixed(2)}</p>
                              <p style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Shipping: ${Number(order.shipping_total).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="font-medium mb-0.5" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>Placed</p>
                              <p style={{ color: "hsl(var(--fp-forest))" }}>{format(new Date(order.created_at), "dd MMM yyyy")}</p>
                              <p style={{ color: "hsl(var(--fp-forest)/0.6)" }}>{format(new Date(order.created_at), "HH:mm")}</p>
                            </div>
                          </div>
                          {order.notes && (
                            <p className="text-xs italic" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
                              Note: {order.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      <FPFooter />

      {/* Product Edit Panel */}
      {editProduct !== undefined && (
        <ProductEditPanel
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(undefined)}
          onSaved={() => { loadAll(); }}
        />
      )}
    </div>
  );
}

// ─── Location Form Sub-component ──────────────────────────────────────────────

function LocationForm({
  form,
  onChange,
  onSave,
  onCancel,
  title,
}: {
  form: Omit<Location, "id" | "is_active">;
  onChange: (f: Omit<Location, "id" | "is_active">) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
}) {
  function set(key: string, value: string) {
    onChange({ ...form, [key]: value });
  }
  return (
    <div className="bg-fp-cream/40 rounded-xl p-4 space-y-4 border" style={{ borderColor: "hsl(var(--fp-blush)/0.3)" }}>
      <p className="font-medium text-sm" style={{ color: "hsl(var(--fp-forest))" }}>{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Name *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Store / Pickup point name" className="border-fp-blush focus-visible:ring-fp-rose h-9 text-sm" />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Address *</Label>
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address" className="border-fp-blush focus-visible:ring-fp-rose h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>City</Label>
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" className="border-fp-blush focus-visible:ring-fp-rose h-9 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>State</Label>
            <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="CA" className="border-fp-blush focus-visible:ring-fp-rose h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>ZIP</Label>
            <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="90210" className="border-fp-blush focus-visible:ring-fp-rose h-9 text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Phone</Label>
          <Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" className="border-fp-blush focus-visible:ring-fp-rose h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>Hours</Label>
          <Input value={form.hours || ""} onChange={(e) => set("hours", e.target.value)} placeholder="Mon–Sat 9am–7pm" className="border-fp-blush focus-visible:ring-fp-rose h-9 text-sm" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "hsl(var(--fp-rose))" }}>
          <Save className="w-3.5 h-3.5" /> Save
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "hsl(var(--fp-blush))", color: "hsl(var(--fp-forest)/0.6)" }}>
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}
