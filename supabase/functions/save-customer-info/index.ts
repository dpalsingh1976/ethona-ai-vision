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
    const body = await req.json();
    const { agent_id, call_id } = body;

    console.log("save-customer-info called with:", JSON.stringify({ agent_id, call_id, caller_name: body.caller_name }));

    if (!agent_id) {
      console.error("Missing agent_id in request body:", JSON.stringify(body));
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
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Classify lead
    const score = classifyLead(body);
    const status = mapLeadStatus(score);

    const budgetMin = body.budget_min ? Number(body.budget_min) : null;
    const budgetMax = body.budget_max ? Number(body.budget_max) : null;
    const preApproved = body.pre_approved === true || body.pre_approved === "true";
    const desiredAreas = body.preferred_locations
      ? (Array.isArray(body.preferred_locations) ? body.preferred_locations : [body.preferred_locations])
      : null;

    const leadData = {
      org_id: agent.org_id,
      agent_id: agent.id,
      name: sanitize(body.caller_name, 200),
      caller_phone: sanitize(body.phone, 30),
      email: sanitize(body.email, 255),
      timeline: sanitize(body.timeline, 100),
      budget_min: budgetMin,
      budget_max: budgetMax,
      financing_status: sanitize(body.financing_status, 100),
      pre_approved: preApproved,
      desired_areas: desiredAreas,
      must_haves: {
        bedrooms: body.bedrooms || null,
        bathrooms: body.bathrooms || null,
        features: body.must_haves || null,
      },
      motivation_reason: sanitize(body.motivation_reason, 500),
      score,
      status,
    };

    // Check if a call record already exists for this call_id
    const { data: existingCall } = await supabase
      .from("calls")
      .select("id, lead_id")
      .eq("retell_call_id", call_id)
      .maybeSingle();

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

      if (!existingCall) {
        // Create call stub
        await supabase.from("calls").insert({
          org_id: agent.org_id,
          agent_id: agent.id,
          lead_id: leadId,
          retell_call_id: call_id,
          outcome: score,
          extracted_data: body,
        });
      } else {
        // Link lead to existing call
        await supabase.from("calls").update({ lead_id: leadId }).eq("id", existingCall.id);
      }
    }

    console.log("Saved customer info:", { call_id, leadId, score, status });

    return new Response(JSON.stringify({ success: true, lead_id: leadId, score, status }), {
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
