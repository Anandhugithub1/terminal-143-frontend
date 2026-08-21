export function calculateProfileCompletion(profile) {
  if (!profile) return 0;

  const REQUIRED_FIELDS = [
    "name",
    "bio",
    "dob",
    "gender",
    "interest",
    "photos",
    "socialMediaLinks",
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

    // Default for text/number fields
    return value !== undefined && value !== null && value !== "";
  }).length;

  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}
export const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Mandarin', value: 'zh' },
  { label: 'Thai', value: 'th' },
  { label: 'Russian', value: 'ru' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Japanese', value: 'jp' },
  { label: 'Korean', value: 'kr' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Urdu', value: 'ur' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Vietnamese', value: 'vi' },
  { label: 'Polish', value: 'pl' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Hebrew', value: 'he' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Greek', value: 'el' },
];
