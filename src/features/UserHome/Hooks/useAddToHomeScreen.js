import { useEffect, useState, useCallback } from "react"

const STORAGE_KEY = "a2hs_last_shown"
const DISMISS_KEY = "a2hs_dismissed"
const IOS_WEEK_KEY = "a2hs_ios_week"
const IOS_WEEK_COUNT_KEY = "a2hs_ios_week_count"

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  )
}

export function useAddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canShow, setCanShow] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    const ios = isIOS()
    setIsIOSDevice(ios)

    const now = Date.now()

    if (ios) {
      const weekStart = Number(localStorage.getItem(IOS_WEEK_KEY) || 0)
      let weekCount = Number(localStorage.getItem(IOS_WEEK_COUNT_KEY) || 0)

      // Reset week
      if (now - weekStart > ONE_WEEK) {
        localStorage.setItem(IOS_WEEK_KEY, now.toString())
        localStorage.setItem(IOS_WEEK_COUNT_KEY, "0")
        weekCount = 0
      }

      if (weekCount < 2) {
        setCanShow(true)
        localStorage.setItem(
          IOS_WEEK_COUNT_KEY,
          (weekCount + 1).toString()
        )
      }

      return
    }

    // ANDROID LOGIC
    const lastShown = Number(localStorage.getItem(STORAGE_KEY) || 0)
    const dismissed = localStorage.getItem(DISMISS_KEY)

    if (dismissed === "true") return
    if (now - lastShown < ONE_MONTH) return

    const handler = e => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanShow(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const showPrompt = useCallback(async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, "true")
    }

    localStorage.setItem(STORAGE_KEY, Date.now().toString())

    setCanShow(false)
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    setCanShow(false)
  }, [])

  return {
    canShow,
    showPrompt,
    dismiss,
    isIOSDevice
  }
}
