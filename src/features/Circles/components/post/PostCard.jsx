import { useState } from "react";
import { ChevronRight, Flag, MoreVertical, Share2 } from "lucide-react";
import PostMedia from "./PostMedia";
import BottomSheetModal from "../common/BottomSheetModal";

// Shared post card used by the Circles feed (match-style posts) and the
// circle details "Posts" tab (community posts). The two layouts differ
// enough that a `variant` flag controls spacing/typography, while the
// header, body, image, tags and action row are composed from props.
export default function PostCard({
  variant = "circle", // "feed" | "circle"
  avatar,
  name,
  statusDot = false,
  badge,
  meta,
  onShare,
  onReport,
  heading,
  onHeadingClick,
  onAuthorClick,
  body,
  image,
  media = [],
  tags = [],
  actions = [],
  actionsWrapperClassName = "",
}) {
  const isFeed = variant === "feed";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className={
        isFeed
          ? "bg-white rounded-2xl shadow-sm border border-border-clr overflow-hidden hover:shadow-md transition-shadow"
          : "bg-gray-50 rounded-xl p-4"
      }
    >
      {/* Header */}
      <div className={isFeed ? "p-3 pb-2 sm:p-4 sm:pb-2" : "mb-3"}>
        <div className="flex items-start justify-between gap-2">
          <div
            className={`flex items-center gap-2.5 min-w-0 ${onAuthorClick ? "active:opacity-60 transition-opacity cursor-pointer" : ""}`}
            onClick={onAuthorClick}
          >
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt={name}
                loading="lazy"
                decoding="async"
                className={
                  isFeed
                    ? "w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
                    : "w-10 h-10 rounded-full object-cover"
                }
              />
              {statusDot && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={
                    isFeed
                      ? "text-base sm:text-lg font-bold text-text-sec truncate"
                      : "font-semibold text-gray-800 text-sm truncate"
                  }
                >
                  {name}
                </h3>
                {badge}
              </div>
              {meta}
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1 -mr-1 shrink-0 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className={isFeed ? "w-5 h-5 text-gray-500" : "w-4 h-4 text-gray-400"} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={isFeed ? "px-3 pb-2 sm:px-4" : ""}>
        {heading && (
          onHeadingClick ? (
            <button
              onClick={onHeadingClick}
              className="inline-flex items-center gap-0.5 text-base sm:text-lg font-bold text-text-sec mb-1 active:opacity-60 transition-opacity"
            >
              {heading}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ) : (
            <h4 className="text-base sm:text-lg font-bold text-text-sec mb-1">{heading}</h4>
          )
        )}

        {body && (
          <p
            className={
              isFeed
                ? "text-gray-600 text-sm leading-relaxed"
                : "text-gray-700 text-sm mb-3"
            }
          >
            {body}
          </p>
        )}

        {tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${isFeed ? "mt-3" : "mb-3"}`}>
            {tags.map((tag) => (
              <span
                key={tag}
                className={
                  isFeed
                    ? "px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                    : "px-3 py-1 bg-white text-primary rounded-full text-xs font-medium"
                }
              >
                {isFeed ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {(media?.[0]?.url || image) && (
        <div className={isFeed ? "px-3 pb-2 sm:px-4" : "mb-3"}>
          <PostMedia
            media={media}
            image={image}
            alt={heading || name}
            className={
              isFeed
                ? "w-full h-56 sm:h-72 md:h-96 object-cover rounded-xl mt-2"
                : "w-full h-56 sm:h-72 md:h-96 object-cover rounded-lg"
            }
          />
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className={isFeed ? "px-3 py-2.5 sm:p-4 sm:pt-2 border-t border-border-clr mt-2" : ""}>
          <div className={actionsWrapperClassName}>
            {actions.map(({ key, icon: Icon, label, onClick, className, iconClassName }) => (
              <button key={key} onClick={onClick} className={className}>
                <Icon className={iconClassName} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* More Menu */}
      <BottomSheetModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        panelClassName="rounded-t-2xl sm:rounded-2xl sm:max-w-sm overflow-hidden"
      >
        <button
          onClick={() => {
            setIsMenuOpen(false);
            onShare?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-5 h-5 text-gray-500" />
          Share
        </button>
        <button
          onClick={() => {
            setIsMenuOpen(false);
            onReport?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-rose-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
        >
          <Flag className="w-5 h-5" />
          Report Post
        </button>
      </BottomSheetModal>
    </div>
  );
}
