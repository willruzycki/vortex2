import React, { useState, useEffect, useRef } from "react";
import { Video, VideoInteraction, User, UserRecommendation, WatchHistory } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  Star,
  Search,
  Sparkles
} from "lucide-react";

import VideoCarousel from "../components/feed/VideoCarousel";
import MobileVideoFeed from "../components/feed/MobileVideoFeed";
import CategoryHeader from "../components/feed/CategoryHeader";
import SearchBar from "../components/feed/SearchBar";
import VideoCard from "../components/feed/VideoCard";
import { useSidebar } from "@/components/SidebarContext";

export default function Feed() {
  const [videos, setVideos] = useState([]);
  const [personalizedVideos, setPersonalizedVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [creatorPicks, setCreatorPicks] = useState([]);
  const [aiOriginals, setAiOriginals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { isDesktopSidebarOpen } = useSidebar();
  const [loadingStage, setLoadingStage] = useState('Initializing...');

  // Debounce search to avoid excessive API calls
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }

    initializeApp();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      const lowercasedQuery = searchQuery.toLowerCase();
      const results = videos.filter(video => 
        (video.title && video.title.toLowerCase().includes(lowercasedQuery)) ||
        (video.created_by && video.created_by.toLowerCase().includes(lowercasedQuery)) ||
        (video.tags && Array.isArray(video.tags) && video.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery)))
      );
      setSearchResults(results);
    }, 300); // 300ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, videos]);

  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setLoadingStage('Loading user data...');
      const currentUser = await User.me().catch(() => null);
      setUser(currentUser);
      
      setLoadingStage('Loading videos...');
      const allVideos = await Video.list("-created_date", 30);
      setVideos(allVideos);

      processVideoCategories(allVideos);

      if (currentUser) {
        setLoadingStage('Personalizing your feed...');
        generatePersonalizedRecommendations(currentUser, allVideos);
      }
      
    } catch (error) {
      console.error("Error initializing app:", error);
    } finally {
      setIsLoading(false);
      setLoadingStage('Ready!');
    }
  };

  const checkScreenSize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const processVideoCategories = (allVideos) => {
    setLoadingStage('Organizing content...');
    
    // Perform all video processing in one go
    const sortedByViews = [...allVideos].sort((a, b) => (b.views || 0) - (a.views || 0));
    const sortedByLikes = [...allVideos].sort((a, b) => (b.likes || 0) - (a.likes || 0));

    setTrendingVideos(sortedByViews.slice(0, 10));
    setRecentVideos(allVideos.slice(0, 10)); // Already sorted by date
    setCreatorPicks(sortedByLikes.slice(0, 10));
    setAiOriginals(allVideos.filter(video => video.is_ai_generated).slice(0, 10));
  };
  
  const generatePersonalizedRecommendations = async (currentUser, allVideos) => {
    // This is a background task, so we don't block the UI
    setTimeout(async () => {
      if (!currentUser || allVideos.length === 0) return;

      try {
        const interactions = await VideoInteraction.filter({ user_id: currentUser.id, interaction_type: 'like' }, "-timestamp", 20);
        const likedVideoIds = new Set(interactions.map(i => i.video_id));

        if (likedVideoIds.size === 0) {
          setPersonalizedVideos([]); // No liked videos, no recommendations
          return;
        }

        const likedVideos = allVideos.filter(v => likedVideoIds.has(v.id));
        const likedTags = new Set(likedVideos.flatMap(v => v.tags || []));

        // Simple recommendation: find other videos with similar tags
        const recommended = allVideos
          .filter(v => !likedVideoIds.has(v.id)) // Exclude already liked videos
          .map(video => {
            const sharedTags = (video.tags || []).filter(tag => likedTags.has(tag));
            return { ...video, score: sharedTags.length };
          })
          .filter(video => video.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        setPersonalizedVideos(recommended);
      } catch (error) {
        console.warn("Could not generate personalized recommendations:", error);
        // Fallback gracefully
        setPersonalizedVideos([]);
      }
    }, 500); // Delay slightly to not interfere with initial render
  };

  const handleVideoInteraction = async (videoId, interactionType, data = {}) => {
    if (!user) return;

    // Fire-and-forget interaction logging
    VideoInteraction.create({
      video_id: videoId,
      user_id: user.id,
      interaction_type: interactionType,
      timestamp: new Date().toISOString(),
      device_type: isMobile ? 'mobile' : 'desktop',
      ...data
    }).catch(error => {
        console.warn("Failed to log interaction (non-critical):", error);
    });

    // Optimistically update video stats client-side for immediate feedback
    const updateVideoStats = (videoArray, setVideoArray) => {
      const videoIndex = videoArray.findIndex(v => v.id === videoId);
      if (videoIndex !== -1) {
        const updatedVideos = [...videoArray];
        const videoToUpdate = { ...updatedVideos[videoIndex] };

        if (interactionType === "like") {
          videoToUpdate.likes = (videoToUpdate.likes || 0) + 1;
        } else if (interactionType === "view") {
          videoToUpdate.views = (videoToUpdate.views || 0) + 1;
        }
        updatedVideos[videoIndex] = videoToUpdate;
        setVideoArray(updatedVideos);
      }
    };

    updateVideoStats(videos, setVideos);
    updateVideoStats(personalizedVideos, setPersonalizedVideos);
    updateVideoStats(trendingVideos, setTrendingVideos);
    updateVideoStats(recentVideos, setRecentVideos);
    updateVideoStats(creatorPicks, setCreatorPicks);
    updateVideoStats(aiOriginals, setAiOriginals);

    if (searchQuery.trim() !== '') {
      updateVideoStats(searchResults, setSearchResults);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-800 text-lg font-medium">{loadingStage}</p>
          <p className="text-slate-600 text-sm mt-2">Setting up your personalized experience...</p>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <MobileVideoFeed
        videos={user ? personalizedVideos.length > 0 ? personalizedVideos : videos : videos}
        user={user}
        onInteraction={handleVideoInteraction}
      />
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`mx-auto px-4 py-8 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-7xl' : 'max-w-full md:px-12'}`}>
        <section className="mb-12">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </section>

        <AnimatePresence mode="wait">
          {searchQuery.trim() !== '' ? (
            <motion.section
              key="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Search Results for "{searchQuery}"
              </h2>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {searchResults.map((video, index) => (
                    <VideoCard key={video.id} video={video} index={index} onVideoClick={() => handleVideoInteraction(video.id, "view")} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h3>
                  <p className="text-gray-600">Try a different search term.</p>
                </div>
              )}
            </motion.section>
          ) : (
            <motion.div 
              key="carousels" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Personalized For You Section - Only if user logged in and has recommendations */}
              {user && personalizedVideos.length > 0 && (
                <section className="mb-12">
                  <CategoryHeader
                    title="For You"
                    icon={Sparkles}
                    subtitle="Personalized recommendations just for you"
                    gradient={true}
                  />
                  <VideoCarousel
                    videos={personalizedVideos}
                    onVideoClick={(video) => handleVideoInteraction(video.id, "view")}
                    isLoading={false}
                  />
                </section>
              )}

              {/* Trending Section */}
              <section className="mb-12">
                <CategoryHeader
                  title="Trending"
                  icon={TrendingUp}
                  subtitle="What's popular right now"
                />
                <VideoCarousel
                  videos={trendingVideos}
                  onVideoClick={(video) => handleVideoInteraction(video.id, "view")}
                  isLoading={false}
                />
              </section>
              
              {/* Recently Uploaded Section */}
              <section className="mb-12">
                <CategoryHeader
                  title="Recently Uploaded"
                  icon={Clock}
                  subtitle="Fresh content from creators"
                />
                <VideoCarousel
                  videos={recentVideos}
                  onVideoClick={(video) => handleVideoInteraction(video.id, "view")}
                  isLoading={false}
                />
              </section>

              {/* Creator Picks Section */}
              <section className="mb-12">
                <CategoryHeader
                  title="Creator Picks"
                  icon={Star}
                  subtitle="Top-rated content"
                />
                <VideoCarousel
                  videos={creatorPicks}
                  onVideoClick={(video) => handleVideoInteraction(video.id, "view")}
                  isLoading={false}
                />
              </section>

              {/* AI Originals Section - Only if there are AI videos */}
              {aiOriginals.length > 0 && (
                <section className="mb-12">
                  <CategoryHeader
                    title="AI Originals"
                    icon={Sparkles}
                    subtitle="AI-generated masterpieces"
                    gradient={true}
                  />
                  <VideoCarousel
                    videos={aiOriginals}
                    onVideoClick={(video) => handleVideoInteraction(video.id, "view")}
                    isLoading={false}
                  />
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}