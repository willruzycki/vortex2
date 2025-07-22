import React, { useState, useEffect } from "react";
import { User, Follow } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Bell } from "lucide-react";

export default function CreatorProfile({ video, user }) {
  const [creator, setCreator] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [creatorError, setCreatorError] = useState(false);

  useEffect(() => {
    if (video) {
      loadCreatorInfo();
    }
  }, [video, user]);

  const loadCreatorInfo = async () => {
    if (!video) return;
    setIsLoading(true);
    setCreatorError(false);
    
    try {
      console.log("Loading creator info for video:", video);
      
      // Check if we have valid creator_id
      if (video.creator_id && video.creator_id.length > 10 && !video.creator_id.includes('-')) {
        try {
          const creatorResults = await User.filter({ id: video.creator_id });
          
          if (creatorResults.length > 0) {
            const creatorData = creatorResults[0];
            setCreator(creatorData);
            console.log("Creator found:", creatorData);
            
            // Load follower count and follow status
            try {
              const followers = await Follow.filter({ following_id: video.creator_id });
              setSubscriberCount(followers.length);
              
              if (user) {
                const isUserFollowing = followers.some(f => f.follower_id === user.id);
                setIsFollowing(isUserFollowing);
              }
            } catch (followError) {
              console.warn("Could not load follower data:", followError);
              setSubscriberCount(0);
            }
            
            setIsLoading(false);
            return; // Successfully loaded creator
          }
        } catch (apiError) {
          console.warn("Creator API call failed:", apiError);
        }
      }

      // Create fallback creator data from video information
      console.log("Creating fallback creator data");
      setCreatorError(true);
      
      const fallbackCreator = {
        id: video.creator_id || 'unknown',
        full_name: video.creator_full_name || 
                  video.created_by?.split('@')[0] || 
                  'Unknown Creator',
        email: video.created_by || 'unknown@example.com',
        avatar_url: video.creator_avatar_url || null
      };
      
      setCreator(fallbackCreator);
      setSubscriberCount(0);
      console.log("Using fallback creator:", fallbackCreator);
      
    } catch (error) {
      console.error("Unexpected error in loadCreatorInfo:", error);
      setCreatorError(true);
      
      // Final fallback
      setCreator({
        id: 'fallback',
        full_name: 'Unknown Creator',
        email: 'unknown@example.com',
        avatar_url: null
      });
      setSubscriberCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      alert("Please log in to subscribe to creators.");
      return;
    }

    // Prevent self-subscription
    if (user.id === video?.creator_id) {
      alert("You cannot subscribe to yourself.");
      return;
    }

    // Don't allow subscribing to non-existent creators
    if (creatorError || !video?.creator_id || video.creator_id === 'unknown' || video.creator_id === 'fallback') {
      alert("Cannot subscribe to this creator at the moment.");
      return;
    }

    // Optimistic UI update
    const wasFollowing = isFollowing;
    const originalCount = subscriberCount;
    
    setIsFollowing(!wasFollowing);
    setSubscriberCount(prev => wasFollowing ? Math.max(0, prev - 1) : prev + 1);

    try {
      if (wasFollowing) {
        // Unfollow
        const existingFollows = await Follow.filter({
          follower_id: user.id,
          following_id: video.creator_id
        });
        if (existingFollows.length > 0) {
          await Follow.delete(existingFollows[0].id);
        }
      } else {
        // Follow
        await Follow.create({
          follower_id: user.id,
          following_id: video.creator_id
        });
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      // Revert on error
      setIsFollowing(wasFollowing);
      setSubscriberCount(originalCount);
      alert("Failed to update subscription. Please try again.");
    }
  };

  const formatSubscriberCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-xl animate-pulse">
        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-24"></div>
        </div>
        <div className="w-28 h-9 bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  if (!creator) return null;

  const isOwnVideo = user?.id === video?.creator_id;

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-gray-900/30 rounded-xl my-4">
      <div className="flex items-center gap-3">
        {/* Creator Avatar */}
        <Link to={createPageUrl(`Profile?userId=${creator.id}`)}>
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.full_name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {creator.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </Link>

        {/* Creator Info */}
        <div>
          <Link 
            to={createPageUrl(`Profile?userId=${creator.id}`)}
            className="text-white font-semibold hover:text-gray-300 transition-colors"
          >
            {creator.full_name}
          </Link>
          <p className="text-gray-400 text-sm">
            {formatSubscriberCount(subscriberCount)} subscribers
          </p>
        </div>
      </div>

      {/* Subscribe Button - Only show if not own video and user is logged in */}
      {!isOwnVideo && user && (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubscribe}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              isFollowing
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-white hover:bg-gray-100 text-black'
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Subscribed
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
          
          {isFollowing && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <Bell className="w-5 h-5" />
            </Button>
          )}
        </div>
      )}

      {/* Show login prompt if not logged in */}
      {!user && (
        <Button
          onClick={() => alert("Please log in to subscribe to creators.")}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Subscribe
        </Button>
      )}
    </div>
  );
}