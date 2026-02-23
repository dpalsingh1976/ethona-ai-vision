import React from "react";
import { Search, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  aiTerms: string[];
}

export function SearchBar({ query, onQueryChange, aiTerms }: SearchBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-green-100 py-3 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
          <Input
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Search groceries... try 'healthy snack' or 'vrat ka khana'"
            className="pl-10 pr-10 h-12 text-base rounded-xl border-green-200 focus-visible:ring-green-500 bg-green-50/50"
          />
          {query && (
            <button onClick={() => onQueryChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {aiTerms.length > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-green-700 overflow-x-auto">
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span className="flex-shrink-0 font-medium">AI expanded:</span>
            {aiTerms.slice(0, 6).map((t, i) => (
              <span key={i} className="bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
