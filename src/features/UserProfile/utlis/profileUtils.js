export function calculateProfileCompletion(profile) {
  if (!profile) return 0;

  const REQUIRED_FIELDS = [
    "name",
    "bio",
    "age",
    "gender",
    "interest",
    "photo",
    "socialMediaLinks",
    "healthStatus",
  ];

  const filled = REQUIRED_FIELDS.filter((field) => {
    const value = profile[field];

    if (Array.isArray(value)) {
      // For arrays like interests or photos
      return value.length > 0;
    }

    if (field === "socialMediaLinks") {
      // At least one valid social link
      return (
        Array.isArray(profile.socialMediaLinks) &&
        profile.socialMediaLinks.some((link) => link.usernameOrLink?.trim())
      );
    }

    if (field === "healthStatus") {
      // Must have both stdStatus and lastTestedDate filled
      const hs = profile.healthStatus;
      return hs && hs.stdStatus && hs.lastTestedDate;
    }

    // Default for text/number fields
    return value !== undefined && value !== null && value !== "";
  }).length;

  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}
