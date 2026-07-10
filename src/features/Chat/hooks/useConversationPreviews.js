import { useCallback, useEffect, useState } from 'react'
import { useSocketEvent } from '../../../shared/socket/useSocket'
import { normalizeIncomingMessage } from '../api'

const STORAGE_KEY = 'chat.conversationPreviews'

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

// Tracks last-message/unread-count/online state per matchId, keyed off
// socket events, and persists it locally since the backend doesn't yet
// expose a conversations-list endpoint with this data baked in.
export function useConversationPreviews() {
  const [state, setState] = useState(previews)

  useEffect(() => {
    subscribers.add(setState)
    return () => subscribers.delete(setState)
  }, [])

  useSocketEvent('newMessage', (payload) => {
    const msg = normalizeIncomingMessage(payload)
    if (!msg) return
    updateMatch(msg.matchId, (prev) => ({
      lastMessage: msg.text,
      lastMessageAt: msg.sentAt,
      lastMessageMine: false,
      unreadCount: (prev?.unreadCount || 0) + 1,
    }))
  })

  useSocketEvent('presence', (payload) => {
    const matchId = payload.matchId || payload.userId
    if (!matchId) return
    updateMatch(matchId, () => ({ online: !!payload.online }))
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
