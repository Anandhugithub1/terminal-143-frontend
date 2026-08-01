import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

// Browsers don't shrink 100dvh when the keyboard opens — the layout viewport
// stays put and the keyboard overlays it, so a fixed h-[100dvh] column leaves
// blank space under whatever the keyboard now covers. window.visualViewport
// does report the keyboard-adjusted height, so pages size off that instead.
//
// offsetTop is subtracted because iOS also scrolls the layout viewport up to
// reveal the focused field; measuring height alone leaves the column too tall
// by exactly that shift, which is what pushes a composer up off the keyboard.
//
// Native builds opt out entirely: the Keyboard plugin is configured with
// resize: "native", so iOS resizes the WebView itself and 100dvh is already
// correct. Applying a JS height on top of that subtracts the keyboard twice.
export function useVisualViewportHeight() {
  const nativeResize = Capacitor.isNativePlatform()

  const [height, setHeight] = useState(() =>
    !nativeResize && typeof window !== 'undefined' && window.visualViewport
      ? window.visualViewport.height
      : null
  )

  useEffect(() => {
    if (nativeResize) return
    const vv = window.visualViewport
    if (!vv) return
    const update = () => setHeight(vv.height - vv.offsetTop)
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [nativeResize])

  return height
}

export default useVisualViewportHeight
