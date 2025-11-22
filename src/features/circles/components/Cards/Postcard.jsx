export default function PostCard({ post, onLike, style }) {
  const hasMedia = Array.isArray(post.media) && post.media.length > 0;

  return (
    <article
      className="bg-white rounded-2xl p-4 shadow-md sm:shadow-lg border border-border-clr transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-xl"
      style={style}
    >
      {/* Header */}
      <header className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gradient-primary to-gradient-secondary flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
          {post.authorImage ? (
            <img
              src={post.authorImage}
              alt={post.authorName || "User"}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span>{post.authorName?.[0]?.toUpperCase() || "U"}</span>
          )}
        </div>

        {/* Author + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {post.authorName || "Unknown user"}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>{timeAgo(post.createdAt)}</span>
                {post.visibility && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="capitalize">{post.visibility}</span>
                  </>
                )}
              </div>
            </div>

            {/* Placeholder for more options */}
            <button
              type="button"
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 flex-shrink-0"
              aria-label="Post options"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      {post.body && (
        <p className="text-sm text-gray-800 leading-relaxed mb-3 whitespace-pre-line">
          {post.body}
        </p>
      )}

      {/* Media */}
      {hasMedia && (
        <div className="mb-3 rounded-2xl overflow-hidden border border-border-clr bg-gray-50">
          <div className="relative max-h-80">
            <img
              src={post.media[0]}
              alt="Post media"
              className="w-full h-full max-h-80 object-cover"
            />
            {post.media.length > 1 && (
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/60 text-[11px] text-white font-medium">
                +{post.media.length - 1} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={post.isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <span>{post.likeCount ?? 0} likes</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span>{post.commentCount ?? 0} comments</span>
        </div>
      </div>

      {/* Comment Previews */}
      {(post.previews || []).length > 0 && (
        <div className="mb-3 border-t border-border-clr pt-3">
          <div className="space-y-2">
            {post.previews.slice(0, 2).map((p) => (
              <div key={p.commentId} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold flex-shrink-0 overflow-hidden">
                  {p.authorProfileImage ? (
                    <img
                      src={p.authorProfileImage}
                      alt={p.authorName || "User"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{p.authorName?.[0]?.toUpperCase() ?? "U"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-gray-900 truncate">
                      {p.authorName || "Unknown"}
                    </span>
                    {p.isLiked && (
                      <svg
                        className="w-3 h-3 text-amber-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2">
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 pt-2 border-t border-border-clr mt-1">
        <button
          type="button"
          onClick={() => onLike?.(post.postId)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95 ${
            post.isLiked
              ? "bg-red-50 text-red-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={post.isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <span>Like</span>
        </button>

        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 active:scale-95 transition-all duration-150"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span>Comment</span>
        </button>

        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 active:scale-95 transition-all duration-150"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
          </svg>
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}

function timeAgo(value) {
  if (!value) return "";

  let ts = value;

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      ts = parsed;
    }
  }

  if (typeof ts !== "number") return "";

  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
