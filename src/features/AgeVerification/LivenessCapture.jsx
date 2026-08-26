// features/AgeVerification/LivenessCapture.jsx
//
// Renders the AWS Amplify FaceLivenessDetector, themed to PassorMatch (magenta),
// inside a branded frame with a header and privacy note. On success calls
// onComplete(); on failure calls onError(err, kind).
//
// The header owns the top-of-screen affordances (a Cancel control and the
// attempt counter) so we control their placement. On Android the status bar
// does NOT overlay the WebView (overlaysWebView:false), so env(safe-area-inset-
// top) reports 0 there; we add a real min top pad so the header never sits
// flush against the top edge / status bar. On iOS the inset is added on top.
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness"
import { ThemeProvider, createTheme } from "@aws-amplify/ui-react"
import { ShieldCheck, X, AlertCircle } from "lucide-react"
import "@aws-amplify/ui-react/styles.css"
import { makeLivenessCredentialsProvider } from "./credentials"

const REGION = import.meta.env.VITE_REKOGNITION_REGION || "us-east-1"

// Match the detector's font to the app (Inter, loaded via index.html) so the
// in-camera text looks consistent with the rest of PassorMatch.
const APP_FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

// Brand the detector's controls (oval, buttons, progress) with PassorMatch pink.
const livenessTheme = createTheme({
  name: "passormatch-liveness",
  tokens: {
    fonts: {
      default: {
        variable: { value: APP_FONT },
        static: { value: APP_FONT },
      },
    },
    colors: {
      background: { primary: { value: "#ffffff" } },
      brand: {
        primary: {
          10: { value: "#fbe9f4" },
          80: { value: "#d2449d" },
          90: { value: "#b1327f" },
          100: { value: "#8f2867" },
        },
      },
      border: { primary: { value: "#ece4ea" } },
    },
    radii: { small: { value: "10px" }, medium: { value: "14px" }, large: { value: "18px" } },
    components: {
      button: {
        primary: {
          backgroundColor: { value: "#d2449d" },
          _hover: { backgroundColor: { value: "#b1327f" } },
        },
      },
    },
  },
})

// Map a retry reason from the previous attempt to a specific, actionable hint
// key so the user knows what to fix this time. Falls back to a generic retry
// message for anything unmapped.
const RETRY_HINT_KEY = {
  borderline: "retryHintBorderline",       // couldn't confirm age -> better light
  unclear_capture: "retryHintFace",        // no/multiple faces -> single face, centered
  liveness: "retryHintLiveness",           // not confirmed live -> hold still, follow prompts
  capture: "retryHintCapture",             // camera check didn't finish
}

export default function LivenessCapture({ sessionId, onComplete, onError, onBack, attempt, maxAttempts, retryReason }) {
  const { t, i18n } = useTranslation("ageVerification")
  const credentialProvider = useMemo(() => makeLivenessCredentialsProvider(), [])
  const hintKey = retryReason ? RETRY_HINT_KEY[retryReason] || "retryHintGeneric" : null

  // Override the Amplify detector's built-in (English-only) in-camera copy with
  // friendlier, on-brand, localized strings. Only the guidance/hint text is
  // remapped; anything omitted falls back to Amplify's default. Rebuilt on
  // language change so the camera speaks the user's language.
  const displayText = useMemo(() => ({
    hintMoveFaceFrontOfCameraText: t("lvMoveFace"),
    hintCenterFaceText: t("lvCenterFace"),
    hintTooCloseText: t("lvTooClose"),
    hintTooFarText: t("lvTooFar"),
    hintTooManyFacesText: t("lvTooManyFaces"),
    hintFaceDetectedText: t("lvFaceDetected"),
    hintHoldFaceForFreshnessText: t("lvHoldStill"),
    hintConnectingText: t("lvConnecting"),
    hintVerifyingText: t("lvVerifying"),
    hintCheckCompleteText: t("lvComplete"),
    hintIlluminationTooBrightText: t("lvTooBright"),
    hintIlluminationTooDarkText: t("lvTooDark"),
    hintIlluminationNormalText: t("lvLightGood"),
    hintCanNotIdentifyText: t("lvCantIdentify"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [i18n.language])

  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Branded header — owns the top affordances so nothing sits in the
          status bar. Real min top-pad (Android reports 0 for the safe-area
          inset) plus the iOS inset on top of it. */}
      <header
        className="flex items-center justify-between gap-3 px-4 pb-3 border-b border-gray-100"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.875rem)" }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#FBE9F4] text-[#D2449D]">
            <ShieldCheck size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight text-gray-900">
              {t("captureHeader")}
            </p>
            {maxAttempts > 1 && (
              <p className="mt-0.5 text-[11px] leading-tight text-gray-400">
                {t("attemptOf", { current: attempt, total: maxAttempts })}
              </p>
            )}
          </div>
        </div>

        {/* Cancel — clear, well-placed 44px tap target on the right. */}
        {onBack && (
          <button
            onClick={onBack}
            aria-label={t("cancel")}
            className="-mr-1.5 flex h-11 w-11 flex-none items-center justify-center rounded-full text-gray-400 active:bg-gray-100"
          >
            <X size={22} />
          </button>
        )}
      </header>

      {/* Retry hint — shown when this capture follows a failed attempt, telling
          the user exactly what to fix (lighting, single face, hold still, ...). */}
      {hintKey && (
        <div
          role="status"
          className="flex items-start gap-2 border-b border-[#FCE4B8] bg-[#FEF6E7] px-4 py-2.5"
        >
          <AlertCircle size={17} className="mt-0.5 flex-none text-[#B45309]" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight text-[#92400E]">
              {t("retryTitle")}
            </p>
            <p className="mt-0.5 text-[12.5px] leading-snug text-[#B45309]">
              {t(hintKey)}
            </p>
          </div>
        </div>
      )}

      {/* Scoped overrides for the Amplify detector: the header already provides
          a Cancel control, so hide the detector's own built-in cancel button
          (it otherwise sits high near the status bar and duplicates ours), and
          give the camera view a little top breathing room. */}
      <style>{`
        .pm-liveness [data-amplify-liveness-cancel-button],
        .pm-liveness button[aria-label="Cancel Face Liveness check"],
        .pm-liveness button[aria-label="Cancel"] {
          display: none !important;
        }
        .pm-liveness .amplify-liveness-camera-module,
        .pm-liveness [data-amplify-liveness-detector] {
          padding-top: 0.25rem;
        }
      `}</style>

      {/* The detector fills the space between header and footer. */}
      <div className="pm-liveness relative flex-1 overflow-hidden bg-white">
        <ThemeProvider theme={livenessTheme}>
          <FaceLivenessDetector
            sessionId={sessionId}
            region={REGION}
            config={{ credentialProvider }}
            disableStartScreen
            displayText={displayText}
            onAnalysisComplete={async () => { onComplete() }}
            onError={(err) => {
              const name = err?.error?.name || err?.name || "unknown"
              const message = err?.error?.message || err?.message || JSON.stringify(err)
              console.error("[liveness] error:", name, "-", message, err?.state ? `(state: ${err.state})` : "")
              const isCameraDenied =
                /NotAllowed|Permission|denied|camera/i.test(name) ||
                /NotAllowed|permission|denied|camera/i.test(message)
              onError?.(err, isCameraDenied ? "camera" : "generic")
            }}
          />
        </ThemeProvider>
      </div>

      {/* Privacy note */}
      <footer
        className="flex items-center justify-center gap-1.5 border-t border-gray-100 px-6 py-3 text-center text-[11px] text-gray-400"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <span aria-hidden>🔒</span>
        <span>{t("captureBody")}</span>
      </footer>
    </div>
  )
}
