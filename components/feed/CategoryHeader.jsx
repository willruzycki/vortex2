import React from "react";
import { ChevronRight } from "lucide-react";

export default function CategoryHeader({ title, icon: Icon, subtitle, gradient = false, isDarkMode = false }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          gradient 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
            : 'bg-red-500'
        }`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
          {subtitle && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
          )}
        </div>
      </div>
      
      <button className={`flex items-center gap-1 transition-colors text-sm ${
        isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-slate-900'
      }`}>
        View all
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}