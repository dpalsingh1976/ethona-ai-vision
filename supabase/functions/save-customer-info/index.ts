import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function classifyLead(data: Record<string, unknown>): string {
  const hasAgent = data.has_agent === true || data.has_agent === "true" || data.has_agent === "yes";
  if (hasAgent) return "DISQUALIFIED";

  const timeline = String(data.timeline || "").toLowerCase();
  const isHotTimeline = timeline.includes("0-3") || timeline.includes("1-3") || timeline.includes("next") || timeline.includes("couple") || timeline.includes("soon") || timeline.includes("immediately") || timeline.includes("month") || timeline.includes("1 month") || timeline.includes("2 month") || timeline.includes("3 month");
  const isWarmTimeline = timeline.includes("3-6") || timeline.includes("six");
  const preApproved = data.pre_approved === true || data.pre_approved === "true" || String(data.financing_status || "").toLowerCase().includes("pre-approved") || String(data.financing_status || "").toLowerCase().includes("preapproved") || String(data.financing_status || "").toLowerCase().includes("cash");
  const hasBudget = !!data.budget_max || !!data.budget_min || !!data.budget;

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

function sanitize(val: unknown, maxLen = 500): string | null {
  if (val == null || val === "") return null;
  return String(val).slice(0, maxLen).trim() || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const rawBody = await req.json();

    // Retell sends function call payloads wrapped in a "call" object
    // Extract the actual data from the Retell payload format
    const callData = rawBody.call || rawBody;
    const args = rawBody.args || {};
    const dynamicVars = callData.collected_dynamic_variables || {};

    // Merge: prefer args (function parameters) > dynamic variables > call-level fields
    const merged = { ...dynamicVars, ...args };

    const agent_id = merged.agent_id || callData.agent_id || rawBody.agent_id;
    const call_id = merged.call_id || callData.call_id || rawBody.call_id;

    console.log("save-customer-info called with:", JSON.stringify({
      has_call_wrapper: !!rawBody.call,
      agent_id,
      call_id,
      args_keys: Object.keys(args),
      dynamic_var_keys: Object.keys(dynamicVars),
      merged_keys: Object.keys(merged),
    }));

    if (!agent_id) {
      console.error("Missing agent_id. Raw body keys:", Object.keys(rawBody), "Call keys:", Object.keys(callData));
      return new Response(JSON.stringify({ error: "agent_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up agent by retell_agent_id
    const { data: agent } = await supabase
      .from("agents")
      .select("id, org_id")
      .eq("retell_agent_id", agent_id)
      .single();

    if (!agent) {
      console.error("Agent not found for retell_agent_id:", agent_id);
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract customer data from merged sources, also try parsing from transcript if dynamic vars are empty
    const callerName = sanitize(merged.caller_name || merged.name, 200);
    const phone = sanitize(merged.phone || merged.caller_phone, 30);
    const email = sanitize(merged.email, 255);
    const timeline = sanitize(merged.timeline, 100);
    const budgetStr = merged.budget || merged.budget_max;
    const budgetMin = merged.budget_min ? Number(merged.budget_min) : null;
    const budgetMax = budgetStr ? Number(String(budgetStr).replace(/[^0-9.]/g, '')) : null;
    const financingStatus = sanitize(merged.financing_status || merged.pre_approval_status, 100);
    const preApproved = merged.pre_approved === true || merged.pre_approved === "true" || 
      String(financingStatus || "").toLowerCase().includes("pre-approved") ||
      String(financingStatus || "").toLowerCase().includes("preapproved");
    const desiredAreas = merged.preferred_locations
      ? (Array.isArray(merged.preferred_locations) ? merged.preferred_locations : [merged.preferred_locations])
      : null;
    const hasAgent = merged.has_agent === true || merged.has_agent === "true" || merged.has_agent === "yes";

    // Classify lead
    const classifyData = {
      has_agent: hasAgent,
      timeline,
      pre_approved: preApproved,
      financing_status: financingStatus,
      budget_min: budgetMin,
      budget_max: budgetMax,
      budget: budgetStr,
    };
    const score = classifyLead(classifyData);
    const status = mapLeadStatus(score);

    const leadData = {
      org_id: agent.org_id,
      agent_id: agent.id,
      name: callerName,
      caller_phone: phone,
      email,
      timeline,
      budget_min: budgetMin,
      budget_max: budgetMax,
      financing_status: financingStatus,
      pre_approved: preApproved,
      desired_areas: desiredAreas,
      must_haves: {
        bedrooms: merged.bedrooms || null,
        bathrooms: merged.bathrooms || null,
        features: merged.must_haves || null,
      },
      motivation_reason: sanitize(merged.motivation_reason, 500),
      score,
      status,
    };

    console.log("Lead data to save:", JSON.stringify(leadData));

    // Check if a call record already exists for this call_id
    let existingCall = null;
    if (call_id) {
      const { data } = await supabase
        .from("calls")
        .select("id, lead_id")
        .eq("retell_call_id", call_id)
        .maybeSingle();
      existingCall = data;
    }

    let leadId: string | null = null;

    if (existingCall?.lead_id) {
      // Update existing lead
      await supabase
        .from("leads")
        .update(leadData)
        .eq("id", existingCall.lead_id);
      leadId = existingCall.lead_id;
    } else {
      // Create new lead
      const { data: lead } = await supabase
        .from("leads")
        .insert({ ...leadData, notes: `Mid-call save from ${call_id}` })
        .select("id")
        .single();
      leadId = lead?.id || null;

      if (!existingCall && call_id) {
        // Create call stub
        await supabase.from("calls").insert({
          org_id: agent.org_id,
          agent_id: agent.id,
          lead_id: leadId,
          retell_call_id: call_id,
          outcome: score,
          extracted_data: merged,
        });
      } else if (existingCall) {
        // Link lead to existing call
        await supabase.from("calls").update({ lead_id: leadId }).eq("id", existingCall.id);
      }
    }

    console.log("Saved customer info:", { call_id, leadId, score, status });

    // Return result that Retell can use in subsequent nodes
    return new Response(JSON.stringify({ 
      result: `Lead saved successfully. Score: ${score}, Status: ${status}`,
      lead_id: leadId, 
      score, 
      status 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("save-customer-info error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
