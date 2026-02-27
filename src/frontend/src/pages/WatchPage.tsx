import { useParams, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Calendar, Loader2, AlertCircle, Play } from "lucide-react";
import { useGetVideo } from "../hooks/useQueries";
import { decodeVideoId, formatDate } from "../utils/videoId";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

export function WatchPage() {
  const { id } = useParams({ from: "/video/$id" });
  const videoId = decodeVideoId(id);
  const { data: video, isLoading, isError } = useGetVideo(videoId);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = async () => {
    if (!video) return;
    setIsDownloading(true);
    try {
      const url = video.externalBlob.getDirectURL();
      const a = document.createElement("a");
      a.href = url;
      a.download = `${video.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      // Fallback: open in new tab
      window.open(video.externalBlob.getDirectURL(), "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-up opacity-0">
          <div className="h-8 w-32 rounded bg-muted animate-pulse" />
          <div className="aspect-video rounded-xl bg-card border border-border animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (isError || !video) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto text-center py-20 animate-fade-up opacity-0">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border border-destructive/30 mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-display text-3xl text-foreground mb-3">
            Video Not Found
          </h2>
          <p className="font-body text-muted-foreground mb-8">
            This video may have been removed or the link is invalid.
          </p>
          <Link to="/">
            <Button variant="outline" className="gap-2 border-border hover:border-primary/60">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const videoUrl = video.externalBlob.getDirectURL();

  return (
    <main className="container mx-auto px-4 py-8 animate-fade-up opacity-0">
      <div className="max-w-5xl mx-auto">
        {/* Back nav */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 duration-200" />
          Back to All Videos
        </Link>

        {/* Video player */}
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black border border-border shadow-glow group">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-full"
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <track kind="captions" />
          </video>

          {/* Custom play overlay (shown before first play) */}
          {!isPlaying && (
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity duration-300 w-full border-0"
              onClick={handlePlayToggle}
              onKeyDown={(e) => e.key === "Enter" && handlePlayToggle()}
              aria-label="Play video"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-glow transition-all duration-200 hover:scale-110">
                <Play className="h-9 w-9 fill-primary-foreground text-primary-foreground ml-1" />
              </div>
            </button>
          )}
        </div>

        {/* Video info */}
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:shrink-0">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 shrink-0 bg-primary" />
              <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                Now Playing
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
              {video.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-body">{formatDate(video.uploadedAt)}</span>
            </div>
            {video.description && (
              <p className="font-body text-foreground/70 leading-relaxed pt-2 max-w-2xl">
                {video.description}
              </p>
            )}
          </div>

          {/* Download button */}
          <div className="shrink-0">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow-sm"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? "Preparing..." : "Download"}
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-border" />
      </div>
    </main>
  );
}
