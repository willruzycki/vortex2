import React, { useState, useEffect } from "react";
import { Video, User } from "@/api/entities";
import { Search, TrendingUp, Filter, Sparkles, Users, Video as VideoIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import SearchBar from "../components/discover/SearchBar";
import TrendingSection from "../components/discover/TrendingSection";
import CategoryFilter from "../components/discover/CategoryFilter";
import VideoCard from "../components/discover/VideoCard";
import { useSidebar } from "@/components/SidebarContext";

const CreatorCard = ({ creator, index }) => (
  <Link to={createPageUrl(`UserProfile?username=${creator.username}`)}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/10 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-white/20 transition-colors duration-300"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
        {creator.avatar_url ? (
          <img src={creator.avatar_url} alt={creator.full_name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className="text-3xl font-bold text-white">{creator.full_name?.charAt(0).toUpperCase() || 'U'}</span>
        )}
      </div>
      <h3 className="text-lg font-bold text-white">{creator.full_name}</h3>
      <p className="text-gray-400 text-sm">@{creator.username}</p>
      <p className="text-gray-300 text-sm mt-2 line-clamp-2">{creator.bio}</p>
    </motion.div>
  </Link>
);

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("videos"); // 'videos' or 'creators'
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [videos, setVideos] = useState([]);
  const [creators, setCreators] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDesktopSidebarOpen } = useSidebar();

  useEffect(() => {
    loadContent();
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
        performSearch();
    }
  }, [searchQuery, searchMode]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const trending = await Video.list("-views", 10);
      setTrendingVideos(trending);
      
      let allVideos;
      if (selectedCategory === "all") {
        allVideos = await Video.list("-created_date", 50);
      } else {
        allVideos = await Video.filter({ category: selectedCategory }, "-created_date", 50);
      }
      setVideos(allVideos);
    } catch (error) {
      console.error("Error loading content:", error);
    }
    setIsLoading(false);
  };

  const performSearch = async () => {
      if (searchMode === 'videos') {
          const videoResults = await Video.filter({ title: `%${searchQuery}%`, visibility: 'public' });
          setVideos(videoResults);
      } else {
          const userResultsByName = await User.filter({ full_name: `%${searchQuery}%` });
          const userResultsByUsername = await User.filter({ username: `%${searchQuery}%` });
          const combined = [...userResultsByName, ...userResultsByUsername];
          const uniqueCreators = Array.from(new Set(combined.map(u => u.id))).map(id => combined.find(u => u.id === id));
          setCreators(uniqueCreators);
      }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 md:pt-8 md:pb-8">
      <div className={`mx-auto px-4 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-7xl' : 'max-w-full md:px-12'}`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Discover Amazing Content</h1>
          <p className="text-gray-400 text-lg">Explore trending videos and find your next favorite creator</p>
        </div>

        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {searchQuery.trim() === '' ? (
          <>
            <TrendingSection videos={trendingVideos} isLoading={isLoading} />
            <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video, index) => <VideoCard key={video.id} video={video} index={index} />)}
            </div>
          </>
        ) : (
          <div>
            <div className="flex justify-center gap-2 mb-8 bg-gray-900 p-1 rounded-xl max-w-sm mx-auto">
              <button onClick={() => setSearchMode('videos')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${searchMode === 'videos' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Videos</button>
              <button onClick={() => setSearchMode('creators')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${searchMode === 'creators' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Creators</button>
            </div>

            {searchMode === 'videos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.length > 0 ? videos.map((video, index) => <VideoCard key={video.id} video={video} index={index} />) : <p className="text-gray-400 col-span-full text-center">No videos found.</p>}
              </div>
            )}
            {searchMode === 'creators' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {creators.length > 0 ? creators.map((creator, index) => <CreatorCard key={creator.id} creator={creator} index={index} />) : <p className="text-gray-400 col-span-full text-center">No creators found.</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}