import { Heart, MessageCircle, X } from "lucide-react";

const NEUTRAL_BUTTON_CLASS =
  "flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors";

export function buildPostActions({
  isLiked,
  onToggleLike,
  onComment,
  onPass,
  includeMatchActions = true,
  isMatching = false,
  matchLabel = "Match",
  matchingLabel = "Matching…",
}) {
  const commentAction = {
    key: "comment",
    icon: MessageCircle,
    label: "Comment",
    onClick: onComment,
    iconClassName: "w-4 h-4",
    className: NEUTRAL_BUTTON_CLASS,
  };

  if (!includeMatchActions) {
    return [commentAction];
  }

  return [
    {
      key: "pass",
      icon: X,
      label: "Pass",
      onClick: onPass,
      iconClassName: "w-4 h-4",
      className: NEUTRAL_BUTTON_CLASS,
    },
    commentAction,
    {
      key: "match",
      icon: Heart,
      label: isMatching ? matchingLabel : matchLabel,
      onClick: onToggleLike,
      disabled: isMatching,
      iconClassName: `w-4 h-4 group-hover:fill-white transition-colors ${isMatching ? "animate-pulse" : ""} ${isLiked ? "fill-rose-500 text-rose-500" : ""}`,
      className:
        `group flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm transition-all ${isMatching ? "opacity-70" : "hover:shadow-lg hover:scale-105"}`,
    },
  ];
}
