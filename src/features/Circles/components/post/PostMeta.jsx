import { formatPostTime } from "../../utils/postDisplay";

export default function PostMeta({ post }) {
  return (
    <p className="text-xs text-gray-500">
      {formatPostTime(post.createdAtEpoch)}
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
