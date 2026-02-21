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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: orgIds } = await adminSupabase.rpc("get_user_org_ids", { _user_id: userId });
    if (!orgIds?.length) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: agents } = await adminSupabase
      .from("agents")
      .select("id, retell_agent_id, org_id")
      .in("org_id", orgIds)
      .not("retell_agent_id", "is", null);

    if (!agents?.length) {
      return new Response(JSON.stringify({ calls: [], synced: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const retellApiKey = Deno.env.get("RETELL_API_KEY");
    if (!retellApiKey) {
      return new Response(JSON.stringify({ error: "RETELL_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const retellAgentIds = agents.map((a) => a.retell_agent_id).filter(Boolean);

    const retellRes = await fetch("https://api.retellai.com/v2/list-calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${retellApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter_criteria: { agent_id: retellAgentIds },
        limit: 100,
        sort_order: "descending",
      }),
    });

    if (!retellRes.ok) {
      const errText = await retellRes.text();
      console.error("Retell API error:", retellRes.status, errText);
      return new Response(JSON.stringify({ error: "Failed to fetch from Retell" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const retellCalls = await retellRes.json();

    let synced = 0;
    for (const rc of retellCalls) {
      const agent = agents.find((a) => a.retell_agent_id === rc.agent_id);
      if (!agent) continue;

      const { data: existing } = await adminSupabase
        .from("calls")
        .select("id")
        .eq("retell_call_id", rc.call_id)
        .maybeSingle();

      if (!existing) {
        const extractedData = rc.call_analysis?.custom_analysis_data || {};
        await adminSupabase.from("calls").insert({
          org_id: agent.org_id,
          agent_id: agent.id,
          retell_call_id: rc.call_id,
          started_at: rc.start_timestamp ? new Date(rc.start_timestamp).toISOString() : null,
          ended_at: rc.end_timestamp ? new Date(rc.end_timestamp).toISOString() : null,
          duration_seconds: rc.call_duration_ms ? Math.round(rc.call_duration_ms / 1000) : null,
          transcript: rc.transcript || null,
          transcript_summary: rc.call_analysis?.call_summary || null,
          recording_url: rc.recording_url || null,
          outcome: extractedData.lead_status || null,
          extracted_data: extractedData,
        });
        synced++;
      }
    }

    return new Response(
      JSON.stringify({ calls: retellCalls, synced, total: retellCalls.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("fetch-retell-calls error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
