import { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useMatches, SendProfileFeeback } from '../../UserHome/api'
import { useSocket } from '../../../shared/socket/useSocket'
import { useConversationPreviews } from '../hooks/useConversationPreviews'
import PageLayout from '../../../shared/components/PageLayout'
import EmptyState from '../../../shared/components/EmptyState'
import MatchRow from '../components/MatchRow'
import NewMatchesStrip from '../components/NewMatchesStrip'

export default function ChatListPage() {
  const { data: matches = [], isLoading, isError } = useMatches()
  const { isConnected } = useSocket()
  const { previews } = useConversationPreviews()
  const { mutate: sendFeedback } = SendProfileFeeback()

  const [sentFeedback, setSentFeedback] = useState({})
  const [loadingUser, setLoadingUser] = useState(null)
  const navigate = useNavigate()

  function handleFeedback(username, liked) {
    if (loadingUser) return
    setLoadingUser(username)
    sendFeedback(
      { targetUsername: username, liked },
      {
        onSuccess: () => {
          setSentFeedback((prev) => ({
            ...prev,
            [username]: liked ? 'liked' : 'disliked',
          }))
        },
        onSettled: () => setLoadingUser(null),
      }
    )
  }

  const goToProfile = (link) => {
    try {
      const url = new URL(link)
      navigate(url.pathname)
    } catch {
      navigate(link)
    }
  }

  // Matches with no conversation yet surface in the "New Matches" strip up
  // top (the usual dating-app pattern); once a conversation starts, a match
  // moves down into the chat list, most recent first.
  const { newMatches, conversations } = useMemo(() => {
    const fresh = []
    const active = []
    for (const match of matches) {
      if (previews[match.PK]?.lastMessageAt) {
        active.push(match)
      } else {
        fresh.push(match)
      }
    }
    active.sort(
      (a, b) => new Date(previews[b.PK].lastMessageAt) - new Date(previews[a.PK].lastMessageAt)
    )
    return { newMatches: fresh, conversations: active }
  }, [matches, previews])

  if (isLoading) {
    return (
      <PageLayout className="bg-white">
        <div className="p-4 pt-6 space-y-4">
          <h1 className="text-2xl font-bold">Loading chats...</h1>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton circle width={56} height={56} />
              <div className="flex-1">
                <Skeleton height={16} width="40%" />
                <Skeleton height={14} width="65%" />
              </div>
            </div>
          ))}
        </div>
      </PageLayout>
    )
  }

  if (isError || matches.length === 0) {
    return (
      <PageLayout className="bg-white">
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={MessageCircle}
            title={isError ? 'Could not load matches' : 'No matches yet'}
            subtitle={
              isError
                ? 'Please try again later.'
                : 'Start swiping to find someone special — your matches will show up here as chats.'
            }
          />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="bg-white">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Matches / Chat</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          {isConnected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      <NewMatchesStrip
        matches={newMatches}
        onOpenChat={(matchId) => navigate(`/matches/${matchId}/chat`)}
      />

      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            subtitle="Tap a new match above to say hi and start chatting."
          />
        </div>
      ) : (
        <div className="flex-1 divide-y divide-gray-100">
          {conversations.map((match) => (
            <MatchRow
              key={match.PK}
              match={match}
              preview={previews[match.PK]}
              feedbackState={sentFeedback[match.PK] || match.feedback}
              feedbackDisabled={loadingUser === match.PK}
              onOpenChat={() => navigate(`/matches/${match.PK}/chat`)}
              onOpenProfile={() => goToProfile(match.profileLink)}
              onLike={() => handleFeedback(match.PK, true)}
              onDislike={() => handleFeedback(match.PK, false)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  )
}
