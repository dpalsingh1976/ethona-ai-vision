import React from "react";
import Footer from "@/components/Footer";
import { SearchBar } from "@/components/e-grocery/SearchBar";
import { FilterChips } from "@/components/e-grocery/FilterChips";
import { CategoryFilter } from "@/components/e-grocery/CategoryFilter";
import { ProductGrid } from "@/components/e-grocery/ProductGrid";
import { ScoreToggle } from "@/components/e-grocery/ScoreToggle";
import { useGrocerySearch } from "@/hooks/useGrocerySearch";
import { ShoppingBasket, Sparkles } from "lucide-react";

const EGrocery = () => {
  const {
    query, setQuery,
    selectedTags, toggleTag,
    selectedCategory, setSelectedCategory,
    showScores, setShowScores,
    products, aiTerms, isLoading,
  } = useGrocerySearch();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
      {/* Hero header */}
      <section className="pt-10 pb-6 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShoppingBasket className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">FreshBasket</h1>
          </div>
          <p className="text-green-100 text-sm md:text-base">
            AI-Powered Indian Grocery Store • Hybrid Search Demo
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-green-100">
            <Sparkles className="w-3 h-3" />
            Powered by AI Search
          </div>
        </div>
      </section>

      {/* Search */}
      <SearchBar query={query} onQueryChange={setQuery} aiTerms={aiTerms} />

      {/* Filters */}
      <div className="max-w-5xl mx-auto w-full space-y-3 pt-4">
        <FilterChips selected={selectedTags} onToggle={toggleTag} />
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <ScoreToggle showScores={showScores} onToggle={setShowScores} productCount={products.length} />
      </div>

      {/* Products */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4">
        <ProductGrid products={products} showScores={showScores} isLoading={isLoading} query={query} />
      </main>

      <Footer />
    </div>
  );
};

export default EGrocery;
