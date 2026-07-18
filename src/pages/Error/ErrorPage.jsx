import { useEffect } from "react"
import { useRouteError, useNavigate } from "react-router-dom"

export default function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    if (error) {
      console.error("Route error:", error)
    }

    const handleOnline = () => {
      window.location.reload()
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [error])

  const isOffline =
    typeof navigator !== "undefined" && !navigator.onLine

  const message = isOffline
    ? "You’re offline. We’ll reconnect automatically."
    : "Something didn’t load properly. Please try again."

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <span className="text-3xl">
            {isOffline ? "📡" : "⚠️"}
          </span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {isOffline ? "No internet connection" : "Something went wrong"}
        </h1>

        <p className="text-sm text-gray-500 max-w-xs mb-6">
          {message}
        </p>

        {!isOffline && (
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
            >
              Retry
            </button>

            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
