import React from "react";
import { Leaf, Package } from "lucide-react";
import type { ShippingGroup, ShippingOption } from "@/hooks/useFleuristCheckout";

interface CartGroupSummaryProps {
  groups: ShippingGroup[];
  selectedShipping: Record<string, ShippingOption>;
  onSelectShipping: (groupType: string, option: ShippingOption) => void;
  showShippingOptions?: boolean;
}

export function CartGroupSummary({
  groups,
  selectedShipping,
  onSelectShipping,
  showShippingOptions = false,
}: CartGroupSummaryProps) {
  if (!groups || groups.length === 0) return null;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.type}
          className={`rounded-2xl border p-4 ${
            group.type === "perishable"
              ? "border-fp-rose/20 bg-fp-blush/10"
              : "border-fp-forest/20 bg-fp-cream"
          }`}
        >
          {/* Group header */}
          <div className="flex items-center gap-2 mb-3">
            {group.type === "perishable" ? (
              <Leaf className="w-4 h-4 text-fp-rose" />
            ) : (
              <Package className="w-4 h-4 text-fp-forest" />
            )}
            <span className="font-medium text-fp-forest text-sm">{group.label}</span>
            <span className="ml-auto text-sm font-semibold text-fp-forest">
              ${group.subtotal.toFixed(2)}
            </span>
          </div>

          {/* Item list */}
          <ul className="text-xs text-fp-forest/60 space-y-1 mb-3">
            {group.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          {/* Warnings */}
          {group.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-3">
              {group.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700">⚠️ {w}</p>
              ))}
            </div>
          )}

          {/* Shipping options */}
          {showShippingOptions && group.shipping_options.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-fp-forest/70 uppercase tracking-wider">
                Shipping Options
              </p>
              {group.shipping_options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    selectedShipping[group.type]?.id === opt.id
                      ? "border-fp-rose bg-fp-rose/5"
                      : "border-fp-blush/30 hover:border-fp-blush"
                  }`}
                >
                  <input
                    type="radio"
                    name={`shipping_${group.type}`}
                    checked={selectedShipping[group.type]?.id === opt.id}
                    onChange={() => onSelectShipping(group.type, opt)}
                    className="accent-fp-rose"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-fp-forest">{opt.label}</span>
                      {opt.recommended && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-fp-forest/50">
                      {opt.carrier} · {opt.delivery_days === 1 ? "1 day" : `${opt.delivery_days} days`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-fp-forest">
                    {opt.price === 0 ? "Free" : `$${opt.price.toFixed(2)}`}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
