import React from "react";
import type { FPCategory } from "@/hooks/useFleuristProducts";

interface CategoryFilterProps {
  categories: FPCategory[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export function CategoryFilter({ categories, activeSlug, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        onClick={() => onSelect("")}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeSlug === ""
            ? "bg-fp-rose text-white shadow-sm"
            : "bg-fp-cream text-fp-forest/70 hover:bg-fp-blush/50"
        }`}
      >
        All Flowers
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeSlug === cat.slug
              ? "bg-fp-rose text-white shadow-sm"
              : "bg-fp-cream text-fp-forest/70 hover:bg-fp-blush/50"
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
