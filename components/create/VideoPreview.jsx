
import React, { useState } from "react";
import { Video } from "@/api/entities";
import { motion } from "framer-motion";
import { Play, Edit, Save, X, Sparkles, Hash, Type, FileText, LayoutGrid, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function VideoPreview({ video, user, onSave, onCancel }) {
  const [editedVideo, setEditedVideo] = useState({
    ...video,
    category: "video",
    visibility: "public" // Default to public
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Add creator info to the video object before saving
      const finalVideoData = {
        ...editedVideo,
        creator_id: user.id,
        creator_username: user.username,
        creator_full_name: user.full_name,
        creator_avatar_url: user.avatar_url
      };

      await Video.create(finalVideoData);
      onSave();
    } catch (error) {
      console.error("Error saving video:", error);
    }

    setIsSaving(false);
  };

  const handleTagAdd = (tag) => {
    if (tag && !editedVideo.tags.includes(tag)) {
      setEditedVideo(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setEditedVideo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Edit className="w-7 h-7 md:w-8 md:h-8 text-red-500" />
          Finalize Your Upload
        </h3>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Video Preview */}
        <div className="lg:col-span-2">
            <h4 className="font-semibold text-lg text-slate-800 mb-4">Preview</h4>
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-lg">
              {video.video_url ? (
                <video
                  src={video.video_url}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <Play className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-3 bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Type className="w-4 h-4" /> Title
              </Label>
              <input
                type="text"
                placeholder="e.g. My Awesome AI-Generated Film"
                value={editedVideo.title}
                onChange={(e) => setEditedVideo(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <FileText className="w-4 h-4" /> Description
              </Label>
              <textarea
                placeholder="Tell viewers about your video"
                value={editedVideo.description}
                onChange={(e) => setEditedVideo(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-28 bg-white border border-slate-300 rounded-lg p-3 text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>

            {/* Category and Visibility */}
            <div className="grid md:grid-cols-2 gap-5">
                <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <LayoutGrid className="w-4 h-4" /> Category
                    </Label>
                    <select
                      value={editedVideo.category}
                      onChange={(e) => setEditedVideo(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition appearance-none bg-no-repeat bg-right pr-8"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                    >
                      <option value="video">Video</option>
                      <option value="shorts">Shorts</option>
                      <option value="series">Series</option>
                    </select>
                </div>
                <div>
                    <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <Eye className="w-4 h-4" /> Visibility
                    </Label>
                    <select
                      value={editedVideo.visibility}
                      onChange={(e) => setEditedVideo(prev => ({ ...prev, visibility: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition appearance-none bg-no-repeat bg-right pr-8"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                </div>
            </div>

            {/* AI Toggle */}
             <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-3 h-full">
                <Label htmlFor="ai-toggle-preview" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  AI-Generated
                </Label>
                <Switch
                  id="ai-toggle-preview"
                  checked={editedVideo.is_ai_generated}
                  onCheckedChange={(checked) => setEditedVideo(prev => ({...prev, is_ai_generated: checked}))}
                  className="data-[state=checked]:bg-purple-500"
                />
            </div>

            {/* Tags */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Hash className="w-4 h-4" /> Tags (Optional)
              </Label>
              <div className="bg-white border border-slate-300 rounded-lg p-2 flex flex-wrap gap-2 mb-2 min-h-[46px]">
                  {editedVideo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        handleTagAdd(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                    className="flex-grow bg-transparent p-1 text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
              </div>
              <p className="text-xs text-slate-500">Press Enter to add a tag. Tags help with discovery.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors font-medium"
        >
          Cancel
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Publish Video
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
