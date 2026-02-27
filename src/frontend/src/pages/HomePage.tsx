import { Film, Loader2, VideoOff } from "lucide-react";
import { VideoCard } from "../components/VideoCard";
import { useGetAllVideos } from "../hooks/useQueries";

export function HomePage() {
  const { data: videos, isLoading, isError } = useGetAllVideos();

  return (
    <main className="container mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-10 animate-fade-up opacity-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-0.5 w-8 bg-primary" />
          <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
            Latest Videos
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-foreground">
          ALL <span className="text-primary">VIDEOS</span>
        </h1>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => `skeleton-${i}`).map((key) => (
            <div key={key} className="animate-pulse space-y-3">
              <div className="aspect-video rounded-lg bg-card border border-border" />
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up opacity-0">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border border-destructive/30">
            <Film className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-display text-2xl text-foreground mb-2">
            Failed to Load Videos
          </h2>
          <p className="font-body text-muted-foreground">
            Something went wrong. Please refresh the page.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && videos?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up opacity-0">
          <div className="mb-6 relative">
            <div className="h-20 w-20 rounded-full bg-muted/50 border border-border flex items-center justify-center">
              <VideoOff className="h-9 w-9 text-muted-foreground" />
            </div>
            <div className="absolute -inset-2 rounded-full border border-border/30 animate-pulse" />
          </div>
          <h2 className="font-display text-3xl text-foreground mb-2">
            No Videos Yet
          </h2>
          <p className="font-body text-muted-foreground max-w-sm">
            No videos have been uploaded yet. Check back later for new content.
          </p>
        </div>
      )}

      {/* Video grid */}
      {!isLoading && !isError && videos && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video, i) => (
            <VideoCard
              key={Array.from(video.id).join(",")}
              video={video}
              animationDelay={i * 80}
            />
          ))}
        </div>
      )}
    </main>
  );
}
