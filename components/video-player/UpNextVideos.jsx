import React, { useState, useEffect } from 'react';
import { Video } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function UpNextVideos({ currentVideo }) {
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [autoplay, setAutoplay] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!currentVideo) return;
            setIsLoading(true);
            try {
                // Fetch videos with same category, excluding the current one
                const videos = await Video.filter(
                    { category: currentVideo.category }, 
                    "-views", // sort by most viewed
                    15
                );
                setRelatedVideos(videos.filter(v => v.id !== currentVideo.id).slice(0, 10));
            } catch (error) {
                console.error("Failed to fetch related videos:", error);
            }
            setIsLoading(false);
        };
        fetchRelated();
    }, [currentVideo]);

    const VideoItem = ({ video }) => (
        <Link to={createPageUrl(`VideoPlayer?v=${video.id}`)} className="flex gap-3 group">
            <div className="w-40 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0">
                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-400 transition-colors">{video.title}</h3>
                <p className="text-xs text-gray-400">{video.creator_full_name || video.created_by.split('@')[0]}</p>
                <p className="text-xs text-gray-400">{(video.views || 0).toLocaleString()} views</p>
            </div>
        </Link>
    );

    return (
        <div className="bg-gray-900/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Up Next</h2>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="autoplay-switch" className="text-white">Autoplay</Label>
                    <Switch id="autoplay-switch" checked={autoplay} onCheckedChange={setAutoplay} />
                </div>
            </div>
            <div className="space-y-4">
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-40 h-24 bg-gray-700 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded"></div>
                                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    relatedVideos.map(video => <VideoItem key={video.id} video={video} />)
                )}
            </div>
        </div>
    );
}