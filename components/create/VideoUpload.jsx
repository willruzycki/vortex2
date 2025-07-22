import React, { useState, useRef } from "react";
import { UploadFile } from "@/api/integrations";
import { Upload, FileVideo, Camera, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function VideoUpload({ 
  user, 
  onVideoUploaded, 
  uploadProgress, 
  setUploadProgress, 
  isProcessing, 
  setIsProcessing 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(true);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      handleVideoUpload(videoFile);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      handleVideoUpload(file);
    }
  };

  const handleVideoUpload = async (file) => {
    if (!user) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const { file_url } = await UploadFile({ file });
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create video preview data
      const videoData = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        video_url: file_url,
        creator_id: user.id,
        duration: 0,
        category: "shorts",
        is_ai_generated: isAiGenerated,
        tags: [],
        views: 0,
        likes: 0,
        shares: 0
      };

      onVideoUploaded(videoData);
    } catch (error) {
      console.error("Upload failed:", error);
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 bg-white shadow-lg ${
          dragActive
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-red-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.avi,.mkv,.webm,.flv,.wmv,.m4v,.3gp,.ogv,.f4v,.asf,.m2v,.mpg,.mpeg,.mts,.m2ts,.vob,.rm,.rmvb,.ts"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <FileVideo className="w-10 h-10 text-white" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Drop your video here
            </h3>
            <p className="text-gray-600 mb-6">
              or click to browse from your device
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Switch
              id="ai-generated-toggle"
              checked={isAiGenerated}
              onCheckedChange={setIsAiGenerated}
              className="data-[state=checked]:bg-purple-500"
            />
            <Label htmlFor="ai-generated-toggle" className="text-slate-900 flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-purple-500" />
              This video is AI-Generated
            </Label>
          </div>

          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <Upload className="w-5 h-5" />
              Choose Video
            </motion.button>
          </div>

          <div className="flex justify-center gap-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-500">
              <FileVideo className="w-5 h-5" />
              <span className="text-sm">All Video Formats</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Camera className="w-5 h-5" />
              <span className="text-sm">Up to 10GB</span>
            </div>
          </div>
          
          {/* Supported Formats */}
          <div className="bg-slate-50 rounded-xl p-4 mt-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Supported Formats:</h4>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-xs text-gray-600">
              <span className="bg-white px-2 py-1 rounded">MP4</span>
              <span className="bg-white px-2 py-1 rounded">MOV</span>
              <span className="bg-white px-2 py-1 rounded">AVI</span>
              <span className="bg-white px-2 py-1 rounded">MKV</span>
              <span className="bg-white px-2 py-1 rounded">WEBM</span>
              <span className="bg-white px-2 py-1 rounded">FLV</span>
              <span className="bg-white px-2 py-1 rounded">WMV</span>
              <span className="bg-white px-2 py-1 rounded">M4V</span>
              <span className="bg-white px-2 py-1 rounded">3GP</span>
              <span className="bg-white px-2 py-1 rounded">OGV</span>
              <span className="bg-white px-2 py-1 rounded">F4V</span>
              <span className="bg-white px-2 py-1 rounded">ASF</span>
              <span className="bg-white px-2 py-1 rounded">MPG</span>
              <span className="bg-white px-2 py-1 rounded">MPEG</span>
              <span className="bg-white px-2 py-1 rounded">MTS</span>
              <span className="bg-white px-2 py-1 rounded">TS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-900 font-medium">Uploading video...</span>
            <span className="text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Processing your video for optimal playback...
          </div>
        </motion.div>
      )}
    </div>
  );
}