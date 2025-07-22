
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import MobileCategoryTabs from "./MobileCategoryTabs";

export default function MobileVideoFeed({ videos, user, onInteraction }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredVideos, setFilteredVideos] = useState([]);

  useEffect(() => {
    filterVideosByCategory();
  }, [videos, activeCategory]);

  const filterVideosByCategory = () => {
    let filtered;
    switch (activeCategory) {
      case "trending":
        filtered = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "recent":
        filtered = [...videos].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case "ai":
        filtered = videos.filter(video => video.is_ai_generated);
        break;
      case "shorts":
        filtered = videos.filter(video => video.category === "shorts");
        break;
      default:
        filtered = videos;
    }
    setFilteredVideos(filtered);
  };

  const formatViews = (views) => {
    if (!views) return "0 views";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <MobileCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="pb-20">
        <AnimatePresence mode="wait">
          {filteredVideos.map((video, index) => (
            <motion.a
              key={video.id}
              href={createPageUrl(`VideoPlayer?v=${video.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="mb-6 block bg-white"
            >
              <div className="relative aspect-video bg-black">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {video.is_ai_generated && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-white" />
                      <span className="text-xs font-medium text-white">AI</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">
                      {(video.created_by || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-medium text-base line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <div className="text-gray-600 text-sm">
                      <p>{video.created_by?.split('@')[0] || 'Unknown Creator'}</p>
                      <div className="flex items-center gap-2">
                        <span>{formatViews(video.views)}</span>
                        <span>•</span>
                        <span>{format(new Date(video.created_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
