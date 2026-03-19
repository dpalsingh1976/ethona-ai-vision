import React, { useState, useEffect } from "react";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { supabase } from "@/integrations/supabase/client";
import { Settings, MapPin, Package, RefreshCw, Save, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function FlouristPlaceAdmin() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"settings" | "locations" | "inventory">("settings");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: settingsRows }, { data: locs }, { data: prods }] = await Promise.all([
      supabase.from("fp_admin_settings").select("key, value"),
      supabase.from("fp_pickup_locations").select("*").order("name"),
      supabase.from("fp_products").select("id, name, inventory_count, price, is_perishable").eq("is_active", true).order("name"),
    ]);

    const s: Record<string, any> = {};
    for (const row of settingsRows || []) {
      s[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    }
    setSettings(s);
    setLocations(locs || []);
    setProducts(prods || []);
    setLoading(false);
  }

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

  async function updateInventory(productId: string, count: number) {
    await supabase.from("fp_products").update({ inventory_count: count }).eq("id", productId);
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, inventory_count: count } : p));
    toast.success("Inventory updated");
  }

  async function toggleLocation(id: string, isActive: boolean) {
    await supabase.from("fp_pickup_locations").update({ is_active: isActive }).eq("id", id);
    setLocations((prev) => prev.map((l) => l.id === id ? { ...l, is_active: isActive } : l));
  }

  const tabs = [
    { id: "settings", label: "Business Rules", icon: Settings },
    { id: "locations", label: "Pickup Locations", icon: MapPin },
    { id: "inventory", label: "Inventory", icon: Package },
  ] as const;

  return (
    <div className="min-h-screen bg-fp-cream/20 font-sans">
      <FPNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-fp-forest">Admin Dashboard</h1>
            <p className="text-fp-forest/50 text-sm mt-1">Manage your FlouristPlace business rules</p>
          </div>
          <button
            onClick={loadAll}
            className="p-2 rounded-xl border border-fp-blush hover:bg-fp-blush/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-fp-forest" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-fp-blush/30">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? "border-fp-rose text-fp-rose"
                  : "border-transparent text-fp-forest/50 hover:text-fp-forest"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-fp-forest/40">Loading...</div>
        ) : (
          <>
            {/* Settings */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl border border-fp-blush/20 p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-fp-forest/70">Delivery Radius (miles)</Label>
                    <Input
                      type="number"
                      value={settings.delivery_radius_miles || 30}
                      onChange={(e) => setSettings((s) => ({ ...s, delivery_radius_miles: Number(e.target.value) }))}
                      className="border-fp-blush focus-visible:ring-fp-rose"
                    />
                    <p className="text-xs text-fp-forest/40">Orders within this radius get local delivery</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-fp-forest/70">Local Delivery Price ($)</Label>
                    <Input
                      type="number"
                      value={settings.local_delivery_price || 15}
                      onChange={(e) => setSettings((s) => ({ ...s, local_delivery_price: Number(e.target.value) }))}
                      className="border-fp-blush focus-visible:ring-fp-rose"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-fp-forest/70">Min Perishable Advance Days</Label>
                    <Input
                      type="number"
                      value={settings.min_perishable_advance_days || 8}
                      onChange={(e) => setSettings((s) => ({ ...s, min_perishable_advance_days: Number(e.target.value) }))}
                      className="border-fp-blush focus-visible:ring-fp-rose"
                    />
                    <p className="text-xs text-fp-forest/40">Minimum days required for perishable shipping orders</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-fp-forest/70">Same-Day Cutoff Hour (24h)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={settings.same_day_cutoff_hour || 10}
                      onChange={(e) => setSettings((s) => ({ ...s, same_day_cutoff_hour: Number(e.target.value) }))}
                      className="border-fp-blush focus-visible:ring-fp-rose"
                    />
                  </div>
                </div>

                {/* Carrier toggles */}
                <div className="space-y-2">
                  <Label className="text-fp-forest/70">Enabled Carriers</Label>
                  <div className="flex flex-wrap gap-3">
                    {["ups", "fedex", "usps"].map((carrier) => (
                      <label key={carrier} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.carriers?.[carrier] ?? true}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              carriers: { ...s.carriers, [carrier]: e.target.checked },
                            }))
                          }
                          className="accent-fp-rose w-4 h-4"
                        />
                        <span className="text-sm font-medium text-fp-forest uppercase">{carrier}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  className="flex items-center gap-2 bg-fp-rose text-white px-6 py-2.5 rounded-xl font-medium hover:bg-fp-rose/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            )}

            {/* Pickup Locations */}
            {activeTab === "locations" && (
              <div className="space-y-3">
                {locations.map((loc) => (
                  <div key={loc.id} className="bg-white rounded-2xl border border-fp-blush/20 p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-fp-rose mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-fp-forest">{loc.name}</p>
                        <p className="text-sm text-fp-forest/60">{loc.address}, {loc.city}, {loc.state} {loc.zip}</p>
                        {loc.hours && <p className="text-xs text-fp-rose mt-0.5">{loc.hours}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${loc.is_active ? "bg-green-100 text-green-700" : "bg-fp-blush/40 text-fp-forest/40"}`}>
                        {loc.is_active ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => toggleLocation(loc.id, !loc.is_active)}
                        className="text-xs text-fp-forest/50 hover:text-fp-rose underline"
                      >
                        {loc.is_active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inventory */}
            {activeTab === "inventory" && (
              <div className="bg-white rounded-2xl border border-fp-blush/20 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-fp-cream/50 border-b border-fp-blush/20">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-fp-forest/60">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-fp-forest/60">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-fp-forest/60">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-fp-forest/60">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-fp-blush/10 last:border-0 hover:bg-fp-cream/30">
                        <td className="px-4 py-3 font-medium text-fp-forest">{p.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_perishable ? "bg-fp-rose/10 text-fp-rose" : "bg-fp-forest/10 text-fp-forest"}`}>
                            {p.is_perishable ? "Fresh" : "Lasting"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-fp-forest/60">${Number(p.price).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            value={p.inventory_count}
                            onChange={(e) => updateInventory(p.id, Number(e.target.value))}
                            className="w-20 h-8 px-2 rounded-lg border border-fp-blush focus:outline-none focus:ring-1 focus:ring-fp-rose text-fp-forest text-center"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <FPFooter />
    </div>
  );
}
