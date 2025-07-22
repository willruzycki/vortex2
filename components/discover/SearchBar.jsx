import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({ searchQuery, onSearchChange }) {
  return (
    <div className="relative max-w-2xl mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search videos, creators, or topics..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}