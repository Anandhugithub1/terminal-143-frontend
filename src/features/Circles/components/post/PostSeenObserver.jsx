import { useEffect, useRef } from "react";

const VISIBILITY_THRESHOLD = 0.6;
const DWELL_TIME = 2000;

export default function PostSeenObserver({ postId, onSeen, children }) {
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const seenRef = useRef(false);
  const onSeenRef = useRef(onSeen);
  onSeenRef.current = onSeen;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || seenRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
              seenRef.current = true;
              onSeenRef.current(postId);
              observer.disconnect();
            }, DWELL_TIME);
          }
        } else if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      },
      { threshold: VISIBILITY_THRESHOLD }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [postId]);

  return <div ref={containerRef}>{children}</div>;
}
