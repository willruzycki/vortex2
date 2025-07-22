import React from "react";
import { Play, Eye, Sparkles, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function VideoCard({ video, index, onVideoClick, showSubscribeButton = false, user, onSubscribe }) {
  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return `${views}`;
  };

  const handleCardClick = () => {
    console.log("VideoCard clicked:", {
      videoId: video.id,
      videoTitle: video.title,
      navigatingTo: createPageUrl(`VideoPlayer?v=${video.id}`)
    });
    
    if (onVideoClick) {
      onVideoClick(video);
    }
  };

  if (!video || !video.id) {
    console.error("VideoCard: Invalid video data:", video);
    return null;
  }

  const canSubscribe = showSubscribeButton && user && user.id !== video.creator_id;
  const videoPlayerUrl = createPageUrl(`VideoPlayer?v=${video.id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link 
        to={videoPlayerUrl} 
        className="block"
        onClick={handleCardClick}
      >
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.warn("Thumbnail failed to load:", video.thumbnail_url);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>

          {video.is_ai_generated && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-xs font-medium text-white">AI</span>
              </div>
            </div>
          )}

          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-xs">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
      </Link>

      <div className="pt-3 flex gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          {video.creator_avatar_url ? (
            <img 
              src={video.creator_avatar_url} 
              alt={video.creator_full_name} 
              className="w-full h-full object-cover rounded-full" 
              onError={(e) => e.target.style.display = 'none'}
            />
          ) : (
            <span className="text-sm font-bold text-white">
              {(video.creator_full_name || video.created_by || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <Link 
            to={videoPlayerUrl} 
            className="block"
            onClick={handleCardClick}
          >
            <h3 className="text-slate-900 font-medium line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
              {video.title}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="text-gray-600 text-sm space-y-0.5">
              <p className="hover:text-slate-900 transition-colors">
                {video.creator_full_name || video.created_by?.split('@')[0] || 'Unknown Creator'}
              </p>
              <div className="flex items-center gap-2">
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <span>{format(new Date(video.created_date), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            {canSubscribe && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSubscribe && onSubscribe(video.creator_id);
                }}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-full"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Subscribe
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}