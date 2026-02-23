import React from "react";
import { Bug } from "lucide-react";

interface ScoreToggleProps {
  showScores: boolean;
  onToggle: (v: boolean) => void;
  productCount: number;
}

export function ScoreToggle({ showScores, onToggle, productCount }: ScoreToggleProps) {
  return (
    <div className="flex items-center justify-between px-4">
      <span className="text-sm text-gray-500">{productCount} products</span>
      <button
        onClick={() => onToggle(!showScores)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
          showScores ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        <Bug className="w-3 h-3" />
        {showScores ? "Hide Scores" : "Show Scores"}
      </button>
    </div>
  );
}
