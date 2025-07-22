import React from "react";
import { Clock, Film, TrendingUp, Sparkles, Grid } from "lucide-react";

const categories = [
  { id: "all", label: "All Videos", icon: Grid },
  { id: "shorts", label: "Shorts", icon: Clock },
  { id: "films", label: "Films", icon: Film },
  { id: "creator_series", label: "Series", icon: TrendingUp }
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}