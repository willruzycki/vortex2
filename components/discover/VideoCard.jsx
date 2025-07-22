
import React from "react";
import { Play, Eye, Heart, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function VideoCard({ video, index }) {
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Link to={createPageUrl(`VideoPlayer?v=${video.id}`)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group cursor-pointer"
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

          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-white text-xs">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Stats */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white text-xs">{video.views || 0}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
              <Heart className="w-3 h-3 text-white" />
              <span className="text-white text-xs">{video.likes || 0}</span>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="mt-3">
          <h3 className="text-white font-medium line-clamp-2 mb-1">{video.title}</h3>
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>{video.created_by?.split('@')[0] || 'Unknown Creator'}</span>
            <span>{format(new Date(video.created_date), 'MMM d')}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span className="capitalize">{video.category?.replace('_', ' ')}</span>
            {video.tags && video.tags.length > 0 && (
              <>
                <span>•</span>
                <span>#{video.tags[0]}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
