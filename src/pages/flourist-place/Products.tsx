import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { FPSearchBar } from "@/components/flourist-place/shop/FPSearchBar";
import { CategoryFilter } from "@/components/flourist-place/shop/CategoryFilter";
import { ProductGrid } from "@/components/flourist-place/shop/ProductGrid";
import { useFleuristSearch } from "@/hooks/useFleuristSearch";
import { useFleuristProducts } from "@/hooks/useFleuristProducts";
import { SlidersHorizontal } from "lucide-react";

export default function FlouristPlaceProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [categorySlug, setCategorySlug] = useState(searchParams.get("category") || "");
  const [occasionFilter, setOccasionFilter] = useState(searchParams.get("occasion") || "");
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [filterOpen, setFilterOpen] = useState(false);

  const { products: searchResults, aiTerms, isLoading: searching, search, clearSearch } = useFleuristSearch();
  const { products: allProducts, categories, isLoading } = useFleuristProducts({ limit: 60 });

  // Trigger search when query/filters change
  useEffect(() => {
    if (query || categorySlug || occasionFilter) {
      search({
        query: query || undefined,
        category_slug: categorySlug || undefined,
        occasion: occasionFilter || undefined,
        max_price: maxPrice,
        limit: 48,
      });
    } else {
      clearSearch();
    }
  }, [query, categorySlug, occasionFilter, maxPrice]);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    setSearchParams((prev) => {
      if (q) prev.set("q", q); else prev.delete("q");
      return prev;
    });
  };

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    setOccasionFilter("");
    setSearchParams((prev) => {
      if (slug) prev.set("category", slug); else prev.delete("category");
      prev.delete("occasion");
      return prev;
    });
  };

  const displayProducts = (query || categorySlug || occasionFilter) ? searchResults : allProducts;
  const displayLoading = (query || categorySlug || occasionFilter) ? searching : isLoading;

  const activeFilters = [
    occasionFilter && `Occasion: ${occasionFilter}`,
    maxPrice && `Under $${maxPrice}`,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-fp-cream/20 font-sans">
      <FPNavbar />

      {/* Page header */}
      <div className="bg-gradient-to-br from-fp-blush/20 to-fp-cream border-b border-fp-blush/20 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-4xl font-bold text-fp-forest mb-4">
            {occasionFilter ? `${occasionFilter.charAt(0).toUpperCase() + occasionFilter.slice(1)} Flowers` : "All Flowers"}
          </h1>
          <FPSearchBar
            query={query}
            onQueryChange={handleQueryChange}
            aiTerms={aiTerms}
            className="max-w-2xl"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter */}
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            activeSlug={categorySlug}
            onSelect={handleCategoryChange}
          />
        </div>

        {/* Quick price filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-medium text-fp-forest/60 uppercase tracking-wider">Price:</span>
          {[undefined, 25, 50, 100].map((price) => (
            <button
              key={price ?? "all"}
              onClick={() => setMaxPrice(price)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                maxPrice === price
                  ? "bg-fp-rose text-white"
                  : "bg-fp-cream text-fp-forest/60 hover:bg-fp-blush/40"
              }`}
            >
              {price ? `Under $${price}` : "All Prices"}
            </button>
          ))}

          {/* Active occasion filter chip */}
          {occasionFilter && (
            <span className="flex items-center gap-1 bg-fp-forest text-white px-3 py-1.5 rounded-full text-xs font-medium">
              {occasionFilter}
              <button onClick={() => { setOccasionFilter(""); setSearchParams((p) => { p.delete("occasion"); return p; }); }} className="ml-1 hover:text-fp-blush">×</button>
            </span>
          )}
        </div>

        {/* Results count */}
        {!displayLoading && (
          <p className="text-sm text-fp-forest/50 mb-4">
            {displayProducts.length} flower{displayProducts.length !== 1 ? "s" : ""} found
          </p>
        )}

        <ProductGrid products={displayProducts} isLoading={displayLoading} query={query} />
      </div>

      <FPFooter />
    </div>
  );
}
