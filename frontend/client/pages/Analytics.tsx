import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { videoApi, Video } from "@shared/api";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Clock, 
  Users, 
  Calendar,
  Play,
  Download,
  Share2,
  ArrowLeft
} from "lucide-react";

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const videoId = searchParams.get("id");
  
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

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

    fetchVideo();
  }, [videoId, toast]);

  // Mock analytics data (in production, this would come from the backend)
  const analyticsData = {
    views: {
      total: video?.views || 0,
      change: 12.5,
      data: [
        { date: "2024-01-01", views: 120 },
        { date: "2024-01-02", views: 145 },
        { date: "2024-01-03", views: 132 },
        { date: "2024-01-04", views: 167 },
        { date: "2024-01-05", views: 189 },
        { date: "2024-01-06", views: 201 },
        { date: "2024-01-07", views: 234 },
      ],
    },
    watchTime: {
      total: video?.duration ? (video.duration * (video.views || 0)) : 0,
      average: video?.duration ? video.duration * 0.85 : 0,
      change: 8.3,
    },
    engagement: {
      retention: 94.2,
      completion: 78.5,
      dropOff: [
        { time: "0%", viewers: 100 },
        { time: "25%", viewers: 92 },
        { time: "50%", viewers: 85 },
        { time: "75%", viewers: 78 },
        { time: "100%", viewers: 78 },
      ],
    },
    demographics: {
      countries: [
        { country: "United States", views: 45, percentage: 45 },
        { country: "United Kingdom", views: 20, percentage: 20 },
        { country: "Canada", views: 15, percentage: 15 },
        { country: "Australia", views: 12, percentage: 12 },
        { country: "Other", views: 8, percentage: 8 },
      ],
      devices: [
        { device: "Desktop", views: 55, percentage: 55 },
        { device: "Mobile", views: 35, percentage: 35 },
        { device: "Tablet", views: 10, percentage: 10 },
      ],
    },
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
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
            <p className="text-foreground/60">Loading analytics...</p>
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <AnimatedBackground interactive={false} />
      <Navigation />

      <main className="flex-1 pt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to={`/player?id=${videoId}`} 
              className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Video</span>
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Video Analytics</h1>
                <p className="text-foreground/60 text-lg">{video.title}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="input-premium"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-elevated p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-accent font-semibold">
                  +{analyticsData.views.change}%
                </span>
              </div>
              <h3 className="text-foreground/70 text-sm font-medium mb-1">Total Views</h3>
              <p className="text-3xl font-bold">{formatNumber(analyticsData.views.total)}</p>
            </div>

            <div className="glass-elevated p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm text-accent font-semibold">
                  +{analyticsData.watchTime.change}%
                </span>
              </div>
              <h3 className="text-foreground/70 text-sm font-medium mb-1">Watch Time</h3>
              <p className="text-3xl font-bold">{formatDuration(analyticsData.watchTime.total)}</p>
            </div>

            <div className="glass-elevated p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm text-foreground/60">Avg</span>
              </div>
              <h3 className="text-foreground/70 text-sm font-medium mb-1">Avg. Watch Time</h3>
              <p className="text-3xl font-bold">{formatDuration(analyticsData.watchTime.average)}</p>
            </div>

            <div className="glass-elevated p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-sm text-foreground/60">Rate</span>
              </div>
              <h3 className="text-foreground/70 text-sm font-medium mb-1">Retention Rate</h3>
              <p className="text-3xl font-bold">{analyticsData.engagement.retention}%</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Views Over Time */}
            <div className="glass-elevated rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Views Over Time</h2>
              <div className="space-y-4">
                {analyticsData.views.data.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-foreground/60">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-6 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                          style={{ 
                            width: `${(item.views / Math.max(...analyticsData.views.data.map(d => d.views))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right font-semibold">{item.views}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Retention */}
            <div className="glass-elevated rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Audience Retention</h2>
              <div className="space-y-4">
                {analyticsData.engagement.dropOff.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-foreground/60">{item.time}</div>
                    <div className="flex-1">
                      <div className="w-full h-6 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all"
                          style={{ width: `${item.viewers}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right font-semibold">{item.viewers}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Countries */}
            <div className="glass-elevated rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Top Countries</h2>
              <div className="space-y-4">
                {analyticsData.demographics.countries.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">{item.country}</div>
                    <div className="flex-1">
                      <div className="w-full h-4 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-semibold">{item.percentage}%</span>
                      <span className="text-sm text-foreground/60 ml-2">({item.views})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices */}
            <div className="glass-elevated rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Devices</h2>
              <div className="space-y-4">
                {analyticsData.demographics.devices.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{item.device}</div>
                    <div className="flex-1">
                      <div className="w-full h-4 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-semibold">{item.percentage}%</span>
                      <span className="text-sm text-foreground/60 ml-2">({item.views})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Details */}
          <div className="glass-elevated rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Video Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Status</p>
                <p className="font-semibold capitalize">{video.status}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Duration</p>
                <p className="font-semibold">
                  {video.duration ? formatDuration(video.duration) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Uploaded</p>
                <p className="font-semibold">
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">File Size</p>
                <p className="font-semibold">
                  {video.fileSize
                    ? `${(video.fileSize / (1024 * 1024)).toFixed(2)} MB`
                    : "N/A"}
                </p>
              </div>
              {video.metadata && (
                <>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Resolution</p>
                    <p className="font-semibold">
                      {video.metadata.width}x{video.metadata.height}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Codec</p>
                    <p className="font-semibold uppercase">{video.metadata.codec}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">FPS</p>
                    <p className="font-semibold">{video.metadata.fps?.toFixed(2) || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Bitrate</p>
                    <p className="font-semibold">
                      {video.metadata.bitrate
                        ? `${(parseInt(video.metadata.bitrate) / 1000).toFixed(0)} kbps`
                        : "N/A"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
