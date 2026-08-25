// features/AgeVerification/AgeGate.jsx
//
// Orchestrates the deferred age-verification UX at the app root:
//   state 'ok'      -> render nothing (SEA users, verified users)
//   state 'grace'   -> dismissible reminder banner; user can verify anytime
//   state 'expired' -> full-screen, non-dismissible gate until verified
//
// All state is server-authoritative (useAgeVerification). The lazy-loaded flow
// keeps the Amplify/liveness code out of the main bundle.
//
// Mounted at the app root (App.jsx), so it renders on every route including
// login/signup and onboarding/profile-completion — routes where the user
// either isn't authenticated yet or hasn't finished setting up their profile.
// Age verification only makes sense once a profile exists and is complete;
// gate on useMyProfile().profileCompleted the same way
// RequireProfileIncomplete does, and fail closed (render nothing) for every
// other state — loading, error, 404/no-profile-yet, or logged out — since a
// missing banner is always safe but a premature one is the bug being fixed.
import { lazy, Suspense, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useAgeVerification } from "./useAgeVerification"
import { configureAmplify } from "./amplifyConfig"
import { useMyProfile } from "../UserProfile/Hooks/useMyProfile"

const AgeVerificationFlow = lazy(() => import("./AgeVerificationFlow"))

export default function AgeGate() {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useMyProfile()
  const profileCompleted = !!profile?.profileCompleted
  // Skip the age-status fetch entirely until we know the profile is
  // complete — no point hitting the endpoint on the login screen or mid-
  // onboarding, where the result is discarded below anyway.
  const { state, daysRemaining } = useAgeVerification(profileCompleted)

  // Configure Amplify once when the gate is live (only matters for regulated
  // users who reach the liveness flow). Safe no-op if env isn't set.
  useEffect(() => {
    if (state === "grace" || state === "expired") configureAmplify()
  }, [state])

  const [flowOpen, setFlowOpen] = useState(false)
  // Session-only dismissal of the reminder (returns next app open while pending).
  const [dismissed, setDismissed] = useState(false)

  // Not logged in, profile still loading, profile fetch failed (including
  // 404/no-profile-yet), or onboarding not finished — never show the
  // banner/gate in any of these cases. Placed after all hooks so the hook
  // order stays identical across renders regardless of this condition.
  if (profileLoading || profileError || !profileCompleted) {
    return null
  }

  const openFlow = () => setFlowOpen(true)
  const closeFlow = () => setFlowOpen(false)

  // The flow stays open on success until the user taps Continue (onClose); it
  // only refreshes the server state so the gate/banner clears afterward.
  // `dismissible` controls whether the X / "Maybe later" show — off on the
  // expired hard gate (they must verify), on during the grace period.
  const renderFlow = (dismissible) =>
    flowOpen ? (
      <Suspense fallback={null}>
        <AgeVerificationFlow onClose={closeFlow} dismissible={dismissible} />
      </Suspense>
    ) : null

  if (state === "expired") {
    // Hard gate — blocks the app until verified. Not dismissible until passed.
    return (
      <>
        <ExpiredGate onVerify={openFlow} />
        {renderFlow(false)}
      </>
    )
  }

  if (state === "grace" && !dismissed) {
    return (
      <>
        <ReminderBanner
          daysRemaining={daysRemaining}
          onVerify={openFlow}
          onDismiss={() => setDismissed(true)}
        />
        {renderFlow(true)}
      </>
    )
  }

  // 'ok', or grace dismissed for this session — the flow can still be open if
  // the user launched it (e.g. from a passed result they haven't closed yet).
  return renderFlow(true)
}

function ReminderBanner({ daysRemaining, onVerify, onDismiss }) {
  const { t } = useTranslation("ageVerification")
  return (
    <div
      role="status"
      // Sit below the app header (and the device status-bar safe area) so the
      // banner never overlaps the logo/nav row.
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 72px)" }}
      className="fixed inset-x-3 z-40 rounded-2xl border border-[#D2449D] bg-[#FBE9F4] p-3.5 shadow-lg"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-[#B1327F]">
        🛡️ {t("bannerTitle")}
      </div>
      <p className="mt-1 text-xs text-gray-600">
        {t("bannerBody", { count: daysRemaining ?? 0 })}
      </p>
      <div className="mt-2.5 flex gap-2">
        <button
          onClick={onVerify}
          className="rounded-lg bg-[#D2449D] px-3 py-1.5 text-xs font-semibold text-white"
        >
          {t("verifyNow")}
        </button>
        <button onClick={onDismiss} className="px-3 py-1.5 text-xs font-semibold text-gray-500">
          {t("later")}
        </button>
      </div>
    </div>
  )
}

function ExpiredGate({ onVerify }) {
  const { t } = useTranslation("ageVerification")
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white px-8 text-center"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mb-3 rounded-full bg-[#FBE9E7] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#B42318]">
        {t("gateBadge")}
      </div>
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FBE9E7] text-4xl">
        🔒
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{t("gateTitle")}</h2>
      <p className="mt-2 max-w-xs text-gray-500">{t("gateBody")}</p>
      <button
        onClick={onVerify}
        className="mt-6 w-full max-w-xs rounded-xl bg-[#D2449D] py-3.5 font-semibold text-white"
      >
        {t("gateCta")}
      </button>
    </div>
  )
}
