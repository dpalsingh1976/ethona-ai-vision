import React from "react";
import { Link } from "react-router-dom";

const occasions = [
  { slug: "wedding", label: "Wedding", emoji: "💍", desc: "Mandap, garlands & stage décor", color: "from-rose-100 to-pink-50" },
  { slug: "pooja", label: "Pooja & Temple", emoji: "🪔", desc: "Marigold, lotus & jasmine", color: "from-amber-100 to-yellow-50" },
  { slug: "birthday", label: "Birthday", emoji: "🎂", desc: "Colorful bouquets & arrangements", color: "from-purple-100 to-violet-50" },
  { slug: "anniversary", label: "Anniversary", emoji: "💑", desc: "Romantic roses & mixed blooms", color: "from-red-100 to-rose-50" },
  { slug: "festival", label: "Festival", emoji: "🌟", desc: "Décor for all celebrations", color: "from-green-100 to-emerald-50" },
  { slug: "romantic", label: "Just Because", emoji: "💌", desc: "Surprise someone special", color: "from-pink-100 to-fuchsia-50" },
];

export function OccasionTiles() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {occasions.map((occ) => (
        <Link
          key={occ.slug}
          to={`/flouristPlace/products?occasion=${occ.slug}`}
          className="group"
        >
          <div className={`bg-gradient-to-br ${occ.color} rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-white/60`}>
            <div className="text-3xl mb-2">{occ.emoji}</div>
            <div className="font-semibold text-fp-forest text-sm">{occ.label}</div>
            <div className="text-xs text-fp-forest/50 mt-0.5 leading-tight">{occ.desc}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
