import React from "react";

const CATEGORIES = [
  "All",
  "Atta & Flour",
  "Dal & Pulses",
  "Rice",
  "Masala & Spices",
  "Oil & Ghee",
  "Snacks",
  "Beverages",
  "Pickles & Chutneys",
  "Papad & Fryums",
  "Ready to Eat",
  "Essentials",
  "Dry Fruits",
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (cat: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-4 scrollbar-hide">
      {CATEGORIES.map(cat => {
        const value = cat === "All" ? "" : cat;
        const isActive = selected === value;
        return (
          <button
            key={cat}
            onClick={() => onSelect(value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:text-green-700"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
