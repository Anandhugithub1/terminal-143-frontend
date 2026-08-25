// features/AgeVerification/AgeGate.jsx
//
// Orchestrates the deferred age-verification UX at the app root:
//   state 'ok'      -> render nothing (SEA users, verified users)
//   state 'grace'   -> dismissible reminder banner; user can verify anytime
//   state 'expired' -> full-screen, non-dismissible gate until verified
//
// All state is server-authoritative (useAgeVerification). The lazy-loaded flow
// keeps the Amplify/liveness code out of the main bundle.
import { lazy, Suspense, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAgeVerification } from "./useAgeVerification"

const AgeVerificationFlow = lazy(() => import("./AgeVerificationFlow"))

export default function AgeGate() {
  const { state, daysRemaining } = useAgeVerification()
  const [flowOpen, setFlowOpen] = useState(false)
  // Session-only dismissal of the reminder (returns next app open while pending).
  const [dismissed, setDismissed] = useState(false)

  const openFlow = () => setFlowOpen(true)
  const closeFlow = () => setFlowOpen(false)

  const flow = flowOpen ? (
    <Suspense fallback={null}>
      <AgeVerificationFlow onClose={closeFlow} onPassed={closeFlow} />
    </Suspense>
  ) : null

  if (state === "expired") {
    // Hard gate — blocks the app until verified. Not dismissible.
    return (
      <>
        <ExpiredGate onVerify={openFlow} />
        {flow}
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
        {flow}
      </>
    )
  }

  // 'ok', or grace dismissed for this session.
  return flow
}

function ReminderBanner({ daysRemaining, onVerify, onDismiss }) {
  const { t } = useTranslation("ageVerification")
  return (
    <div
      role="status"
      className="fixed inset-x-3 top-3 z-40 rounded-2xl border border-[#D2449D] bg-[#FBE9F4] p-3.5 shadow-lg"
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-8 text-center">
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
