import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
// These endpoints are hosted by chat-service (path prefix /chat/circles/...),
// not circle-service — reuse chatApi (base https://.../chat), NOT this
// feature's own axios.js (base https://.../circles, a different backend).
import { chatApi } from '../../../api/clients'
import { getCurrentUsername } from '../../../shared/utils/getCurrentUsername'
import { queryKeys } from '../queries/queryKeys'

// Mirrors Chat/api.js's fetchUnreadCounts, keyed by circleId instead of the
// other user's username. Shape: { total, circles: { <circleId>: {
// unreadCount, lastMessage, lastMessageAt, chatEnabled, hasMessages } } }.
// Every active-membership circle is included, even ones with zero messages
// — hasMessages: false there, distinct from a circleId this response never
// mentions at all (not a member / never loaded).
export async function fetchCircleUnreadCounts() {
  const res = await chatApi.get('/circles/unread', { withCredentials: true })
  return {
    total: res.data?.total || 0,
    circles: res.data?.circles || {},
  }
}

export function useCircleUnreadCounts() {
  return useQuery({
    queryKey: queryKeys.circleChatUnread,
    queryFn: fetchCircleUnreadCounts,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: { total: 0, circles: {} },
  })
}

// One page of a circle's message history. Same pagination shape as 1:1
// (see Chat/api.js's fetchConversationHistoryPage) — pageParam is the
// backend's opaque lastKey cursor, first page omits it.
async function fetchCircleHistoryPage(circleId, pageParam) {
  const res = await chatApi.get(`/circles/${circleId}/messages`, {
    params: pageParam ? { lastKey: pageParam } : undefined,
    withCredentials: true,
  })
  const myUsername = getCurrentUsername()

  return {
    messages: (res.data?.messages || []).map((msg) => ({
      id: msg.messageId,
      text: msg.content,
      senderId: msg.senderId,
      sentAt: msg.sentAt,
      mine: msg.senderId === myUsername,
    })),
    lastKey: res.data?.lastKey || null,
  }
}

// Paginated circle message history — same "reverse pages, flatten" shape as
// useConversationHistory: pages come back newest-page-first, each page's
// messages already oldest-first internally.
export function useCircleChatHistory(circleId) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.circleChatHistory(circleId),
    queryFn: ({ pageParam }) => fetchCircleHistoryPage(circleId, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastKey,
    enabled: !!circleId,
    retry: 1,
    staleTime: 60 * 1000,
  })

  const data = useMemo(() => {
    const pages = query.data?.pages ?? []
    return {
      messages: [...pages].reverse().flatMap((page) => page.messages),
    }
  }, [query.data])

  return { ...query, data }
}

// Resolves the circle's active members to display identity (name,
// avatarUrl) for the chat thread's sender labels/avatars — see
// getCircleMembers.js. Caller must be an active member themselves.
// Long staleTime: membership/profile identity rarely changes mid-session,
// and this is fetched once per circle-chat visit, not per message.
async function fetchCircleMembers(circleId) {
  const res = await chatApi.get(`/circles/${circleId}/members`, { withCredentials: true })
  return res.data?.members || []
}

export function useCircleMembers(circleId) {
  const query = useQuery({
    queryKey: queryKeys.circleMembers(circleId),
    queryFn: () => fetchCircleMembers(circleId),
    enabled: !!circleId,
    staleTime: 5 * 60 * 1000,
  })

  // A Map keyed by userId is what the thread actually wants per bubble —
  // built once per fetch rather than .find()-ing the array on every render.
  const byUserId = useMemo(() => {
    const map = new Map()
    for (const m of query.data || []) map.set(m.userId, m)
    return map
  }, [query.data])

  return { ...query, byUserId }
}

// Admin/owner-only toggle — see setCircleChatEnabled.js. 403s server-side for
// a plain member; the UI should only ever show this control to owner/admin.
export function useSetCircleChatEnabled(circleId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enabled) => {
      const res = await chatApi.post(
        `/circles/${circleId}/chat-enabled`,
        { enabled },
        { withCredentials: true }
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.circleChatUnread })
    },
  })
}

// Same role as Chat/api.js's normalizeIncomingMessage — one place to
// interpret the CIRCLE_MESSAGE socket payload shape so a backend field
// change only needs updating here.
export function normalizeIncomingCircleMessage(payload) {
  if (payload.type !== 'CIRCLE_MESSAGE') return null
  const { circleId } = payload
  if (!circleId) return null
  return {
    circleId,
    id: payload.messageId || `${Date.now()}-${Math.random()}`,
    text: payload.content ?? '',
    senderId: payload.senderId,
    sentAt: payload.sentAt || new Date().toISOString(),
  }
}

// Mirrors appendToHistoryCache, patching the circle chat infinite-query
// cache instead. Same insert-sorted-into-pages[0], no-op-if-cache-absent-or-
// duplicate behavior.
export function appendToCircleHistoryCache(queryClient, circleId, message) {
  queryClient.setQueryData(queryKeys.circleChatHistory(circleId), (old) => {
    if (!old?.pages?.length) return old
    const newestPage = old.pages[0]
    if (newestPage.messages.some((m) => m.id === message.id)) return old
    const messages = [...newestPage.messages, message].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    )
    return {
      ...old,
      pages: [{ ...newestPage, messages }, ...old.pages.slice(1)],
    }
  })
}
