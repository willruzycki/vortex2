import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from "date-fns";

export default function VideoDetails({ video }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!video) return null;

    const formattedDate = video.created_date ? format(new Date(video.created_date), 'MMM d, yyyy') : 'Date unknown';
    const formattedViews = (video.views || 0).toLocaleString();

    return (
        <div className="my-4">
            <h1 className="text-2xl font-bold text-white mb-2">{video.title || 'Untitled Video'}</h1>
            <div 
                className={`bg-gray-900/50 p-4 rounded-xl cursor-pointer ${isExpanded ? 'max-h-full' : 'max-h-28 overflow-hidden'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 text-gray-400 text-sm mb-2">
                    <span>{formattedViews} views</span>
                    <span>•</span>
                    <span>{formattedDate}</span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">
                    {video.description || 'No description available.'}
                </p>
            </div>
        </div>
    );
}