import React, { useState } from "react";
import { Package } from "lucide-react";
import type { GroceryProduct } from "@/hooks/useGrocerySearch";

interface ProductCardProps {
  product: GroceryProduct;
  showScores: boolean;
}

const TAG_COLORS: Record<string, string> = {
  jain: "bg-orange-100 text-orange-700",
  vrat: "bg-purple-100 text-purple-700",
  organic: "bg-green-100 text-green-700",
  "diabetic-friendly": "bg-blue-100 text-blue-700",
  gujarati: "bg-amber-100 text-amber-700",
  "sugar-free": "bg-pink-100 text-pink-700",
  "high-protein": "bg-red-100 text-red-700",
  "heart-healthy": "bg-rose-100 text-rose-700",
  vegetarian: "bg-emerald-100 text-emerald-700",
};

export function ProductCard({ product, showScores }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Product image */}
      <div className="relative bg-white h-36 flex items-center justify-center p-2">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="bg-gradient-to-br from-green-50 to-orange-50 w-full h-full rounded-lg flex items-center justify-center">
            <Package className="w-12 h-12 text-green-300" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-gray-500 mb-0.5">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-1">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-2">{product.unit}</p>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600"}`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold text-green-700">${product.price}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-sm text-gray-400 line-through">${product.mrp}</span>
          )}
        </div>

        {/* Debug scores */}
        {showScores && (
          <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-[10px] text-gray-500 space-y-0.5">
            <div className="flex justify-between"><span>Keyword</span><span className="font-mono">{product.keyword_score}</span></div>
            <div className="flex justify-between"><span>Semantic</span><span className="font-mono">{product.semantic_score}</span></div>
            <div className="flex justify-between font-semibold text-green-700"><span>Final</span><span className="font-mono">{product.final_score}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
