import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Eye, Heart, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { User, VideoInteraction } from "@/api/entities";

export default function VideoCarousel({ videos, onVideoClick, isLoading }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 320; // Width of one video card plus gap
    const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });

    // Update scroll button states
    setTimeout(() => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }, 300);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVideoClick = async (video) => {
    console.log("VideoCarousel - Video clicked:", {
      videoId: video.id,
      videoTitle: video.title,
      navigatingTo: createPageUrl(`VideoPlayer?v=${video.id}`)
    });
    
    // Track click interaction for analytics
    try {
      const currentUser = await User.me().catch(() => null);
      if (currentUser) {
        await VideoInteraction.create({
          video_id: video.id,
          user_id: currentUser.id,
          interaction_type: 'click',
          timestamp: new Date().toISOString(),
          device_type: window.innerWidth < 768 ? 'mobile' : 'desktop'
        });
        console.log("Click interaction logged successfully");
      }
    } catch (error) {
      console.log("Click tracking failed (non-critical):", error);
    }
    
    // Call the provided onVideoClick prop for additional handling if it exists
    if (onVideoClick) {
      onVideoClick(video);
    }
  };

  const formatViews = (views) => {
    if (!views) return "0 views";
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views.toLocaleString()} views`;
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-80 animate-pulse">
            <div className="aspect-video bg-white/10 rounded-xl mb-3"></div>
            <div className="px-1">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    console.log("VideoCarousel: No videos to display");
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No videos available</p>
      </div>
    );
  }

  console.log("VideoCarousel rendering", videos.length, "videos");

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Video Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const container = e.target;
          setCanScrollLeft(container.scrollLeft > 0);
          setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
        }}
      >
        {videos.map((video, index) => {
          if (!video || !video.id) {
            console.warn("Skipping invalid video at index", index, video);
            return null;
          }

          const videoPlayerUrl = createPageUrl(`VideoPlayer?v=${video.id}`);

          return (
            <Link 
              key={video.id} 
              to={videoPlayerUrl}
              onClick={() => handleVideoClick(video)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-80 cursor-pointer group/video"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-300"
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
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  {/* Duration */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs font-medium">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* AI Badge */}
                  {video.is_ai_generated && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-white" />
                        <span className="text-xs font-medium text-white">AI</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="pt-3 px-1">
                  <h3 className="text-slate-900 font-medium text-sm line-clamp-2 mb-1 group-hover/video:text-slate-700 transition-colors">
                    {video.title}
                  </h3>
                  
                  <div className="text-gray-600 text-xs space-y-1">
                    <p className="hover:text-gray-900 transition-colors cursor-pointer">
                      {video.creator_full_name || video.created_by?.split('@')[0] || 'Unknown Creator'}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span>{formatViews(video.views)}</span>
                      <span>•</span>
                      <span>{format(new Date(video.created_date), 'MMM d, yyyy')}</span>
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500">#</span>
                        <span className="text-gray-500">{video.tags[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}