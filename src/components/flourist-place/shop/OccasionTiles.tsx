import React from "react";
import { Link } from "react-router-dom";

const occasions = [
  {
    slug: "wedding",
    label: "Wedding",
    emoji: "💍",
    desc: "Mandap, garlands & stage décor",
    gradient: "linear-gradient(135deg, hsl(340 60% 92%) 0%, hsl(350 80% 85%) 100%)",
    border: "hsl(340 70% 80%)",
    textColor: "hsl(340 40% 30%)",
  },
  {
    slug: "pooja",
    label: "Pooja & Temple",
    emoji: "🪔",
    desc: "Marigold, lotus & jasmine",
    gradient: "linear-gradient(135deg, hsl(38 100% 90%) 0%, hsl(45 95% 75%) 100%)",
    border: "hsl(40 90% 70%)",
    textColor: "hsl(38 60% 25%)",
  },
  {
    slug: "diwali",
    label: "Diwali",
    emoji: "✨",
    desc: "Torans, marigolds & rangoli kits",
    gradient: "linear-gradient(135deg, hsl(30 100% 88%) 0%, hsl(38 100% 72%) 100%)",
    border: "hsl(35 90% 65%)",
    textColor: "hsl(30 60% 25%)",
  },
  {
    slug: "birthday",
    label: "Birthday",
    emoji: "🎂",
    desc: "Colorful bouquets & gerberas",
    gradient: "linear-gradient(135deg, hsl(270 60% 92%) 0%, hsl(285 55% 80%) 100%)",
    border: "hsl(275 50% 75%)",
    textColor: "hsl(275 35% 28%)",
  },
  {
    slug: "anniversary",
    label: "Anniversary",
    emoji: "💑",
    desc: "Romantic roses & mixed blooms",
    gradient: "linear-gradient(135deg, hsl(0 70% 92%) 0%, hsl(350 80% 80%) 100%)",
    border: "hsl(0 65% 75%)",
    textColor: "hsl(0 40% 28%)",
  },
  {
    slug: "navratri",
    label: "Navratri",
    emoji: "🌺",
    desc: "Nine sacred colors daily",
    gradient: "linear-gradient(135deg, hsl(10 90% 88%) 0%, hsl(20 95% 75%) 100%)",
    border: "hsl(15 85% 70%)",
    textColor: "hsl(12 55% 26%)",
  },
  {
    slug: "mehendi",
    label: "Mehendi",
    emoji: "🌿",
    desc: "Jasmine, rose & bridal baskets",
    gradient: "linear-gradient(135deg, hsl(140 50% 88%) 0%, hsl(150 45% 75%) 100%)",
    border: "hsl(145 45% 68%)",
    textColor: "hsl(148 35% 22%)",
  },
  {
    slug: "lunar-new-year",
    label: "Lunar New Year",
    emoji: "🏮",
    desc: "Orchids, peonies & cherry blooms",
    gradient: "linear-gradient(135deg, hsl(0 80% 88%) 0%, hsl(15 90% 78%) 100%)",
    border: "hsl(5 75% 72%)",
    textColor: "hsl(0 45% 26%)",
  },
  {
    slug: "chuseok",
    label: "Chuseok",
    emoji: "🌾",
    desc: "White chrysanthemum offerings",
    gradient: "linear-gradient(135deg, hsl(200 50% 90%) 0%, hsl(210 45% 78%) 100%)",
    border: "hsl(205 45% 72%)",
    textColor: "hsl(210 35% 22%)",
  },
  {
    slug: "haldi",
    label: "Haldi Ceremony",
    emoji: "💛",
    desc: "Turmeric & golden marigolds",
    gradient: "linear-gradient(135deg, hsl(50 100% 88%) 0%, hsl(48 95% 72%) 100%)",
    border: "hsl(48 90% 65%)",
    textColor: "hsl(48 60% 22%)",
  },
  {
    slug: "festival",
    label: "Festival",
    emoji: "🌟",
    desc: "Décor for all celebrations",
    gradient: "linear-gradient(135deg, hsl(160 55% 88%) 0%, hsl(165 50% 74%) 100%)",
    border: "hsl(162 48% 68%)",
    textColor: "hsl(165 38% 20%)",
  },
  {
    slug: "romantic",
    label: "Just Because",
    emoji: "💌",
    desc: "Surprise someone special",
    gradient: "linear-gradient(135deg, hsl(320 60% 90%) 0%, hsl(330 65% 78%) 100%)",
    border: "hsl(325 55% 72%)",
    textColor: "hsl(328 38% 26%)",
  },
];

export function OccasionTiles() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {occasions.map((occ) => (
        <Link
          key={occ.slug}
          to={`/flouristPlace/products?occasion=${occ.slug}`}
          className="group relative overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          style={{
            background: occ.gradient,
            borderColor: occ.border,
          }}
        >
          <div className="p-5 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm"
              style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(8px)" }}
            >
              {occ.emoji}
            </div>
            <div className="font-bold text-sm leading-tight mb-1" style={{ color: occ.textColor }}>
              {occ.label}
            </div>
            <div
              className="text-xs leading-tight opacity-80"
              style={{ color: occ.textColor }}
            >
              {occ.desc}
            </div>
          </div>
          {/* Hover glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl"
            style={{ background: "rgba(255,255,255,0.12)" }}
          />
        </Link>
      ))}
    </div>
  );
}
