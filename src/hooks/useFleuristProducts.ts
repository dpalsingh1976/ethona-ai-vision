import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FPProduct } from "./useFleuristSearch";

export interface FPCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  occasion_tags: string[];
  display_order: number;
}

export function useFleuristProducts(options?: {
  category_id?: string;
  is_perishable?: boolean;
  limit?: number;
  featured?: boolean;
}) {
  const [products, setProducts] = useState<FPProduct[]>([]);
  const [categories, setCategories] = useState<FPCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [options?.category_id, options?.is_perishable, options?.limit]);

  async function loadCategories() {
    const { data } = await supabase
      .from("fp_categories")
      .select("*")
      .order("display_order");
    setCategories(data || []);
  }

  async function loadProducts() {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("fp_products")
        .select("*, fp_categories(id, name, slug, icon)")
        .eq("is_active", true)
        .gt("inventory_count", 0)
        .order("created_at", { ascending: false });

      if (options?.category_id) {
        query = query.eq("category_id", options.category_id);
      }
      if (options?.is_perishable !== undefined) {
        query = query.eq("is_perishable", options.is_perishable);
      }
      if (options?.featured) {
        query = query.limit(8);
      } else {
        query = query.limit(options?.limit || 50);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setProducts(data || []);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }

  async function getProductById(id: string): Promise<FPProduct | null> {
    const { data } = await supabase
      .from("fp_products")
      .select("*, fp_categories(id, name, slug, icon)")
      .eq("id", id)
      .single();
    return data as FPProduct | null;
  }

  return { products, categories, isLoading, error, getProductById, reload: loadProducts };
}
