import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Flower2, Menu, X, ChevronDown } from "lucide-react";
import { useFleuristCart } from "@/hooks/useFleuristCart";

const occasionLinks = [
  { slug: "wedding", label: "💍 Wedding" },
  { slug: "pooja", label: "🪔 Pooja & Temple" },
  { slug: "diwali", label: "✨ Diwali" },
  { slug: "navratri", label: "🌺 Navratri" },
  { slug: "mehendi", label: "🌿 Mehendi" },
  { slug: "haldi", label: "💛 Haldi" },
  { slug: "lunar-new-year", label: "🏮 Lunar New Year" },
  { slug: "chuseok", label: "🌾 Chuseok" },
  { slug: "birthday", label: "🎂 Birthday" },
  { slug: "anniversary", label: "💑 Anniversary" },
];

export function FPNavbar() {
  const { totalItems } = useFleuristCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [occasionsOpen, setOccasionsOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(totalItems);
  const [cartBump, setCartBump] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cart badge animation on item add
  useEffect(() => {
    if (totalItems > prevCount) {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 400);
    }
    setPrevCount(totalItems);
  }, [totalItems]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOccasionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: "rgba(255,255,255,0.92)",
        borderColor: "hsl(var(--fp-blush)/0.3)",
        boxShadow: "0 1px 12px hsl(var(--fp-rose)/0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/flouristPlace" className="flex items-center gap-2.5 group flex-shrink-0">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, hsl(var(--fp-rose)) 0%, hsl(var(--fp-blush)) 100%)" }}
            >
              <Flower2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight" style={{ color: "hsl(var(--fp-forest))" }}>
              Flourist<span style={{ color: "hsl(var(--fp-rose))" }}>Place</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/flouristPlace"
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                color: isActive("/flouristPlace") && location.pathname === "/flouristPlace"
                  ? "hsl(var(--fp-rose))"
                  : "hsl(var(--fp-forest)/0.7)",
                background: isActive("/flouristPlace") && location.pathname === "/flouristPlace"
                  ? "hsl(var(--fp-rose)/0.08)"
                  : "transparent",
              }}
            >
              Home
            </Link>

            <Link
              to="/flouristPlace/products"
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                color: location.pathname.startsWith("/flouristPlace/products")
                  ? "hsl(var(--fp-rose))"
                  : "hsl(var(--fp-forest)/0.7)",
                background: location.pathname.startsWith("/flouristPlace/products")
                  ? "hsl(var(--fp-rose)/0.08)"
                  : "transparent",
              }}
            >
              Shop
            </Link>

            {/* Occasions Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setOccasionsOpen(!occasionsOpen)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "hsl(var(--fp-forest)/0.7)" }}
              >
                Occasions
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform duration-200"
                  style={{ transform: occasionsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              {occasionsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 rounded-2xl border shadow-lg overflow-hidden z-50"
                  style={{
                    background: "white",
                    borderColor: "hsl(var(--fp-blush)/0.4)",
                    boxShadow: "0 8px 32px hsl(var(--fp-rose)/0.15)",
                  }}
                >
                  <div className="p-2">
                    {occasionLinks.map((occ) => (
                      <Link
                        key={occ.slug}
                        to={`/flouristPlace/products?occasion=${occ.slug}`}
                        onClick={() => setOccasionsOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-fp-blush/20"
                        style={{ color: "hsl(var(--fp-forest)/0.8)" }}
                      >
                        {occ.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              to="/flouristPlace/cart"
              className="relative p-2.5 rounded-2xl transition-all hover:scale-105"
              style={{ background: "hsl(var(--fp-blush)/0.25)" }}
            >
              <ShoppingCart className="w-5 h-5" style={{ color: "hsl(var(--fp-forest))" }} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold transition-transform"
                  style={{
                    background: "hsl(var(--fp-rose))",
                    transform: cartBump ? "scale(1.4)" : "scale(1)",
                    transitionDuration: "300ms",
                  }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2.5 rounded-2xl transition-colors"
              style={{ background: "hsl(var(--fp-blush)/0.2)" }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen
                ? <X className="w-5 h-5" style={{ color: "hsl(var(--fp-forest))" }} />
                : <Menu className="w-5 h-5" style={{ color: "hsl(var(--fp-forest))" }} />
              }
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden py-4 border-t space-y-1"
            style={{ borderColor: "hsl(var(--fp-blush)/0.2)" }}
          >
            {[
              { to: "/flouristPlace", label: "Home" },
              { to: "/flouristPlace/products", label: "Shop All Flowers" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ color: "hsl(var(--fp-forest)/0.8)" }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 pb-1 px-3">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--fp-forest)/0.4)" }}>
                Occasions
              </p>
              <div className="grid grid-cols-2 gap-1">
                {occasionLinks.slice(0, 8).map((occ) => (
                  <Link
                    key={occ.slug}
                    to={`/flouristPlace/products?occasion=${occ.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-medium"
                    style={{
                      background: "hsl(var(--fp-blush)/0.2)",
                      color: "hsl(var(--fp-forest)/0.8)",
                    }}
                  >
                    {occ.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
