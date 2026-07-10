import { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useMatches, SendProfileFeeback } from '../../UserHome/api'
import { useConversationPreviews } from '../hooks/useConversationPreviews'
import PageLayout from '../../../shared/components/PageLayout'
import EmptyState from '../../../shared/components/EmptyState'
import MatchRow from '../components/MatchRow'
import NewMatchesStrip from '../components/NewMatchesStrip'

export default function ChatListPage() {
  const { data: matches = [], isLoading, isError } = useMatches()
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

  // Every match shows in the top strip (classic dating-app "stories" row).
  // The list below is just active conversations, most recent first.
  const conversations = useMemo(() => {
    return matches
      .filter((match) => previews[match.PK]?.lastMessageAt)
      .sort(
        (a, b) => new Date(previews[b.PK].lastMessageAt) - new Date(previews[a.PK].lastMessageAt)
      )
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
      <div className="pt-3" />

      <NewMatchesStrip
        matches={matches}
        onOpenChat={(matchId) => navigate(`/matches/${matchId}/chat`)}
      />

      <div className="border-t border-gray-100" />

      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            subtitle="Tap a match above to say hi and start chatting."
          />
        </div>
      ) : (
        <div className="flex-1">
          <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
            Chat
          </p>
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
