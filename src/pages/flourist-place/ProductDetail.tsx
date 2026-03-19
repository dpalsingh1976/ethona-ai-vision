import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { useFleuristProducts } from "@/hooks/useFleuristProducts";
import { useFleuristCart } from "@/hooks/useFleuristCart";
import { ShoppingCart, Clock, Leaf, Package, Truck, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { FPProduct } from "@/hooks/useFleuristSearch";

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
  if (text.includes("carnation")) return { gradient: "from-pink-100 to-red-100", emoji: "🌸" };
  if (text.includes("gerbera") || text.includes("daisy")) return { gradient: "from-orange-100 to-yellow-100", emoji: "🌼" };
  return { gradient: "from-rose-50 to-pink-100", emoji: "🌸" };
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProductById } = useFleuristProducts();
  const { addItem } = useFleuristCart();
  const [product, setProduct] = useState<FPProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (id) {
      setLoading(true);
      getProductById(id).then((p) => {
        setProduct(p);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fp-cream/20">
        <FPNavbar />
        <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="h-96 bg-fp-blush/20 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-fp-blush/20 rounded-xl w-3/4" />
            <div className="h-6 bg-fp-blush/10 rounded-xl w-1/2" />
            <div className="h-4 bg-fp-blush/10 rounded-xl w-full" />
            <div className="h-4 bg-fp-blush/10 rounded-xl w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-fp-cream/20">
        <FPNavbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-fp-forest/50 text-xl">Product not found.</p>
          <Link to="/flouristPlace/products" className="text-fp-rose mt-4 inline-block">← Back to shop</Link>
        </div>
      </div>
    );
  }

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  const fallback = getFallbackGradient(product);

  const handleAddToCart = () => {
    addItem({
      id: crypto.randomUUID(),
      product_id: product.id,
      name: product.name,
      price: product.price,
      is_perishable: product.is_perishable,
      shipping_class: product.shipping_class,
      image: product.images?.[0] || "",
      prep_time_days: product.prep_time_days,
      quantity: qty,
    });
    toast.success(`${product.name} added to cart!`, {
      description: `${qty} item${qty > 1 ? "s" : ""} · $${(product.price * qty).toFixed(2)}`,
    });
  };

  const currentImgUrl = product.images?.[imgIdx];
  const currentImgFailed = imgErrors[imgIdx];

  return (
    <div className="min-h-screen bg-fp-cream/20 font-sans">
      <FPNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-fp-forest/50 mb-6">
          <Link to="/flouristPlace" className="hover:text-fp-rose">Home</Link>
          <span>/</span>
          <Link to="/flouristPlace/products" className="hover:text-fp-rose">Shop</Link>
          <span>/</span>
          <span className="text-fp-forest line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl overflow-hidden bg-fp-cream border border-fp-blush/20">
              {currentImgUrl && !currentImgFailed ? (
                <img
                  src={currentImgUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgErrors(prev => ({ ...prev, [imgIdx]: true }))}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${fallback.gradient} flex items-center justify-center`}>
                  <span className="text-8xl opacity-60">{fallback.emoji}</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${imgIdx === i ? "border-fp-rose" : "border-fp-blush/30"}`}
                  >
                    {img && !imgErrors[i] ? (
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${fallback.gradient} flex items-center justify-center`}>
                        <span className="text-xl">{fallback.emoji}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            {/* Category badge */}
            {product.fp_categories && (
              <span className="inline-flex items-center gap-1 bg-fp-blush/40 text-fp-forest/70 text-xs px-3 py-1 rounded-full">
                {product.fp_categories.icon} {product.fp_categories.name}
              </span>
            )}

            <h1 className="font-serif text-3xl font-bold text-fp-forest">{product.name}</h1>

            {/* Perishable badge */}
            <div className="flex items-center gap-2">
              {product.is_perishable ? (
                <span className="flex items-center gap-1.5 bg-fp-rose/10 text-fp-rose text-sm px-3 py-1.5 rounded-full">
                  <Leaf className="w-3.5 h-3.5" /> Fresh Flower
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-fp-forest/10 text-fp-forest text-sm px-3 py-1.5 rounded-full">
                  <Package className="w-3.5 h-3.5" /> Lasting Item
                </span>
              )}
              {discount && (
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1.5 rounded-full font-medium">
                  {discount}% off
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-fp-forest">${product.price.toFixed(2)}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-lg text-fp-forest/40 line-through">${product.mrp.toFixed(2)}</span>
              )}
            </div>

            {product.description && (
              <p className="text-fp-forest/60 leading-relaxed">{product.description}</p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/flouristPlace/products?occasion=${tag}`}
                    className="bg-fp-cream text-fp-forest/60 text-xs px-2.5 py-1 rounded-full hover:bg-fp-blush/40 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Delivery info */}
            <div className="bg-fp-cream rounded-2xl p-4 space-y-2">
              {product.prep_time_days > 0 && (
                <div className="flex items-center gap-2 text-sm text-fp-forest/70">
                  <Clock className="w-4 h-4 text-fp-rose flex-shrink-0" />
                  <span>Requires {product.prep_time_days} day{product.prep_time_days > 1 ? "s" : ""} preparation time</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-fp-forest/70">
                <Truck className="w-4 h-4 text-fp-rose flex-shrink-0" />
                <span>
                  {product.is_perishable
                    ? "Overnight or 2-day shipping for fresh delivery"
                    : "Standard, 2-day, or overnight shipping available"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-fp-forest/70">
                <MapPin className="w-4 h-4 text-fp-rose flex-shrink-0" />
                <span>Free store pickup available</span>
              </div>
            </div>

            {/* Qty + Add */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-fp-blush rounded-xl px-3 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-fp-forest hover:text-fp-rose">−</button>
                <span className="w-8 text-center font-medium text-fp-forest">{qty}</span>
                <button onClick={() => setQty(Math.min(product.inventory_count, qty + 1))} className="text-fp-forest hover:text-fp-rose">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.inventory_count === 0}
                className="flex-1 h-12 bg-fp-rose text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-fp-rose/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart — ${(product.price * qty).toFixed(2)}
              </button>
            </div>

            {product.inventory_count <= 5 && product.inventory_count > 0 && (
              <p className="text-amber-600 text-sm font-medium">
                ⚠️ Only {product.inventory_count} left in stock
              </p>
            )}
          </div>
        </div>
      </div>

      <FPFooter />
    </div>
  );
}
