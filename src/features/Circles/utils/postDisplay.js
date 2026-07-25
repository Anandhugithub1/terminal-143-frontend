export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";

export const formatPostTime = (epochMillis) => {
  if (!epochMillis) return "";

  const diffSec = Math.max(0, (Date.now() - epochMillis) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export const getAgeFromDob = (dob) => {
  if (!dob) return null;

  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;

  return age;
};

const GENDER_LABELS = {
  M: "Male",
  F: "Female",
  O: "Other",
};

export const getGenderLabel = (gender) => {
  if (!gender) return null;

  return GENDER_LABELS[gender.toUpperCase()] || gender;
};

// The label to show for a post's author. Prefers the real profile display name
// (authorDisplayName, added later); falls back to authorName (the username) for
// posts created before that field existed / not yet backfilled.
export const getAuthorDisplayName = (post) =>
  post?.authorDisplayName || post?.authorName || "";

// Buckets a gender into its matching pool: men and trans men (MTM), women
// and trans women (FTF), everyone else (OT).
const genderGroup = (gender) => {
  if (!gender) return "OT";

  const g = String(gender).trim().toUpperCase();

  if (g === "M" || g === "TM") return "MTM";
  if (g === "F" || g === "TF") return "FTF";

  return "OT";
};

// Whether the current user and a post's author could match each other.
// Matching is cross-group (MTM <-> FTF); "OT" never matches.
export const isMutualPreferenceMatch = (myProfile, post) => {
  const myGroup = genderGroup(myProfile?.gender);
  const authorGroup = post?.authorPrefGroup
    ? String(post.authorPrefGroup).trim().toUpperCase()
    : genderGroup(post?.authorGender);

  if (myGroup === "OT" || authorGroup === "OT") return false;

  return myGroup !== authorGroup;
};
