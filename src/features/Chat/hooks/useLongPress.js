import { useRef, useCallback } from 'react'

const LONG_PRESS_MS = 450
// Finger drift beyond this cancels the press — otherwise a scroll gesture
// that starts on a bubble would fire the long-press handler.
const MOVE_CANCEL_PX = 10

// Returns handlers to spread onto an element: fires `onLongPress` if the
// pointer stays down (without moving far) for LONG_PRESS_MS, and otherwise
// leaves click/scroll behavior alone. Works for touch and mouse alike since
// it's built on pointer events.
export function useLongPress(onLongPress) {
  const timerRef = useRef(null)
  const startRef = useRef(null)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startRef.current = null
  }, [])

  const onPointerDown = useCallback(
    (e) => {
      startRef.current = { x: e.clientX, y: e.clientY }
      timerRef.current = setTimeout(() => {
        onLongPress(e)
        clear()
      }, LONG_PRESS_MS)
    },
    [onLongPress, clear]
  )

  const onPointerMove = useCallback(
    (e) => {
      if (!startRef.current) return
      const dx = e.clientX - startRef.current.x
      const dy = e.clientY - startRef.current.y
      if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) clear()
    },
    [clear]
  )

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
  }
}
