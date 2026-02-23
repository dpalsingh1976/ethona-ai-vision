import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query = "", tags = [], category = "" } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If no search query, return all products with optional filters
    if (!query.trim()) {
      let q = supabase.from("grocery_products").select("*").eq("in_stock", true);
      if (category) q = q.eq("category", category);
      if (tags.length > 0) q = q.overlaps("tags", tags);
      const { data, error } = await q.order("name").limit(50);
      if (error) throw error;
      return new Response(JSON.stringify({
        products: (data || []).map(p => ({ ...p, keyword_score: 0, semantic_score: 0, final_score: 0 })),
        ai_terms: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1. Keyword search
    const keywordQuery = query.trim().split(/\s+/).map(t => t + ":*").join(" & ");
    
    let keywordSql = `
      SELECT *, ts_rank(search_document, to_tsquery('english', $1)) as kw_score
      FROM grocery_products
      WHERE search_document @@ to_tsquery('english', $1) AND in_stock = true
    `;
    const params: any[] = [keywordQuery];
    let paramIdx = 2;

    if (category) {
      keywordSql += ` AND category = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }

    keywordSql += ` ORDER BY kw_score DESC LIMIT 30`;

    const { data: keywordResults, error: kwError } = await supabase.rpc("execute_grocery_search", {
      search_query: keywordQuery,
      filter_category: category || null,
      filter_tags: tags.length > 0 ? tags : null,
    });

    // Fallback: use direct query if RPC doesn't exist yet
    let kwProducts: any[] = [];
    if (kwError) {
      // Direct approach using from()
      let q = supabase.from("grocery_products").select("*").eq("in_stock", true).textSearch("search_document", query, { type: "websearch" });
      if (category) q = q.eq("category", category);
      if (tags.length > 0) q = q.overlaps("tags", tags);
      const { data } = await q.limit(30);
      kwProducts = (data || []).map((p: any) => ({ ...p, kw_score: 1 }));
    } else {
      kwProducts = keywordResults || [];
    }

    // 2. AI semantic expansion via Lovable AI
    let aiTerms: string[] = [];
    let semanticProducts: any[] = [];

    try {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: `You are an Indian grocery product search assistant. Given a search query, return ONLY a JSON array of 5-10 related Indian grocery search terms/synonyms/product names. Include Hindi transliterations where relevant. No explanation, just the JSON array. Example: for "healthy snack" return ["makhana","roasted chana","diet namkeen","murmura","fox nuts","puffed rice","sugar free","diabetic friendly","oats","dry fruits"]`
              },
              { role: "user", content: query }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          // Extract JSON array from response
          const match = content.match(/\[[\s\S]*?\]/);
          if (match) {
            aiTerms = JSON.parse(match[0]);
          }
        }
      }
    } catch (e) {
      console.error("AI expansion failed, continuing with keyword only:", e);
    }

    // 3. Search with AI-expanded terms using ILIKE for better matching
    if (aiTerms.length > 0) {
      // Build an OR filter: match any AI term against name, brand, description, category, or tags
      const orConditions = aiTerms.map(term => {
        const t = term.replace(/'/g, "''"); // escape single quotes
        return `name.ilike.%${t}%,brand.ilike.%${t}%,description.ilike.%${t}%,category.ilike.%${t}%,subcategory.ilike.%${t}%`;
      }).join(",");

      let q2 = supabase.from("grocery_products").select("*").eq("in_stock", true).or(orConditions);
      if (category) q2 = q2.eq("category", category);
      if (tags.length > 0) q2 = q2.overlaps("tags", tags);
      const { data, error: semErr } = await q2.limit(30);
      if (semErr) {
        console.error("Semantic search error:", semErr);
      }
      semanticProducts = (data || []).map((p: any) => ({ ...p, sem_score: 1 }));

      // Also try matching against tags array (ilike doesn't search arrays)
      if (semanticProducts.length < 20) {
        const tagTerms = aiTerms.filter(t => t.includes("-") || t.length < 20);
        if (tagTerms.length > 0) {
          const { data: tagData } = await supabase
            .from("grocery_products")
            .select("*")
            .eq("in_stock", true)
            .overlaps("tags", tagTerms)
            .limit(20);
          for (const p of (tagData || [])) {
            if (!semanticProducts.find((sp: any) => sp.id === p.id)) {
              semanticProducts.push({ ...p, sem_score: 0.8 });
            }
          }
        }
      }
    }

    // 4. Merge and score
    const productMap = new Map<string, any>();
    
    // Normalize keyword scores
    const maxKw = Math.max(...kwProducts.map((p: any) => p.kw_score || 1), 1);
    for (const p of kwProducts) {
      const normalized = (p.kw_score || 1) / maxKw;
      productMap.set(p.id, {
        ...p,
        keyword_score: Math.round(normalized * 100) / 100,
        semantic_score: 0,
        kw_score: undefined,
        sem_score: undefined,
      });
    }

    // Add semantic results
    for (const p of semanticProducts) {
      if (productMap.has(p.id)) {
        productMap.get(p.id).semantic_score = 0.8; // Found in both = high relevance
      } else {
        productMap.set(p.id, {
          ...p,
          keyword_score: 0,
          semantic_score: 0.6,
          kw_score: undefined,
          sem_score: undefined,
        });
      }
    }

    // Calculate final scores (0.6 keyword + 0.4 semantic)
    const results = Array.from(productMap.values()).map(p => ({
      ...p,
      final_score: Math.round((0.6 * p.keyword_score + 0.4 * p.semantic_score) * 100) / 100,
    }));

    results.sort((a, b) => b.final_score - a.final_score);

    return new Response(JSON.stringify({
      products: results.slice(0, 20),
      ai_terms: aiTerms,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("grocery-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
