import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, occasion, max_price, category_slug, limit = 20 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // AI query expansion — get semantic synonyms/tags
    let aiTerms: string[] = [];
    let expandedQuery = query || "";

    if (query && LOVABLE_API_KEY) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: "You are a flower shop search assistant. Expand search queries into related flower/occasion terms. Return JSON only.",
              },
              {
                role: "user",
                content: `Expand this flower shop search query into related terms, occasions, and flower types: "${query}". Return JSON: {"terms": ["term1", "term2", ...], "expanded": "expanded search string"}. Max 8 terms. Focus on flowers, occasions, Hindi terms (pooja, mandap, etc).`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            aiTerms = parsed.terms || [];
            expandedQuery = parsed.expanded || query;
          }
        }
      } catch (e) {
        console.error("AI expansion failed:", e);
      }
    }

    // Build database query
    let dbQuery = supabase
      .from("fp_products")
      .select(`
        id, name, description, price, mrp, is_perishable, prep_time_days,
        inventory_count, images, tags, shipping_class, is_active,
        fp_categories(id, name, slug, icon)
      `)
      .eq("is_active", true)
      .gt("inventory_count", 0)
      .order("inventory_count", { ascending: false });

    if (max_price) dbQuery = dbQuery.lte("price", max_price);

    // Category filter
    if (category_slug) {
      const { data: catData } = await supabase
        .from("fp_categories")
        .select("id")
        .eq("slug", category_slug)
        .single();
      if (catData) dbQuery = dbQuery.eq("category_id", catData.id);
    }

    // Occasion/tag filter
    if (occasion) {
      dbQuery = dbQuery.contains("tags", [occasion]);
    }

    const { data: allProducts, error } = await dbQuery.limit(200);

    if (error) throw error;

    let results = allProducts || [];

    // Client-side relevance scoring
    if (query || aiTerms.length > 0) {
      const searchTerms = [
        ...(query ? query.toLowerCase().split(/\s+/) : []),
        ...aiTerms.map((t) => t.toLowerCase()),
      ];

      results = results
        .map((p) => {
          const text = `${p.name} ${p.description || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
          let score = 0;
          for (const term of searchTerms) {
            if (p.name.toLowerCase().includes(term)) score += 10;
            if ((p.tags || []).some((t: string) => t.toLowerCase().includes(term))) score += 6;
            if ((p.description || "").toLowerCase().includes(term)) score += 3;
            if (text.includes(term)) score += 1;
          }
          return { ...p, _score: score };
        })
        .filter((p) => p._score > 0 || !query)
        .sort((a, b) => b._score - a._score);
    }

    // Fallback: if no results with query, return top products
    if (results.length === 0 && query) {
      const { data: fallback } = await supabase
        .from("fp_products")
        .select(`id, name, description, price, mrp, is_perishable, prep_time_days, inventory_count, images, tags, shipping_class, is_active, fp_categories(id, name, slug, icon)`)
        .eq("is_active", true)
        .gt("inventory_count", 0)
        .limit(8);
      results = (fallback || []).map((p) => ({ ...p, _score: 0 }));
    }

    return new Response(
      JSON.stringify({
        products: results.slice(0, limit),
        ai_terms: aiTerms,
        total: results.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("fp-search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Search failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
