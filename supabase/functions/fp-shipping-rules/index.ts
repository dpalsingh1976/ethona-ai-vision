import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  is_perishable: boolean;
  shipping_class: string;
}

interface ShippingOption {
  id: string;
  label: string;
  carrier: string;
  price: number;
  delivery_days: number;
  is_local: boolean;
  recommended?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { items, delivery_date, destination_zip, distance_miles } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load admin settings
    const { data: settingsRows } = await supabase
      .from("fp_admin_settings")
      .select("key, value");

    const settings: Record<string, any> = {};
    for (const row of settingsRows || []) {
      settings[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    }

    const deliveryRadius = Number(settings.delivery_radius_miles) || 30;
    const localDeliveryPrice = Number(settings.local_delivery_price) || 15;
    const minPerishableDays = Number(settings.min_perishable_advance_days) || 8;
    const blackoutDates: string[] = settings.blackout_dates || [];
    const carriers = settings.carriers || { ups: true, fedex: true, usps: true };

    // Split cart into groups
    const perishableItems: CartItem[] = (items || []).filter((i: CartItem) => i.is_perishable);
    const nonPerishableItems: CartItem[] = (items || []).filter((i: CartItem) => !i.is_perishable);

    const isLocal = distance_miles !== undefined ? distance_miles <= deliveryRadius : true;

    // Check delivery date advance
    const today = new Date();
    const delivDate = delivery_date ? new Date(delivery_date) : null;
    const daysAdvance = delivDate
      ? Math.floor((delivDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const groups = [];

    // --- Perishable group ---
    if (perishableItems.length > 0) {
      const shippingOptions: ShippingOption[] = [];

      if (isLocal) {
        shippingOptions.push({
          id: "local_delivery",
          label: "Local Delivery",
          carrier: "local",
          price: localDeliveryPrice,
          delivery_days: 1,
          is_local: true,
          recommended: true,
        });
      } else {
        // Only overnight/2-day for perishables
        if (daysAdvance >= 1) {
          shippingOptions.push({
            id: "overnight",
            label: "Overnight Shipping",
            carrier: carriers.fedex ? "FedEx" : "UPS",
            price: 45.99,
            delivery_days: 1,
            is_local: false,
            recommended: daysAdvance < 3,
          });
        }
        if (daysAdvance >= 2) {
          shippingOptions.push({
            id: "two_day",
            label: "2-Day Shipping",
            carrier: carriers.ups ? "UPS" : "FedEx",
            price: 29.99,
            delivery_days: 2,
            is_local: false,
            recommended: daysAdvance >= 3,
          });
        }
      }

      const perishableTotal = perishableItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );

      groups.push({
        type: "perishable",
        label: "Fresh Flowers & Perishables",
        items: perishableItems,
        subtotal: perishableTotal,
        shipping_options: shippingOptions,
        min_advance_days: minPerishableDays,
        days_advance_met: daysAdvance >= minPerishableDays,
        warnings:
          daysAdvance < minPerishableDays && !isLocal
            ? [`Perishable items need at least ${minPerishableDays} days advance order for shipping.`]
            : [],
      });
    }

    // --- Non-perishable group ---
    if (nonPerishableItems.length > 0) {
      const shippingOptions: ShippingOption[] = [];

      if (isLocal) {
        shippingOptions.push({
          id: "local_delivery",
          label: "Local Delivery",
          carrier: "local",
          price: localDeliveryPrice,
          delivery_days: 1,
          is_local: true,
          recommended: false,
        });
      } else {
        if (carriers.fedex || carriers.ups) {
          shippingOptions.push({
            id: "overnight",
            label: "Overnight Shipping",
            carrier: carriers.fedex ? "FedEx" : "UPS",
            price: 35.99,
            delivery_days: 1,
            is_local: false,
          });
          shippingOptions.push({
            id: "two_day",
            label: "2-Day Shipping",
            carrier: carriers.ups ? "UPS" : "FedEx",
            price: 19.99,
            delivery_days: 2,
            is_local: false,
            recommended: true,
          });
          shippingOptions.push({
            id: "ground_35",
            label: "3-5 Day Ground",
            carrier: carriers.usps ? "USPS" : "UPS",
            price: 8.99,
            delivery_days: 5,
            is_local: false,
          });
        }
      }

      const nonPerishableTotal = nonPerishableItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );

      groups.push({
        type: "non_perishable",
        label: "Décor & Non-Perishables",
        items: nonPerishableItems,
        subtotal: nonPerishableTotal,
        shipping_options: shippingOptions,
        min_advance_days: 0,
        days_advance_met: true,
        warnings: [],
      });
    }

    // Check blackout dates
    const blackoutWarning =
      delivery_date && blackoutDates.includes(delivery_date)
        ? [`${delivery_date} is a blackout date. Please select a different delivery date.`]
        : [];

    return new Response(
      JSON.stringify({
        groups,
        is_local: isLocal,
        distance_miles: distance_miles || null,
        blackout_warning: blackoutWarning,
        settings: {
          delivery_radius_miles: deliveryRadius,
          local_delivery_price: localDeliveryPrice,
          min_perishable_advance_days: minPerishableDays,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("fp-shipping-rules error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Rules engine failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
