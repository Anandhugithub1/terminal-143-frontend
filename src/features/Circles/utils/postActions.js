import { RxCross1 } from "react-icons/rx";
import { FaCommentDots, FaHeart } from "react-icons/fa";

const OUTLINED_BUTTON_CLASS =
  "flex items-center justify-center gap-1.5 py-2 rounded-full bg-white border border-gray-200 text-gray-800 font-bold text-sm hover:bg-gray-50 transition-colors";

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
    icon: FaCommentDots,
    label: "Comment",
    onClick: onComment,
    iconClassName: "w-4 h-4 text-gray-800",
    className: OUTLINED_BUTTON_CLASS,
  };

  if (!includeMatchActions) {
    return [commentAction];
  }

  return [
    {
      key: "pass",
      icon: RxCross1,
      label: "Pass",
      onClick: onPass,
      iconClassName: "w-2.5 h-2.5 text-white",
      iconWrapClassName: "bg-rose-500",
      className: OUTLINED_BUTTON_CLASS,
    },
    commentAction,
    {
      key: "match",
      icon: FaHeart,
      label: isMatching ? matchingLabel : matchLabel,
      onClick: onToggleLike,
      disabled: isMatching,
      iconClassName: `w-4 h-4 text-white ${isMatching ? "animate-pulse" : ""}`,
      className:
        `flex items-center justify-center gap-1.5 py-2 rounded-full bg-primary text-white font-bold text-sm transition-all ${isMatching ? "opacity-70" : "hover:shadow-lg hover:scale-105"}`,
    },
  ];
}
