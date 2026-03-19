import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FPCartItem, FPEventDetails } from "./useFleuristCart";

export interface ShippingOption {
  id: string;
  label: string;
  carrier: string;
  price: number;
  delivery_days: number;
  is_local: boolean;
  recommended?: boolean;
}

export interface ShippingGroup {
  type: "perishable" | "non_perishable";
  label: string;
  items: FPCartItem[];
  subtotal: number;
  shipping_options: ShippingOption[];
  min_advance_days: number;
  days_advance_met: boolean;
  warnings: string[];
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  hours?: string;
}

export type CheckoutStep = "event" | "delivery" | "review" | "confirmation";

export function useFleuristCheckout() {
  const [step, setStep] = useState<CheckoutStep>("event");
  const [shippingGroups, setShippingGroups] = useState<ShippingGroup[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<Record<string, ShippingOption>>({});
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "delivery">("delivery");
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<Record<string, string>>({});
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPickupLocations = useCallback(async () => {
    const { data } = await supabase
      .from("fp_pickup_locations")
      .select("*")
      .eq("is_active", true);
    setPickupLocations(data || []);
  }, []);

  const fetchShippingRules = useCallback(
    async (items: FPCartItem[], delivery_date: string, distance_miles?: number) => {
      setIsLoadingRules(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("fp-shipping-rules", {
          body: {
            items: items.map((i) => ({
              id: i.id,
              name: i.name,
              quantity: i.quantity,
              price: i.price,
              is_perishable: i.is_perishable,
              shipping_class: i.shipping_class,
            })),
            delivery_date,
            distance_miles,
          },
        });
        if (fnError) throw fnError;
        setShippingGroups(data.groups || []);

        // Auto-select recommended options
        const autoSelected: Record<string, ShippingOption> = {};
        for (const group of data.groups || []) {
          const recommended = group.shipping_options.find((o: ShippingOption) => o.recommended);
          if (recommended) autoSelected[group.type] = recommended;
          else if (group.shipping_options.length > 0)
            autoSelected[group.type] = group.shipping_options[0];
        }
        setSelectedShipping(autoSelected);
      } catch (err) {
        setError("Failed to load shipping options");
      } finally {
        setIsLoadingRules(false);
      }
    },
    []
  );

  const submitOrder = useCallback(
    async (
      items: FPCartItem[],
      eventDetails: FPEventDetails,
      guestInfo: { name: string; email: string }
    ) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const shippingCostBreakdown: Record<string, number> = {};
        let shippingTotal = 0;

        if (deliveryMode === "delivery") {
          for (const [type, option] of Object.entries(selectedShipping)) {
            shippingCostBreakdown[type] = option.price;
            shippingTotal += option.price;
          }
        }

        const { data, error: fnError } = await supabase.functions.invoke("fp-checkout", {
          body: {
            items: items.map((i) => ({
              product_id: i.product_id,
              name: i.name,
              quantity: i.quantity,
              unit_price: i.price,
              is_perishable: i.is_perishable,
            })),
            event_type: eventDetails.event_type,
            custom_event_name: eventDetails.custom_event_name,
            event_date: eventDetails.event_date,
            delivery_date: eventDetails.delivery_date,
            delivery_mode: deliveryMode,
            pickup_location_id: deliveryMode === "pickup" ? selectedPickupLocation : null,
            shipping_address: deliveryMode === "delivery" ? shippingAddress : {},
            shipping_groups: shippingGroups,
            shipping_cost_breakdown: shippingCostBreakdown,
            guest_email: guestInfo.email,
            guest_name: guestInfo.name,
          },
        });

        if (fnError) throw fnError;
        if (data.error) throw new Error(data.error);

        setOrderId(data.order_id);
        return data.order_id;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Order submission failed";
        setError(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [deliveryMode, selectedPickupLocation, selectedShipping, shippingAddress, shippingGroups]
  );

  const shippingTotal = Object.values(selectedShipping).reduce(
    (sum, o) => sum + o.price,
    0
  );

  return {
    step,
    setStep,
    shippingGroups,
    selectedShipping,
    setSelectedShipping,
    pickupLocations,
    deliveryMode,
    setDeliveryMode,
    selectedPickupLocation,
    setSelectedPickupLocation,
    shippingAddress,
    setShippingAddress,
    isLoadingRules,
    isSubmitting,
    orderId,
    error,
    shippingTotal,
    loadPickupLocations,
    fetchShippingRules,
    submitOrder,
  };
}
