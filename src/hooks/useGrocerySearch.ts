import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GroceryProduct {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  price: number;
  mrp: number | null;
  unit: string;
  image_url: string | null;
  tags: string[];
  in_stock: boolean;
  keyword_score: number;
  semantic_score: number;
  final_score: number;
}

interface SearchResult {
  products: GroceryProduct[];
  ai_terms: string[];
}

export function useGrocerySearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showScores, setShowScores] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, error } = useQuery<SearchResult>({
    queryKey: ["grocery-search", debouncedQuery, selectedTags, selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("grocery-search", {
        body: { query: debouncedQuery, tags: selectedTags, category: selectedCategory },
      });
      if (error) throw error;
      return data as SearchResult;
    },
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return {
    query, setQuery,
    selectedTags, toggleTag,
    selectedCategory, setSelectedCategory,
    showScores, setShowScores,
    products: data?.products || [],
    aiTerms: data?.ai_terms || [],
    isLoading, error,
  };
}
