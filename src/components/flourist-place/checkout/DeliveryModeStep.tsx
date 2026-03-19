import React from "react";
import { MapPin, Truck, Loader2, User, Home, Building } from "lucide-react";
import type { PickupLocation, ShippingGroup, ShippingOption } from "@/hooks/useFleuristCheckout";
import { CartGroupSummary } from "../cart/CartGroupSummary";
import type { FPCartItem } from "@/hooks/useFleuristCart";

interface DeliveryModeStepProps {
  mode: "pickup" | "delivery";
  onModeChange: (mode: "pickup" | "delivery") => void;
  pickupLocations: PickupLocation[];
  selectedPickup: string;
  onPickupSelect: (id: string) => void;
  shippingGroups: ShippingGroup[];
  selectedShipping: Record<string, ShippingOption>;
  onShippingSelect: (type: string, opt: ShippingOption) => void;
  isLoadingRules: boolean;
  items: FPCartItem[];
  onBack: () => void;
  onNext: () => void;
  shippingAddress: Record<string, string>;
  onAddressChange: (address: Record<string, string>) => void;
}

export function DeliveryModeStep({
  mode,
  onModeChange,
  pickupLocations,
  selectedPickup,
  onPickupSelect,
  shippingGroups,
  selectedShipping,
  onShippingSelect,
  isLoadingRules,
  items,
  onBack,
  onNext,
  shippingAddress,
  onAddressChange,
}: DeliveryModeStepProps) {
  const addressComplete =
    !!shippingAddress.name?.trim() &&
    !!shippingAddress.street?.trim() &&
    !!shippingAddress.city?.trim() &&
    !!shippingAddress.state?.trim() &&
    !!shippingAddress.zip?.trim();

  const canProceed =
    mode === "pickup"
      ? !!selectedPickup
      : shippingGroups.length > 0 &&
        shippingGroups.every((g) => selectedShipping[g.type]) &&
        addressComplete;

  const updateField = (field: string, value: string) => {
    onAddressChange({ ...shippingAddress, [field]: value });
  };

  const inputStyle = {
    border: "1.5px solid hsl(var(--fp-blush))",
    borderRadius: "0.75rem",
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    color: "hsl(var(--fp-forest))",
    background: "white",
    transition: "border-color 0.15s",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: "hsl(var(--fp-forest))" }}>
          Delivery Method
        </h2>
        <p className="text-sm" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
          Choose how you'd like to receive your flowers.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        {(["delivery", "pickup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200"
            style={{
              borderColor: mode === m ? "hsl(var(--fp-rose))" : "hsl(var(--fp-blush)/0.4)",
              background: mode === m ? "hsl(var(--fp-rose)/0.06)" : "white",
            }}
          >
            {m === "delivery" ? (
              <Truck className="w-6 h-6" style={{ color: mode === m ? "hsl(var(--fp-rose))" : "hsl(var(--fp-forest)/0.4)" }} />
            ) : (
              <MapPin className="w-6 h-6" style={{ color: mode === m ? "hsl(var(--fp-rose))" : "hsl(var(--fp-forest)/0.4)" }} />
            )}
            <span
              className="font-semibold text-sm"
              style={{ color: mode === m ? "hsl(var(--fp-rose))" : "hsl(var(--fp-forest)/0.7)" }}
            >
              {m === "delivery" ? "Delivery" : "Free Pickup"}
            </span>
          </button>
        ))}
      </div>

      {/* Pickup locations */}
      {mode === "pickup" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "hsl(var(--fp-forest)/0.7)" }}>
            Select a pickup location:
          </p>
          {pickupLocations.length === 0 ? (
            <p className="text-sm" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
              No pickup locations available at this time.
            </p>
          ) : (
            pickupLocations.map((loc) => (
              <label
                key={loc.id}
                className="flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all"
                style={{
                  borderColor: selectedPickup === loc.id ? "hsl(var(--fp-rose))" : "hsl(var(--fp-blush)/0.35)",
                  background: selectedPickup === loc.id ? "hsl(var(--fp-rose)/0.05)" : "white",
                }}
              >
                <input
                  type="radio"
                  name="pickup_location"
                  value={loc.id}
                  checked={selectedPickup === loc.id}
                  onChange={() => onPickupSelect(loc.id)}
                  className="mt-0.5"
                  style={{ accentColor: "hsl(var(--fp-rose))" }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--fp-forest))" }}>
                    {loc.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                    {loc.address}, {loc.city}, {loc.state} {loc.zip}
                  </p>
                  {loc.hours && (
                    <p className="text-xs mt-0.5" style={{ color: "hsl(var(--fp-rose))" }}>
                      🕐 {loc.hours}
                    </p>
                  )}
                  {loc.phone && (
                    <p className="text-xs mt-0.5" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
                      {loc.phone}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-green-600">Free</span>
              </label>
            ))
          )}
        </div>
      )}

      {/* Delivery: shipping options */}
      {mode === "delivery" && (
        <div className="space-y-5">
          {isLoadingRules ? (
            <div className="flex items-center justify-center py-8" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Calculating shipping options...</span>
            </div>
          ) : (
            <CartGroupSummary
              groups={shippingGroups}
              selectedShipping={selectedShipping}
              onSelectShipping={onShippingSelect}
              showShippingOptions={true}
            />
          )}

          {/* Shipping address form */}
          <div
            className="rounded-2xl p-5 border space-y-4"
            style={{
              background: "hsl(var(--fp-cream)/0.6)",
              borderColor: "hsl(var(--fp-blush)/0.4)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4" style={{ color: "hsl(var(--fp-rose))" }} />
              <p className="font-semibold text-sm" style={{ color: "hsl(var(--fp-forest))" }}>
                Delivery Address
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--fp-forest)/0.35)" }} />
                <input
                  type="text"
                  placeholder="Recipient's full name"
                  value={shippingAddress.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(var(--fp-rose))")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(var(--fp-blush))")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                Street Address *
              </label>
              <input
                type="text"
                placeholder="123 Main St, Apt 4B"
                value={shippingAddress.street || ""}
                onChange={(e) => updateField("street", e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "hsl(var(--fp-rose))")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(var(--fp-blush))")}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                  City *
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city || ""}
                  onChange={(e) => updateField("city", e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(var(--fp-rose))")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(var(--fp-blush))")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                  State *
                </label>
                <input
                  type="text"
                  placeholder="CA"
                  maxLength={2}
                  value={shippingAddress.state || ""}
                  onChange={(e) => updateField("state", e.target.value.toUpperCase())}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "hsl(var(--fp-rose))")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(var(--fp-blush))")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
                ZIP Code *
              </label>
              <input
                type="text"
                placeholder="94102"
                maxLength={10}
                value={shippingAddress.zip || ""}
                onChange={(e) => updateField("zip", e.target.value)}
                style={{ ...inputStyle, maxWidth: "160px" }}
                onFocus={(e) => (e.target.style.borderColor = "hsl(var(--fp-rose))")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(var(--fp-blush))")}
              />
            </div>

            {mode === "delivery" && !addressComplete && (
              <p className="text-xs" style={{ color: "hsl(var(--fp-rose)/0.8)" }}>
                ⚠️ Please fill in all address fields to continue.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 h-12 rounded-2xl font-semibold text-sm border-2 transition-colors hover:bg-fp-blush/10"
          style={{
            borderColor: "hsl(var(--fp-blush))",
            color: "hsl(var(--fp-forest))",
          }}
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 h-12 rounded-2xl font-semibold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{ background: "hsl(var(--fp-rose))" }}
        >
          Review Order →
        </button>
      </div>
    </div>
  );
}
