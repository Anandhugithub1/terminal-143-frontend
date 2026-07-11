import { useState } from "react";
import { ChevronRight, Flag, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import PostMedia from "./PostMedia";
import BottomSheetModal from "../common/BottomSheetModal";

export default function PostCard({
  variant = "circle",
  avatar,
  name,
  statusDot = false,
  badge,
  meta,
  onShare,
  onReport,
  onEdit,
  onDelete,
  isAuthor = false,
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
  const { t } = useTranslation("circles");
  const isFeed = variant === "feed";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasMedia = !!(media?.[0]?.url || image);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
        <div
          className={`flex items-center gap-3 min-w-0 ${onAuthorClick ? "cursor-pointer active:opacity-60 transition-opacity" : ""}`}
          onClick={onAuthorClick}
        >
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt={name}
              loading="lazy"
              decoding="async"
              className="w-10 h-10 rounded-full object-cover"
            />
            {statusDot && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {heading && (
                onHeadingClick ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onHeadingClick(); }}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full active:opacity-60 transition-opacity"
                  >
                    {heading}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {heading}
                  </span>
                )
              )}
              {badge}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight mt-0.5">
              {name}
            </h3>
            <div className="mt-0.5">{meta}</div>
          </div>
        </div>

        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-1.5 -mr-1 shrink-0 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Body */}
      {(body || tags.length > 0) && (
        <div className={`px-4 space-y-2.5 ${hasMedia ? 'pb-2' : 'pb-3'}`}>
          {body && (
            <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media — edge-to-edge */}
      {hasMedia && (
        <PostMedia
          media={media}
          image={image}
          alt={heading || name}
        />
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className={`border-t border-gray-100 px-4 py-2.5 ${hasMedia ? 'mt-0' : ''}`}>
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
        {isAuthor && (
          <button
            onClick={() => { setIsMenuOpen(false); onEdit?.(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-5 h-5 text-gray-500" />
            {t("postCard.editPost")}
          </button>
        )}
        <button
          onClick={() => { setIsMenuOpen(false); onShare?.(); }}
          className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${isAuthor ? "border-t border-gray-100" : ""}`}
        >
          <Share2 className="w-5 h-5 text-gray-500" />
          {t("postCard.share")}
        </button>
        {isAuthor && (
          <button
            onClick={() => { setIsMenuOpen(false); onDelete?.(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-rose-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <Trash2 className="w-5 h-5" />
            {t("postCard.deletePost")}
          </button>
        )}
        {!isAuthor && (
          <button
            onClick={() => { setIsMenuOpen(false); onReport?.(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-rose-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <Flag className="w-5 h-5" />
            {t("postCard.reportPost")}
          </button>
        )}
      </BottomSheetModal>
    </div>
  );
}
