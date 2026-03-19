import React from "react";
import { ProductCard } from "./ProductCard";
import type { FPProduct } from "@/hooks/useFleuristSearch";
import { Loader2, ShoppingBasket } from "lucide-react";

interface ProductGridProps {
  products: FPProduct[];
  isLoading: boolean;
  query?: string;
}

export function ProductGrid({ products, isLoading, query }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-fp-cream rounded-2xl overflow-hidden animate-pulse">
            <div className="h-52 bg-fp-blush/20" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-fp-blush/20 rounded w-1/2" />
              <div className="h-4 bg-fp-blush/30 rounded w-3/4" />
              <div className="h-4 bg-fp-blush/20 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-fp-forest/40">
        <ShoppingBasket className="w-16 h-16 mb-4 text-fp-blush" />
        <p className="text-lg font-medium text-fp-forest/60">No flowers found</p>
        <p className="text-sm">
          {query ? `No results for "${query}" — try a different search` : "Check back soon for new arrivals"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
