import React from "react";
import { Edit, Settings, Calendar, Sparkles, UserPlus, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function ProfileHeader({ 
  user, 
  currentUser,
  isFollowing,
  onFollowToggle,
  followers, 
  following, 
  totalViews, 
  totalLikes 
}) {
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-4xl font-bold text-white">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          {user.is_creator && (
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-slate-50">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{user.full_name}</h1>
              <p className="text-gray-500">@{user.username || user.email?.split('@')[0]}</p>
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Link to={createPageUrl("EditProfile")}>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Settings")}>
                    <Button variant="outline" size="icon">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <Button 
                  onClick={onFollowToggle}
                  className={`transition-all duration-300 w-36 ${
                    isFollowing
                      ? 'bg-gray-200 hover:bg-gray-300 text-slate-800'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
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
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center md:justify-start gap-6 text-sm mb-4">
            <div className="text-center">
              <span className="text-slate-900 font-bold">{followers.toLocaleString()}</span>{' '}
              <span className="text-gray-600">Followers</span>
            </div>
            <div className="text-center">
              <span className="text-slate-900 font-bold">{following.toLocaleString()}</span>{' '}
              <span className="text-gray-600">Following</span>
            </div>
            <div className="text-center">
              <span className="text-slate-900 font-bold">{totalLikes.toLocaleString()}</span>{' '}
              <span className="text-gray-600">Likes</span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
          )}
          
          {/* Join Date */}
          <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Joined {format(new Date(user.created_date), 'MMMM yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}