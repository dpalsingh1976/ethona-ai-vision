import React, { useRef } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FPSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  aiTerms?: string[];
  placeholder?: string;
  className?: string;
}

export function FPSearchBar({
  query,
  onQueryChange,
  aiTerms = [],
  placeholder = "Search 'wedding garland', 'pooja flowers', 'birthday bouquet under $50'...",
  className = "",
}: FPSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={className}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fp-rose" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="pl-12 pr-10 h-14 text-base rounded-2xl border-fp-blush focus-visible:ring-fp-rose bg-white shadow-sm"
        />
        {query && (
          <button
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-fp-forest/40 hover:text-fp-rose transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {aiTerms.length > 0 && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Sparkles className="w-3.5 h-3.5 text-fp-rose flex-shrink-0" />
          <span className="text-xs text-fp-forest/50 font-medium flex-shrink-0">AI expanded:</span>
          {aiTerms.slice(0, 7).map((term, i) => (
            <button
              key={i}
              onClick={() => onQueryChange(term)}
              className="text-xs bg-fp-blush/40 text-fp-forest/70 hover:bg-fp-blush hover:text-fp-rose px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
