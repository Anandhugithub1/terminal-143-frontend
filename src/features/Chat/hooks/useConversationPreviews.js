import { useCallback, useEffect, useState } from 'react'
import { useSocketEvent } from '../../../shared/socket/useSocket'
import { normalizeIncomingMessage } from '../api'

const STORAGE_KEY = 'chat.conversationPreviews'

// chat-service has no $disconnect signal reliable enough to broadcast
// "offline" (API Gateway doesn't resend connect-time query params to it),
// so presence is re-broadcast as "online" on every heartbeat (~30s) instead.
// A match is considered online if we've heard from them more recently than
// this window; STALE_CHECK_INTERVAL_MS re-evaluates that on a timer so the
// UI flips to offline on its own once the window elapses, without a new event.
const PRESENCE_STALE_MS = 90 * 1000
const STALE_CHECK_INTERVAL_MS = 15 * 1000

function loadPreviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function savePreviews(previews) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(previews))
  } catch {
    // storage unavailable — previews just won't persist across reloads
  }
}

// Module-level store (mirrors the socketManager singleton pattern) so that
// ChatListPage and ChatConversationPage — mounted independently — share one
// source of truth instead of racing to write the same localStorage key.
let previews = loadPreviews()
const subscribers = new Set()

function setPreviews(updater) {
  previews = typeof updater === 'function' ? updater(previews) : updater
  savePreviews(previews)
  subscribers.forEach((fn) => fn(previews))
}

function updateMatch(matchId, patch) {
  setPreviews((prev) => ({
    ...prev,
    [matchId]: { ...prev[matchId], ...patch(prev[matchId]) },
  }))
}

function isOnline(preview) {
  return !!preview?.lastSeenAt && Date.now() - preview.lastSeenAt < PRESENCE_STALE_MS
}

// previews.online is derived at read time (never trust a stored boolean —
// it goes stale the moment heartbeats stop), so every subscriber sees a
// consistent, non-stale view instead of each recomputing it separately.
function withDerivedOnline(rawPreviews) {
  const result = {}
  for (const [matchId, preview] of Object.entries(rawPreviews)) {
    result[matchId] = { ...preview, online: isOnline(preview) }
  }
  return result
}

// Tracks last-message/unread-count/online state per matchId, keyed off
// socket events, and persists it locally since the backend doesn't yet
// expose a conversations-list endpoint with this data baked in.
export function useConversationPreviews() {
  const [state, setState] = useState(() => withDerivedOnline(previews))

  useEffect(() => {
    const onRawChange = (rawPreviews) => setState(withDerivedOnline(rawPreviews))
    subscribers.add(onRawChange)

    // Re-derive on a timer too, independent of any event, so a match flips
    // to offline once PRESENCE_STALE_MS elapses even if nothing else changes.
    const interval = setInterval(() => setState(withDerivedOnline(previews)), STALE_CHECK_INTERVAL_MS)

    return () => {
      subscribers.delete(onRawChange)
      clearInterval(interval)
    }
  }, [])

  useSocketEvent('MESSAGE', (payload) => {
    const msg = normalizeIncomingMessage(payload)
    if (!msg) return
    updateMatch(msg.matchId, (prev) => ({
      lastMessage: msg.text,
      lastMessageAt: msg.sentAt,
      lastMessageMine: false,
      unreadCount: (prev?.unreadCount || 0) + 1,
    }))
  })

  useSocketEvent('PRESENCE', (payload) => {
    const matchId = payload.userId
    if (!matchId || !payload.online) return
    updateMatch(matchId, () => ({ lastSeenAt: Date.now() }))
  })

  const markRead = useCallback((matchId) => {
    if (!previews[matchId]?.unreadCount) return
    updateMatch(matchId, () => ({ unreadCount: 0 }))
  }, [])

  const recordSentMessage = useCallback((matchId, text) => {
    updateMatch(matchId, () => ({
      lastMessage: text,
      lastMessageAt: new Date().toISOString(),
      lastMessageMine: true,
    }))
  }, [])

  return { previews: state, markRead, recordSentMessage }
}
