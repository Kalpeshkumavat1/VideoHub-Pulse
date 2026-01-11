import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import {
  BarChart3,
  Upload,
  Grid3x3,
  Play,
  TrendingUp,
  Clock,
  HardDrive,
} from "lucide-react";
import { useState, useEffect } from "react";
import { videoApi, authApi, Video } from "@shared/api";
import { useToast } from "@/hooks/use-toast";

interface StatCard {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<StatCard[]>([
    {
      label: "Total Videos",
      value: 0,
      trend: "",
      icon: <Play className="w-6 h-6" />,
      color: "from-primary to-primary/60",
    },
    {
      label: "Storage Used",
      value: "0GB",
      trend: "",
      icon: <HardDrive className="w-6 h-6" />,
      color: "from-secondary to-secondary/60",
    },
    {
      label: "Processing Queue",
      value: 0,
      trend: "",
      icon: <Clock className="w-6 h-6" />,
      color: "from-amber-500 to-amber-500/60",
    },
    {
      label: "Total Views",
      value: 0,
      trend: "",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-accent to-accent/60",
    },
  ]);

  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosResponse] = await Promise.all([
          videoApi.getVideos(),
        ]);

        if (videosResponse.success) {
          const videoList = videosResponse.videos || [];
          setVideos(videoList);

          // Calculate stats
          const totalVideos = videoList.length;
          const processingVideos = videoList.filter(v => v.status === 'processing' || v.status === 'analyzing' || v.status === 'uploading').length;
          const totalViews = videoList.reduce((sum, v) => sum + (v.views || 0), 0);
          
          // Calculate storage used (sum of all video file sizes)
          const totalStorageBytes = videoList.reduce((sum, v) => sum + (v.fileSize || 0), 0);
          const totalStorageMB = totalStorageBytes / (1024 * 1024);
          
          // Display in MB if less than 1024 MB, otherwise convert to GB
          const storageUsed = totalStorageMB >= 1024 
            ? `${(totalStorageMB / 1024).toFixed(2)} GB`
            : `${totalStorageMB.toFixed(2)} MB`;

          setStats([
            {
              label: "Total Videos",
              value: totalVideos,
              trend: totalVideos > 0 ? `${totalVideos} videos` : "No videos yet",
              icon: <Play className="w-6 h-6" />,
              color: "from-primary to-primary/60",
            },
            {
              label: "Storage Used",
              value: storageUsed,
              trend: totalVideos > 0 ? "Across all videos" : "No storage used",
              icon: <HardDrive className="w-6 h-6" />,
              color: "from-secondary to-secondary/60",
            },
            {
              label: "Processing Queue",
              value: processingVideos,
              trend: processingVideos > 0 ? "In progress" : "All done",
              icon: <Clock className="w-6 h-6" />,
              color: "from-amber-500 to-amber-500/60",
            },
            {
              label: "Total Views",
              value: totalViews.toLocaleString(),
              trend: totalViews > 0 ? "Keep it up!" : "No views yet",
              icon: <BarChart3 className="w-6 h-6" />,
              color: "from-accent to-accent/60",
            },
          ]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center flex-col gap-6">
        <Navigation />
        <div className="text-center">
          {/* Large Loading Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-32 h-32">
              <img
                src="/reshot-icon-video-tutorials-ZUNFC7L9TP.svg"
                alt="Loading..."
                className="w-full h-full animate-spin"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Loading your dashboard...</h2>
          <p className="text-foreground/60">Preparing your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <AnimatedBackground interactive={false} />
      <Navigation />

      <main className="flex-1 pt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Welcome back, <span className="text-primary">Creator</span>
            </h1>
            <p className="text-lg text-foreground/60">
              Manage your videos and track performance
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="glass-elevated p-6 rounded-xl hover-lift group relative overflow-hidden"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                    >
                      {stat.icon}
                    </div>
                    {stat.trend && (
                      <span className="text-xs text-accent font-semibold">
                        {stat.trend}
                      </span>
                    )}
                  </div>

                  <h3 className="text-foreground/70 text-sm font-medium mb-1">
                    {stat.label}
                  </h3>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="glass-elevated rounded-xl p-8 h-full">
                <h2 className="text-xl font-bold mb-6">Quick Actions</h2>

                <div className="space-y-4">
                  <Link to="/upload" className="block">
                    <Button
                      size="lg"
                      className="btn-primary w-full text-white justify-start group"
                    >
                      <Upload className="mr-2 w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                      Upload Video
                    </Button>
                  </Link>

                  <Link to="/library" className="block">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-muted/50 hover:border-primary/50 justify-start"
                    >
                      <Grid3x3 className="mr-2 w-5 h-5" />
                      View Library
                    </Button>
                  </Link>

                  {videos.length > 0 && (
                    <Link to={`/analytics?id=${videos[0]._id}`} className="block">
                      <button className="w-full p-3 rounded-lg glass hover:glass-accent transition-colors text-left flex items-center gap-2 text-foreground/70 hover:text-primary">
                        <BarChart3 className="w-5 h-5" />
                        View Analytics
                      </button>
                    </Link>
                  )}
                </div>

                {/* Storage Info */}
                <div className="mt-8 pt-8 border-t border-muted/50">
                  <p className="text-sm text-foreground/70 mb-3">
                    Storage Usage
                  </p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: "60%" }}
                    />
                  </div>
                  <p className="text-xs text-foreground/60">
                    2.4GB of 5GB used
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Videos */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Videos</h2>
                <Link to="/library" className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1">
                  View All
                  <span>→</span>
                </Link>
              </div>

              <div className="space-y-4">
                {videos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-foreground/60 mb-4">No videos yet</p>
                    <Link to="/upload">
                      <Button className="btn-primary">
                        <Upload className="mr-2 w-4 h-4" />
                        Upload Your First Video
                      </Button>
                    </Link>
                  </div>
                ) : (
                  videos.map((video) => (
                    <div
                      key={video._id}
                      className="glass-elevated p-4 rounded-lg hover-lift group flex gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
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
                            <Play className="w-6 h-6 text-foreground/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate mb-1">
                          {video.title}
                        </h3>
                        <p className="text-sm text-foreground/60 mb-2">
                          {formatDate(video.createdAt)} · {formatDuration(video.duration)}
                        </p>

                        <div className="flex items-center gap-3">
                          <span className={getStatusBadge(video.status)}>
                            {video.status === "processing" || video.status === "analyzing" || video.status === "uploading"
                              ? "Processing"
                              : video.status === "completed"
                              ? "Published"
                              : "Failed"}
                          </span>
                          {video.views > 0 && (
                            <span className="text-xs text-foreground/60">
                              {video.views.toLocaleString()} views
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link to={`/player?id=${video._id}`}>
                          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-foreground/60 hover:text-foreground">
                            <Play className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Analytics Preview */}
          <div className="glass-elevated rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Performance Overview</h2>
              {videos.length > 0 && (
                <Link to={`/analytics?id=${videos[0]._id}`}>
                  <button className="text-primary hover:text-primary/80 text-sm font-semibold">
                    View Detailed Analytics →
                  </button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">42.5K</p>
                <p className="text-foreground/60">Total Views This Month</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-secondary mb-2">
                  3.2K
                </p>
                <p className="text-foreground/60">
                  Average Watch Time (min)
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-accent mb-2">94%</p>
                <p className="text-foreground/60">Audience Retention Rate</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
