import React, { useState, useEffect } from "react";
import { User, Follow, Subscription, UserReaction, VideoInteraction, Video } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Plus, Check, Bell, Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { format } from "date-fns";

export default function VideoInfo({ video, user, onVideoUpdate }) {
  const [creator, setCreator] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userReaction, setUserReaction] = useState(null);
  const [likesCount, setLikesCount] = useState(video.likes || 0);
  const [dislikesCount, setDislikesCount] = useState(video.dislikes || 0);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingReaction, setIsLoadingReaction] = useState(false);

  useEffect(() => {
    loadCreatorInfo();
    if (user) {
      loadUserReaction();
    }
  }, [video, user]);

  const loadCreatorInfo = async () => {
    setIsLoading(true);
    try {
      let creatorData;
      if (video.creator_id && video.creator_id !== 'fallback') {
        const results = await User.filter({ id: video.creator_id }, '', 1);
        creatorData = results.length > 0 ? results[0] : null;
      }
      
      if (!creatorData) {
        creatorData = {
          id: 'fallback',
          username: video.creator_username || 'unknown',
          full_name: video.creator_full_name || 'Unknown Creator',
          avatar_url: video.creator_avatar_url || null,
        };
      }
      setCreator(creatorData);
      
      if (creatorData.id !== 'fallback' && user) {
        const subscriptions = await Subscription.filter({ channel_id: creatorData.id });
        setSubscriberCount(subscriptions.length);
        setIsSubscribed(subscriptions.some(sub => sub.subscriber_id === user.id));
      }
    } catch (error) {
      console.error("Error loading creator info:", error);
    }
    setIsLoading(false);
  };

  const loadUserReaction = async () => {
    try {
      const reactions = await UserReaction.filter({ video_id: video.id, user_id: user.id });
      if (reactions.length > 0) {
        setUserReaction(reactions[0].reaction);
      }
    } catch (error) {
      console.error("Error loading user reaction:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !creator || creator.id === 'fallback') return;
    
    try {
      if (isSubscribed) {
        const sub = await Subscription.filter({ subscriber_id: user.id, channel_id: creator.id });
        if (sub.length > 0) await Subscription.delete(sub[0].id);
        setSubscriberCount(p => p - 1);
      } else {
        await Subscription.create({ subscriber_id: user.id, channel_id: creator.id, tier: "free" });
        setSubscriberCount(p => p + 1);
      }
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error("Error handling subscription:", error);
    }
  };

  const handleReaction = async (reactionType) => {
    if (!user) return;
    setIsLoadingReaction(true);

    const existingReaction = await UserReaction.filter({ video_id: video.id, user_id: user.id });
    
    if (existingReaction.length > 0) { // Has a reaction
      if (existingReaction[0].reaction === reactionType) { // Un-reacting
        await UserReaction.delete(existingReaction[0].id);
        setUserReaction(null);
        if (reactionType === 'like') setLikesCount(p => p - 1);
        if (reactionType === 'dislike') setDislikesCount(p => p - 1);
      } else { // Changing reaction
        await UserReaction.update(existingReaction[0].id, { reaction: reactionType });
        setUserReaction(reactionType);
        if (reactionType === 'like') {
          setLikesCount(p => p + 1);
          setDislikesCount(p => p - 1);
        } else {
          setLikesCount(p => p - 1);
          setDislikesCount(p => p + 1);
        }
      }
    } else { // No reaction, creating a new one
      await UserReaction.create({ video_id: video.id, user_id: user.id, reaction: reactionType });
      setUserReaction(reactionType);
      if (reactionType === 'like') setLikesCount(p => p + 1);
      if (reactionType === 'dislike') setDislikesCount(p => p + 1);
    }
    
    // Update the video entity
    const updatedVideo = await Video.filter({id: video.id});
    if(updatedVideo.length > 0){
        await Video.update(video.id, {
            likes: reactionType === 'like' && userReaction !== 'like' ? updatedVideo[0].likes + 1 : userReaction === 'like' ? updatedVideo[0].likes -1 : updatedVideo[0].likes,
            dislikes: reactionType === 'dislike' && userReaction !== 'dislike' ? updatedVideo[0].dislikes + 1 : userReaction === 'dislike' ? updatedVideo[0].dislikes -1 : updatedVideo[0].dislikes
        });
    }

    setIsLoadingReaction(false);
  };
  
  const formatSubscriberCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  };

  const formatViewCount = (views) => {
    if (!views || views === 0) return "No views";
    if (views === 1) return "1 view";
    return `${views.toLocaleString()} views`;
  };

  if (isLoading || !creator) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/10 rounded-lg w-3/4"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-white/10 rounded-lg w-1/4 mb-2"></div>
            <div className="h-4 bg-white/10 rounded-lg w-1/3"></div>
          </div>
          <div className="h-10 bg-white/10 rounded-lg w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold leading-tight">{video.title}</h1>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link to={createPageUrl(`UserProfile?username=${creator.username}`)} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                <img src={creator.avatar_url || `https://ui-avatars.com/api/?name=${creator.full_name}&background=random`} alt={creator.full_name} className="w-full h-full object-cover"/>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{creator.full_name}</h3>
              <p className="text-gray-400 text-sm">{formatSubscriberCount(subscriberCount)} subscribers</p>
            </div>
          </Link>
          {user && user.id !== creator.id && (
            <Button onClick={handleSubscribe} className={`px-4 py-2 rounded-full font-medium transition-colors ${isSubscribed ? 'bg-gray-700' : 'bg-white text-black'}`}>
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleReaction('like')} disabled={isLoadingReaction} className={`rounded-full px-4 py-2 ${userReaction === 'like' ? 'bg-blue-600' : 'bg-gray-800'}`}>
            <ThumbsUp className="w-4 h-4 mr-2" /> {likesCount}
          </Button>
          <Button onClick={() => handleReaction('dislike')} disabled={isLoadingReaction} className={`rounded-full px-4 py-2 ${userReaction === 'dislike' ? 'bg-red-600' : 'bg-gray-800'}`}>
            <ThumbsDown className="w-4 h-4 mr-2" /> {dislikesCount}
          </Button>
          <Button onClick={() => { navigator.clipboard.writeText(window.location.href); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);}} className="bg-gray-800 rounded-full px-4 py-2">
            <Share2 className="w-4 h-4 mr-2" /> {isCopied ? 'Copied!' : 'Share'}
          </Button>
        </div>
      </div>
      <div className="bg-gray-800/50 p-4 rounded-xl text-sm">
        <div className="flex items-center gap-4 mb-2">
          <span className="font-semibold">{formatViewCount(video.views)}</span>
          <span className="font-semibold">{format(new Date(video.created_date), 'MMM d, yyyy')}</span>
        </div>
        <p className={`whitespace-pre-wrap ${!showFullDescription && 'line-clamp-2'}`}>{video.description}</p>
        <button onClick={() => setShowFullDescription(!showFullDescription)} className="text-white font-semibold mt-2">
          {showFullDescription ? "Show less" : "Show more"}
        </button>
      </div>
    </div>
  );
}