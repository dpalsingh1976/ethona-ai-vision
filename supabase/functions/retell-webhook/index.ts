import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function classifyLead(data: Record<string, unknown>): string {
  const hasAgent = data.has_agent === true || data.has_agent === "true" || data.has_agent === "yes";
  if (hasAgent) return "DISQUALIFIED";

  const timeline = String(data.timeline || "").toLowerCase();
  const isHotTimeline = timeline.includes("0-3") || timeline.includes("1-3") || timeline.includes("next") || timeline.includes("couple") || timeline.includes("soon") || timeline.includes("immediately");
  const isWarmTimeline = timeline.includes("3-6") || timeline.includes("six");
  const preApproved = data.pre_approved === true || data.pre_approved === "true" || String(data.financing_status || "").toLowerCase().includes("pre-approved") || String(data.financing_status || "").toLowerCase().includes("cash");
  const hasBudget = !!data.budget_max || !!data.budget_min;

  if (isHotTimeline && preApproved && hasBudget) return "HOT";
  if (isWarmTimeline || (isHotTimeline && (!preApproved || !hasBudget))) return "WARM";
  return "COLD";
}

function mapLeadStatus(score: string): string {
  switch (score) {
    case "HOT": return "ready";
    case "WARM": return "warm";
    case "COLD": return "nurture";
    case "DISQUALIFIED": return "disqualified";
    default: return "new";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { event, call } = body;

    console.log("Webhook event received:", event, "call_id:", call?.call_id);

    if (event !== "call_ended" && event !== "call_analyzed") {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const retellAgentId = call.agent_id;
    const extractedData = call.call_analysis?.custom_analysis_data || call.extracted_data || {};

    const { data: agent } = await supabase
      .from("agents")
      .select("id, org_id")
      .eq("retell_agent_id", retellAgentId)
      .single();

    if (!agent) {
      console.error("No agent found for retell_agent_id:", retellAgentId);
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingCall } = await supabase
      .from("calls")
      .select("id, lead_id")
      .eq("retell_call_id", call.call_id)
      .maybeSingle();

    const leadScore = extractedData.lead_status || classifyLead(extractedData);
    const leadStatus = mapLeadStatus(leadScore);
    const budgetMin = extractedData.budget_min ? Number(extractedData.budget_min) : null;
    const budgetMax = extractedData.budget_max ? Number(extractedData.budget_max) : null;

    if (existingCall) {
      await supabase
        .from("calls")
        .update({
          transcript: call.transcript || undefined,
          transcript_summary: call.call_analysis?.call_summary || undefined,
          recording_url: call.recording_url || undefined,
          outcome: leadScore,
          extracted_data: extractedData,
          duration_seconds: call.call_duration_ms ? Math.round(call.call_duration_ms / 1000) : undefined,
          ended_at: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : undefined,
        })
        .eq("id", existingCall.id);

      if (existingCall.lead_id) {
        await supabase
          .from("leads")
          .update({
            name: extractedData.caller_name || undefined,
            caller_phone: extractedData.phone || call.from_number || undefined,
            email: extractedData.email || undefined,
            timeline: extractedData.timeline || undefined,
            budget_min: budgetMin,
            budget_max: budgetMax,
            financing_status: extractedData.financing_status || undefined,
            pre_approved: extractedData.pre_approved === true || extractedData.pre_approved === "true",
            desired_areas: extractedData.preferred_locations
              ? (Array.isArray(extractedData.preferred_locations) ? extractedData.preferred_locations : [extractedData.preferred_locations])
              : undefined,
            must_haves: {
              bedrooms: extractedData.bedrooms || null,
              bathrooms: extractedData.bathrooms || null,
              features: extractedData.must_haves || null,
            },
            motivation_reason: extractedData.motivation_reason || undefined,
            score: leadScore,
            status: leadStatus,
          })
          .eq("id", existingCall.lead_id);
      }

      return new Response(JSON.stringify({ success: true, updated: true, lead_id: existingCall.lead_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        org_id: agent.org_id,
        agent_id: agent.id,
        name: extractedData.caller_name || null,
        caller_phone: extractedData.phone || call.from_number || null,
        email: extractedData.email || null,
        timeline: extractedData.timeline || null,
        budget_min: budgetMin,
        budget_max: budgetMax,
        financing_status: extractedData.financing_status || null,
        pre_approved: extractedData.pre_approved === true || extractedData.pre_approved === "true",
        desired_areas: extractedData.preferred_locations
          ? (Array.isArray(extractedData.preferred_locations) ? extractedData.preferred_locations : [extractedData.preferred_locations])
          : null,
        must_haves: {
          bedrooms: extractedData.bedrooms || null,
          bathrooms: extractedData.bathrooms || null,
          features: extractedData.must_haves || null,
        },
        motivation_reason: extractedData.motivation_reason || null,
        score: leadScore,
        status: leadStatus,
        notes: `Auto-created from call ${call.call_id}`,
      })
      .select()
      .single();

    if (leadError) console.error("Failed to create lead:", leadError);

    const { error: callError } = await supabase
      .from("calls")
      .insert({
        org_id: agent.org_id,
        agent_id: agent.id,
        lead_id: lead?.id || null,
        retell_call_id: call.call_id,
        started_at: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : null,
        ended_at: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null,
        duration_seconds: call.call_duration_ms ? Math.round(call.call_duration_ms / 1000) : null,
        transcript: call.transcript || null,
        transcript_summary: call.call_analysis?.call_summary || null,
        recording_url: call.recording_url || null,
        outcome: leadScore,
        extracted_data: extractedData,
      });

    if (callError) console.error("Failed to create call:", callError);

    if (extractedData.appointment_requested === true || extractedData.appointment_requested === "true") {
      await supabase
        .from("appointments")
        .insert({
          org_id: agent.org_id,
          agent_id: agent.id,
          lead_id: lead?.id || null,
          start_time: new Date().toISOString(),
          notes: `Preferred: ${extractedData.preferred_day || "TBD"} at ${extractedData.preferred_time || "TBD"}`,
          status: "scheduled",
        });
    }

    return new Response(JSON.stringify({ success: true, lead_id: lead?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
