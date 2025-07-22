import React, { useState, useEffect } from "react";
import { User, Video, Follow } from "@/api/entities";
import { motion } from "framer-motion";
import { useSidebar } from "@/components/SidebarContext";

import ChannelHeader from "../components/profile/ChannelHeader";
import ChannelNavigation from "../components/profile/ChannelNavigation";
import HomeTab from "../components/profile/HomeTab";
import VideosTab from "../components/profile/VideosTab";
import PlaylistsTab from "../components/profile/PlaylistsTab";
import AboutTab from "../components/profile/AboutTab";

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const { isDesktopSidebarOpen } = useSidebar();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Load user's videos
      const userVideos = await Video.filter({ creator_id: currentUser.id }, "-created_date");
      setVideos(userVideos);

      const followersData = await Follow.filter({ following_id: currentUser.id });
      setFollowers(followersData.length);
      
      const followingData = await Follow.filter({ follower_id: currentUser.id });
      setFollowing(followingData.length);

    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setIsLoading(false);
  };

  const tabs = [
    { id: "home", label: "Home" },
    { id: "videos", label: "Videos" },
    { id: "playlists", label: "Playlists" },
    { id: "about", label: "About" }
  ];

  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`mx-auto transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-7xl px-4' : 'max-w-full md:px-12'}`}>
        {/* Channel Header */}
        <ChannelHeader
          user={user}
          currentUser={user}
          followers={followers}
          following={following}
          totalViews={totalViews}
          isOwnProfile={true}
        />

        {/* Channel Navigation */}
        <ChannelNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="pb-20 md:pb-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "home" && (
              <HomeTab 
                user={user} 
                videos={videos} 
                totalViews={totalViews}
              />
            )}
            {activeTab === "videos" && (
              <VideosTab videos={videos} />
            )}
            {activeTab === "playlists" && (
              <PlaylistsTab user={user} />
            )}
            {activeTab === "about" && (
              <AboutTab 
                user={user} 
                totalViews={totalViews}
                totalVideos={videos.length}
                joinDate={user.created_date}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}