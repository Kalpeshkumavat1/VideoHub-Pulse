import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { Play, Search, Filter, Grid, List } from "lucide-react";
import { videoApi, Video, userApi, UserRole } from "@shared/api";
import { useToast } from "@/hooks/use-toast";

export default function Library() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await userApi.getProfile();
        if (response.success && response.user) {
          setUserRole(response.user.role);
        }
      } catch (error) {
        // User might not be logged in
        setUserRole(null);
      }
    };

    const fetchVideos = async () => {
      try {
        const response = await videoApi.getVideos();
        if (response.success) {
          setVideos(response.videos || []);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load videos";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
    fetchVideos();
  }, [toast]);

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const baseClass = "text-xs font-semibold px-3 py-1 rounded-full";
    switch (status) {
      case "completed":
        return `${baseClass} badge-success`;
      case "processing":
      case "pending":
        return `${baseClass} badge-processing`;
      case "failed":
        return `${baseClass} badge-error`;
      default:
        return `${baseClass} badge-info`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
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
              className="w-16 h-16 mx-auto mb-4 animate-spin"
            />
            <p className="text-foreground/60">Loading videos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <AnimatedBackground interactive={false} />
      <Navigation />

      <main className="flex-1 pt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Video Library</h1>
                <p className="text-foreground/60">
                  {videos.length} {videos.length === 1 ? "video" : "videos"} total
                </p>
              </div>
              {(userRole === 'editor' || userRole === 'admin') && (
                <Link to="/upload">
                  <Button className="btn-primary">
                    Upload Video
                  </Button>
                </Link>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg glass input-premium"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "glass hover:glass-accent"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "glass hover:glass-accent"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Videos */}
          {filteredVideos.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No videos found" : "No videos yet"}
              </h3>
              <p className="text-foreground/60 mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Upload your first video to get started"}
              </p>
              {!searchQuery && (userRole === 'editor' || userRole === 'admin') && (
                <Link to="/upload">
                  <Button className="btn-primary">Upload Video</Button>
                </Link>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <Link
                  key={video._id}
                  to={`/player?id=${video._id}`}
                  className="glass-elevated rounded-xl overflow-hidden hover-lift group"
                >
                  <div className="relative aspect-video bg-muted/30">
                    {video.thumbnail ? (
                      <img
                        src={videoApi.getThumbnailUrl(video._id)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://cdn.builder.io/api/v1/image/assets%2Fa894e354474f44e78db635f9fe66e719%2F1cfa44281da34b1aa9d65415c1380407?format=webp&width=200";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-12 h-12 text-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate mb-1">{video.title}</h3>
                    <p className="text-sm text-foreground/60 mb-2">
                      {formatDate(video.createdAt)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={getStatusBadge(video.status)}>
                        {video.status === "processing" || video.status === "pending"
                          ? "Processing"
                          : video.status === "completed"
                          ? "Published"
                          : "Failed"}
                      </span>
                      {video.views > 0 && (
                        <span className="text-xs text-foreground/60">
                          {video.views} views
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVideos.map((video) => (
                <Link
                  key={video._id}
                  to={`/player?id=${video._id}`}
                  className="glass-elevated p-4 rounded-lg hover-lift group flex gap-4"
                >
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    {video.thumbnail ? (
                      <img
                        src={videoApi.getThumbnailUrl(video._id)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://cdn.builder.io/api/v1/image/assets%2Fa894e354474f44e78db635f9fe66e719%2F1cfa44281da34b1aa9d65415c1380407?format=webp&width=200";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Play className="w-8 h-8 text-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate mb-1">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-foreground/60 mb-2 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-foreground/60">
                      <span>{formatDate(video.createdAt)}</span>
                      {video.duration && <span>{formatDuration(video.duration)}</span>}
                      {video.views > 0 && <span>{video.views} views</span>}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={getStatusBadge(video.status)}>
                      {video.status === "processing" || video.status === "pending"
                        ? "Processing"
                        : video.status === "completed"
                        ? "Published"
                        : "Failed"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
