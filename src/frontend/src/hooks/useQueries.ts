import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Video } from "../backend.d";

// ─── Video Queries ───────────────────────────────────────────────────────────

export function useGetAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVideo(videoId: Uint8Array | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Video | null>({
    queryKey: ["video", videoId ? Array.from(videoId).join(",") : null],
    queryFn: async () => {
      if (!actor || !videoId) return null;
      return actor.getVideo(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

// ─── Admin / Auth Queries ────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: Uint8Array) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
