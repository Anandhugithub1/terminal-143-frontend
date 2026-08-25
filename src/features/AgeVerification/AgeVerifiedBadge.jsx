// features/AgeVerification/AgeVerifiedBadge.jsx
//
// Small pill shown on a profile when the user has passed age verification.
// Driven by the derived `ageVerified` boolean from the backend (never the raw
// verification data). Renders nothing when not verified.
import { BadgeCheck } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function AgeVerifiedBadge({ verified, className = "" }) {
  const { t } = useTranslation("ageVerification")
  if (!verified) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[#E2F3EC] px-2.5 py-1 text-xs font-semibold text-[#12805C] ${className}`}
      title={t("verifiedBadgeTitle")}
    >
      <BadgeCheck size={13} strokeWidth={2.5} />
      {t("verifiedBadge")}
    </span>
  )
}
