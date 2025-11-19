export default function MobilePostCard({ post, onLike, style }) {
  return (
    <article 
      className="bg-white rounded-2xl p-4 shadow-lg fade-in border border-border-clr"
      style={style}
    >
      {/* Header */}
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gradient-primary to-gradient-secondary flex items-center justify-center text-white font-semibold text-sm">
          {post.author?.name?.[0] || "U"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-sm font-semibold text-gray-900 truncate">{post.author?.name}</div>
            {post.author?.role && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium hidden sm:inline">
                {post.author.role}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">{timeAgo(post.createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.body}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          {post.likeCount}
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {post.commentCount}
        </div>
      </div>

      {/* Comment Previews */}
      {(post.previews || []).length > 0 && (
        <div className="mb-3 border-t border-border-clr pt-3">
          <div className="space-y-2">
            {post.previews.slice(0,2).map(p => (
              <div key={p.commentId} className="flex gap-2">
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold flex-shrink-0">
                  {p.authorName[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-semibold text-gray-900">{p.authorName}</span>
                    {p.isLiked && (
                      <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-700">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 pt-3 border-t border-border-clr">
        <button 
          onClick={() => onLike(post.postId)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium ${
            post.isLiked 
              ? "bg-red-50 text-red-600" 
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          Like
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          Share
        </button>
      </div>
    </article>
  );
}

function timeAgo(epoch) {
  if (!epoch) return "";
  const diff = Date.now() - epoch;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}