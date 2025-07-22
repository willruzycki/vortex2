import React, { useState } from "react";
import { Search, SlidersHorizontal, Play, Eye, Clock } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VideosTab({ videos }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, popular, oldest

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || '0';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'oldest':
          return new Date(a.created_date) - new Date(b.created_date);
        case 'recent':
        default:
          return new Date(b.created_date) - new Date(a.created_date);
      }
    });

  return (
    <div className="p-4 md:p-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="recent">Recently uploaded</option>
            <option value="popular">Most popular</option>
            <option value="oldest">Oldest</option>
          </select>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <Link key={video.id} to={createPageUrl(`VideoPlayer?v=${video.id}`)}>
              <div className="group">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-3">
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
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>

                  {/* Duration */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-xs">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div>
                  <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(video.views)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(video.created_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {searchQuery ? 'No videos found' : 'No videos uploaded'}
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Try adjusting your search terms or filters.' 
              : 'This channel hasn\'t uploaded any videos yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
}