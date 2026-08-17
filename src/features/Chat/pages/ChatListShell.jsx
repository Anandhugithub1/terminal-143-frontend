import { useMatch } from 'react-router-dom'
import PeekShell from '../../../shared/components/PeekShell'

// Keeps ChatListPage mounted underneath every one of its nested chat-style
// routes (a direct-message thread, a circle chat, and the support
// thread — see AppFeatureRoutes) so the edge-swipe-back gesture on any of
// them reveals the real, already-rendered chat list sliding in from
// behind.
export default function ChatListShell({ children }) {
  const isConversationOpen = !!useMatch('/matches/:matchId/chat')
  const isCircleChatOpen = !!useMatch('/matches/circles/:circleId/chat')
  const isSupportOpen = !!useMatch('/matches/support/chat')

  return (
    <PeekShell isChildOpen={isConversationOpen || isCircleChatOpen || isSupportOpen} backTo="/matches">
      {children}
    </PeekShell>
  )
}
