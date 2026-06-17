import { Heart, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";

export default function CommentCard({
  avatar = DEFAULT_AVATAR,
  name = "Anonymous",
  text,
  time,
  likes = 0,
  onLike,
  onReply,
  onDelete,
  onAuthorClick,
  isReply = false,
  replySlot,
  replies = [],
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`flex gap-3 ${isReply ? "ml-4 mt-2" : ""}`}>
      <img
        src={avatar}
        alt={name}
        loading="lazy"
        decoding="async"
        onClick={onAuthorClick}
        className={`${isReply ? "w-8 h-8" : "w-10 h-10"} rounded-full object-cover flex-shrink-0 ${onAuthorClick ? "cursor-pointer active:opacity-60 transition-opacity" : ""}`}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-1">
            <h4
              onClick={onAuthorClick}
              className={`font-semibold text-gray-800 text-sm ${onAuthorClick ? "cursor-pointer active:opacity-60 transition-opacity" : ""}`}
            >{name}</h4>
            {onDelete && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <MoreVertical className={isReply ? "w-3.5 h-3.5 text-gray-400" : "w-4 h-4 text-gray-400"} />
              </button>
            )}
            {onDelete && confirmDelete && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(); setConfirmDelete(false); }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full"
                >
                  Cancel
                </button>
              </div>
            )}
            {!onDelete && (
              <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <MoreVertical className={isReply ? "w-3.5 h-3.5 text-gray-400" : "w-4 h-4 text-gray-400"} />
              </button>
            )}
          </div>
          <p className="text-gray-600 text-sm">{text}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 px-2">
          {time && <span className="text-xs text-gray-400">{time}</span>}
          <button
            onClick={onLike}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Heart className="w-3.5 h-3.5" />
            {likes}
          </button>
          {!isReply && onReply && (
            <button
              onClick={onReply}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-semibold"
            >
              Reply
            </button>
          )}
        </div>

        {replySlot}

        {replies.map((reply) => (
          <CommentCard
            key={reply.commentId || reply.id}
            isReply
            avatar={reply.avatar}
            name={reply.name}
            text={reply.text}
            time={reply.time}
            likes={reply.likes}
            onAuthorClick={reply.onAuthorClick}
            onDelete={reply.onDelete}
          />
        ))}
      </div>
    </div>
  );
}
