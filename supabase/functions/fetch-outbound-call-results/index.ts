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
    const TABLE_NAME = encodeURIComponent("LEAD_INSURANCE_TABLE");
    const airtableUrl = new URL(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`
    );

    // Only fetch records where last_called is not empty (i.e., calls have been made)
    airtableUrl.searchParams.set("filterByFormula", "NOT({last_called}='')");
    airtableUrl.searchParams.set("pageSize", "50");
    // Sort by last_called descending
    airtableUrl.searchParams.set("sort[0][field]", "last_called");
    airtableUrl.searchParams.set("sort[0][direction]", "desc");

    const res = await fetch(airtableUrl.toString(), {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 404) {
        return new Response(JSON.stringify({ records: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Airtable error ${res.status}: ${errText}`);
    }

    const data = await res.json();

    const records = (data.records || []).map((record: { id: string; fields: Record<string, string> }) => {
      const f = record.fields;
      return {
        id: record.id,
        first_name: f.first_name || f.First_Name || f["First Name"] || "",
        last_name: f.last_name || f.Last_Name || f["Last Name"] || "",
        to_phone_number: f.to_phone_number || f.To_Phone_Number || f["To Phone Number"] || "",
        call_status: f.call_status || f.Call_Status || f["Call Status"] || "unknown",
        last_called: f.last_called || f.Last_Called || f["Last Called"] || "",
        interest_level: f.interest_level || f.Interest_Level || f["Interest Level"] || "",
        timeline: f.timeline || f.Timeline || "",
        next_action: f.next_action || f.Next_Action || f["Next Action"] || "",
        notes: f.notes || f.Notes || "",
        lead_source: f.lead_source || f.Lead_Source || f["Lead Source"] || "",
        original_interest: f.original_interest || f.Original_Interest || f["Original Interest"] || "",
        has_existing_coverage: f.has_existing_coverage || f.Has_Existing_Coverage || "",
        working_with_advisor: f.working_with_advisor || f.Working_With_Advisor || "",
        transfer_attempted: f.transfer_attempted || f.Transfer_Attempted || "",
      };
    });

    return new Response(
      JSON.stringify({ records }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("fetch-outbound-call-results error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
