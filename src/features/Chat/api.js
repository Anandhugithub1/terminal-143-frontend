import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { chatApi } from '../../api/clients'
import { getCurrentUsername } from '../../shared/utils/getCurrentUsername'
import { uploadToS3 } from '../../shared/utils/uploadToS3'

// Server-authoritative per-conversation summary: unread count + last message.
// Computed on the backend (ULID key-range count, no per-message counter), so it
// survives reload / new device / being offline, unlike the socket-only local
// tally. Shape: { total, conversations: { <otherUsername>: { unreadCount,
// lastMessage, lastMessageAt } } }, keyed by the other user's username (= the
// value the app treats as matchId).
export async function fetchUnreadCounts() {
  const res = await chatApi.get('/unread', { withCredentials: true })
  return {
    total: res.data?.total || 0,
    conversations: res.data?.conversations || {},
  }
}

export function useUnreadCounts() {
  return useQuery({
    queryKey: ['chatUnreadCounts'],
    queryFn: fetchUnreadCounts,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: { total: 0, conversations: {} },
  })
}

// One page of message history for a conversation. `matchId` here is the
// other user's username (see useMatches() — each match row's PK is their
// username), which is what chat-service's
// /chat/conversations/{otherUserId}/messages expects.
//
// `pageParam` is the backend's opaque lastKey cursor (already
// URI-encoded — see getConversationHistory.js) for the page OLDER than
// whatever's already loaded; omitted for the first page, which is the most
// recent messages. Each page comes back oldest-first internally.
async function fetchConversationHistoryPage(matchId, pageParam) {
  const res = await chatApi.get(`/conversations/${matchId}/messages`, {
    params: pageParam ? { lastKey: pageParam } : undefined,
    withCredentials: true,
  })
  const myUsername = getCurrentUsername()

  return {
    messages: (res.data?.messages || []).map((msg) => ({
      id: msg.messageId,
      text: msg.content,
      sentAt: msg.sentAt,
      mine: msg.senderId === myUsername,
    })),
    lastKey: res.data?.lastKey || null,
    blockedByMe: !!res.data?.blockedByMe,
    blockedByOther: !!res.data?.blockedByOther,
  }
}

// Paginated message history: the first page is the most recent messages,
// and fetchNextPage() loads the next OLDER page via the backend's lastKey
// cursor (chat-service defaults to 20 messages/page — see
// messageService.listMessages). Older pages must be flattened BEFORE newer
// ones (React Query's own `pages` array is newest-page-first, since that's
// fetch order) so the combined list still reads oldest-to-newest top to
// bottom, matching how each individual page is already ordered.
export function useConversationHistory(matchId) {
  const query = useInfiniteQuery({
    queryKey: ['chatHistory', matchId],
    queryFn: ({ pageParam }) => fetchConversationHistoryPage(matchId, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastKey,
    enabled: !!matchId,
    retry: 1,
    staleTime: 60 * 1000,
  })

  const data = useMemo(() => {
    const pages = query.data?.pages ?? []
    const latestPage = pages[0]
    return {
      messages: [...pages].reverse().flatMap((page) => page.messages),
      blockedByMe: !!latestPage?.blockedByMe,
      blockedByOther: !!latestPage?.blockedByOther,
    }
  }, [query.data])

  return { ...query, data }
}

// Support chat is standalone REST, not realtime (no WebSocket path — see
// chat-service's supportChat.js) — a poll-based history fetch plus a plain
// POST to send, instead of useConversationHistory/the socket send path.
const SUPPORT_POLL_MS = 8000

export async function fetchSupportHistory() {
  // Reuses the same cookie-authed history endpoint as a 1:1 conversation
  // (getConversationHistory.js), just with the reserved SUPPORT id as the
  // "other user" — that handler already special-cases SUPPORT (skips the
  // soft-delete check, since it isn't a real profile).
  const res = await chatApi.get('/conversations/SUPPORT/messages', {
    withCredentials: true,
  })
  const myUsername = getCurrentUsername()
  return (res.data?.messages || []).map((msg) => ({
    id: msg.messageId,
    text: msg.content,
    imageUrl: msg.imageUrl || null,
    sentAt: msg.sentAt,
    mine: msg.senderId === myUsername,
  }))
}

export function useSupportHistory() {
  return useQuery({
    queryKey: ['supportChatHistory'],
    queryFn: fetchSupportHistory,
    refetchInterval: SUPPORT_POLL_MS,
    staleTime: 0,
  })
}

export function useSendSupportMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ content, imageUrl }) => {
      const res = await chatApi.post(
        '/support/messages',
        { content, imageUrl },
        { withCredentials: true }
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportChatHistory'] })
      queryClient.invalidateQueries({ queryKey: ['chatUnreadCounts'] })
    },
  })
}

// Requests a presigned S3 PUT url for a support-chat photo attachment
// (issueSupportUploadUrl.js — user-side only, staff replies stay text-only),
// then uploads the file directly to S3, mirroring CreatePostModal's
// getPresignedUrl -> uploadToS3 flow for circle post media.
export async function uploadSupportImage(file, options) {
  const res = await chatApi.post(
    '/support/upload-url',
    { fileType: file.type, fileSize: file.size },
    { withCredentials: true }
  )
  const { presignedUrl, publicUrl } = res.data
  await uploadToS3(presignedUrl, file, options)
  return publicUrl
}

// REST equivalent of the WebSocket readReceipt action, for the support
// thread's poll-based (non-realtime) flow — see markSupportRead.js.
export function useMarkSupportRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (messageId) => {
      const res = await chatApi.post(
        '/support/read',
        { messageId },
        { withCredentials: true }
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatUnreadCounts'] })
    },
  })
}

export function useBlockUser(matchId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await chatApi.post(
        '/block',
        { otherUserId: matchId },
        { withCredentials: true }
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', matchId] })
    },
  })
}

export function useUnblockUser(matchId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await chatApi.post(
        '/unblock',
        { otherUserId: matchId },
        { withCredentials: true }
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', matchId] })
    },
  })
}

// "Delete for me" only — hides the message from this device/account, the
// other party still sees it. Removes it from the cached history immediately
// (no refetch needed to see the effect) rather than invalidating, since a
// deleted message never comes back from the server for this viewer anyway.
export function useDeleteMessage(matchId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId) => {
      const res = await chatApi.delete(
        `/conversations/${matchId}/messages/${messageId}`,
        { withCredentials: true }
      )
      return res.data
    },
    onSuccess: (_data, messageId) => {
      // ['chatHistory', matchId] is an infinite-query cache: { pages, pageParams }
      // — the deleted message could be on any page, not just the newest.
      queryClient.setQueryData(['chatHistory', matchId], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.filter((msg) => msg.id !== messageId),
          })),
        }
      })
    },
  })
}

// Both the preview list and the open conversation need to interpret the
// same incoming socket payload the same way — keep it in one place so a
// backend field-name change only needs updating here.
//
// chat-service (sendMessage.js) only ever pushes MESSAGE events to the
// recipient's own connections, so payload.senderId is always "the other
// user" from this client's point of view — that's what the rest of the
// app calls matchId (see useMatches(): each match row's PK is the other
// user's username).
export function normalizeIncomingMessage(payload) {
  if (payload.type !== 'MESSAGE') return null
  const matchId = payload.senderId
  if (!matchId) return null
  return {
    matchId,
    id: payload.messageId || `${Date.now()}-${Math.random()}`,
    text: payload.content ?? '',
    sentAt: payload.sentAt || new Date().toISOString(),
  }
}
