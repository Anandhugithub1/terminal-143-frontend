// features/AgeVerification/AgeVerificationFlow.jsx
//
// The selfie liveness + age check. Handles: start session -> run liveness
// capture -> submit for result -> branch on PASS / FAIL / CHALLENGE.
//
// The actual camera capture uses AWS Amplify's <FaceLivenessDetector />. That
// SDK isn't wired into the build yet, so the capture step is isolated behind
// LivenessCapture below — swap its placeholder for the real component when
// Amplify is configured (see docs note at the bottom). Everything else — the
// session lifecycle, result submission, and outcome UI — is complete.
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { startAgeSession, getAgeResult } from "./api"
import { useRefreshAgeVerification } from "./useAgeVerification"

const STEP = {
  INTRO: "intro",
  CAPTURE: "capture",
  SUBMITTING: "submitting",
  RESULT: "result",
}

export default function AgeVerificationFlow({ onClose, onPassed }) {
  const { t } = useTranslation("ageVerification")
  const refreshStatus = useRefreshAgeVerification()

  const [step, setStep] = useState(STEP.INTRO)
  const [sessionId, setSessionId] = useState(null)
  const [outcome, setOutcome] = useState(null) // { status, reason }
  const [error, setError] = useState("")

  const begin = async () => {
    setError("")
    try {
      const { sessionId } = await startAgeSession()
      setSessionId(sessionId)
      setStep(STEP.CAPTURE)
    } catch {
      setError(t("errorStart"))
    }
  }

  const handleCaptureComplete = async () => {
    setStep(STEP.SUBMITTING)
    try {
      const res = await getAgeResult(sessionId)
      setOutcome(res)
      setStep(STEP.RESULT)
      refreshStatus()
      if (res.status === "passed") onPassed?.()
    } catch {
      setError(t("errorSubmit"))
      setStep(STEP.INTRO)
    }
  }

  const retry = () => {
    setOutcome(null)
    setError("")
    setStep(STEP.INTRO)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {step === STEP.INTRO && (
        <Centered>
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold text-gray-900">{t("introTitle")}</h2>
          <p className="mt-2 max-w-xs text-gray-500">{t("introBody")}</p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button
            onClick={begin}
            className="mt-6 w-full max-w-xs rounded-xl bg-[#D2449D] py-3.5 font-semibold text-white"
          >
            {t("introCta")}
          </button>
          {onClose && (
            <button onClick={onClose} className="mt-2 text-sm text-gray-400">
              {t("later")}
            </button>
          )}
        </Centered>
      )}

      {step === STEP.CAPTURE && (
        <LivenessCapture
          sessionId={sessionId}
          onComplete={handleCaptureComplete}
          onError={() => {
            setError(t("errorCapture"))
            setStep(STEP.INTRO)
          }}
        />
      )}

      {step === STEP.SUBMITTING && (
        <Centered>
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#D2449D]" />
          <p className="mt-4 text-gray-500">{t("checking")}</p>
        </Centered>
      )}

      {step === STEP.RESULT && outcome && (
        <ResultView outcome={outcome} onRetry={retry} onClose={onClose} />
      )}
    </div>
  )
}

function ResultView({ outcome, onRetry, onClose }) {
  const { t } = useTranslation("ageVerification")

  if (outcome.status === "passed") {
    return (
      <Centered>
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900">{t("passedTitle")}</h2>
        <p className="mt-2 max-w-xs text-gray-500">{t("passedBody")}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full max-w-xs rounded-xl bg-[#D2449D] py-3.5 font-semibold text-white"
        >
          {t("continue")}
        </button>
      </Centered>
    )
  }

  if (outcome.status === "challenge") {
    return (
      <Centered>
        <div className="text-5xl mb-4">🪪</div>
        <h2 className="text-2xl font-bold text-gray-900">{t("challengeTitle")}</h2>
        <p className="mt-2 max-w-xs text-gray-500">{t("challengeBody")}</p>
        <button
          onClick={onRetry}
          className="mt-6 w-full max-w-xs rounded-xl bg-[#D2449D] py-3.5 font-semibold text-white"
        >
          {t("retrySelfie")}
        </button>
        {/* ID document fallback (Didit/Yoti) is a future phase; retry for now. */}
      </Centered>
    )
  }

  // failed
  return (
    <Centered>
      <div className="text-5xl mb-4">🚫</div>
      <h2 className="text-2xl font-bold text-gray-900">{t("failedTitle")}</h2>
      <p className="mt-2 max-w-xs text-gray-500">{t("failedBody")}</p>
      <a
        href="mailto:support23@passormatch.com"
        className="mt-6 w-full max-w-xs rounded-xl border border-gray-200 py-3.5 text-center font-semibold text-gray-600"
      >
        {t("contactSupport")}
      </a>
    </Centered>
  )
}

function Centered({ children }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// LivenessCapture — INTEGRATION SEAM for AWS Amplify FaceLivenessDetector.
//
// To wire the real capture:
//   1. npm i @aws-amplify/ui-react-liveness aws-amplify
//   2. Configure Amplify with an identity pool that can call Rekognition.
//   3. Replace the placeholder below with:
//        <FaceLivenessDetector
//          sessionId={sessionId}
//          region={import.meta.env.VITE_REKOGNITION_REGION || 'us-east-1'}
//          onAnalysisComplete={async () => onComplete()}
//          onError={onError}
//        />
//   4. Ensure camera permission (Capacitor: NSCameraUsageDescription on iOS,
//      camera permission on Android) and test getUserMedia inside the webview.
//
// Until then this placeholder lets the rest of the flow run end to end.
// ---------------------------------------------------------------------------
function LivenessCapture({ onComplete, onError }) {
  const { t } = useTranslation("ageVerification")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 600)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[3px] border-dashed border-[#D2449D]">
        <span className="text-5xl">🙂</span>
        <span className="absolute inset-[-3px] animate-spin rounded-full border-[3px] border-transparent border-t-[#D2449D]" />
      </div>
      <p className="mt-6 font-semibold text-gray-900">{t("captureTitle")}</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">{t("captureBody")}</p>
      {/* Placeholder action — replaced by FaceLivenessDetector's own flow.
          The real component reports failures via onError; expose it here so the
          user can back out if the camera can't start. */}
      <button
        disabled={!ready}
        onClick={onComplete}
        className="mt-6 w-full max-w-xs rounded-xl bg-[#D2449D] py-3.5 font-semibold text-white disabled:opacity-40"
      >
        {t("captureContinue")}
      </button>
      <button onClick={onError} className="mt-2 text-sm text-gray-400">
        {t("errorCapture")}
      </button>
    </div>
  )
}
