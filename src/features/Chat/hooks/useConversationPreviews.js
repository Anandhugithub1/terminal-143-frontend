import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket, useSocketEvent } from '../../../shared/socket/useSocket'
import { normalizeIncomingMessage, useUnreadCounts } from '../api'

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
// Seed previews from the server-authoritative source (fetchUnreadCounts):
// unread count AND lastMessage/lastMessageAt. This makes the chat list
// recognise active conversations from the server — not just local state — so a
// conversation shows up after a reload / on a new device even if localStorage
// has no record of it. Live socket events layer on top while the app is open.
// `requestedAt` is stamped right before the /chat/unread fetch fires — it's
// what proves the server's count reflects a snapshot no older than "now".
// See the comment below for why that's needed to safely apply it.
function hydrateFromServer(conversations, requestedAt) {
  setPreviews((prev) => {
    const next = { ...prev }
    const seen = new Set()

    // A live MESSAGE event bumps unreadCount locally (and stamps
    // unreadBumpedAt) the instant it arrives. A server count fetched around
    // the same time may have been computed by a query that ran BEFORE that
    // message became countable — applying it unconditionally would silently
    // revert the badge. Only trust the server's unreadCount for a
    // conversation once a fetch was *issued* after the local bump; that
    // fetch's result is guaranteed to reflect a state at least that fresh.
    const canTrustServerUnread = (matchId) => {
      const bumpedAt = next[matchId]?.unreadBumpedAt || 0
      return !bumpedAt || requestedAt >= bumpedAt
    }

    for (const [matchId, info] of Object.entries(conversations || {})) {
      const trustServerUnread = canTrustServerUnread(matchId)
      next[matchId] = {
        ...next[matchId],
        ...(trustServerUnread && { unreadCount: info.unreadCount || 0, unreadBumpedAt: 0 }),
        // Server is authoritative for block state — it knows about blocks made
        // on another device, and about threads this client has never opened.
        blockedByMe: !!info.blockedByMe,
        blockedByOther: !!info.blockedByOther,
        // Only fill lastMessage/At from the server when we don't already have a
        // fresher local one (local may hold a just-sent message not yet in the
        // server summary). Prefer the newer timestamp.
        ...(shouldTakeServerLastMessage(next[matchId], info) && {
          lastMessage: info.lastMessage,
          lastMessageAt: info.lastMessageAt,
          lastMessageMine: false,
        }),
      }
      seen.add(matchId)
    }
    // Conversations the server didn't report have no unread — unless a local
    // bump happened after this fetch was issued, same rule as above.
    for (const matchId of Object.keys(next)) {
      if (!seen.has(matchId) && next[matchId]?.unreadCount && canTrustServerUnread(matchId)) {
        next[matchId] = { ...next[matchId], unreadCount: 0, unreadBumpedAt: 0 }
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

export function useConversationPreviews() {
  const [state, setState] = useState(() => withDerivedOnline(previews))
  const { data: unread, dataUpdatedAt } = useUnreadCounts()
  const queryClient = useQueryClient()

  // Hold the socket open for as long as anything shows previews. useSocketEvent
  // only subscribes — it never acquires — so without this the chat list has no
  // connection at all (the socket is ref-counted and closes at zero), and MESSAGE
  // never arrives: no live last-message, no unread badge, until a refetch.
  useSocket()

  // Hydrate from the server whenever fresh data arrives (load / refocus).
  // dataUpdatedAt (when the RESPONSE was received) is a safe, conservative
  // stand-in for "server snapshot no older than" — the actual DynamoDB query
  // ran strictly before this, so it's never later than the true request time.
  useEffect(() => {
    if (unread?.conversations) hydrateFromServer(unread.conversations, dataUpdatedAt)
  }, [unread, dataUpdatedAt])

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
      // See hydrateFromServer: marks this bump as newer than any /chat/unread
      // fetch already in flight, so that response can't revert it.
      unreadBumpedAt: Date.now(),
    }))

    // ChatConversationPage keeps its own MESSAGE listener, but it's only
    // mounted while that specific conversation is open — a message arriving
    // while sitting on the list page never reaches it, so the cache below
    // goes stale and the conversation opens without its newest message
    // until staleTime (60s) elapses. Patch it here too, whenever a
    // ['chatHistory', matchId] entry already exists (nothing to patch if
    // the user has never opened this conversation this session — it'll
    // fetch fresh on first open anyway).
    //
    // ['chatHistory', matchId] is an infinite-query cache: { pages, pageParams }.
    // pages[0] is always the NEWEST page (the first one fetched) — a live
    // message belongs there, never on an older page appended later via
    // fetchNextPage().
    queryClient.setQueryData(['chatHistory', msg.matchId], (old) => {
      if (!old?.pages?.length) return old
      const newestPage = old.pages[0]
      if (newestPage.messages.some((m) => m.id === msg.id)) return old
      return {
        ...old,
        pages: [
          { ...newestPage, messages: [...newestPage.messages, { id: msg.id, text: msg.text, sentAt: msg.sentAt, mine: false }] },
          ...old.pages.slice(1),
        ],
      }
    })
  })

  useSocketEvent('PRESENCE', (payload) => {
    const matchId = payload.userId
    if (!matchId || !payload.online) return
    updateMatch(matchId, () => ({ lastSeenAt: Date.now() }))
  })

  const markRead = useCallback((matchId) => {
    if (!previews[matchId]?.unreadCount) return
    updateMatch(matchId, () => ({ unreadCount: 0, unreadBumpedAt: 0 }))
  }, [])

  const recordSentMessage = useCallback((matchId, text) => {
    updateMatch(matchId, () => ({
      lastMessage: text,
      lastMessageAt: new Date().toISOString(),
      lastMessageMine: true,
    }))
  }, [])

  // Blocked conversations are hidden from the chat list (standard pattern —
  // see ChatListPage). Only tracks blockedByMe, since that's the case a
  // client can act on immediately; if the other side blocked you instead,
  // the list catches up next time this conversation is opened/refetched.
  const setBlockedByMe = useCallback((matchId, blocked) => {
    updateMatch(matchId, () => ({ blockedByMe: blocked }))
  }, [])

  return { previews: state, markRead, recordSentMessage, setBlockedByMe }
}
