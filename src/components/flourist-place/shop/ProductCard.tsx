import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { FPProduct } from "@/hooks/useFleuristSearch";
import { ShoppingCart, Clock, Star } from "lucide-react";
import { useFleuristCart } from "@/hooks/useFleuristCart";
import { toast } from "sonner";

interface ProductCardProps {
  product: FPProduct;
  compact?: boolean;
}

const occasionLabel: Record<string, { emoji: string; label: string }> = {
  wedding: { emoji: "💍", label: "Wedding" },
  pooja: { emoji: "🪔", label: "Pooja" },
  diwali: { emoji: "✨", label: "Diwali" },
  "lunar-new-year": { emoji: "🏮", label: "Lunar NY" },
  chuseok: { emoji: "🌾", label: "Chuseok" },
  navratri: { emoji: "🌺", label: "Navratri" },
  mehendi: { emoji: "🌿", label: "Mehendi" },
  haldi: { emoji: "💛", label: "Haldi" },
  birthday: { emoji: "🎂", label: "Birthday" },
  anniversary: { emoji: "💑", label: "Anniversary" },
  festival: { emoji: "🌟", label: "Festival" },
};

// Gradient fallbacks keyed by flower type keywords in product name/tags
function getFallbackGradient(product: FPProduct): { gradient: string; emoji: string } {
  const text = (product.name + " " + (product.tags || []).join(" ")).toLowerCase();
  if (text.includes("marigold") || text.includes("guldaudi")) return { gradient: "from-amber-100 to-orange-200", emoji: "🌼" };
  if (text.includes("lotus")) return { gradient: "from-pink-100 to-purple-200", emoji: "🪷" };
  if (text.includes("rose")) return { gradient: "from-rose-100 to-pink-200", emoji: "🌹" };
  if (text.includes("jasmine") || text.includes("mogra") || text.includes("gajra")) return { gradient: "from-white to-yellow-50", emoji: "🌸" };
  if (text.includes("sunflower")) return { gradient: "from-yellow-100 to-amber-200", emoji: "🌻" };
  if (text.includes("orchid")) return { gradient: "from-purple-100 to-violet-200", emoji: "🌸" };
  if (text.includes("peony")) return { gradient: "from-pink-50 to-rose-100", emoji: "🌸" };
  if (text.includes("cherry") || text.includes("sakura")) return { gradient: "from-pink-100 to-rose-50", emoji: "🌸" };
  if (text.includes("chrysanthemum")) return { gradient: "from-yellow-50 to-amber-100", emoji: "💮" };
  if (text.includes("tropical") || text.includes("hibiscus")) return { gradient: "from-red-100 to-orange-100", emoji: "🌺" };
  if (text.includes("lavender")) return { gradient: "from-purple-100 to-violet-100", emoji: "💜" };
  if (text.includes("carnation")) return { gradient: "from-pink-100 to-red-100", emoji: "🌸" };
  if (text.includes("gerbera") || text.includes("daisy")) return { gradient: "from-orange-100 to-yellow-100", emoji: "🌼" };
  return { gradient: "from-rose-50 to-pink-100", emoji: "🌸" };
}

function getOccasionBadge(tags: string[] = []) {
  for (const tag of tags) {
    if (occasionLabel[tag]) return occasionLabel[tag];
  }
  return null;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem } = useFleuristCart();
  const [imgError, setImgError] = useState(false);
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const occasionBadge = getOccasionBadge(product.tags || []);
  const fallback = getFallbackGradient(product);

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

  const imageUrl = product.images?.[0];
  const showImage = imageUrl && !imgError;

  return (
    <Link to={`/flouristPlace/products/${product.id}`} className="group block">
      <div
        className="rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{
          background: "white",
          borderColor: "hsl(var(--fp-blush)/0.35)",
          boxShadow: "0 2px 8px hsl(var(--fp-rose)/0.06)",
        }}
      >
        {/* Image */}
        <div
          className={`relative overflow-hidden ${compact ? "h-44" : "h-56"}`}
          style={{ background: "hsl(var(--fp-cream))" }}
        >
          {showImage ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${fallback.gradient} flex items-center justify-center`}>
              <span className="text-6xl opacity-70">{fallback.emoji}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%)",
            }}
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_perishable ? (
              <span
                className="text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1"
                style={{ background: "hsl(var(--fp-rose))" }}
              >
                🌿 Fresh
              </span>
            ) : (
              <span
                className="text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm"
                style={{ background: "hsl(var(--fp-forest))" }}
              >
                📦 Lasting
              </span>
            )}
            {occasionBadge && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm"
                style={{
                  background: "rgba(255,255,255,0.88)",
                  color: "hsl(var(--fp-forest))",
                  backdropFilter: "blur(4px)",
                }}
              >
                {occasionBadge.emoji} {occasionBadge.label}
              </span>
            )}
            {discount && (
              <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* Add to cart — always visible on mobile, hover on desktop */}
          <button
            onClick={handleAdd}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0 hover:scale-110"
            style={{ background: "hsl(var(--fp-rose))" }}
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Category */}
          {product.fp_categories && (
            <p className="text-xs mb-1 font-medium" style={{ color: "hsl(var(--fp-rose)/0.8)" }}>
              {product.fp_categories.icon} {product.fp_categories.name}
            </p>
          )}

          {/* Name */}
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2 mb-2"
            style={{ color: "hsl(var(--fp-forest))" }}
          >
            {product.name}
          </h3>

          {/* Star rating placeholder */}
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3"
                fill={i < 4 ? "hsl(var(--fp-gold))" : "none"}
                style={{ color: "hsl(var(--fp-gold))" }}
              />
            ))}
            <span className="text-xs ml-0.5" style={{ color: "hsl(var(--fp-forest)/0.45)" }}>
              4.8
            </span>
          </div>

          {/* Prep time */}
          {product.prep_time_days > 0 && (
            <p
              className="text-xs flex items-center gap-1 mb-3"
              style={{ color: "hsl(var(--fp-forest)/0.5)" }}
            >
              <Clock className="w-3 h-3" />
              {product.prep_time_days}d prep
            </p>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between">
            <div>
              <span
                className="font-bold text-base"
                style={{ color: "hsl(var(--fp-forest))" }}
              >
                ${product.price.toFixed(2)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span
                  className="text-xs line-through ml-1.5"
                  style={{ color: "hsl(var(--fp-forest)/0.35)" }}
                >
                  ${product.mrp.toFixed(2)}
                </span>
              )}
            </div>
            {product.inventory_count <= 10 && product.inventory_count > 0 && (
              <span className="text-xs font-semibold text-amber-600">
                {product.inventory_count <= 5 ? `Only ${product.inventory_count} left` : "Low stock"}
              </span>
            )}
          </div>

          {/* Tags (first 2) */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: "hsl(var(--fp-blush)/0.4)",
                    color: "hsl(var(--fp-forest)/0.7)",
                  }}
                >
                  {tag.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
