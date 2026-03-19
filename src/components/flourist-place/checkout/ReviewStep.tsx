import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Package, Truck } from "lucide-react";
import type { FPCartItem, FPEventDetails } from "@/hooks/useFleuristCart";
import type { ShippingOption } from "@/hooks/useFleuristCheckout";

interface ReviewStepProps {
  items: FPCartItem[];
  eventDetails: FPEventDetails;
  deliveryMode: "pickup" | "delivery";
  selectedShipping: Record<string, ShippingOption>;
  shippingTotal: number;
  subtotal: number;
  isSubmitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (guestInfo: { name: string; email: string }) => void;
}

export function ReviewStep({
  items,
  eventDetails,
  deliveryMode,
  selectedShipping,
  shippingTotal,
  subtotal,
  isSubmitting,
  error,
  onBack,
  onSubmit,
}: ReviewStepProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const total = subtotal + shippingTotal;
  const isValid = name.trim() && email.includes("@");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-fp-forest mb-1">Review & Place Order</h2>
        <p className="text-fp-forest/60 text-sm">Check your details before confirming.</p>
      </div>

      {/* Guest info */}
      <div className="bg-fp-cream rounded-2xl p-4 space-y-4">
        <h3 className="font-medium text-fp-forest text-sm">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-fp-forest/60">Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="h-10 rounded-xl border-fp-blush focus-visible:ring-fp-rose"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-fp-forest/60">Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-10 rounded-xl border-fp-blush focus-visible:ring-fp-rose"
            />
          </div>
        </div>
      </div>

      {/* Event summary */}
      <div className="bg-fp-blush/20 rounded-2xl p-4">
        <h3 className="font-medium text-fp-forest text-sm mb-2">Event Details</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-fp-forest/50">Event</dt>
          <dd className="text-fp-forest font-medium capitalize">{eventDetails.event_type} {eventDetails.custom_event_name ? `(${eventDetails.custom_event_name})` : ""}</dd>
          <dt className="text-fp-forest/50">Event Date</dt>
          <dd className="text-fp-forest font-medium">{eventDetails.event_date}</dd>
          <dt className="text-fp-forest/50">Delivery Date</dt>
          <dd className="text-fp-forest font-medium">{eventDetails.delivery_date}</dd>
          <dt className="text-fp-forest/50">Method</dt>
          <dd className="text-fp-forest font-medium capitalize flex items-center gap-1">
            {deliveryMode === "delivery" ? <Truck className="w-3 h-3" /> : <Package className="w-3 h-3" />}
            {deliveryMode}
          </dd>
        </dl>
      </div>

      {/* Order items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-fp-forest/70">
            <span>{item.name} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-fp-blush/30 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-fp-forest/60">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-fp-forest/60">
          <span>Shipping</span>
          <span>{shippingTotal === 0 ? "Free" : `$${shippingTotal.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-fp-forest pt-1 border-t border-fp-blush/20">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
          {error}
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
          onClick={() => onSubmit({ name, email })}
          disabled={!isValid || isSubmitting}
          className="flex-1 h-12 bg-fp-forest text-white rounded-xl font-medium hover:bg-fp-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
          ) : (
            <><ShieldCheck className="w-4 h-4" /> Place Order</>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-fp-forest/40">
        No payment required at checkout — pay on delivery/pickup
      </p>
    </div>
  );
}
