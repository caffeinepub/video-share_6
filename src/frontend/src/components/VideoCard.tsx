import { Link } from "@tanstack/react-router";
import { Play, Trash2, Calendar } from "lucide-react";
import type { Video } from "../backend.d";
import { encodeVideoId, formatDate } from "../utils/videoId";
import { useIsCallerAdmin, useDeleteVideo } from "../hooks/useQueries";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VideoCardProps {
  video: Video;
  animationDelay?: number;
}

export function VideoCard({ video, animationDelay = 0 }: VideoCardProps) {
  const { data: isAdmin } = useIsCallerAdmin();
  const deleteVideo = useDeleteVideo();
  const encodedId = encodeVideoId(video.id);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${video.title}"?`)) return;
    try {
      await deleteVideo.mutateAsync(video.id);
      toast.success("Video deleted successfully");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  return (
    <article
      className="animate-fade-up opacity-0 group"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <Link to="/video/$id" params={{ id: encodedId }} className="block">
        {/* Thumbnail area */}
        <div className="scanline-overlay relative aspect-video overflow-hidden rounded-lg bg-card border border-border transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-glow-sm">
          {/* Video preview thumbnail using the stream URL */}
          <video
            src={video.externalBlob.getDirectURL()}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            preload="metadata"
            onLoadedMetadata={(e) => {
              // Seek to 1 second for thumbnail frame
              (e.target as HTMLVideoElement).currentTime = 1;
            }}
          />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-glow transition-transform duration-200 group-hover:scale-110">
              <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground ml-0.5" />
            </div>
          </div>

          {/* Delete button (admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteVideo.isPending}
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-background/70 backdrop-blur-sm border border-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-destructive/80 hover:border-destructive"
              title="Delete video"
            >
              <Trash2 className="h-3.5 w-3.5 text-foreground" />
            </button>
          )}

          {/* Duration badge placeholder */}
          <div className="absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-xs font-body font-medium bg-background/70 backdrop-blur-sm text-foreground/80">
            HD
          </div>
        </div>

        {/* Card info */}
        <div className="mt-3 space-y-1 px-0.5">
          <h3 className="font-display text-lg leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {video.title}
          </h3>
          {video.description && (
            <p className="font-body text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
            <Calendar className="h-3 w-3" />
            <span className="font-body">{formatDate(video.uploadedAt)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
