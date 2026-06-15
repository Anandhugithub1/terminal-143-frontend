import { formatPostTime, getAgeFromDob, getGenderLabel } from "../../utils/postDisplay";

export default function PostMeta({ post }) {
  const age = getAgeFromDob(post.authorDob);
  const gender = getGenderLabel(post.authorGender);
  const authorInfo = [age, gender].filter(Boolean).join(", ");

  return (
    <p className="text-xs text-gray-500">
      {formatPostTime(post.createdAtEpoch)}
      {authorInfo && <> • {authorInfo}</>}
      {post.location?.placeName && (
        <>
          {" "}
          • {post.location.placeName}
          {post.location.countryCode ? `, ${post.location.countryCode}` : ""}
        </>
      )}
    </p>
  );
}
