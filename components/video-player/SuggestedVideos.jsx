import React, { useState, useEffect } from "react";
import { Video } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Play, Eye } from "lucide-react";
import { format } from "date-fns";

export default function SuggestedVideos({ currentVideoId }) {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuggestedVideos();
  }, [currentVideoId]);

  const loadSuggestedVideos = async () => {
    setIsLoading(true);
    try {
      // Get recent videos excluding current video
      const allVideos = await Video.list("-created_date", 15);
      const suggestedVideos = allVideos.filter(video => video.id !== currentVideoId);
      setVideos(suggestedVideos.slice(0, 10));
    } catch (error) {
      console.error("Error loading suggested videos:", error);
    }
    setIsLoading(false);
  };

  const formatViews = (views) => {
    if (!views) return "0 views";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Suggested Videos</h3>
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="w-32 h-20 bg-gray-700 rounded-lg animate-pulse flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Suggested Videos</h3>
      
      <div className="space-y-3">
        {videos.map((video) => (
          <Link
            key={video.id}
            to={createPageUrl(`VideoPlayer?v=${video.id}`)}
            className="group block"
          >
            <div className="flex gap-3 hover:bg-gray-900/30 rounded-lg p-2 transition-colors">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium line-clamp-2 group-hover:text-red-400 transition-colors mb-1 text-sm">
                  {video.title}
                </h4>
                
                <p className="text-gray-400 text-xs hover:text-gray-300 transition-colors mb-1">
                  {video.creator_full_name || 'Unknown Creator'}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{formatViews(video.views)}</span>
                  </div>
                  <span>•</span>
                  <span>{format(new Date(video.created_date), 'MMM d')}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}