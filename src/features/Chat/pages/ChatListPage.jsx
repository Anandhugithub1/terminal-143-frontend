import { useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInfiniteMatches, SendProfileFeeback } from '../../UserHome/api'
import { useConversationPreviews } from '../hooks/useConversationPreviews'
import { useCircles } from '../../Circles/hooks/useCircles'
import { useCircleChatPreviews } from '../../Circles/hooks/useCircleChatPreviews'
import { useTranslatedCircleName } from '../../Circles/constants/onboardingCircles'
import CircleChatRow from '../../Circles/components/chat/CircleChatRow'
import PageLayout from '../../../shared/components/PageLayout'
import EmptyState from '../../../shared/components/EmptyState'
import MatchRow from '../components/MatchRow'
import SupportRow from '../components/SupportRow'
import NewMatchesStrip from '../components/NewMatchesStrip'
import ChatListSkeleton from '../components/ChatListSkeleton'

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

  const { data: circlesData } = useCircles()
  const myCircles = circlesData?.circles || []
  const { previews: circlePreviews } = useCircleChatPreviews()
  const getCircleName = useTranslatedCircleName()

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

  // Circle Chats section — a separate, labeled group above Direct rather
  // than merged into one recency-sorted list, so a person-thread and a
  // group-thread stay easy to tell apart at a glance (see the design
  // discussion: avatar shape alone isn't enough once chat volume grows).
  // Only circles with SOME chat state (a message ever sent, or unread) are
  // listed — mirrors how Direct excludes matches with no conversation yet.
  const circleConversations = useMemo(() => {
    return myCircles
      .filter((c) => circlePreviews[c.circleId]?.lastMessageAt)
      .sort((a, b) => {
        const aT = new Date(circlePreviews[a.circleId]?.lastMessageAt || 0)
        const bT = new Date(circlePreviews[b.circleId]?.lastMessageAt || 0)
        return bT - aT
      })
  }, [myCircles, circlePreviews])

  if (isLoading) {
    return (
      <PageLayout className="bg-white">
        <ChatListSkeleton />
      </PageLayout>
    )
  }

  // Support is always reachable, independent of whether this user has any
  // real matches — it must never be hidden behind the no-matches/error empty
  // states below. This full-page empty state is only correct when there's
  // NOTHING to show at all — a user with zero 1:1 matches but an active
  // circle chat must still fall through to the main return below, which
  // renders the Circle Chats section regardless of `matches`. Checking
  // matches.length alone here previously hid every circle conversation
  // behind "No matches yet" whenever the user had no direct matches yet.
  if (isError || (matches.length === 0 && circleConversations.length === 0)) {
    return (
      <PageLayout className="bg-white">
        <SupportRow onOpenChat={() => navigate('/matches/support/chat')} preview={previews.SUPPORT} />
        <div className="border-t border-gray-100" />
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

      {circleConversations.length > 0 && (
        <>
          <div>
            <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
              {t('circleList.sectionLabel')}
            </p>
            {circleConversations.map((circle, index) => (
              <CircleChatRow
                key={circle.circleId}
                circle={{ ...circle, name: getCircleName(circle.circleId, circle.name) }}
                preview={circlePreviews[circle.circleId]}
                index={index}
                onOpenChat={() => navigate(`/circles/${circle.circleId}/chat`)}
              />
            ))}
          </div>
          <div className="border-t border-gray-100" />
        </>
      )}

      <div className={conversations.length === 0 ? 'flex-1 flex flex-col' : ''}>
        <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
          {t('list.chatSectionLabel')}
        </p>

        <SupportRow onOpenChat={() => navigate('/matches/support/chat')} preview={previews.SUPPORT} />

        {conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageCircle}
              title={t('list.noConversationsYet')}
              subtitle={t('list.tapMatchToStart')}
            />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </PageLayout>
  )
}
