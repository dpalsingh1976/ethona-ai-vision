const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
  const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return new Response(JSON.stringify({ error: "Missing Airtable credentials" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const offset = url.searchParams.get("offset") || "";
    const search = url.searchParams.get("search") || "";

    const TABLE_NAME = encodeURIComponent("LEAD_INSURANCE_TABLE");
    const airtableUrl = new URL(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`
    );
    airtableUrl.searchParams.set("pageSize", "50");

    // Only return rows where both to_phone_number AND from_phone_number are non-empty
    const baseFilter = `AND(NOT({to_phone_number}=''), NOT({from_phone_number}=''))`;

    if (search) {
      airtableUrl.searchParams.set(
        "filterByFormula",
        `AND(${baseFilter}, OR(SEARCH("${search}", LOWER({first_name})), SEARCH("${search}", LOWER({last_name})), SEARCH("${search}", {to_phone_number})))`
      );
    } else {
      airtableUrl.searchParams.set("filterByFormula", baseFilter);
    }

    if (offset) {
      airtableUrl.searchParams.set("offset", offset);
    }

    const res = await fetch(airtableUrl.toString(), {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 404) {
        return new Response(JSON.stringify({ records: [], offset: null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Airtable error ${res.status}: ${errText}`);
    }

    const data = await res.json();

    const leads = (data.records || []).map((record: { id: string; fields: Record<string, string> }) => {
      const f = record.fields;
      return {
        id: record.id,
        first_name: f.first_name || f.First_Name || f["First Name"] || "",
        last_name: f.last_name || f.Last_Name || f["Last Name"] || "",
        to_phone_number: f.to_phone_number || f.To_Phone_Number || f["To Phone Number"] || "",
        from_phone_number: f.from_phone_number || f.From_Phone_Number || f["From Phone Number"] || "",
        lead_source: f.lead_source || f.Lead_Source || f["Lead Source"] || "",
        original_interest: f.original_interest || f.Original_Interest || f["Original Interest"] || "",
        advisor_name: f.advisor_name || f.Advisor_Name || f["Advisor Name"] || "",
        agent_name: f.agent_name || f.Agent_name || f.Agent_Name || f["Agent Name"] || "Sarah",
        advisor_website: f.advisor_website || f.Advisor_Website || f["Advisor Website"] || "",
        status: f.status || f.Status || "",
      };
    });

    return new Response(
      JSON.stringify({ leads, offset: data.offset || null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("fetch-airtable-leads error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
