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
    console.log("Pre-call webhook received:", JSON.stringify(body));

    const rawPhone = body.phone_number || body.to_number || body.from_number || null;

    if (!rawPhone) {
      return new Response(
        JSON.stringify({ error: "No phone number provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalized = normalizePhone(rawPhone);
    if (!normalized) {
      return new Response(
        JSON.stringify({ error: "Could not normalize phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Looking up phone:", normalized);

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
        throw new Error(`Airtable error ${res.status}: ${errText}`);
      }
      return res.json();
    };

    let data = await queryAirtable(`{to_phone_number}='${normalized}'`);

    if (!data.records || data.records.length === 0) {
      console.log("No exact match, trying last-10-digit fallback");
      const suffix = last10(normalized);
      data = await queryAirtable(
        `RIGHT(SUBSTITUTE({to_phone_number}, "+", ""), 10)='${suffix}'`
      );
    }

    if (!data.records || data.records.length === 0) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const record = data.records[0];
    const fields = record.fields;

    const leadContext = {
      first_name: fields.first_name || fields.First_Name || fields["First Name"] || "",
      last_name: fields.last_name || fields.Last_Name || fields["Last Name"] || "",
      phone_number: fields.to_phone_number || fields.phone_number || fields.Phone || normalized,
      lead_source: fields.lead_source || fields.Lead_Source || fields["Lead Source"] || "",
      original_interest: fields.original_interest || fields.Original_Interest || fields["Original Interest"] || "",
      advisor_name: fields.advisor_name || fields.Advisor_Name || fields["Advisor Name"] || "",
      transfer_number: fields.transfer_number || fields.Transfer_Number || fields["Transfer Number"] || "",
      advisor_website: fields.advisor_website || fields.Advisor_Website || fields["Advisor Website"] || "",
    };

    console.log("Returning lead context:", leadContext);

    return new Response(JSON.stringify(leadContext), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Pre-call webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
