import React from "react";
import { Edit, Settings, Calendar, Sparkles, UserPlus, UserCheck, Bell, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function ChannelHeader({ 
  user, 
  currentUser,
  isFollowing,
  onFollowToggle,
  followers, 
  following, 
  totalViews,
  isOwnProfile
}) {
  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  return (
    <div className="bg-white shadow-sm">
      {/* Channel Banner - Placeholder for future implementation */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500"></div>
      
      {/* Channel Info */}
      <div className="px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Picture */}
          <div className="relative -mt-16 md:-mt-20">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            {user.is_verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Channel Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{user.full_name}</h1>
                <div className="flex items-center gap-4 text-gray-600 mt-2">
                  <span>@{user.username || user.email?.split('@')[0]}</span>
                  <span>•</span>
                  <span>{formatCount(followers)} subscribers</span>
                  <span>•</span>
                  <span>{formatCount(totalViews)} views</span>
                </div>
                {user.bio && (
                  <p className="text-gray-700 mt-2 max-w-2xl">{user.bio}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <Link to={createPageUrl("EditProfile")}>
                      <Button variant="outline" className="bg-gray-100 hover:bg-gray-200">
                        <Edit className="w-4 h-4 mr-2" />
                        Customize channel
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" className="bg-gray-100 hover:bg-gray-200">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </>
                ) : currentUser ? (
                  <>
                    <Button 
                      onClick={onFollowToggle}
                      className={`px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ${
                        isFollowing
                          ? 'bg-gray-200 hover:bg-gray-300 text-slate-800'
                          : 'bg-black hover:bg-gray-800 text-white'
                      }`}
                      size="lg"
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-5 h-5 mr-2" />
                          Subscribed
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Subscribe
                        </>
                      )}
                    </Button>
                    {isFollowing && (
                      <Button variant="outline" size="icon" className="bg-gray-100 hover:bg-gray-200">
                        <Bell className="w-5 h-5" />
                      </Button>
                    )}
                  </>
                ) : (
                  <Button 
                    onClick={() => alert("Please log in to subscribe to creators.")}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold"
                    size="lg"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Subscribe
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}