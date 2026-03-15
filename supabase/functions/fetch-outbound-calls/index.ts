import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase credentials" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { data, error } = await supabase
      .from("calls")
      .select("id, retell_call_id, outcome, started_at, ended_at, duration_seconds, transcript_summary, extracted_data, org_id")
      .not("outcome", "is", null)
      .order("started_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const records = (data ?? []).map((row) => {
      const ext = (row.extracted_data ?? {}) as Record<string, string>;
      return {
        id: row.id,
        retell_call_id: row.retell_call_id ?? "",
        // Use outcome from calls table as the authoritative call_status for this specific call
        call_status: row.outcome ?? "",
        started_at: row.started_at ?? "",
        ended_at: row.ended_at ?? "",
        duration_seconds: row.duration_seconds ?? null,
        transcript_summary: row.transcript_summary ?? "",
        // Lead identity from extracted_data
        first_name: ext.first_name ?? "",
        last_name: ext.last_name ?? "",
        to_phone_number: ext.to_phone_number ?? "",
        // Interest data — only meaningful when the call was actually answered/connected
        interest_level: ext.interest_level ?? "",
        next_action: ext.next_action ?? "",
        notes: ext.notes ?? "",
        timeline: ext.timeline ?? "",
        original_interest: ext.original_interest ?? "",
        lead_source: ext.lead_source ?? "",
        has_existing_coverage: ext.has_existing_coverage ?? "",
        working_with_advisor: ext.working_with_advisor ?? "",
        transfer_attempted: ext.transfer_attempted ?? "",
      };
    });

    return new Response(
      JSON.stringify({ records }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("fetch-outbound-calls error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
