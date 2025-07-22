import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({ searchQuery, onSearchChange }) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for videos and creators..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-full pl-12 pr-12 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}