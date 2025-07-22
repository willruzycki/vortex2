import React from "react";
import { Play, Eye, Clock } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function HomeTab({ user, videos, totalViews }) {
  const featuredVideo = videos[0]; // Show most recent video as featured
  const recentVideos = videos.slice(1, 7); // Show next 6 videos

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || '0';
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Channel Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm text-center">
          <div className="text-2xl font-bold text-slate-900">{videos.length}</div>
          <div className="text-gray-600 text-sm">Videos</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm text-center">
          <div className="text-2xl font-bold text-slate-900">{formatViews(totalViews)}</div>
          <div className="text-gray-600 text-sm">Views</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm text-center">
          <div className="text-2xl font-bold text-slate-900">{format(new Date(user.created_date), 'yyyy')}</div>
          <div className="text-gray-600 text-sm">Joined</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm text-center">
          <div className="text-2xl font-bold text-slate-900">{user.is_verified ? 'Verified' : 'Creator'}</div>
          <div className="text-gray-600 text-sm">Status</div>
        </div>
      </div>

      {/* Featured Video */}
      {featuredVideo && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Featured</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <Link to={createPageUrl(`VideoPlayer?v=${featuredVideo.id}`)}>
                  <div className="relative aspect-video bg-black group">
                    {featuredVideo.thumbnail_url ? (
                      <img 
                        src={featuredVideo.thumbnail_url} 
                        alt={featuredVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Play className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="md:w-1/2 p-6">
                <Link to={createPageUrl(`VideoPlayer?v=${featuredVideo.id}`)}>
                  <h3 className="text-xl font-bold text-slate-900 hover:text-red-600 transition-colors mb-2">
                    {featuredVideo.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatViews(featuredVideo.views)} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(featuredVideo.created_date), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-gray-700 line-clamp-3">
                  {featuredVideo.description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Videos */}
      {recentVideos.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVideos.map((video) => (
              <Link key={video.id} to={createPageUrl(`VideoPlayer?v=${video.id}`)}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
                  <div className="relative aspect-video bg-black">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <span>{formatViews(video.views)} views</span>
                      <span>•</span>
                      <span>{format(new Date(video.created_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No content yet</h3>
          <p className="text-gray-600">This channel hasn't uploaded any videos.</p>
        </div>
      )}
    </div>
  );
}