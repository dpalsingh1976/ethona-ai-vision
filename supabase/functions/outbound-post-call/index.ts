import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 7) return `+${digits}`;
  return null;
}

function last10(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Return a string value or undefined (omits falsy/empty from payload) */
function strOrUndef(v: unknown): string | undefined {
  const s = String(v ?? "").trim();
  return s && s !== "undefined" && s !== "null" ? s : undefined;
}

/** Return a boolean or undefined */
function boolOrUndef(v: unknown): boolean | undefined {
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return undefined;
}

// ── Airtable helpers ──────────────────────────────────────────────────────────

async function queryAirtable(
  baseUrl: string,
  apiKey: string,
  formula: string
): Promise<{ records: { id: string; fields: Record<string, unknown> }[] }> {
  const url = new URL(baseUrl);
  url.searchParams.set("filterByFormula", formula);
  url.searchParams.set("maxRecords", "1");
  console.log("Airtable query:", url.toString());
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 404) return { records: [] };
    throw new Error(`Airtable query error ${res.status}: ${errText}`);
  }
  return res.json();
}

async function patchAirtableRecord(
  baseId: string,
  tableName: string,
  recordId: string,
  apiKey: string,
  fields: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, error: errText };
  }
  return { ok: true };
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
  const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("Missing Airtable credentials");
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const event = body.event;
    console.log("Post-call webhook event:", event);

    // Ignore non-relevant events
    if (event === "call_started") {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (event !== "call_ended" && event !== "call_analyzed") {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const call = body.call;
    if (!call) {
      return new Response(JSON.stringify({ error: "No call data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callAnalysis = call.call_analysis || {};
    // customData holds all extract_dynamic_variable values set by the conversation flow
    const customData: Record<string, unknown> = callAnalysis.custom_analysis_data || {};

    // ── Resolve phone ──────────────────────────────────────────────────────
    const rawPhone = call.to_number || call.from_number;
    const normalized = normalizePhone(rawPhone || "");
    if (!normalized) {
      console.error("Could not determine lead phone from call:", call.call_id);
      return new Response(
        JSON.stringify({ error: "Could not determine lead phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Look up Airtable record ────────────────────────────────────────────
    const TABLE_NAME = encodeURIComponent("LEAD_INSURANCE_TABLE");
    const airtableBaseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`;

    let data = await queryAirtable(airtableBaseUrl, AIRTABLE_API_KEY, `{to_phone_number}='${normalized}'`);
    if (!data.records || data.records.length === 0) {
      const suffix = last10(normalized);
      data = await queryAirtable(
        airtableBaseUrl,
        AIRTABLE_API_KEY,
        `RIGHT(SUBSTITUTE({to_phone_number}, "+", ""), 10)='${suffix}'`
      );
    }

    // ── Determine call_status fallback ────────────────────────────────────
    let callStatus: string = strOrUndef(customData.call_status) ?? "";
    if (!callStatus) {
      if (call.in_voicemail) {
        callStatus = "Voicemail Left";
      } else if (call.disconnection_reason === "dial_no_answer") {
        callStatus = "No Answer";
      } else if (call.transcript) {
        callStatus = "Connected - Interested";
      } else {
        callStatus = "No Answer";
      }
    }

    if (!data.records || data.records.length === 0) {
      console.warn("Lead not found in Airtable for phone:", normalized);
    } else {
      const record = data.records[0];
      const recordId = record.id;

      // ── PATCH 1: Core fields (always written — must not break existing flow) ──
      // These fields are the existing Airtable columns that were already present.
      const coreFields: Record<string, unknown> = {
        call_status: callStatus,
        last_called: todayDate(),
      };

      if (event === "call_analyzed") {
        const interest = strOrUndef(customData.interest_level);
        if (interest) coreFields.interest_level = interest;

        const timeline = strOrUndef(customData.timeline);
        if (timeline) coreFields.timeline = timeline;

        const hasCoverage = boolOrUndef(customData.has_existing_coverage);
        if (hasCoverage !== undefined) coreFields.has_existing_coverage = hasCoverage;

        const withAdvisor = boolOrUndef(customData.working_with_advisor);
        if (withAdvisor !== undefined) coreFields.working_with_advisor = withAdvisor;

        const transferAttempted = boolOrUndef(customData.transfer_attempted);
        if (transferAttempted !== undefined) coreFields.transfer_attempted = transferAttempted;

        const nextAction = strOrUndef(customData.next_action);
        if (nextAction) coreFields.next_action = nextAction;

        // notes: prefer call_summary from new flow, fallback to legacy notes / call_summary fields
        const notes =
          strOrUndef(customData.notes) ||
          strOrUndef(callAnalysis.call_summary) ||
          strOrUndef(callAnalysis.in_call_summary) ||
          undefined;
        if (notes) coreFields.notes = notes;
      }

      console.log("Airtable PATCH 1 (core):", recordId, coreFields);
      const coreResult = await patchAirtableRecord(AIRTABLE_BASE_ID, TABLE_NAME, recordId, AIRTABLE_API_KEY, coreFields);
      if (!coreResult.ok) {
        console.error("Airtable core PATCH failed:", coreResult.error);
      } else {
        console.log("Airtable core fields updated successfully");
      }

      // ── PATCH 2: Enhanced intelligence fields (best-effort — new columns) ──
      // These fields are extracted by the new financial services conversation flow.
      // If the Airtable columns do not yet exist, this PATCH may fail — that is safe
      // because core fields were already saved in PATCH 1.
      //
      // RECOMMENDED NEW AIRTABLE COLUMNS TO CREATE:
      //   product_interest      — Text: "Retirement Planning" | "Life Insurance" | "Both"
      //   primary_goal          — Text: e.g. "family protection", "tax-efficient retirement"
      //   family_stage          — Text: e.g. "kids at home", "grown children", "no dependents"
      //   employment_stage      — Text: e.g. "working full-time", "pre-retirement", "retired"
      //   urgency_level         — Text: "high" | "medium" | "low"
      //   objection_reason      — Text: e.g. "already has advisor", "not interested"
      //   callback_requested    — Checkbox (boolean)
      //   appointment_ready     — Checkbox (boolean)
      //   call_summary          — Long text: concise 2-3 sentence human-readable summary
      //   extracted_need_signals — Long text: comma-separated detected need signals
      if (event === "call_analyzed") {
        const enhancedFields: Record<string, unknown> = {};

        const productInterest = strOrUndef(customData.product_interest);
        if (productInterest) enhancedFields.product_interest = productInterest;

        const primaryGoal = strOrUndef(customData.primary_goal);
        if (primaryGoal) enhancedFields.primary_goal = primaryGoal;

        const familyStage = strOrUndef(customData.family_stage);
        if (familyStage) enhancedFields.family_stage = familyStage;

        const employmentStage = strOrUndef(customData.employment_stage);
        if (employmentStage) enhancedFields.employment_stage = employmentStage;

        const urgencyLevel = strOrUndef(customData.urgency_level);
        if (urgencyLevel) enhancedFields.urgency_level = urgencyLevel;

        const objectionReason = strOrUndef(customData.objection_reason);
        if (objectionReason) enhancedFields.objection_reason = objectionReason;

        const callbackRequested = boolOrUndef(customData.callback_requested);
        if (callbackRequested !== undefined) enhancedFields.callback_requested = callbackRequested;

        const appointmentReady = boolOrUndef(customData.appointment_ready);
        if (appointmentReady !== undefined) enhancedFields.appointment_ready = appointmentReady;

        // call_summary: prefer flow's dedicated field, fallback to Retell's call_summary
        const callSummary =
          strOrUndef(customData.call_summary) ||
          strOrUndef(callAnalysis.call_summary) ||
          undefined;
        if (callSummary) enhancedFields.call_summary = callSummary;

        const needSignals = strOrUndef(customData.extracted_need_signals);
        if (needSignals) enhancedFields.extracted_need_signals = needSignals;

        if (Object.keys(enhancedFields).length > 0) {
          console.log("Airtable PATCH 2 (enhanced):", recordId, enhancedFields);
          const enhancedResult = await patchAirtableRecord(
            AIRTABLE_BASE_ID,
            TABLE_NAME,
            recordId,
            AIRTABLE_API_KEY,
            enhancedFields
          );
          if (!enhancedResult.ok) {
            // Non-fatal — columns may not exist yet in Airtable
            console.warn(
              "Airtable enhanced PATCH failed (columns may not exist yet — create them in Airtable):",
              enhancedResult.error
            );
          } else {
            console.log("Airtable enhanced fields updated successfully");
          }
        }
      }
    }

    // ── Persist call locally in Supabase for dashboard visibility ────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: agent } = await supabase
      .from("agents")
      .select("id, org_id")
      .eq("retell_agent_id", call.agent_id)
      .maybeSingle();

    if (agent) {
      const { data: existingCall } = await supabase
        .from("calls")
        .select("id")
        .eq("retell_call_id", call.call_id)
        .maybeSingle();

      const callPayload = {
        org_id: agent.org_id,
        agent_id: agent.id,
        retell_call_id: call.call_id,
        started_at: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : null,
        ended_at: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null,
        duration_seconds: call.call_duration_ms ? Math.round(call.call_duration_ms / 1000) : null,
        transcript: call.transcript || null,
        transcript_summary: callAnalysis.call_summary || null,
        recording_url: call.recording_url || null,
        // outcome stores the enriched call_status label from the flow
        outcome: callStatus,
        // extracted_data stores all structured signals for dashboard display
        extracted_data: {
          ...customData,
          call_status: callStatus,
        },
      };

      if (existingCall) {
        await supabase.from("calls").update(callPayload).eq("id", existingCall.id);
      } else {
        await supabase.from("calls").insert(callPayload);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Post-call webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
