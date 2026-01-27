import { useEffect, useState } from "react"

const STORAGE_KEY = "a2hs_last_shown"
const ONE_MONTH = 1000 * 60 * 60 * 24 * 30

function isAppInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  )
}

export function useAddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canShow, setCanShow] = useState(false)

  useEffect(() => {
    if (isAppInstalled()) return

    const handler = e => {
      e.preventDefault()
      setDeferredPrompt(e)

      const lastShown = Number(localStorage.getItem(STORAGE_KEY) || 0)
      const now = Date.now()

      if (now - lastShown > ONE_MONTH) {
        setCanShow(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const showPrompt = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    await deferredPrompt.userChoice

    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    setCanShow(false)
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    setCanShow(false)
  }

  return {
    canShow,
    showPrompt,
    dismiss
  }
}
