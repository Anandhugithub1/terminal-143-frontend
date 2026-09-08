import { Clock, MapPin, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPostTime } from "../../utils/postDisplay";

export default function PostMeta({ post, extra }) {
  const { t } = useTranslation("circles");
  const likePercentage = post.authorFeedback?.likePercentage;
  const location = post.location?.placeName
    ? `${post.location.placeName}${post.location.countryCode ? `, ${post.location.countryCode}` : ""}`
    : null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-0.5">
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <Clock className="w-3 h-3 shrink-0" />
        {formatPostTime(post.createdAtEpoch)}
      </span>

      {location && (
        <span className="inline-flex items-center gap-1 min-w-0">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{location}</span>
        </span>
      )}

      {typeof likePercentage === "number" && likePercentage >= 50 && (
        <span className="inline-flex items-center gap-1 whitespace-nowrap text-rose-500 font-medium">
          <Heart className="w-3 h-3 shrink-0 fill-rose-500" />
          {t("postMeta.likedPercentage", { percent: likePercentage })}
        </span>
      )}

      {extra}
    </div>
  );
}
