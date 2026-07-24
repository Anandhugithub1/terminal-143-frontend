import { useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInfiniteMatches, SendProfileFeeback } from '../../UserHome/api'
import { useConversationPreviews } from '../hooks/useConversationPreviews'
import PageLayout from '../../../shared/components/PageLayout'
import EmptyState from '../../../shared/components/EmptyState'
import MatchRow from '../components/MatchRow'
import NewMatchesStrip from '../components/NewMatchesStrip'

export default function ChatListPage() {
  const { t } = useTranslation('chat')
  const {
    matches,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMatches()
  const { previews } = useConversationPreviews()
  const { mutate: sendFeedback } = SendProfileFeeback()

  const [sentFeedback, setSentFeedback] = useState({})
  const [loadingUser, setLoadingUser] = useState(null)
  const navigate = useNavigate()

  // Fetch the next page of matches as the sentinel at the bottom of the
  // conversation list scrolls into view.
  const loadMoreRef = useRef(null)
  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !hasNextPage) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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
      navigate(url.pathname, { state: { isMatch: true } })
    } catch {
      navigate(link, { state: { isMatch: true } })
    }
  }

  // Matches you haven't messaged yet show in the top strip; once a
  // conversation starts, a match drops out of the strip and into the
  // chat list below, most recent first.
  //
  // Threads you've blocked stay in the list (marked "Blocked", muted, sorted
  // last) rather than disappearing: unblock lives inside the conversation, so
  // hiding the thread left no way to reach it. They're kept out of the
  // new-matches strip, which is a prompt to start chatting.
  const { newMatches, conversations } = useMemo(() => {
    const fresh = []
    const active = []
    for (const match of matches) {
      const preview = previews[match.PK]
      if (preview?.blockedByMe) {
        active.push(match)
      } else if (preview?.lastMessageAt) {
        active.push(match)
      } else {
        fresh.push(match)
      }
    }
    active.sort((a, b) => {
      // Blocked threads sink below live conversations; they're for going back
      // to, not for reading.
      const aBlocked = !!previews[a.PK]?.blockedByMe
      const bBlocked = !!previews[b.PK]?.blockedByMe
      if (aBlocked !== bBlocked) return aBlocked ? 1 : -1
      return (
        new Date(previews[b.PK]?.lastMessageAt || 0) -
        new Date(previews[a.PK]?.lastMessageAt || 0)
      )
    })
    return { newMatches: fresh, conversations: active }
  }, [matches, previews])

  if (isLoading) {
    return (
      <PageLayout className="bg-white">
        <div className="p-4 pt-6 space-y-4">
          <h1 className="text-2xl font-bold">{t('list.loadingChats')}</h1>
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
            title={isError ? t('list.couldNotLoadMatches') : t('list.noMatchesYet')}
            subtitle={isError ? t('list.tryAgainLater') : t('list.startSwiping')}
          />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="bg-white">
      <div className="pt-3" />

      <NewMatchesStrip
        matches={newMatches}
        onOpenChat={(matchId) => navigate(`/matches/${matchId}/chat`)}
      />

      <div className="border-t border-gray-100" />

      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={MessageCircle}
            title={t('list.noConversationsYet')}
            subtitle={t('list.tapMatchToStart')}
          />
        </div>
      ) : (
        <div className="flex-1">
          <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
            {t('list.chatSectionLabel')}
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

          {hasNextPage && (
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {isFetchingNextPage && (
                <Skeleton circle width={24} height={24} />
              )}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}
