import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

export default function InstagramExitBanner() {
  const location = useLocation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isInstagram = /Instagram/i.test(navigator.userAgent)
    const isAllowedRoute = [
      "/",
      "/home",
      "/login",
      "/register"
    ].includes(location.pathname)

    setShow(isInstagram && isAllowedRoute)
  }, [location.pathname])

  if (!show) return null

  return (
    <>
      {/* Spacer to push content */}
      <div className="h-[72px]" />

      {/* Banner */}
      <div className="fixed inset-x-0 top-0 z-[1000] px-4 pt-3">
        <div className="mx-auto max-w-md rounded-xl border border-border-clr bg-white shadow-md">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-primary text-lg">🌐</span>
            </div>

            <p className="flex-1 text-sm font-medium text-gray-900">
              Open in browser for the best experience
            </p>

            <button
              onClick={() => setShow(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
