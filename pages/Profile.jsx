import React, { useState, useEffect } from "react";
import { User, Video, Follow } from "@/api/entities";
import { motion } from "framer-motion";
import { useLocation } from 'react-router-dom';
import { useSidebar } from "@/components/SidebarContext";

import ChannelHeader from "../components/profile/ChannelHeader";
import ChannelNavigation from "../components/profile/ChannelNavigation";
import HomeTab from "../components/profile/HomeTab";
import VideosTab from "../components/profile/VideosTab";
import PlaylistsTab from "../components/profile/PlaylistsTab";
import AboutTab from "../components/profile/AboutTab";

export default function Profile() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const profileUserIdFromUrl = queryParams.get('userId');
  const usernameFromUrl = queryParams.get('username');

  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const { isDesktopSidebarOpen } = useSidebar();

  useEffect(() => {
    loadProfile(profileUserIdFromUrl, usernameFromUrl);
  }, [profileUserIdFromUrl, usernameFromUrl]);

  const loadProfile = async (id, username) => {
    setIsLoading(true);
    try {
      const loggedInUser = await User.me().catch(() => null);
      setCurrentUser(loggedInUser);

      let targetUser;
      if (id) {
        const results = await User.filter({ id: id });
        if (results.length > 0) targetUser = results[0];
      } else if (username) {
        const results = await User.filter({ username: username });
        if (results.length > 0) targetUser = results[0];
      } else if (loggedInUser) {
        targetUser = loggedInUser;
      }

      if (!targetUser) {
        console.error("Profile user not found");
        setProfileUser(null);
        setIsLoading(false);
        return;
      }
      setProfileUser(targetUser);

      // Load user's videos
      const userVideos = await Video.filter({ created_by: targetUser.email }, "-created_date");
      setVideos(userVideos);

      // Load follow data
      const followersData = await Follow.filter({ following_id: targetUser.id });
      setFollowers(followersData.length);
      
      const followingData = await Follow.filter({ follower_id: targetUser.id });
      setFollowing(followingData.length);

      if (loggedInUser && loggedInUser.id !== targetUser.id) {
        setIsFollowing(followersData.some(f => f.follower_id === loggedInUser.id));
      }

    } catch (error) {
      console.error("Error loading profile:", error);
      setProfileUser(null);
    }
    setIsLoading(false);
  };
  
  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert("Please log in to follow creators.");
      return;
    }

    const originalState = isFollowing;
    const originalCount = followers;

    // Optimistic update
    setIsFollowing(!isFollowing);
    setFollowers(prev => isFollowing ? prev - 1 : prev + 1);

    try {
      if (isFollowing) {
        const followRecord = await Follow.filter({ follower_id: currentUser.id, following_id: profileUser.id });
        if (followRecord.length > 0) {
          await Follow.delete(followRecord[0].id);
        }
      } else {
        await Follow.create({ follower_id: currentUser.id, following_id: profileUser.id });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      // Revert on error
      setIsFollowing(originalState);
      setFollowers(originalCount);
    }
  };

  const tabs = [
    { id: "home", label: "Home" },
    { id: "videos", label: "Videos" },
    { id: "playlists", label: "Playlists" },
    { id: "about", label: "About" }
  ];

  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Channel Not Found</h3>
          <p className="text-gray-600 mb-8">The channel you are looking for does not exist.</p>
          <a href="/" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`mx-auto transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-7xl px-4' : 'max-w-full md:px-12'}`}>
        {/* Channel Header */}
        <ChannelHeader
          user={profileUser}
          currentUser={currentUser}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          followers={followers}
          following={following}
          totalViews={totalViews}
          isOwnProfile={isOwnProfile}
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
                user={profileUser} 
                videos={videos} 
                totalViews={totalViews}
              />
            )}
            {activeTab === "videos" && (
              <VideosTab videos={videos} />
            )}
            {activeTab === "playlists" && (
              <PlaylistsTab user={profileUser} />
            )}
            {activeTab === "about" && (
              <AboutTab 
                user={profileUser} 
                totalViews={totalViews}
                totalVideos={videos.length}
                joinDate={profileUser.created_date}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}