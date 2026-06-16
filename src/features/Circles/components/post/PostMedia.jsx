import { useEffect, useRef, useState } from "react";
import { ImageOff, Volume2, VolumeX } from "lucide-react";

// Renders the first media item of a post. Images are lazy-loaded; videos
// behave like Instagram/Reels:
// - <video src> is only set once the card is near the viewport (lazy load,
//   avoids fetching every video on the page up front)
// - muted autoplay + loop only while scrolled into view, paused otherwise
// - tap to play/pause, mute toggle overlay
// - loading spinner until the first frame is ready, error fallback if the
//   media fails to load
export default function PostMedia({ media = [], image, alt, className }) {
  const item = media?.[0];
  const url = item?.url || image;
  const isVideo = item?.type === "video";

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9);
  const [imageAspectRatio, setImageAspectRatio] = useState(null);

  // Lazy-load: start fetching once the card is within ~200px of the viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  // Autoplay/pause based on actual visibility.
  useEffect(() => {
    if (!isVideo) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVideo]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    if (isInView) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isInView, isVideo]);

  if (!url) return null;

  if (isVideo) {
    // Cap portrait videos at 4:5 (Instagram max portrait ratio) so they don't
    // take over the entire screen; landscape videos show at their natural ratio.
    const clampedRatio = Math.max(videoAspectRatio, 4 / 5);

    return (
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-black rounded-xl mt-2"
        style={{ aspectRatio: clampedRatio }}
      >
        {shouldLoad && !hasError && (
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-contain"
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => {
              const { videoWidth, videoHeight } = e.target;
              if (videoWidth && videoHeight) {
                setVideoAspectRatio(videoWidth / videoHeight);
              }
            }}
            onLoadedData={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              if (v.paused) v.play().catch(() => {});
              else v.pause();
            }}
          />
        )}

        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
            <ImageOff className="w-6 h-6" />
            <span className="text-xs">Video unavailable</span>
          </div>
        )}

        {isLoaded && !hasError && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted((m) => !m);
            }}
            className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    );
  }

  // Cap portrait images at 4:5; use 1:1 as placeholder until dimensions load.
  const clampedImageRatio = imageAspectRatio !== null
    ? Math.max(imageAspectRatio, 4 / 5)
    : 1;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gray-100 rounded-xl mt-2"
      style={{ aspectRatio: clampedImageRatio }}
    >
      {shouldLoad && !hasError && (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-contain"
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.target;
            if (naturalWidth && naturalHeight) {
              setImageAspectRatio(naturalWidth / naturalHeight);
            }
            setIsLoaded(true);
          }}
          onError={() => setHasError(true)}
        />
      )}

      {!isLoaded && !hasError && <div className="absolute inset-0 animate-pulse bg-gray-200" />}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
          <ImageOff className="w-6 h-6" />
          <span className="text-xs">Image unavailable</span>
        </div>
      )}
    </div>
  );
}
