import { useCallback, useEffect, useRef } from "react";
import { useMarkFeedSeen } from "./usePosts";

const FLUSH_INTERVAL = 60 * 1000;
const BATCH_SIZE = 10;

export function useSeenTracker() {
  const { mutate: markFeedSeen } = useMarkFeedSeen();
  const sentRef = useRef(new Set());
  const pendingRef = useRef(new Set());

  const flush = useCallback(() => {
    if (pendingRef.current.size === 0) return;

    const postIds = Array.from(pendingRef.current);
    pendingRef.current.clear();

    markFeedSeen(postIds, {
      onError: () => {
        postIds.forEach((id) => pendingRef.current.add(id));
      },
    });
  }, [markFeedSeen]);

  const markSeen = useCallback(
    (postId, { immediate = false } = {}) => {
      if (!postId || sentRef.current.has(postId) || pendingRef.current.has(postId)) return;

      sentRef.current.add(postId);
      pendingRef.current.add(postId);

      if (immediate || pendingRef.current.size >= BATCH_SIZE) {
        flush();
      }
    },
    [flush]
  );

  useEffect(() => {
    const interval = setInterval(flush, FLUSH_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", flush);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  return markSeen;
}
