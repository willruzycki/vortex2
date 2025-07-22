import React, { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { Video, User, VideoInteraction, WatchHistory } from "@/api/entities";
import { useSidebar } from "@/components/SidebarContext";
import { Film, AlertTriangle } from 'lucide-react';

import VideoPlayer from "../components/video-player/VideoPlayer";
import VideoDetails from "../components/video-player/VideoDetails";
import CreatorProfile from "../components/video-player/CreatorProfile";
import VideoActions from "../components/video-player/VideoActions";
import CommentsSection from "../components/video-player/CommentsSection";
import UpNextVideos from "../components/video-player/UpNextVideos";

const LoadingState = () => (
  <div className="bg-black text-white min-h-screen">
    <div className="max-w-full p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Skeleton */}
        <div className="flex-grow w-full lg:w-2/3 animate-pulse">
          <div className="aspect-video bg-gray-800 rounded-xl mb-4"></div>
          <div className="h-7 bg-gray-800 rounded-lg w-3/4 mb-4"></div>
          <div className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-xl mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-24"></div>
            </div>
            <div className="w-28 h-9 bg-gray-700 rounded-full"></div>
          </div>
          <div className="h-20 bg-gray-800 rounded-lg"></div>
        </div>
        {/* Sidebar Skeleton */}
        <div className="w-full lg:w-1/3 lg:max-w-md flex-shrink-0 animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-40 h-24 bg-gray-800 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-8">
    <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
    <h2 className="text-2xl font-bold text-white mb-2">Video Not Found</h2>
    <p className="text-gray-400 max-w-md mb-6 text-center">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-4"
      >
        Try Again
      </button>
    )}
    <a 
      href="/" 
      className="text-blue-400 hover:text-blue-300 underline"
    >
      Go back to home
    </a>
  </div>
);

export default function VideoPlayer() {
  const [video, setVideo] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { isDesktopSidebarOpen } = useSidebar();
  const videoRef = useRef(null);

  useEffect(() => {
    loadPageData();
  }, [location.search]);

  const loadPageData = async () => {
    setIsLoading(true);
    setError(null);
    
    // Get video ID from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const videoId = urlParams.get('v');
    
    console.log("Loading video with ID:", videoId);
    
    if (!videoId) {
      setError("No video ID found in the URL.");
      setIsLoading(false);
      return;
    }

    try {
      // Load user and video data
      const [currentUser, videosFound] = await Promise.all([
        User.me().catch(() => null),
        Video.filter({ id: videoId })
      ]);
      
      setUser(currentUser);
      
      if (!videosFound || videosFound.length === 0) {
        console.error("Video not found with ID:", videoId);
        setError(`Video with ID "${videoId}" could not be found.`);
        setIsLoading(false);
        return;
      }
      
      const foundVideo = videosFound[0];
      console.log("Video loaded successfully:", foundVideo);
      setVideo(foundVideo);

      // Track view
      if (currentUser) {
        try {
          await VideoInteraction.create({
            video_id: videoId,
            user_id: currentUser.id,
            interaction_type: 'view',
            timestamp: new Date().toISOString(),
            device_type: window.innerWidth < 768 ? 'mobile' : 'desktop'
          });
          
          // Update view count
          await Video.update(videoId, {
            views: (foundVideo.views || 0) + 1
          });
        } catch (viewError) {
          console.warn("Failed to track view:", viewError);
        }
      }

    } catch (e) {
      console.error("Failed to load video:", e);
      setError(e.message || "An unexpected error occurred while loading the video.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoUpdate = (updatedData) => {
    setVideo(prev => ({ ...prev, ...updatedData }));
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !video) {
    return <ErrorState message={error || "Video not found"} onRetry={() => loadPageData()} />;
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className={`transition-all duration-300 ${isDesktopSidebarOpen ? 'max-w-full' : 'max-w-full'}`}>
        <div className="flex flex-col lg:flex-row gap-8 w-full p-4 md:p-8">
          {/* Main Content */}
          <div className="flex-grow w-full lg:w-2/3">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
              <VideoPlayer 
                ref={videoRef}
                src={video.video_url} 
                poster={video.thumbnail_url}
                autoPlay={true}
                muted={true}
              />
            </div>

            {/* Video Details */}
            <VideoDetails video={video} />

            {/* Creator Profile */}
            <CreatorProfile video={video} user={user} />

            {/* Video Actions */}
            <VideoActions 
              video={video} 
              user={user} 
              onVideoUpdate={handleVideoUpdate}
            />

            {/* Comments */}
            <CommentsSection videoId={video.id} user={user} />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-1/3 lg:max-w-md flex-shrink-0">
            <UpNextVideos currentVideo={video} />
          </div>
        </div>
      </div>
    </div>
  );
}