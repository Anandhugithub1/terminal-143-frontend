import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket, useSocketEvent } from '../../../shared/socket/useSocket'
import { appendToCircleHistoryCache, normalizeIncomingCircleMessage, useCircleUnreadCounts } from '../api/circleChatApi'

const STORAGE_KEY = 'chat.circleChatPreviews'

// Mirrors Chat/hooks/useConversationPreviews.js's module-level singleton
// store, so the Circles-home badge, the Chats-list section, and an open
// CircleChatPage all share one source of truth instead of racing on the
// same localStorage key. Deliberately does NOT carry presence/online (no
// per-user online concept for a circle) or block state (circles have no
// block relationship) — those are 1:1-only.
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

let previews = loadPreviews()
const subscribers = new Set()

function setPreviews(updater) {
  previews = typeof updater === 'function' ? updater(previews) : updater
  savePreviews(previews)
  subscribers.forEach((fn) => fn(previews))
}

function updateCircle(circleId, patch) {
  setPreviews((prev) => ({
    ...prev,
    [circleId]: { ...prev[circleId], ...patch(prev[circleId]) },
  }))
}

// Same conflict-resolution rule as useConversationPreviews.hydrateFromServer:
// a live CIRCLE_MESSAGE bumps unreadCount locally the instant it arrives;
// only trust the server's count once a fetch was ISSUED after that local
// bump, so an in-flight /chat/circles/unread response computed before the
// message existed can't silently revert the badge.
function hydrateFromServer(circles, requestedAt) {
  setPreviews((prev) => {
    const next = { ...prev }
    const seen = new Set()

    const canTrustServerUnread = (circleId) => {
      const bumpedAt = next[circleId]?.unreadBumpedAt || 0
      return !bumpedAt || requestedAt >= bumpedAt
    }

    for (const [circleId, info] of Object.entries(circles || {})) {
      const trustServerUnread = canTrustServerUnread(circleId)
      next[circleId] = {
        ...next[circleId],
        ...(trustServerUnread && { unreadCount: info.unreadCount || 0, unreadBumpedAt: 0 }),
        // Server is authoritative for the on/off toggle — an owner/admin may
        // have flipped it from a different device/session.
        chatEnabled: info.chatEnabled !== false,
        // Distinguishes "chat enabled, nobody's messaged yet" from "no data
        // at all" (a circle this hook has never heard about) — the ring
        // badge needs this to show a neutral "chat available" outline
        // instead of nothing. A live CIRCLE_MESSAGE flips this true locally
        // before the server would even know (see the socket handler below).
        hasMessages: info.hasMessages || !!next[circleId]?.hasMessages,
        ...(shouldTakeServerLastMessage(next[circleId], info) && {
          lastMessage: info.lastMessage,
          lastMessageAt: info.lastMessageAt,
          lastMessageMine: false,
        }),
      }
      seen.add(circleId)
    }
    for (const circleId of Object.keys(next)) {
      if (!seen.has(circleId) && next[circleId]?.unreadCount && canTrustServerUnread(circleId)) {
        next[circleId] = { ...next[circleId], unreadCount: 0, unreadBumpedAt: 0 }
      }
    }
    return next
  })
}

function shouldTakeServerLastMessage(local, server) {
  if (!server?.lastMessageAt) return false
  if (!local?.lastMessageAt) return true
  return new Date(server.lastMessageAt) > new Date(local.lastMessageAt)
}

export function useCircleChatPreviews() {
  const [state, setState] = useState(previews)
  const { data: unread, dataUpdatedAt } = useCircleUnreadCounts()
  const queryClient = useQueryClient()

  // useSocketEvent only subscribes, never acquires — hold the socket open
  // for as long as anything shows circle previews, same reasoning as
  // useConversationPreviews's identical call.
  useSocket()

  useEffect(() => {
    if (unread?.circles) hydrateFromServer(unread.circles, dataUpdatedAt)
  }, [unread, dataUpdatedAt])

  useEffect(() => {
    const onChange = (rawPreviews) => setState(rawPreviews)
    subscribers.add(onChange)
    return () => subscribers.delete(onChange)
  }, [])

  useSocketEvent('CIRCLE_MESSAGE', (payload) => {
    const msg = normalizeIncomingCircleMessage(payload)
    if (!msg) return
    updateCircle(msg.circleId, (prev) => ({
      lastMessage: msg.text,
      lastMessageAt: msg.sentAt,
      lastMessageMine: false,
      hasMessages: true,
      unreadCount: (prev?.unreadCount || 0) + 1,
      unreadBumpedAt: Date.now(),
    }))

    // CircleChatPage keeps its own CIRCLE_MESSAGE listener, but it's only
    // mounted while that specific circle's thread is open — patch the
    // history cache here too so a message arriving while browsing
    // elsewhere isn't missing until staleTime elapses (no-op if this
    // circle's history was never fetched this session).
    appendToCircleHistoryCache(queryClient, msg.circleId, { id: msg.id, text: msg.text, senderId: msg.senderId, sentAt: msg.sentAt, mine: false })
  })

  const markRead = useCallback((circleId) => {
    if (!previews[circleId]?.unreadCount) return
    updateCircle(circleId, () => ({ unreadCount: 0, unreadBumpedAt: 0 }))
  }, [])

  const recordSentMessage = useCallback((circleId, text) => {
    updateCircle(circleId, () => ({
      lastMessage: text,
      lastMessageAt: new Date().toISOString(),
      lastMessageMine: true,
      hasMessages: true,
    }))
  }, [])

  return { previews: state, markRead, recordSentMessage }
}
