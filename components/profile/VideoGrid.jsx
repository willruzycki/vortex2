import React from "react";
import { Play, Eye, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function VideoGrid({ videos }) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Videos Yet</h3>
        <p className="text-gray-600">Start creating to see your content here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video, index) => (
        <Link 
          key={video.id} 
          to={createPageUrl(`VideoPlayer?v=${video.id}`)}
          onClick={() => console.log(`2. Video ID Passing: Navigating from creator grid with video ID: ${video.id}`)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
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

              {/* Duration */}
              {video.duration && (
                <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-white text-xs">
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="mt-3">
              <h3 className="text-slate-900 font-medium line-clamp-2 mb-1">{video.title}</h3>
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{video.views || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{video.likes || 0}</span>
                </div>
                <span className="capitalize">{video.category?.replace('_', ' ')}</span>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}