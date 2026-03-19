import React from "react";
import { Link } from "react-router-dom";
import type { FPProduct } from "@/hooks/useFleuristSearch";
import { ShoppingCart, Clock, Leaf } from "lucide-react";
import { useFleuristCart } from "@/hooks/useFleuristCart";
import { toast } from "sonner";

interface ProductCardProps {
  product: FPProduct;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem } = useFleuristCart();
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: crypto.randomUUID(),
      product_id: product.id,
      name: product.name,
      price: product.price,
      is_perishable: product.is_perishable,
      shipping_class: product.shipping_class,
      image: product.images?.[0] || "",
      prep_time_days: product.prep_time_days,
    });
    toast.success(`${product.name} added to cart`, {
      description: product.is_perishable ? "🌸 Fresh flower — book early!" : "📦 Ships anytime",
    });
  };

  return (
    <Link to={`/flouristPlace/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-fp-blush/30 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        {/* Image */}
        <div className={`relative overflow-hidden bg-fp-cream ${compact ? "h-36" : "h-52"}`}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🌸</div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_perishable ? (
              <span className="bg-fp-rose text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Leaf className="w-2.5 h-2.5" /> Fresh
              </span>
            ) : (
              <span className="bg-fp-forest text-white text-xs px-2 py-0.5 rounded-full font-medium">
                Lasting
              </span>
            )}
            {discount && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                -{discount}%
              </span>
            )}
          </div>
          {/* Add to cart button overlay */}
          <button
            onClick={handleAdd}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-fp-rose text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-fp-rose/80"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          {product.fp_categories && (
            <p className="text-xs text-fp-forest/50 mb-0.5">
              {product.fp_categories.icon} {product.fp_categories.name}
            </p>
          )}
          <h3 className="font-medium text-fp-forest text-sm leading-tight line-clamp-2 mb-2">
            {product.name}
          </h3>
          {product.prep_time_days > 0 && (
            <p className="text-xs text-fp-forest/50 flex items-center gap-1 mb-2">
              <Clock className="w-3 h-3" />
              {product.prep_time_days} day{product.prep_time_days > 1 ? "s" : ""} prep
            </p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-fp-forest text-sm">${product.price.toFixed(2)}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-xs text-fp-forest/40 line-through ml-1">
                  ${product.mrp.toFixed(2)}
                </span>
              )}
            </div>
            {product.inventory_count <= 5 && product.inventory_count > 0 && (
              <span className="text-xs text-amber-600 font-medium">
                Only {product.inventory_count} left
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
