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
import { ShieldCheck, X } from "lucide-react"
import "@aws-amplify/ui-react/styles.css"
import { makeLivenessCredentialsProvider } from "./credentials"

const REGION = import.meta.env.VITE_REKOGNITION_REGION || "us-east-1"

// Brand the detector's controls (oval, buttons, progress) with PassorMatch pink.
const livenessTheme = createTheme({
  name: "passormatch-liveness",
  tokens: {
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

export default function LivenessCapture({ sessionId, onComplete, onError, onBack, attempt, maxAttempts }) {
  const { t } = useTranslation("ageVerification")
  const credentialProvider = useMemo(() => makeLivenessCredentialsProvider(), [])

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
