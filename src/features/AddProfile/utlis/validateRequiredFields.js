export const validateRequiredFields = () => {
  const missing = []

  // Name
  if (!formData.name?.trim()) {
    missing.push("Name")
  }

  // Bio
  if (!formData.bio?.trim()) {
    missing.push("Bio")
  }

  // DOB (source of truth)
  if (!formData.dob) {
    missing.push("Date of birth")
  } else if (calculateAge(formData.dob) < 18) {
    missing.push("Valid age (18+)")
  }

  // Social links
  if (
    !formData.socialMediaLinks ||
    formData.socialMediaLinks.length === 0
  ) {
    missing.push("At least one social link")
  }

  // Interests
  if (!hasAtLeastOneInterest) {
    missing.push("At least one interest")
  }

  // Location
  const loc = formData.location
  if (
    !loc ||
    !loc.coordinates ||
    loc.coordinates.lat == null ||
    loc.coordinates.lon == null
  ) {
    missing.push("Location")
  }

  return missing
}
