
import React, { useState } from "react";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  Film, 
  Upload
} from "lucide-react";

import VideoUpload from "../components/create/VideoUpload";
import VideoPreview from "../components/create/VideoPreview";
import { useSidebar } from "@/components/SidebarContext";

export default function Create() {
  const [user, setUser] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const { isDesktopSidebarOpen } = useSidebar();

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not authenticated");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 md:pt-8 md:pb-8">
      <div className={`mx-auto px-4 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-4xl' : 'max-w-full md:px-12'}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
              <Film className="w-6 h-6 text-white"/>
            </div>
            <h1 className="text-4xl font-bold text-slate-900">
              Upload Your Masterpiece
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            This is the home for AI-generated content. Share your art with the world.
          </p>
        </div>
        
        {/* Content */}
        <div className="space-y-8">
          {!previewVideo && (
            <VideoUpload
              user={user}
              onVideoUploaded={setPreviewVideo}
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          )}

          {previewVideo && (
            <VideoPreview
              video={previewVideo}
              user={user}
              onSave={() => {
                setPreviewVideo(null);
                setUploadProgress(0);
              }}
              onCancel={() => {
                setPreviewVideo(null);
                setUploadProgress(0);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
