import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Mirrors PostCard's layout so the feed/posts list doesn't jump when real
// content swaps in.
export function PostCardSkeleton({ variant = "circle" }) {
  const isFeed = variant === "feed";

  return (
    <div
      className={
        isFeed
          ? "bg-white rounded-2xl shadow-sm border border-border-clr overflow-hidden"
          : "bg-gray-50 rounded-xl p-4"
      }
    >
      <div className={isFeed ? "p-4 pb-2" : "mb-3"}>
        <div className="flex items-center gap-3">
          <Skeleton circle width={isFeed ? 48 : 40} height={isFeed ? 48 : 40} />
          <div className="flex-1">
            <Skeleton width="40%" height={14} />
            <Skeleton width="60%" height={10} className="mt-1" />
          </div>
        </div>
      </div>

      <div className={isFeed ? "px-4 pb-2" : ""}>
        <Skeleton count={2} height={12} />
      </div>

      <div className={isFeed ? "px-4 pb-2" : "mb-3"}>
        <Skeleton height={180} borderRadius={12} />
      </div>

      <div className={isFeed ? "p-4 pt-2" : ""}>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton height={38} borderRadius={12} />
          <Skeleton height={38} borderRadius={12} />
          <Skeleton height={38} borderRadius={12} />
        </div>
      </div>
    </div>
  );
}

// Small circular item used for the "My Circles" horizontal list.
export function CircleChipSkeleton() {
  return (
    <div className="flex-shrink-0 w-24 text-center">
      <div className="rounded-2xl p-3 bg-gray-50">
        <Skeleton circle width={64} height={64} />
        <Skeleton width="80%" height={12} className="mt-2" />
        <Skeleton width="60%" height={10} className="mt-1" />
      </div>
    </div>
  );
}

// Mirrors CommentCard's layout for the comments bottom sheet.
export function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton circle width={40} height={40} />
      <div className="flex-1">
        <Skeleton height={50} borderRadius={16} />
        <Skeleton width="30%" height={10} className="mt-1.5" />
      </div>
    </div>
  );
}

// Cover image + about section skeleton for the Circle Details page header.
export function CircleHeaderSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-20">
      <Skeleton height={192} className="!rounded-none" />

      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex gap-3">
            <Skeleton height={40} borderRadius={12} containerClassName="flex-1" />
            <Skeleton height={40} borderRadius={12} containerClassName="flex-1" />
            <Skeleton width={48} height={48} borderRadius={12} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Skeleton width="30%" height={18} className="mb-2" />
          <Skeleton count={2} height={12} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4 p-4 space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function CircleAvatarSkeleton() {
  return (
    <div className="flex-shrink-0 w-20 text-center">
      <div className="rounded-2xl p-2.5">
        <Skeleton circle width={56} height={56} className="mx-auto" />
        <Skeleton width={48} height={10} className="mt-2" />
        <Skeleton width={36} height={8} className="mt-1" />
      </div>
    </div>
  );
}
