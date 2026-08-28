// features/AgeVerification/VerifiedBadge.jsx
//
// Small "Verified" pill shown when the user's live selfie matched their profile
// photo during age verification. Driven by the derived `photoVerified` boolean
// from the backend (never the raw verification data). Renders nothing when not
// verified. Blue, to read distinctly from the green "Age Verified" pill.
import { BadgeCheck } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function VerifiedBadge({ verified, className = "" }) {
  const { t } = useTranslation("ageVerification")
  if (!verified) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[#E7F0FB] px-2.5 py-1 text-xs font-semibold text-[#1D6FD1] ${className}`}
      title={t("photoVerifiedBadgeTitle")}
    >
      <BadgeCheck size={13} strokeWidth={2.5} />
      {t("photoVerifiedBadge")}
    </span>
  )
}
