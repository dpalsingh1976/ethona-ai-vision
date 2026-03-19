import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Flower2, Menu, X } from "lucide-react";
import { useFleuristCart } from "@/hooks/useFleuristCart";
import { useState } from "react";

export function FPNavbar() {
  const { totalItems } = useFleuristCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/flouristPlace", label: "Home" },
    { to: "/flouristPlace/products", label: "Shop" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-fp-blush/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/flouristPlace" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fp-rose to-fp-blush flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Flower2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-semibold text-fp-forest tracking-tight">
              Flourist<span className="text-fp-rose">Place</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-fp-rose ${
                  location.pathname === link.to
                    ? "text-fp-rose"
                    : "text-fp-forest/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              to="/flouristPlace/cart"
              className="relative p-2 rounded-full hover:bg-fp-blush/20 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-fp-forest" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-fp-rose text-white text-xs flex items-center justify-center font-medium">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-fp-blush/20 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-fp-blush/20">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-fp-forest/70 hover:text-fp-rose"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
