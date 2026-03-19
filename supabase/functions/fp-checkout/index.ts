import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      items,
      event_type,
      custom_event_name,
      event_date,
      delivery_date,
      delivery_mode,
      pickup_location_id,
      shipping_address,
      shipping_groups,
      shipping_cost_breakdown,
      guest_email,
      guest_name,
      notes,
    } = body;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get auth user (optional)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(SUPABASE_URL, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    // Validate inventory for each item
    for (const item of items) {
      const { data: product } = await supabase
        .from("fp_products")
        .select("id, name, inventory_count, price")
        .eq("id", item.product_id)
        .single();

      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product ${item.name} not found` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (product.inventory_count < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient inventory for ${product.name}. Only ${product.inventory_count} available.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );
    const shippingTotal = Object.values(shipping_cost_breakdown || {}).reduce(
      (sum: number, cost: any) => sum + (Number(cost) || 0),
      0
    );
    const totalAmount = subtotal + shippingTotal;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("fp_orders")
      .insert({
        user_id: userId,
        guest_email,
        guest_name,
        event_type,
        custom_event_name,
        event_date,
        delivery_date,
        delivery_mode,
        pickup_location_id: delivery_mode === "pickup" ? pickup_location_id : null,
        shipping_address: delivery_mode === "delivery" ? shipping_address : {},
        shipping_groups: shipping_groups || [],
        shipping_cost_breakdown: shipping_cost_breakdown || {},
        subtotal,
        shipping_total: shippingTotal,
        total_amount: totalAmount,
        status: "confirmed",
        notes,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      is_perishable: item.is_perishable,
      shipping_group: item.is_perishable ? "perishable" : "non_perishable",
    }));

    const { error: itemsError } = await supabase.from("fp_order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    // Deduct inventory
    for (const item of items) {
      await supabase.rpc("fp_deduct_inventory", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
        p_order_id: order.id,
      }).catch(() => {
        // Fallback if RPC doesn't exist — direct update
        return supabase
          .from("fp_products")
          .update({ inventory_count: supabase.rpc("fp_products_inventory_count - " + item.quantity) })
          .eq("id", item.product_id);
      });

      // Log inventory event
      await supabase.from("fp_inventory_events").insert({
        product_id: item.product_id,
        delta: -item.quantity,
        reason: "order_placed",
        order_id: order.id,
      });
    }

    // Directly decrement inventory with raw SQL via service role
    for (const item of items) {
      await supabase
        .from("fp_products")
        .update({ inventory_count: 0 }) // placeholder — see below
        .eq("id", "placeholder");
      
      // Use proper RPC approach
      const { data: prod } = await supabase
        .from("fp_products")
        .select("inventory_count")
        .eq("id", item.product_id)
        .single();
      
      if (prod) {
        await supabase
          .from("fp_products")
          .update({ inventory_count: Math.max(0, prod.inventory_count - item.quantity) })
          .eq("id", item.product_id);
      }
    }

    return new Response(
      JSON.stringify({
        order_id: order.id,
        status: order.status,
        total_amount: totalAmount,
        subtotal,
        shipping_total: shippingTotal,
        message: "Order placed successfully!",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("fp-checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Checkout failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
