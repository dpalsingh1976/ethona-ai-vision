import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const customData: Record<string, unknown> = callAnalysis.custom_analysis_data || {};

    const rawPhone = call.to_number || call.from_number;
    const normalized = normalizePhone(rawPhone || "");

    if (!normalized) {
      console.error("Could not determine lead phone from call:", call.call_id);
      return new Response(
        JSON.stringify({ error: "Could not determine lead phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const TABLE_NAME = encodeURIComponent("LEAD_INSURANCE_TABLE");
    const queryAirtable = async (formula: string) => {
      const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`;
      const url = new URL(baseUrl);
      url.searchParams.set("filterByFormula", formula);
      url.searchParams.set("maxRecords", "1");

      console.log("Airtable request URL:", url.toString());

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 404) return { records: [] };
        throw new Error(`Airtable query error ${res.status}: ${errText}`);
      }
      return res.json();
    };

    let data = await queryAirtable(`{to_phone_number}='${normalized}'`);
    if (!data.records || data.records.length === 0) {
      const suffix = last10(normalized);
      data = await queryAirtable(
        `RIGHT(SUBSTITUTE({to_phone_number}, "+", ""), 10)='${suffix}'`
      );
    }

    if (!data.records || data.records.length === 0) {
      console.warn("Lead not found in Airtable for phone:", normalized);
    } else {
      const record = data.records[0];
      const recordId = record.id;

      let callStatus: string = String(customData.call_status || "").trim() || "";
      if (!callStatus) {
        if (call.in_voicemail) {
          callStatus = "voicemail";
        } else if (call.disconnection_reason === "dial_no_answer") {
          callStatus = "no_answer";
        } else if (call.transcript) {
          callStatus = "answered";
        } else {
          callStatus = "unknown";
        }
      }

      const updates: Record<string, unknown> = {
        call_status: callStatus,
        last_called: todayDate(),
      };

      if (call.recording_url) {
        updates.recording = call.recording_url;
      }

      if (event === "call_analyzed") {
        if (customData.interest_level !== undefined)
          updates.interest_level = String(customData.interest_level);
        if (customData.timeline !== undefined)
          updates.timeline = String(customData.timeline);
        if (customData.has_existing_coverage !== undefined)
          updates.has_existing_coverage = customData.has_existing_coverage;
        if (customData.working_with_advisor !== undefined)
          updates.working_with_advisor = customData.working_with_advisor;
        if (customData.transfer_attempted !== undefined)
          updates.transfer_attempted = customData.transfer_attempted;
        if (customData.next_action !== undefined)
          updates.next_action = String(customData.next_action);

        const notes =
          customData.notes ||
          callAnalysis.call_summary ||
          callAnalysis.in_call_summary ||
          null;
        if (notes) updates.notes = String(notes);
      }

      console.log("Updating Airtable record", recordId, "with:", updates);

      const updateRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}/${recordId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields: updates }),
        }
      );

      if (!updateRes.ok) {
        const errText = await updateRes.text();
        console.error("Airtable update failed:", errText);
      } else {
        console.log("Airtable record updated successfully");
      }
    }

    // Also persist the call locally for dashboard visibility
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
        outcome: String(customData.call_status || customData.interest_level || "outbound"),
        extracted_data: customData,
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
