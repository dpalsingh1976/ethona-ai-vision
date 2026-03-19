import React from "react";
import { Link } from "react-router-dom";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { OccasionTiles } from "@/components/flourist-place/shop/OccasionTiles";
import { ProductGrid } from "@/components/flourist-place/shop/ProductGrid";
import { useFleuristProducts } from "@/hooks/useFleuristProducts";
import { FPSearchBar } from "@/components/flourist-place/shop/FPSearchBar";
import { useFleuristSearch } from "@/hooks/useFleuristSearch";
import { useState } from "react";
import { ArrowRight, Leaf, Truck, Star } from "lucide-react";

export default function FlouristPlaceHome() {
  const { products: featured, isLoading } = useFleuristProducts({ featured: true });
  const { products: searchResults, aiTerms, isLoading: searching, search } = useFleuristSearch();
  const [query, setQuery] = useState("");

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (q.trim()) {
      search({ query: q, limit: 12 });
    }
  };

  const displayProducts = query ? searchResults : featured;

  return (
    <div className="min-h-screen bg-fp-cream/30 font-sans">
      <FPNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-fp-blush/30 via-fp-cream to-white">
        {/* Background petals */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["🌸", "🌺", "🌼", "💐", "🌹"].map((petal, i) => (
            <span
              key={i}
              className="absolute text-4xl opacity-10 animate-float"
              style={{
                left: `${10 + i * 18}%`,
                top: `${15 + (i % 2) * 30}%`,
                animationDelay: `${i * 1.2}s`,
                fontSize: `${2 + (i % 3)}rem`,
              }}
            >
              {petal}
            </span>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-fp-rose/10 text-fp-rose px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Leaf className="w-3.5 h-3.5" />
              Fresh flowers for every occasion
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-fp-forest leading-tight mb-4">
              Flowers That Tell{" "}
              <span className="text-fp-rose italic">Your Story</span>
            </h1>
            <p className="text-fp-forest/60 text-lg mb-8 leading-relaxed">
              Wedding garlands, pooja marigolds, birthday bouquets — handcrafted with love and delivered fresh to your door.
            </p>

            {/* AI Search */}
            <FPSearchBar
              query={query}
              onQueryChange={handleQueryChange}
              aiTerms={aiTerms}
              className="max-w-2xl mx-auto mb-6"
            />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/flouristPlace/products"
                className="inline-flex items-center gap-2 bg-fp-rose text-white px-6 py-3 rounded-xl font-medium hover:bg-fp-rose/90 transition-colors shadow-sm"
              >
                Shop All Flowers <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/flouristPlace/products?occasion=wedding"
                className="inline-flex items-center gap-2 border border-fp-blush text-fp-forest px-6 py-3 rounded-xl font-medium hover:bg-fp-blush/20 transition-colors"
              >
                Wedding Collection 💍
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-fp-forest text-white py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-fp-blush" /> Farm-fresh flowers
          </span>
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-fp-blush" /> Local delivery available
          </span>
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-fp-blush" /> 500+ happy orders
          </span>
        </div>
      </div>

      {/* Shop by Occasion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-fp-forest">Shop by Occasion</h2>
            <p className="text-fp-forest/50 text-sm mt-1">Find the perfect flowers for your celebration</p>
          </div>
        </div>
        <OccasionTiles />
      </section>

      {/* Featured Products / Search Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-fp-forest">
              {query ? `Results for "${query}"` : "Featured Flowers"}
            </h2>
            {!query && (
              <p className="text-fp-forest/50 text-sm mt-1">Our most loved arrangements</p>
            )}
          </div>
          {!query && (
            <Link
              to="/flouristPlace/products"
              className="text-fp-rose text-sm font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
        <ProductGrid products={displayProducts} isLoading={isLoading || searching} query={query} />
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-fp-forest to-fp-forest/90 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-3">Planning a Wedding or Event?</h2>
          <p className="text-white/70 mb-6">We specialize in bulk orders for weddings, pooja ceremonies, and festivals. Contact us for custom packages.</p>
          <Link
            to="/flouristPlace/products?occasion=wedding"
            className="inline-flex items-center gap-2 bg-fp-rose px-8 py-3 rounded-xl font-medium hover:bg-fp-rose/90 transition-colors"
          >
            Explore Wedding Collection 💍
          </Link>
        </div>
      </section>

      <FPFooter />
    </div>
  );
}
