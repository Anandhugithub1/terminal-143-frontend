import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSwipeBackGesture } from '../hooks/useSwipeBackGesture'

const OPEN_CLOSE_TRANSITION = 'transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1)'
const SPRING_BACK_TRANSITION = 'transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1)'

// Generic version of the chat-list peek shell: keeps `children` (the parent
// page — a list, a home screen) mounted underneath a nested child route, so
// swiping back on the child route reveals the real, already-rendered parent
// sliding in from behind — a Telegram-style peek — instead of sliding the
// child away over blank space and only then navigating.
//
// `isChildOpen` tells this shell whether ANY of its nested child routes is
// currently active (pass the OR of each child's useMatch), since a parent
// route can have more than one child (e.g. matches/:matchId/chat AND
// matches/support/chat both nest under the chat list).
//
// `backTo` is the path a completed swipe navigates to. Deliberately NOT
// navigate(-1): the panel that was just dragged away always reveals THIS
// shell's own children underneath (that's what makes the peek real), so
// landing anywhere else on release — which real browser-history back can
// do, e.g. a circle chat opened from Circles home instead of from here —
// would show one screen mid-drag and then jump to a different one the
// instant you let go.
export default function PeekShell({ children, isChildOpen, backTo }) {
  const navigate = useNavigate()

  // The child route unmounts the instant the URL changes back to the parent
  // (react-router swaps the Outlet immediately) — but the slide-closed
  // animation still needs the panel in the DOM for its final stretch. This
  // keeps it rendered a beat past that URL change; the panel un-mounts for
  // real once the close transition finishes.
  const [showPanel, setShowPanel] = useState(isChildOpen)
  // Live drag offset in px while the user's finger is down (0 when not
  // dragging). Kept separate from the open/close transform so dragging can
  // render with no transition (1:1 tracking) while route-driven open/close
  // keeps its eased animation.
  const [dragX, setDragX] = useState(0)
  const [transition, setTransition] = useState(OPEN_CLOSE_TRANSITION)
  const panelRef = useRef(null)
  const widthRef = useRef(0)

  useEffect(() => {
    if (isChildOpen) {
      setShowPanel(true)
      setTransition(OPEN_CLOSE_TRANSITION)
      setDragX(0)
      return
    }
    const el = panelRef.current
    if (!el) {
      setShowPanel(false)
      return
    }
    setTransition(OPEN_CLOSE_TRANSITION)
    const onEnd = () => setShowPanel(false)
    el.addEventListener('transitionend', onEnd)
    return () => el.removeEventListener('transitionend', onEnd)
  }, [isChildOpen])

  const swipeBackRef = useSwipeBackGesture({
    disabled: !isChildOpen,
    onDragStart() {
      widthRef.current = panelRef.current?.offsetWidth || window.innerWidth
      setTransition('none')
    },
    onDragMove(dx) {
      setDragX(dx)
    },
    onDragEnd(committed) {
      setTransition(SPRING_BACK_TRANSITION)
      setDragX(committed ? widthRef.current : 0)
    },
    onBack() {
      navigate(backTo)
    },
  })

  const setPanelRef = useCallback(
    (node) => {
      panelRef.current = node
      swipeBackRef(node)
    },
    [swipeBackRef]
  )

  // Route-driven state (isChildOpen) picks the resting position; dragX
  // offsets from there while a gesture is in progress. Once the route
  // actually changes, isChildOpen flips to false, which also makes dragX's
  // contribution moot going forward.
  const baseX = isChildOpen ? 0 : (widthRef.current || window.innerWidth)
  const x = isChildOpen ? dragX : baseX

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      {/* The parent page is always mounted — this is what makes the swipe a
          real reveal instead of a slide-to-blank. Scrolls internally
          (rather than the outer div clipping it) so parent content taller
          than the viewport — e.g. an expanded circle-chats list — stays
          reachable instead of being cut off by the peek shell's fixed
          height. */}
      <div className="h-full overflow-y-auto overflow-x-hidden">{children}</div>

      {showPanel && (
        <div
          ref={setPanelRef}
          className="absolute inset-0 z-[60] bg-gray-50 shadow-2xl"
          style={{
            transition,
            transform: `translate3d(${x}px, 0, 0)`,
            // Without this, a touchstart near the left edge is ambiguous
            // between "vertical scroll" and "horizontal swipe-back" to the
            // browser's compositor, which resolves that ambiguity itself
            // before JS sees more than one pointermove — on a real
            // touchscreen that means the native scroll wins and pointer
            // handlers never get a usable drag sequence. This leaves
            // vertical panning to the browser but reserves horizontal
            // movement for JS.
            touchAction: 'pan-y',
          }}
        >
          <Outlet />
        </div>
      )}
    </div>
  )
}
