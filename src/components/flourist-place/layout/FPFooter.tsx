import React from "react";
import { Link } from "react-router-dom";
import { Flower2, Heart, Instagram, Facebook } from "lucide-react";

export function FPFooter() {
  return (
    <footer className="bg-fp-forest text-white/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-fp-rose flex items-center justify-center">
                <Flower2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-lg font-semibold text-white">
                Flourist<span className="text-fp-blush">Place</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Premium fresh flowers for every occasion. From wedding mandaps to pooja thalis — we deliver nature's finest.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/flouristPlace/products?occasion=wedding" className="hover:text-fp-blush transition-colors">Wedding Flowers</Link></li>
              <li><Link to="/flouristPlace/products?occasion=pooja" className="hover:text-fp-blush transition-colors">Pooja & Temple</Link></li>
              <li><Link to="/flouristPlace/products?occasion=birthday" className="hover:text-fp-blush transition-colors">Birthday Bouquets</Link></li>
              <li><Link to="/flouristPlace/products?occasion=anniversary" className="hover:text-fp-blush transition-colors">Anniversary</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-3">Info</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-fp-blush mt-0.5">🌸</span>
                <span>Same-day orders cut off at 10am</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-fp-blush mt-0.5">📦</span>
                <span>Free pickup at our stores</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-fp-blush mt-0.5">💚</span>
                <span>Eco-friendly packaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-fp-blush mt-0.5">🚚</span>
                <span>Local delivery within 30 miles</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} FlouristPlace. Made with{" "}
            <Heart className="inline w-3 h-3 text-fp-rose" /> for flower lovers.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-fp-blush transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-fp-blush transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
