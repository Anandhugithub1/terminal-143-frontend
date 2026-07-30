import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";

// Renders circle post media. If multiple images exist, show a simple local
// carousel that matches existing circle post card behavior. If the first media
// item is a video, video rendering remains unchanged.
export default function PostMedia({ media = [], image, alt, className }) {
  const { t } = useTranslation("circles");
  const imageUrls = useMemo(() => {
    const urls = (media || [])
      .filter((item) => item?.url && item?.type !== "video")
      .map((item) => item.url);

    if (urls.length === 0 && image) {
      return [image];
    }

    return urls;
  }, [media, image]);

  const firstItem = media?.[0];
  const isVideo = firstItem?.type === "video";
  const shouldUseCarousel = imageUrls.length > 1 && !isVideo;
  const [activeIdx, setActiveIdx] = useState(0);
  const url = isVideo ? firstItem?.url : imageUrls[activeIdx] || image;

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9);
  const [imageAspectRatio, setImageAspectRatio] = useState(null);
  // The carousel's box is locked to the FIRST photo's ratio (Instagram/Reddit
  // behavior) — later photos are object-cover cropped into that same box
  // rather than resizing it, so the container never reflows the feed as you
  // swipe between slides.
  const [carouselAspectRatio, setCarouselAspectRatio] = useState(null);

  const nextPhoto = () => {
    setHasError(false);
    setActiveIdx((idx) => (idx + 1) % imageUrls.length);
  };

  const prevPhoto = () => {
    setHasError(false);
    setActiveIdx((idx) => (idx - 1 + imageUrls.length) % imageUrls.length);
  };

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

  const handleRetry = () => {
    setHasError(false);
    setIsLoaded(false);
    setRetryKey((k) => k + 1);
  };

  useEffect(() => {
    if (activeIdx >= imageUrls.length) {
      setActiveIdx(0);
    }
  }, [activeIdx, imageUrls.length]);

  if (!url) return null;

  if (shouldUseCarousel) {
    const clampedCarouselRatio = carouselAspectRatio !== null
      ? Math.max(carouselAspectRatio, 4 / 5)
      : 4 / 5;

    return (
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-gray-100"
        style={{ aspectRatio: clampedCarouselRatio }}
      >
        {shouldLoad && (
          <img
            key={activeIdx}
            src={url}
            alt={`${alt} photo ${activeIdx + 1}`}
            loading="lazy"
            className="w-full h-full object-cover"
            onLoad={(e) => {
              if (activeIdx !== 0) return;
              const { naturalWidth, naturalHeight } = e.target;
              if (naturalWidth && naturalHeight) {
                setCarouselAspectRatio(naturalWidth / naturalHeight);
              }
            }}
            onError={() => setHasError(true)}
          />
        )}

        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 pointer-events-none">
          <button
            type="button"
            onClick={prevPhoto}
            className="pointer-events-auto rounded-full bg-white/80 p-2 shadow-sm text-gray-700 hover:bg-white transition"
            aria-label={t("postMedia.previousPhoto")}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={nextPhoto}
            className="pointer-events-auto rounded-full bg-white/80 p-2 shadow-sm text-gray-700 hover:bg-white transition"
            aria-label={t("postMedia.nextPhoto")}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {imageUrls.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full ${idx === activeIdx ? "w-5 bg-white" : "w-2 bg-white/60"}`}
            />
          ))}
        </div>

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageOff className="w-6 h-6" />
            <span className="text-xs">{t("postMedia.imageUnavailable")}</span>
          </div>
        )}
      </div>
    );
  }

  if (isVideo) {
    // Landscape videos (>1) get a portrait 4:5 container — video centered, blur fills gaps (Instagram style).
    // Portrait/square videos keep their natural ratio.
    const clampedRatio = videoAspectRatio > 1 ? 4 / 5 : videoAspectRatio;

    return (
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-gray-950 isolate"
        style={{ aspectRatio: clampedRatio }}
      >
        {shouldLoad && !hasError && (
          <>
            {/* Blurred backdrop — same src, browser reuses the same request */}
            <video
              key={`backdrop-${retryKey}`}
              src={url}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              style={{ filter: 'blur(24px)', transform: 'scale(1.15)' }}
              muted
              autoPlay
              loop
              playsInline
              aria-hidden="true"
              tabIndex={-1}
            />
            {/* Main video */}
            <video
              key={`main-${retryKey}`}
              ref={videoRef}
              src={url}
              className="relative w-full h-full object-contain"
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
          </>
        )}

        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
            <ImageOff className="w-6 h-6" />
            <span className="text-xs">{t("postMedia.videoUnavailable")}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRetry(); }}
              className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              {t("postMedia.retry")}
            </button>
          </div>
        )}

        {isLoaded && !hasError && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted((m) => !m);
            }}
            className="absolute bottom-2 right-2 z-20 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            aria-label={isMuted ? t("postMedia.unmuteVideo") : t("postMedia.muteVideo")}
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
      className="relative w-full overflow-hidden bg-gray-100"
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
          <span className="text-xs">{t("postMedia.imageUnavailable")}</span>
        </div>
      )}
    </div>
  );
}
