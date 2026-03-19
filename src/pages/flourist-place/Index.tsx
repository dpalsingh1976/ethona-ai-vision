import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FPNavbar } from "@/components/flourist-place/layout/FPNavbar";
import { FPFooter } from "@/components/flourist-place/layout/FPFooter";
import { OccasionTiles } from "@/components/flourist-place/shop/OccasionTiles";
import { ProductGrid } from "@/components/flourist-place/shop/ProductGrid";
import { useFleuristProducts } from "@/hooks/useFleuristProducts";
import { FPSearchBar } from "@/components/flourist-place/shop/FPSearchBar";
import { useFleuristSearch } from "@/hooks/useFleuristSearch";
import { ArrowRight, Leaf, Truck, Star, Shield, Heart } from "lucide-react";

export default function FlouristPlaceHome() {
  const { products: featured, isLoading } = useFleuristProducts({ featured: true });
  const { products: searchResults, aiTerms, isLoading: searching, search } = useFleuristSearch();
  const [query, setQuery] = useState("");

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (q.trim()) search({ query: q, limit: 12 });
  };

  const displayProducts = query ? searchResults : featured;

  return (
    <div className="min-h-screen font-sans" style={{ background: "hsl(var(--background))" }}>
      <FPNavbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Layered gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--fp-blush)/0.45) 0%, hsl(var(--fp-cream)) 45%, hsl(40 60% 98%) 100%)",
          }}
        />
        {/* Decorative circle */}
        <div
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--fp-rose)) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--fp-gold)) 0%, transparent 70%)" }}
        />

        {/* Floating petals */}
        {["🌸", "🌺", "🌼", "💐", "🌹", "🪷"].map((p, i) => (
          <span
            key={i}
            className="absolute text-4xl opacity-[0.08] animate-float pointer-events-none select-none"
            style={{
              left: `${8 + i * 15}%`,
              top: `${10 + (i % 3) * 22}%`,
              animationDelay: `${i * 1.1}s`,
              fontSize: `${1.8 + (i % 3) * 0.5}rem`,
            }}
          >
            {p}
          </span>
        ))}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-7 border"
              style={{
                background: "hsl(var(--fp-rose)/0.1)",
                color: "hsl(var(--fp-rose))",
                borderColor: "hsl(var(--fp-rose)/0.25)",
              }}
            >
              <Leaf className="w-3.5 h-3.5" />
              Farm-fresh flowers for Indian & Asian celebrations
            </div>

            {/* Headline */}
            <h1
              className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] mb-5 tracking-tight"
              style={{ color: "hsl(var(--fp-forest))" }}
            >
              Flowers That{" "}
              <span
                className="italic relative inline-block"
                style={{ color: "hsl(var(--fp-rose))" }}
              >
                Tell Your Story
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="6"
                  viewBox="0 0 200 6"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,5 Q50,0 100,3 Q150,6 200,2"
                    fill="none"
                    stroke="hsl(var(--fp-rose))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-lg mb-9 leading-relaxed max-w-2xl mx-auto" style={{ color: "hsl(var(--fp-forest)/0.6)" }}>
              Wedding garlands, pooja marigolds, Diwali torans, Asian orchids — handcrafted with love and delivered fresh to your door.
            </p>

            {/* AI Search */}
            <FPSearchBar
              query={query}
              onQueryChange={handleQueryChange}
              aiTerms={aiTerms}
              className="max-w-2xl mx-auto mb-8"
            />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/flouristPlace/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                style={{ background: "hsl(var(--fp-rose))", color: "white" }}
              >
                Shop All Flowers <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/flouristPlace/products?occasion=wedding"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: "hsl(var(--fp-blush))",
                  color: "hsl(var(--fp-forest))",
                  background: "hsl(var(--fp-cream)/0.5)",
                }}
              >
                Wedding Collection 💍
              </Link>
              <Link
                to="/flouristPlace/products?occasion=pooja"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: "hsl(var(--fp-gold)/0.5)",
                  color: "hsl(var(--fp-forest))",
                  background: "hsl(40 85% 96%/0.7)",
                }}
              >
                Pooja & Temple 🪔
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: "hsl(var(--fp-forest))", color: "white" }} className="py-3.5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 text-sm">
          {[
            { icon: <Leaf className="w-4 h-4" />, text: "Farm-fresh flowers daily" },
            { icon: <Truck className="w-4 h-4" />, text: "Local & nationwide delivery" },
            { icon: <Star className="w-4 h-4" />, text: "500+ five-star orders" },
            { icon: <Heart className="w-4 h-4" />, text: "Indian & Asian specialists" },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-2" style={{ color: "hsl(var(--fp-blush))" }}>
              {icon}
              <span className="text-white/80 font-medium">{text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🌿",
              title: "Freshness Guaranteed",
              desc: "All perishable flowers cut within 24 hours of delivery. 100% freshness promise or we re-ship.",
              bg: "hsl(var(--fp-blush)/0.25)",
              border: "hsl(var(--fp-blush))",
            },
            {
              icon: "🎊",
              title: "Event Specialists",
              desc: "From intimate pooja to grand mandap décor — we handle weddings, festivals, and ceremonies of all scales.",
              bg: "hsl(var(--fp-cream))",
              border: "hsl(var(--fp-gold)/0.4)",
            },
            {
              icon: "🌏",
              title: "Indian & Asian Catalog",
              desc: "Marigold garlands, jasmine gajras, orchids for Lunar New Year, chrysanthemums for Chuseok — we specialize.",
              bg: "hsl(150 30% 22% / 0.05)",
              border: "hsl(var(--fp-sage)/0.4)",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl p-7 border hover:shadow-md transition-shadow"
              style={{ background: f.bg, borderColor: f.border }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-serif text-xl font-bold mb-2" style={{ color: "hsl(var(--fp-forest))" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--fp-forest)/0.65)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OCCASIONS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(var(--fp-forest))" }}>
              Shop by Occasion
            </h2>
            <p className="mt-1 text-sm" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
              Find the perfect flowers for every celebration
            </p>
          </div>
        </div>
        <OccasionTiles />
      </section>

      {/* ── FEATURED PRODUCTS / SEARCH ── */}
      <section
        className="py-16"
        style={{ background: "hsl(var(--fp-cream)/0.4)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(var(--fp-forest))" }}>
                {query ? `Results for "${query}"` : "Featured Flowers"}
              </h2>
              {!query && (
                <p className="mt-1 text-sm" style={{ color: "hsl(var(--fp-forest)/0.5)" }}>
                  Our most loved Indian & Asian arrangements
                </p>
              )}
            </div>
            {!query && (
              <Link
                to="/flouristPlace/products"
                className="text-sm font-semibold flex items-center gap-1 hover:underline"
                style={{ color: "hsl(var(--fp-rose))" }}
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <ProductGrid products={displayProducts} isLoading={isLoading || searching} query={query} />
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        className="py-20 px-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--fp-forest)) 0%, hsl(150 35% 18%) 100%)",
          color: "white",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-5">💍</div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Planning a Wedding or Festival?
          </h2>
          <p className="text-white/65 mb-8 leading-relaxed text-lg">
            We specialize in bulk orders for Indian weddings, pooja ceremonies, Diwali, Navratri, and Asian festivals. Custom packages available.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/flouristPlace/products?occasion=wedding"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "hsl(var(--fp-rose))", color: "white" }}
            >
              Explore Wedding Collection
            </Link>
            <Link
              to="/flouristPlace/products?occasion=diwali"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold border-2 transition-all hover:-translate-y-0.5"
              style={{ borderColor: "hsl(var(--fp-gold))", color: "hsl(var(--fp-gold))" }}
            >
              🪔 Diwali Collection
            </Link>
          </div>
        </div>
      </section>

      <FPFooter />
    </div>
  );
}
