import React, { useState } from "react";
import { format } from "date-fns";

export default function VideoDescription({ video }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="bg-gray-100 p-4 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex gap-4 font-semibold mb-2">
        <span>{video.views?.toLocaleString() || 0} views</span>
        <span>{format(new Date(video.created_date), "MMM d, yyyy")}</span>
      </div>
      <p className={`text-sm ${!isExpanded && "line-clamp-2"}`}>
        {video.description}
      </p>
      {video.tags && (
        <div className="flex flex-wrap gap-2 mt-2">
          {video.tags.map((tag, i) => (
            <span key={i} className="text-blue-600 text-sm">#{tag}</span>
          ))}
        </div>
      )}
      <button className="font-semibold text-sm mt-2">
        {isExpanded ? "Show less" : "...more"}
      </button>
    </div>
  );
}