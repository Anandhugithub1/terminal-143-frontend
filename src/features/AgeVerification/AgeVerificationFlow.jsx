// features/AgeVerification/AgeVerificationFlow.jsx
//
// Full age-verification flow: intro -> liveness capture -> submit -> result.
// Auto-retries the liveness capture up to MAX_ATTEMPTS when it can't verify
// (a 'challenge' outcome, or a capture/liveness error), then falls back to a
// friendly failed state. Branded UI throughout.
import { lazy, Suspense, useState } from "react"
import { useTranslation } from "react-i18next"
import { ShieldCheck, RotateCcw, CheckCircle2, XCircle, ScanFace, X } from "lucide-react"
import { startAgeSession, getAgeResult } from "./api"
import { useRefreshAgeVerification } from "./useAgeVerification"

const LivenessCapture = lazy(() => import("./LivenessCapture"))

const MAX_ATTEMPTS = 3
const STEP = { INTRO: "intro", CAPTURE: "capture", SUBMITTING: "submitting", RESULT: "result" }
const ACCENT = "#D2449D"

export default function AgeVerificationFlow({ onClose, dismissible = true }) {
  const { t } = useTranslation("ageVerification")
  const refreshStatus = useRefreshAgeVerification()

  const [step, setStep] = useState(STEP.INTRO)
  const [sessionId, setSessionId] = useState(null)
  const [outcome, setOutcome] = useState(null)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(1)
  // Why the previous attempt is being retried (e.g. 'borderline', 'liveness',
  // 'unclear_capture', 'capture'). Drives the hint shown on the capture screen
  // so the user knows what to fix — empty on the very first attempt.
  const [retryReason, setRetryReason] = useState("")

  // Start (or restart) a capture: fetch a fresh session then open the camera.
  // `reason` is the retry cause to surface on the capture screen (blank = first
  // attempt, no hint).
  const startCapture = async (attemptNo, reason = "") => {
    setError("")
    setRetryReason(reason)
    try {
      const { sessionId } = await startAgeSession()
      if (!sessionId) throw new Error("No sessionId returned")
      setSessionId(sessionId)
      setAttempt(attemptNo)
      setStep(STEP.CAPTURE)
    } catch (err) {
      console.error("[age] startAgeSession failed", err?.response?.status, err?.response?.data || err?.message)
      setError(t("errorStart"))
      setStep(STEP.INTRO)
    }
  }

  const begin = () => startCapture(1)

  const handleCaptureComplete = async () => {
    setStep(STEP.SUBMITTING)
    try {
      const res = await getAgeResult(sessionId)
      // Auto-retry the transient outcomes while attempts remain:
      //   - 'challenge'          -> couldn't confirm age from the selfie
      //   - 'failed' + 'liveness'-> couldn't confirm a live person (bad capture)
      // A fresh capture in better light usually resolves both. We do NOT retry
      // 'failed' + 'underage' (a genuine minor) — that goes straight to failed.
      const isRetryable =
        res.status === "challenge" ||
        (res.status === "failed" && res.reason === "liveness")
      if (isRetryable && attempt < MAX_ATTEMPTS) {
        setError("")
        // Pass the reason forward so the next capture screen tells the user
        // exactly what to fix (lighting, single face, hold still, ...).
        await startCapture(attempt + 1, res.reason || "borderline")
        return
      }
      // After exhausting retries, present a liveness-failure as the friendly
      // "let's try again" (challenge) screen, not the hard underage "failed" —
      // only a real underage result shows the terminal failure.
      const display =
        res.status === "failed" && res.reason === "liveness"
          ? { ...res, status: "challenge" }
          : res
      setOutcome(display)
      setStep(STEP.RESULT)
      // NOTE: we deliberately do NOT refreshStatus() here. Refreshing while the
      // result screen is up flips the server state to 'passed'/'ok', which can
      // re-render AgeGate mid-refetch and unmount this flow before the user sees
      // the success screen. Instead we refresh on close (handleClose below).
    } catch (err) {
      console.error("[age] getAgeResult failed", err?.response?.status, err?.response?.data || err?.message)
      setError(t("errorSubmit"))
      setStep(STEP.INTRO)
    }
  }

  // A capture/camera error: retry automatically if attempts remain, else stop.
  const handleCaptureError = (_err, kind) => {
    if (kind !== "camera" && attempt < MAX_ATTEMPTS) {
      startCapture(attempt + 1, "capture")
      return
    }
    setError(kind === "camera" ? t("errorCameraDenied") : t("errorCapture"))
    setStep(STEP.INTRO)
  }

  const retryFromResult = () => {
    setOutcome(null)
    setError("")
    // Manual retry from the result screen: carry the last outcome's reason so
    // the capture screen still shows the relevant hint.
    startCapture(1, outcome?.reason || "borderline")
  }

  // Closing the flow: NOW refresh the server state (so the gate/banner clears
  // and the profile picks up the new verified status), then close. Doing it here
  // instead of on result avoids the mid-refetch unmount that hid the success
  // screen.
  const handleClose = () => {
    // Only optimistically flip the badge/profile to verified when this close
    // follows a passed result — closing a challenge/failed screen must not.
    refreshStatus(outcome?.status === "passed")
    onClose?.()
  }

  return (
    <div
      // z-[100] so the full-screen flow sits ABOVE the app's bottom nav (z-50)
      // and header — otherwise the nav bar covers the Continue button.
      className="fixed inset-0 z-[100] flex flex-col bg-white"
      // Keep all content below the status bar AND above the home-indicator /
      // gesture bar via the bottom safe-area inset.
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Close (X) — only when dismissible (grace period), on the intro screen,
          or on ANY result screen (so a passed user can always leave). Hidden on
          the non-dismissible expired-gate intro and during capture/submitting.
          Big 44px tap target, top-right, above everything. */}
      {onClose && ((dismissible && step === STEP.INTRO) || step === STEP.RESULT) && (
        <button
          onClick={step === STEP.RESULT ? handleClose : onClose}
          aria-label={t("close")}
          className="absolute right-3 z-[60] flex h-11 w-11 items-center justify-center rounded-full text-gray-400 active:bg-gray-100"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.5rem)" }}
        >
          <X size={24} />
        </button>
      )}

      {step === STEP.INTRO && (
        <IntroScreen t={t} error={error} onStart={begin} onClose={dismissible ? onClose : null} />
      )}

      {step === STEP.CAPTURE && (
        <Suspense fallback={<Spinner t={t} />}>
          <LivenessCapture
            sessionId={sessionId}
            attempt={attempt}
            maxAttempts={MAX_ATTEMPTS}
            retryReason={retryReason}
            onComplete={handleCaptureComplete}
            onError={handleCaptureError}
            onBack={() => setStep(STEP.INTRO)}
          />
        </Suspense>
      )}

      {step === STEP.SUBMITTING && <Spinner t={t} />}

      {step === STEP.RESULT && outcome && (
        <ResultScreen t={t} outcome={outcome} onRetry={retryFromResult} onClose={handleClose} />
      )}
    </div>
  )
}

/* ---------- screens ---------- */

function IntroScreen({ t, error, onStart, onClose }) {
  return (
    <Shell>
      <IconCircle tone="accent"><ScanFace size={34} strokeWidth={1.75} /></IconCircle>
      <h2 className="mt-5 text-2xl font-bold text-gray-900">{t("introTitle")}</h2>
      <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-gray-500">{t("introBody")}</p>

      <ul className="mt-6 w-full max-w-xs space-y-2.5 text-left">
        <Bullet t={t} k="introBullet1" />
        <Bullet t={t} k="introBullet2" />
        <Bullet t={t} k="introBullet3" />
      </ul>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-auto w-full max-w-xs pt-8">
        <PrimaryButton onClick={onStart}>{t("introCta")}</PrimaryButton>
        {onClose && (
          <button onClick={onClose} className="mt-3 w-full py-2 text-sm font-medium text-gray-400">
            {t("later")}
          </button>
        )}
      </div>
    </Shell>
  )
}

function Spinner({ t }) {
  return (
    <Shell>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#D2449D]" />
        <p className="mt-5 text-[15px] font-medium text-gray-500">{t("checking")}</p>
      </div>
    </Shell>
  )
}

function ResultScreen({ t, outcome, onRetry, onClose }) {
  if (outcome.status === "passed") {
    return (
      <Shell>
        <IconCircle tone="pass"><CheckCircle2 size={38} strokeWidth={1.75} /></IconCircle>
        <h2 className="mt-5 text-2xl font-bold text-gray-900">{t("passedTitle")}</h2>
        <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-gray-500">{t("passedBody")}</p>
        <div className="mt-auto w-full max-w-xs pt-8">
          <PrimaryButton onClick={onClose}>{t("continue")}</PrimaryButton>
        </div>
      </Shell>
    )
  }

  if (outcome.status === "challenge") {
    return (
      <Shell>
        <IconCircle tone="challenge"><RotateCcw size={34} strokeWidth={1.75} /></IconCircle>
        <h2 className="mt-5 text-2xl font-bold text-gray-900">{t("challengeTitle")}</h2>
        <p className="mt-2 max-w-[17rem] text-[15px] leading-relaxed text-gray-500">{t("challengeExhaustedBody")}</p>
        <ul className="mt-5 w-full max-w-xs space-y-2.5 text-left">
          <Bullet t={t} k="challengeTip1" />
          <Bullet t={t} k="challengeTip2" />
        </ul>
        <div className="mt-auto w-full max-w-xs pt-8">
          <PrimaryButton onClick={onRetry}>{t("tryAgain")}</PrimaryButton>
          <a href="mailto:support23@passormatch.com" className="mt-3 block w-full py-2 text-center text-sm font-medium text-gray-400">
            {t("contactSupport")}
          </a>
        </div>
      </Shell>
    )
  }

  // failed
  return (
    <Shell>
      <IconCircle tone="fail"><XCircle size={38} strokeWidth={1.75} /></IconCircle>
      <h2 className="mt-5 text-2xl font-bold text-gray-900">{t("failedTitle")}</h2>
      <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-gray-500">{t("failedBody")}</p>
      <div className="mt-auto w-full max-w-xs pt-8">
        <a href="mailto:support23@passormatch.com" className="block w-full rounded-xl border border-gray-200 py-3.5 text-center font-semibold text-gray-600">
          {t("contactSupport")}
        </a>
      </div>
    </Shell>
  )
}

/* ---------- primitives ---------- */

function Shell({ children }) {
  return (
    <div className="flex flex-1 flex-col items-center px-8 pt-8 pb-6 text-center">
      {children}
    </div>
  )
}

function IconCircle({ tone, children }) {
  const tones = {
    accent: "bg-[#FBE9F4] text-[#D2449D]",
    pass: "bg-[#E2F3EC] text-[#12805C]",
    challenge: "bg-[#FAEFDD] text-[#B45309]",
    fail: "bg-[#FBE9E7] text-[#B42318]",
  }
  return (
    <div className={`mt-[12vh] flex h-20 w-20 items-center justify-center rounded-full ${tones[tone]}`}>
      {children}
    </div>
  )
}

function PrimaryButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl py-3.5 font-semibold text-white shadow-sm active:scale-[0.99] transition"
      style={{ backgroundColor: ACCENT }}
    >
      {children}
    </button>
  )
}

function Bullet({ t, k }) {
  return (
    <li className="flex items-start gap-2.5 text-[13.5px] text-gray-600">
      <ShieldCheck size={16} className="mt-0.5 flex-none text-[#D2449D]" />
      <span>{t(k)}</span>
    </li>
  )
}
