import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { videoApi, Video, userApi, UserRole } from "@shared/api";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, ArrowLeft, BarChart3, Edit, Trash2 } from "lucide-react";

export default function Player() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoId = searchParams.get("id");
  
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<{ status: string; progress: number } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      setError("No video ID provided");
      setIsLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        const response = await videoApi.getVideo(videoId);
        if (response.success) {
          setVideo(response.video);
          
          // If video is completed, load the video stream
          if (response.video.status === 'completed') {
            loadVideoStream();
          }
          
          // If video is processing, start polling for status
          if (response.video.status === 'processing' || response.video.status === 'pending') {
            pollProcessingStatus();
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load video";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const loadVideoStream = () => {
      // Use token in query parameter for HTML5 video element
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const url = `${baseUrl}/videos/${videoId}/stream?quality=720&token=${token}`;
      setVideoSrc(url);
    };

    const fetchUserInfo = async () => {
      try {
        const response = await userApi.getProfile();
        if (response.success && response.user) {
          setUserRole(response.user.role);
          setCurrentUserId(response.user.id);
        }
      } catch (error) {
        // User might not be logged in
        setUserRole(null);
        setCurrentUserId(null);
      }
    };

    fetchUserInfo();
    fetchVideo();
  }, [videoId, toast]);

  const pollProcessingStatus = async () => {
    if (!videoId) return;
    
    const interval = setInterval(async () => {
      try {
        const statusResponse = await videoApi.getProcessingStatus(videoId);
        if (statusResponse.success) {
          setProcessingStatus({
            status: statusResponse.status,
            progress: statusResponse.progress || 0,
          });

          // If completed, refresh video data and load stream
          if (statusResponse.status === 'completed') {
            clearInterval(interval);
            const response = await videoApi.getVideo(videoId);
            if (response.success) {
              setVideo(response.video);
              loadVideoStream();
            }
          }
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && videoRef.current) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <img
              src="/reshot-icon-video-tutorials-ZUNFC7L9TP.svg"
              alt="Loading..."
              className="w-12 h-12 mx-auto mb-4 animate-spin"
            />
            <p className="text-foreground/60">Loading video...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4">Video Not Found</h1>
            <p className="text-foreground/60 mb-6">{error || "The video you're looking for doesn't exist."}</p>
            <Link to="/library">
              <Button className="btn-primary">Back to Library</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isProcessing = video.status === 'processing' || video.status === 'pending';
  const isCompleted = video.status === 'completed';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <AnimatedBackground interactive={false} />
      <Navigation />

      <main className="flex-1 pt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button and Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/library" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </Link>
            <div className="flex items-center gap-3">
              {videoId && (
                <Link to={`/analytics?id=${videoId}`}>
                  <Button variant="outline" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                </Link>
              )}
              {/* Show Edit/Delete buttons for editors and admins (they can edit/delete videos in their organization) */}
              {video && (
                <>
                  {(userRole === 'admin' || userRole === 'editor') && (
                    <>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          // TODO: Implement edit modal or navigate to edit page
                          toast({
                            title: "Edit Video",
                            description: "Edit functionality coming soon",
                          });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
                        onClick={async () => {
                          if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
                            return;
                          }
                          try {
                            if (videoId) {
                              await videoApi.deleteVideo(videoId);
                              toast({
                                title: "Success",
                                description: "Video deleted successfully",
                              });
                              navigate("/library");
                            }
                          } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : "Failed to delete video";
                            toast({
                              title: "Error",
                              description: errorMessage,
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Video Player Container */}
          <div className="glass-elevated rounded-xl overflow-hidden mb-8">
            <div className="relative aspect-video bg-black group" onMouseMove={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
              {isProcessing ? (
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <img
                    src="/reshot-icon-video-tutorials-ZUNFC7L9TP.svg"
                    alt="Processing..."
                    className="w-16 h-16 mx-auto mb-4 animate-spin"
                  />
                  <p className="text-white text-lg font-semibold mb-2">
                    Processing Video...
                  </p>
                  {processingStatus && (
                    <div className="w-64">
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${processingStatus.progress}%` }}
                        />
                      </div>
                      <p className="text-white/80 text-sm text-center">
                        {processingStatus.progress}% complete
                      </p>
                    </div>
                  )}
                </div>
              ) : isCompleted ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    crossOrigin="anonymous"
                  />

                  {/* Video Controls */}
                  {showControls && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`,
                          }}
                        />
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePlayPause}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white" />
                          )}
                        </button>

                        <button
                          onClick={toggleMute}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5 text-white" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                          )}
                        </button>

                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />

                        <div className="flex-1 text-white text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        <select
                          value={playbackRate}
                          onChange={(e) => {
                            const rate = parseFloat(e.target.value);
                            setPlaybackRate(rate);
                            if (videoRef.current) {
                              videoRef.current.playbackRate = rate;
                            }
                          }}
                          className="bg-white/20 text-white text-sm px-2 py-1 rounded border-none outline-none"
                        >
                          <option value="0.5">0.5x</option>
                          <option value="0.75">0.75x</option>
                          <option value="1">1x</option>
                          <option value="1.25">1.25x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2x</option>
                        </select>

                        <button
                          onClick={toggleFullscreen}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {isFullscreen ? (
                            <Minimize className="w-5 h-5 text-white" />
                          ) : (
                            <Maximize className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white text-lg font-semibold mb-2">
                      Video {video.status === 'failed' ? 'Failed to Process' : 'Not Ready'}
                    </p>
                    <p className="text-white/60 text-sm">
                      {video.status === 'failed' 
                        ? 'There was an error processing this video.'
                        : 'This video is not available for playback.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
              
              {video.description && (
                <div className="glass-elevated rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-foreground/70 whitespace-pre-wrap">{video.description}</p>
                </div>
              )}

              <div className="glass-elevated rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-foreground/60 mb-1">Views</p>
                    <p className="font-semibold">{video.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60 mb-1">Duration</p>
                    <p className="font-semibold">
                      {video.duration ? formatTime(video.duration) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/60 mb-1">Status</p>
                    <p className="font-semibold capitalize">{video.status}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60 mb-1">Uploaded</p>
                    <p className="font-semibold">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="glass-elevated rounded-lg p-6">
                <h3 className="font-semibold mb-4">Video Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-foreground/60">File Size</p>
                    <p className="font-medium">
                      {video.fileSize
                        ? `${(video.fileSize / (1024 * 1024)).toFixed(2)} MB`
                        : "N/A"}
                    </p>
                  </div>
                  {video.metadata && (
                    <>
                      <div>
                        <p className="text-foreground/60">Resolution</p>
                        <p className="font-medium">
                          {video.metadata.width}x{video.metadata.height}
                        </p>
                      </div>
                      <div>
                        <p className="text-foreground/60">Codec</p>
                        <p className="font-medium uppercase">{video.metadata.codec}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
