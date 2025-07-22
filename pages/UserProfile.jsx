import React, { useState, useEffect } from "react";
import { User, Video, Follow, Subscription } from "@/api/entities";
import { motion } from "framer-motion";
import {
  Play,
  Users,
  Heart,
  Eye,
  Edit,
  Settings,
  Grid,
  Film,
  Sparkles,
  Plus,
  Rss,
  Check
} from "lucide-react";
import VideoGrid from "../components/profile/VideoGrid";
import { useSidebar } from "@/components/SidebarContext";
import { Button } from "@/components/ui/button";

const ProfileHeader = ({ profileUser, stats, currentUser }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (currentUser && profileUser) {
      checkFollowStatus();
      checkSubscriptionStatus();
    }
  }, [currentUser, profileUser]);

  const checkFollowStatus = async () => {
    const follow = await Follow.filter({ follower_id: currentUser.id, following_id: profileUser.id });
    setIsFollowing(follow.length > 0);
  };
  
  const checkSubscriptionStatus = async () => {
    const subscription = await Subscription.filter({ subscriber_id: currentUser.id, channel_id: profileUser.id });
    setIsSubscribed(subscription.length > 0);
  };

  const handleFollow = async () => {
    if (!currentUser) return; // Or prompt to login
    
    if (isFollowing) {
      const follow = await Follow.filter({ follower_id: currentUser.id, following_id: profileUser.id });
      if(follow.length > 0) await Follow.delete(follow[0].id);
    } else {
      await Follow.create({ follower_id: currentUser.id, following_id: profileUser.id });
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            {profileUser.avatar_url ? (
              <img src={profileUser.avatar_url} alt={profileUser.full_name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-4xl font-bold text-white">{profileUser.full_name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{profileUser.full_name}</h1>
              <p className="text-gray-500">@{profileUser.username}</p>
            </div>
            {currentUser?.id !== profileUser.id && (
              <div className="flex gap-2">
                <Button onClick={handleFollow} variant={isFollowing ? "secondary" : "default"}>
                  {isFollowing ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline">
                    <Rss className="w-4 h-4 mr-2" />
                    Subscribe
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-6 text-sm mb-4">
            <div className="text-center"><span className="text-slate-900 font-bold">{stats.followers}</span> <span className="text-gray-600">Followers</span></div>
            <div className="text-center"><span className="text-slate-900 font-bold">{stats.following}</span> <span className="text-gray-600">Following</span></div>
            <div className="text-center"><span className="text-slate-900 font-bold">{stats.likes.toLocaleString()}</span> <span className="text-gray-600">Likes</span></div>
          </div>

          {profileUser.bio && <p className="text-gray-700 mb-4 max-w-2xl">{profileUser.bio}</p>}
        </div>
      </div>
    </div>
  );
};

export default function UserProfile() {
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, likes: 0, views: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { isDesktopSidebarOpen } = useSidebar();

  useEffect(() => {
    loadProfileData();
    const fetchCurrentUser = async () => {
        try {
            setCurrentUser(await User.me());
        } catch(e) { /* not logged in */ }
    }
    fetchCurrentUser();
  }, [window.location.search]);

  const loadProfileData = async () => {
    setIsLoading(true);
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    if (!username) {
      setIsLoading(false);
      return;
    }

    try {
      const users = await User.filter({ username: username });
      if (users.length === 0) {
        setIsLoading(false);
        return;
      }
      const user = users[0];
      setProfileUser(user);

      const userVideos = await Video.filter({ creator_id: user.id, visibility: 'public' }, "-created_date");
      setVideos(userVideos);

      const followersData = await Follow.filter({ following_id: user.id });
      const followingData = await Follow.filter({ follower_id: user.id });
      
      const totalLikes = userVideos.reduce((sum, v) => sum + (v.likes || 0), 0);
      const totalViews = userVideos.reduce((sum, v) => sum + (v.views || 0), 0);

      setStats({
          followers: followersData.length,
          following: followingData.length,
          likes: totalLikes,
          views: totalViews
      });

    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setIsLoading(false);
  };

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
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">User not found</h2>
                <p className="text-gray-600">The profile you are looking for does not exist.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className={`mx-auto px-4 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-6xl' : 'max-w-full md:px-12'}`}>
        <ProfileHeader profileUser={profileUser} stats={stats} currentUser={currentUser} />
        
        <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-6">Uploads ({videos.length})</h3>
            <VideoGrid videos={videos} />
        </div>
      </div>
    </div>
  );
}