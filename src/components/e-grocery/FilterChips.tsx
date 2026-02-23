import React from "react";

const FILTER_TAGS = [
  { label: "Jain", value: "jain", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "Diabetic-Friendly", value: "diabetic-friendly", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "Vrat Special", value: "vrat", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { label: "Organic", value: "organic", color: "bg-green-100 text-green-700 border-green-200" },
  { label: "Gujarati", value: "gujarati", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "Sugar-Free", value: "sugar-free", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { label: "High Protein", value: "high-protein", color: "bg-red-100 text-red-700 border-red-200" },
  { label: "Heart-Healthy", value: "heart-healthy", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

interface FilterChipsProps {
  selected: string[];
  onToggle: (tag: string) => void;
}

export function FilterChips({ selected, onToggle }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-4 scrollbar-hide">
      {FILTER_TAGS.map(tag => (
        <button
          key={tag.value}
          onClick={() => onToggle(tag.value)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            selected.includes(tag.value)
              ? `${tag.color} ring-2 ring-offset-1 ring-current`
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}
