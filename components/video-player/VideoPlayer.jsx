import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings,
  Loader
} from "lucide-react";

const VideoPlayer = forwardRef(({ src, poster, autoPlay = true, muted = true, onTimeUpdate, onEnded, onPlay, onPause }, ref) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    getCurrentTime: () => videoRef.current?.currentTime || 0,
    getDuration: () => videoRef.current?.duration || 0,
    seekTo: (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    }
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
      
      // Auto play if enabled
      if (autoPlay) {
        video.play().catch(error => {
          console.warn("Autoplay failed:", error);
          setIsPlaying(false);
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlay) onPlay();
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (onPause) onPause();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    const handleError = (e) => {
      console.error("Video error:", e);
      setHasError(true);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    // Add event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [src, autoPlay, onTimeUpdate, onPlay, onPause, onEnded]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error("Play failed:", error);
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;
    video.currentTime = time;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen failed:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        muted={muted}
        playsInline
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-lg">Unable to load video</p>
            <p className="text-sm text-gray-400">Please try refreshing the page</p>
          </div>
        </div>
      )}

      {/* Click to Play/Pause */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
      >
        {!isPlaying && !isLoading && !hasError && (
          <div className="w-20 h-20 bg-black/70 rounded-full flex items-center justify-center">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-4">
          <div 
            className="w-full h-1 bg-white/30 rounded cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-red-500 rounded transition-all duration-150"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-red-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <button onClick={toggleMute} className="hover:text-red-400 transition-colors">
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>

            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hover:text-red-400 transition-colors">
              <Settings className="w-6 h-6" />
            </button>
            
            <button onClick={toggleFullscreen} className="hover:text-red-400 transition-colors">
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;