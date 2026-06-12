import { Heart, MessageCircle, Share2 } from "lucide-react";

export function buildPostActions({ post, isLiked, onToggleLike, onComment, onShare }) {
  return [
    {
      key: "like",
      icon: Heart,
      label: (post.likes ?? 0) + (isLiked ? 1 : 0),
      onClick: onToggleLike,
      iconClassName: `w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`,
      className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-500 transition-colors",
    },
    {
      key: "comment",
      icon: MessageCircle,
      label: post.commentCount ?? 0,
      onClick: onComment,
      iconClassName: "w-4 h-4",
      className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors",
    },
    {
      key: "share",
      icon: Share2,
      label: "Share",
      onClick: onShare,
      iconClassName: "w-4 h-4",
      className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-500 transition-colors ml-auto",
    },
  ];
}
