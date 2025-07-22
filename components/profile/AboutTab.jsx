import React from "react";
import { Calendar, MapPin, Link as LinkIcon, Eye, Video, Users } from "lucide-react";
import { format } from "date-fns";

export default function AboutTab({ user, totalViews, totalVideos, joinDate }) {
  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toLocaleString() || '0';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {user.bio ? (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {user.bio}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  This channel hasn't added a description yet.
                </p>
              )}
            </div>
          </div>

          {/* Channel Details */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Channel details</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-slate-900">Joined</div>
                  <div className="text-gray-600">{format(new Date(joinDate), 'MMMM d, yyyy')}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-slate-900">Total views</div>
                  <div className="text-gray-600">{formatCount(totalViews)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-slate-900">Videos uploaded</div>
                  <div className="text-gray-600">{totalVideos}</div>
                </div>
              </div>

              {user.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-slate-900">Location</div>
                    <div className="text-gray-600">{user.location}</div>
                  </div>
                </div>
              )}

              {user.website && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-slate-900">Website</div>
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Channel Stats */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">{formatCount(totalViews)}</div>
              <div className="text-gray-600">Total views</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">{totalVideos}</div>
              <div className="text-gray-600">Videos</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {format(new Date(joinDate), 'yyyy')}
              </div>
              <div className="text-gray-600">Member since</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}