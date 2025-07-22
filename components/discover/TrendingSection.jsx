import React from "react";
import { TrendingUp, Play, Eye, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function TrendingSection({ videos, isLoading }) {
  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-white">Trending Now</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-80 animate-pulse">
              <div className="aspect-video bg-white/10 rounded-xl mb-3"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-bold text-white">Trending Now</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-80 group cursor-pointer"
          >
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>

              {/* AI Badge */}
              {video.is_ai_generated && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span className="text-xs font-medium text-white">AI</span>
                  </div>
                </div>
              )}

              {/* Views */}
              <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded flex items-center gap-1">
                <Eye className="w-3 h-3 text-white" />
                <span className="text-white text-xs">{video.views || 0}</span>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-white font-medium line-clamp-2 mb-1">{video.title}</h3>
              <p className="text-gray-400 text-sm">{video.created_by || 'Unknown Creator'}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}