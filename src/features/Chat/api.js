import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../../api/clients'
import { getCurrentUsername } from '../../shared/utils/getCurrentUsername'

// Message history for a conversation. `matchId` here is the other user's
// username (see useMatches() — each match row's PK is their username), which
// is what chat-service's /chat/conversations/{otherUserId}/messages expects.
async function fetchConversationHistory(matchId) {
  const res = await chatApi.get(`/conversations/${matchId}/messages`, {
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
    blockedByMe: !!res.data?.blockedByMe,
    blockedByOther: !!res.data?.blockedByOther,
  }
}

export function useConversationHistory(matchId) {
  return useQuery({
    queryKey: ['chatHistory', matchId],
    queryFn: () => fetchConversationHistory(matchId),
    enabled: !!matchId,
    retry: 1,
    staleTime: 60 * 1000,
    placeholderData: { messages: [], blockedByMe: false, blockedByOther: false },
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
