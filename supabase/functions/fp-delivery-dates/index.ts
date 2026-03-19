import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { product_ids, event_date, is_local = true } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load settings
    const { data: settingsRows } = await supabase
      .from("fp_admin_settings")
      .select("key, value");

    const settings: Record<string, any> = {};
    for (const row of settingsRows || []) {
      settings[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    }

    const minPerishableDays = Number(settings.min_perishable_advance_days) || 8;
    const blackoutDates: string[] = settings.blackout_dates || [];
    const sameDayCutoff = Number(settings.same_day_cutoff_hour) || 10;

    // Load products to determine max prep time
    let maxPrepDays = 0;
    let hasPerishable = false;

    if (product_ids && product_ids.length > 0) {
      const { data: products } = await supabase
        .from("fp_products")
        .select("id, prep_time_days, is_perishable")
        .in("id", product_ids);

      for (const p of products || []) {
        if (p.prep_time_days > maxPrepDays) maxPrepDays = p.prep_time_days;
        if (p.is_perishable) hasPerishable = true;
      }
    }

    // Determine minimum days from today
    let minDays = maxPrepDays;
    if (hasPerishable && !is_local) {
      minDays = Math.max(minDays, minPerishableDays);
    } else if (hasPerishable) {
      minDays = Math.max(minDays, 1);
    }

    // Check if today's cutoff passed
    const nowHour = new Date().getUTCHours() + (Deno.env.get("TIMEZONE_OFFSET") ? 0 : -8);
    if (nowHour >= sameDayCutoff && minDays === 0) {
      minDays = 1;
    }

    // Generate valid dates for next 90 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDateObj = event_date ? new Date(event_date) : null;

    const availableDates: string[] = [];
    const blockedDates: string[] = [...blackoutDates];

    for (let i = 0; i <= 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];

      // Block past minimum lead time
      if (i < minDays) {
        blockedDates.push(dateStr);
        continue;
      }

      // Block dates after event date
      if (eventDateObj && d > eventDateObj) {
        continue;
      }

      // Block blackout dates
      if (blackoutDates.includes(dateStr)) {
        continue;
      }

      availableDates.push(dateStr);
    }

    return new Response(
      JSON.stringify({
        available_dates: availableDates,
        blocked_dates: blockedDates,
        min_advance_days: minDays,
        has_perishable: hasPerishable,
        max_prep_days: maxPrepDays,
        cutoff_hour: sameDayCutoff,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("fp-delivery-dates error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to compute delivery dates" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
