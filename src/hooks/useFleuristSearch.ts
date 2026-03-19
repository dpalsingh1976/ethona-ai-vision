import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FPProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  is_perishable: boolean;
  prep_time_days: number;
  inventory_count: number;
  images: string[];
  tags: string[];
  shipping_class: string;
  is_active: boolean;
  fp_categories: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  } | null;
  _score?: number;
}

export function useFleuristSearch() {
  const [products, setProducts] = useState<FPProduct[]>([]);
  const [aiTerms, setAiTerms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (params: {
      query?: string;
      category_slug?: string;
      occasion?: string;
      max_price?: number;
      limit?: number;
    }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        setError(null);

        try {
          const { data, error: fnError } = await supabase.functions.invoke("fp-search", {
            body: params,
          });

          if (fnError) throw fnError;

          setProducts(data.products || []);
          setAiTerms(data.ai_terms || []);
        } catch (err) {
          console.error("Search error:", err);
          setError("Search failed. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setProducts([]);
    setAiTerms([]);
    setError(null);
  }, []);

  return { products, aiTerms, isLoading, error, search, clearSearch };
}
