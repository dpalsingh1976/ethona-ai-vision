import React, { useEffect } from "react";
import { MapPin, Truck, Loader2 } from "lucide-react";
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
}: DeliveryModeStepProps) {
  const canProceed =
    mode === "pickup"
      ? !!selectedPickup
      : shippingGroups.length > 0 &&
        shippingGroups.every((g) => selectedShipping[g.type]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-fp-forest mb-1">Delivery Method</h2>
        <p className="text-fp-forest/60 text-sm">Choose how you'd like to receive your flowers.</p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onModeChange("delivery")}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            mode === "delivery"
              ? "border-fp-rose bg-fp-rose/5"
              : "border-fp-blush/30 hover:border-fp-blush"
          }`}
        >
          <Truck className={`w-6 h-6 ${mode === "delivery" ? "text-fp-rose" : "text-fp-forest/50"}`} />
          <span className={`font-medium text-sm ${mode === "delivery" ? "text-fp-rose" : "text-fp-forest/70"}`}>
            Delivery
          </span>
        </button>
        <button
          onClick={() => onModeChange("pickup")}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            mode === "pickup"
              ? "border-fp-rose bg-fp-rose/5"
              : "border-fp-blush/30 hover:border-fp-blush"
          }`}
        >
          <MapPin className={`w-6 h-6 ${mode === "pickup" ? "text-fp-rose" : "text-fp-forest/50"}`} />
          <span className={`font-medium text-sm ${mode === "pickup" ? "text-fp-rose" : "text-fp-forest/70"}`}>
            Free Pickup
          </span>
        </button>
      </div>

      {/* Pickup */}
      {mode === "pickup" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-fp-forest/70">Select a pickup location:</p>
          {pickupLocations.map((loc) => (
            <label
              key={loc.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPickup === loc.id
                  ? "border-fp-rose bg-fp-rose/5"
                  : "border-fp-blush/30 hover:border-fp-blush"
              }`}
            >
              <input
                type="radio"
                name="pickup_location"
                value={loc.id}
                checked={selectedPickup === loc.id}
                onChange={() => onPickupSelect(loc.id)}
                className="accent-fp-rose mt-0.5"
              />
              <div>
                <p className="font-medium text-fp-forest text-sm">{loc.name}</p>
                <p className="text-xs text-fp-forest/60">{loc.address}, {loc.city}, {loc.state} {loc.zip}</p>
                {loc.hours && <p className="text-xs text-fp-rose mt-0.5">🕐 {loc.hours}</p>}
                {loc.phone && <p className="text-xs text-fp-forest/50">{loc.phone}</p>}
              </div>
              <span className="ml-auto text-sm font-semibold text-green-600">Free</span>
            </label>
          ))}
        </div>
      )}

      {/* Delivery shipping options */}
      {mode === "delivery" && (
        <div>
          {isLoadingRules ? (
            <div className="flex items-center justify-center py-8 text-fp-forest/50">
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
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 h-12 border border-fp-blush text-fp-forest rounded-xl font-medium hover:bg-fp-blush/20 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 h-12 bg-fp-rose text-white rounded-xl font-medium hover:bg-fp-rose/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Review Order →
        </button>
      </div>
    </div>
  );
}
