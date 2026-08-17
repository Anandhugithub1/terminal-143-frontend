import { useCallback, useEffect, useRef, useState } from 'react'

// How close to the left edge a touch has to start for the gesture to
// engage. Deliberately generous — a narrow strip hugging the very edge
// collides with the OS's own edge-to-edge back-gesture zone on Android
// (and the equivalent on iOS), which claims that sliver for itself before
// a touch there ever reaches the WebView at all. Starting the hit zone
// further in, like Telegram's own swipe-to-close, avoids that fight
// entirely and is also just easier to hit with a thumb.
const EDGE_ZONE_PX = 80
// Fraction of the viewport width the page has to be dragged past (or a fast
// enough flick, see VELOCITY_THRESHOLD) to commit to closing instead of
// springing back.
const COMMIT_RATIO = 0.35
// px/ms — a quick flick past this speed commits even if released well
// short of COMMIT_RATIO, matching how a fast Telegram swipe doesn't need to
// travel far to dismiss.
const VELOCITY_THRESHOLD = 0.5

// Telegram-style interactive edge-swipe-to-go-back.
//
// Built on raw touchstart/touchmove/touchend rather than Pointer Events —
// verified via live CDP inspection of the running app that Chrome/WebView
// only synthesizes pointermove from touchmove events that are still
// "cancelable" at dispatch time. Once touch-action (pan-y, needed so
// vertical scrolling keeps working — see the panel's own style) tells the
// browser horizontal movement is being handled by JS but vertical is
// native, the browser marks subsequent touchmove events non-cancelable —
// and non-cancelable touchmove never produces a pointermove. Result: with
// a pointer-events implementation, the very first move of every drag
// worked and every move after it went completely silent. touchmove itself
// keeps firing throughout the whole gesture regardless of cancelable, so
// listening to it directly sidesteps the synthesis gap entirely.
//
// Deliberately does NOT touch the element's transform/transition itself —
// the caller owns those (e.g. PeekShell also drives the same transform for
// the open/close route animation, and two writers fighting over one style
// property is how you get a flickering panel). Instead this reports drag
// progress through callbacks and lets the caller decide how to render each
// state:
//
//   onDragStart()          — gesture armed, about to start moving
//   onDragMove(dx)          — dx is the raw, unclamped touch delta in px
//   onDragEnd(committed)    — released; true = finish closing, false = spring back to 0
//
// onBack fires once a drag commits to closing.
export function useSwipeBackGesture({ onDragStart, onDragMove, onDragEnd, onBack, disabled = false }) {
  // A *state*-backed ref (callback-ref pattern), not a plain useRef: the
  // element this attaches to is often not mounted yet on the first render
  // of whatever conditionally renders it (e.g. it only appears after a
  // "show" flag flips true one render later). A plain ref's value changing
  // doesn't re-run any effect, so if the DOM node attaches after this
  // hook's setup effect already ran and bailed out on the ref being empty,
  // that effect never gets a second chance to attach listeners. Routing the
  // node through state means it arriving triggers a re-render, which the
  // effect below is keyed on.
  const [el, setEl] = useState(null)
  const stateRef = useRef(null)

  // Callbacks are read through a ref rather than being effect dependencies,
  // so a caller passing inline arrow functions (recreated every render —
  // onDragMove fires on every touchmove, so that's every render during a
  // drag) doesn't force this effect to tear down and reattach its native
  // listeners mid-gesture.
  const callbacksRef = useRef({})
  callbacksRef.current = { onDragStart, onDragMove, onDragEnd, onBack }

  useEffect(() => {
    if (!el || disabled) return

    function onTouchStart(e) {
      const t = e.touches[0]
      if (!t) return
      if (t.clientX > EDGE_ZONE_PX) return
      stateRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        lastX: t.clientX,
        lastT: e.timeStamp,
        velocity: 0,
        dragging: false,
        touchId: t.identifier,
      }
    }

    function onTouchMove(e) {
      const s = stateRef.current
      if (!s) return
      const t = [...e.touches].find((touch) => touch.identifier === s.touchId)
      if (!t) return

      const dx = t.clientX - s.startX
      const dy = t.clientY - s.startY

      if (!s.dragging) {
        // Only commit to the gesture once horizontal intent is clear —
        // otherwise a vertical scroll started near the edge would get
        // hijacked into a horizontal drag.
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
        if (Math.abs(dy) > Math.abs(dx)) {
          stateRef.current = null
          return
        }
        s.dragging = true
        callbacksRef.current.onDragStart?.()
      }

      if (dx < 0) return

      const dt = e.timeStamp - s.lastT
      if (dt > 0) s.velocity = (t.clientX - s.lastX) / dt
      s.lastX = t.clientX
      s.lastT = e.timeStamp

      callbacksRef.current.onDragMove?.(dx)
    }

    function finish(e) {
      const s = stateRef.current
      if (!s) return
      stateRef.current = null
      if (!s.dragging) return

      const dx = Math.max(0, s.lastX - s.startX)
      const width = el.offsetWidth || window.innerWidth
      const shouldCommit = dx / width > COMMIT_RATIO || s.velocity > VELOCITY_THRESHOLD

      callbacksRef.current.onDragEnd?.(shouldCommit)
      if (shouldCommit) callbacksRef.current.onBack?.()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', finish, { passive: true })
    el.addEventListener('touchcancel', finish, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', finish)
      el.removeEventListener('touchcancel', finish)
    }
  }, [el, disabled])

  const elRef = useCallback((node) => setEl(node), [])

  return elRef
}

export default useSwipeBackGesture
