import { useQuery } from '@tanstack/react-query'
import { chatApi } from '../../api/clients'

// Message history for a conversation. Backend contract not finalized yet —
// on failure we fall back to an empty history so the socket-driven live
// messages still work standalone.
async function fetchConversationHistory(matchId) {
  const res = await chatApi.get(`/conversations/${matchId}/messages`, {
    withCredentials: true,
  })
  return res.data?.messages || []
}

export function useConversationHistory(matchId) {
  return useQuery({
    queryKey: ['chatHistory', matchId],
    queryFn: () => fetchConversationHistory(matchId),
    enabled: !!matchId,
    retry: 1,
    staleTime: 60 * 1000,
    placeholderData: [],
  })
}

// Both the preview list and the open conversation need to interpret the
// same "newMessage" socket payload the same way — keep it in one place so
// a backend field-name change only needs updating here.
export function normalizeIncomingMessage(payload) {
  const matchId = payload.matchId || payload.senderId
  if (!matchId) return null
  return {
    matchId,
    id: payload.id || `${Date.now()}-${Math.random()}`,
    text: payload.text ?? payload.message ?? '',
    sentAt: payload.sentAt || new Date().toISOString(),
  }
}
