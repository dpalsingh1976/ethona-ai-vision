import React from "react";
import { ProductCard } from "./ProductCard";
import type { GroceryProduct } from "@/hooks/useGrocerySearch";
import { SearchSkeleton } from "./SearchSkeleton";
import { ShoppingBasket } from "lucide-react";

interface ProductGridProps {
  products: GroceryProduct[];
  showScores: boolean;
  isLoading: boolean;
  query: string;
}

export function ProductGrid({ products, showScores, isLoading, query }: ProductGridProps) {
  if (isLoading) return <SearchSkeleton />;

  if (products.length === 0 && query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <ShoppingBasket className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">No products found</p>
        <p className="text-sm">Try a different search or filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map(p => (
        <ProductCard key={p.id} product={p} showScores={showScores} />
      ))}
    </div>
  );
}
