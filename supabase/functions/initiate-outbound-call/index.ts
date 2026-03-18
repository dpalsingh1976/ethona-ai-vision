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

interface AirtableLead {
  first_name: string;
  last_name: string;
  to_phone_number: string;
  from_phone_number: string;
  lead_source: string;
  original_interest: string;
  advisor_name: string;
  agent_name: string;
  transfer_number: string;
  advisor_website: string;
}

async function lookupAirtableLead(toNumber: string): Promise<AirtableLead | null> {
  const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
  const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("Missing Airtable credentials — skipping lead lookup");
    return null;
  }

  const normalized = normalizePhone(toNumber);
  if (!normalized) return null;

  const TABLE_NAME = encodeURIComponent("LEAD_INSURANCE_TABLE");

  const queryAirtable = async (formula: string) => {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`);
    url.searchParams.set("filterByFormula", formula);
    url.searchParams.set("maxRecords", "1");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    if (!res.ok) {
      if (res.status === 404) return { records: [] };
      const errText = await res.text();
      throw new Error(`Airtable error ${res.status}: ${errText}`);
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

  if (!data.records || data.records.length === 0) return null;

  const fields = data.records[0].fields;
  return {
    first_name: fields.first_name || fields.First_Name || fields["First Name"] || "",
    last_name: fields.last_name || fields.Last_Name || fields["Last Name"] || "",
    to_phone_number: fields.to_phone_number || fields.To_Phone_Number || normalized,
    from_phone_number: fields.from_phone_number || fields.From_Phone_Number || fields["From Phone Number"] || "",
    lead_source: fields.lead_source || fields.Lead_Source || fields["Lead Source"] || "",
    original_interest: fields.original_interest || fields.Original_Interest || fields["Original Interest"] || "",
    advisor_name: fields.advisor_name || fields.Advisor_Name || fields["Advisor Name"] || "",
    agent_name: fields.agent_name || fields.Agent_name || fields.Agent_Name || fields["Agent Name"] || "Sarah",
    transfer_number: fields.transfer_number || fields.Transfer_Number || fields["Transfer Number"] || "",
    advisor_website: fields.advisor_website || fields.Advisor_Website || fields["Advisor Website"] || "",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RETELL_API_KEY = Deno.env.get("RETELL_API_KEY");
  if (!RETELL_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing RETELL_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { agent_id, from_number: ui_from_number, to_number } = body;

    if (!agent_id || !to_number) {
      return new Response(
        JSON.stringify({ error: "agent_id and to_number are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Initiating outbound call: agent=${agent_id} to=${to_number}`);

    let retell_llm_dynamic_variables: Record<string, string> | undefined;
    let from_number = ui_from_number;

    try {
      const leadData = await lookupAirtableLead(to_number);
      if (leadData) {
        if (leadData.from_phone_number) {
          from_number = normalizePhone(leadData.from_phone_number) || leadData.from_phone_number;
          console.log(`Using Airtable from_phone_number (normalized): ${from_number}`);
        }

        retell_llm_dynamic_variables = {
          first_name: leadData.first_name,
          last_name: leadData.last_name,
          to_phone_number: leadData.to_phone_number,
          lead_source: leadData.lead_source,
          original_interest: leadData.original_interest,
          advisor_name: leadData.advisor_name,
          agent_name: leadData.agent_name,
          transfer_number: leadData.transfer_number,
        };
        console.log("Injecting dynamic variables:", JSON.stringify(retell_llm_dynamic_variables));
      } else {
        console.warn("No Airtable lead found for", to_number, "— proceeding without dynamic variables");
      }
    } catch (airtableErr) {
      console.error("Airtable lookup failed:", airtableErr, "— proceeding without dynamic variables");
    }

    if (!from_number) {
      return new Response(
        JSON.stringify({ error: "from_number could not be determined. Ensure the lead has a from_phone_number in Airtable or supply it manually." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const retellPayload: Record<string, unknown> = {
      from_number,
      to_number,
      agent_id,
    };

    if (retell_llm_dynamic_variables) {
      retellPayload.retell_llm_dynamic_variables = retell_llm_dynamic_variables;
    }

    console.log("Retell payload:", JSON.stringify(retellPayload));

    const retellRes = await fetch("https://api.retellai.com/v2/create-phone-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(retellPayload),
    });

    const retellBody = await retellRes.json();
    console.log("Retell response:", JSON.stringify(retellBody));

    if (!retellRes.ok) {
      return new Response(
        JSON.stringify({ error: retellBody?.message || "Retell API error", detail: retellBody }),
        { status: retellRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(retellBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("initiate-outbound-call error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
