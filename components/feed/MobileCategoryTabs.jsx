import React from "react";
import { TrendingUp, Clock, Sparkles, Grid } from "lucide-react";

const categories = [
  { id: "all", label: "All", icon: Grid },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "shorts", label: "Shorts", icon: Clock }
];

export default function MobileCategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 px-4 py-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-white text-gray-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
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