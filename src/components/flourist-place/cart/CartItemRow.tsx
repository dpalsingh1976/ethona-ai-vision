import React from "react";
import { Trash2, Plus, Minus, Leaf } from "lucide-react";
import type { FPCartItem } from "@/hooks/useFleuristCart";
import { useFleuristCart } from "@/hooks/useFleuristCart";

interface CartItemProps {
  item: FPCartItem;
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useFleuristCart();

  return (
    <div className="flex items-start gap-3 py-4 border-b border-fp-blush/20 last:border-0">
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-fp-cream flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-medium text-fp-forest leading-tight line-clamp-2">
              {item.name}
            </h4>
            {item.is_perishable && (
              <span className="inline-flex items-center gap-1 text-xs text-fp-rose mt-0.5">
                <Leaf className="w-2.5 h-2.5" /> Fresh flower
              </span>
            )}
          </div>
          <button
            onClick={() => removeItem(item.product_id)}
            className="text-fp-forest/30 hover:text-fp-rose transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
              className="w-7 h-7 rounded-full border border-fp-blush flex items-center justify-center hover:bg-fp-blush/30 transition-colors"
            >
              <Minus className="w-3 h-3 text-fp-forest" />
            </button>
            <span className="text-sm font-medium text-fp-forest w-5 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
              className="w-7 h-7 rounded-full border border-fp-blush flex items-center justify-center hover:bg-fp-blush/30 transition-colors"
            >
              <Plus className="w-3 h-3 text-fp-forest" />
            </button>
          </div>

          <span className="font-semibold text-fp-forest text-sm">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
