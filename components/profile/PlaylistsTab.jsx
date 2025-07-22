import React from "react";
import { Plus, PlayCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlaylistsTab({ user }) {
  // Placeholder for playlists - this would be populated from a Playlist entity
  const playlists = [];

  return (
    <div className="p-4 md:p-8">
      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="group cursor-pointer">
              <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden mb-3">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white/70" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-xs">
                  {playlist.video_count} videos
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
                  {playlist.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  {playlist.visibility === 'private' && <Lock className="w-3 h-3" />}
                  <span>{playlist.visibility === 'private' ? 'Private' : 'Public'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No playlists created</h3>
          <p className="text-gray-600 mb-6">
            Playlists help organize your content and make it easier for viewers to find related videos.
          </p>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Create playlist
          </Button>
        </div>
      )}
    </div>
  );
}