import { useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, MessageCircle, Search, X } from 'lucide-react'
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
  const [isCircleChatsExpanded, setIsCircleChatsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
  // Unlike Direct, every joined circle is listed here — including ones with
  // no messages yet — so a freshly joined circle is immediately discoverable
  // as a place to say hi, rather than waiting for its first message before
  // it can even appear.
  //
  // Circles with no message yet sort first (there's no lastMessageAt to
  // compare against a real conversation's recency, and a circle just joined
  // is more likely to be top-of-mind than one that's been quiet for weeks),
  // in listUserCircles' own response order — the API carries no per-member
  // join timestamp today, so that's the closest available proxy for "most
  // recently joined." Circles WITH messages then follow, newest first.
  const circleConversations = useMemo(() => {
    const withMessages = []
    const empty = []
    for (const c of myCircles) {
      if (circlePreviews[c.circleId]?.lastMessageAt) withMessages.push(c)
      else empty.push(c)
    }
    withMessages.sort((a, b) => {
      const aT = new Date(circlePreviews[a.circleId]?.lastMessageAt || 0)
      const bT = new Date(circlePreviews[b.circleId]?.lastMessageAt || 0)
      return bT - aT
    })
    return [...empty, ...withMessages]
  }, [myCircles, circlePreviews])

  const CIRCLE_CHATS_VISIBLE_COUNT = 3
  const visibleCircleConversations = isCircleChatsExpanded
    ? circleConversations
    : circleConversations.slice(0, CIRCLE_CHATS_VISIBLE_COUNT)
  const hiddenCircleConversations = circleConversations.slice(CIRCLE_CHATS_VISIBLE_COUNT)

  // Search filters by NAME ONLY (circle name or match name), never message
  // text — it's a client-side filter over data already in memory, not a
  // server search over message history. While searching, both the 3-row
  // collapse and the New Matches/Direct split are set aside: a query should
  // surface every matching thread at once rather than making the searcher
  // also expand a "show more" or scroll past an unrelated strip first.
  const trimmedQuery = searchQuery.trim().toLowerCase()
  const isSearching = trimmedQuery.length > 0

  const searchedCircleConversations = useMemo(() => {
    if (!isSearching) return []
    return circleConversations.filter((c) =>
      getCircleName(c.circleId, c.name)?.toLowerCase().includes(trimmedQuery)
    )
  }, [isSearching, trimmedQuery, circleConversations, getCircleName])

  const searchedDirectConversations = useMemo(() => {
    if (!isSearching) return []
    return [...conversations, ...newMatches].filter((m) =>
      m.name?.toLowerCase().includes(trimmedQuery)
    )
  }, [isSearching, trimmedQuery, conversations, newMatches])

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

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('list.searchPlaceholder')}
            className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={t('list.clearSearch')}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {isSearching ? (
        <div className="flex-1 flex flex-col">
          {searchedCircleConversations.length === 0 && searchedDirectConversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={Search}
                title={t('list.noSearchResults', { query: searchQuery.trim() })}
                subtitle={t('list.noSearchResultsHint')}
              />
            </div>
          ) : (
            <>
              {searchedCircleConversations.length > 0 && (
                <div>
                  <p className="px-4 pt-1 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {t('circleList.sectionLabel')}
                  </p>
                  {searchedCircleConversations.map((circle, index) => (
                    <CircleChatRow
                      key={circle.circleId}
                      circle={{ ...circle, name: getCircleName(circle.circleId, circle.name) }}
                      preview={circlePreviews[circle.circleId]}
                      index={index}
                      onOpenChat={() => navigate(`/matches/circles/${circle.circleId}/chat`)}
                    />
                  ))}
                </div>
              )}
              {searchedDirectConversations.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {t('list.chatSectionLabel')}
                  </p>
                  {searchedDirectConversations.map((match) => (
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
            </>
          )}
        </div>
      ) : (
        <>
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
            {visibleCircleConversations.map((circle, index) => (
              <CircleChatRow
                key={circle.circleId}
                circle={{ ...circle, name: getCircleName(circle.circleId, circle.name) }}
                preview={circlePreviews[circle.circleId]}
                index={index}
                onOpenChat={() => navigate(`/matches/circles/${circle.circleId}/chat`)}
              />
            ))}
            {!isCircleChatsExpanded && hiddenCircleConversations.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCircleChatsExpanded(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
              >
                <div className="flex -space-x-2 shrink-0">
                  {hiddenCircleConversations.slice(0, 3).map((circle, i) => {
                    const name = getCircleName(circle.circleId, circle.name)
                    return circle.coverPhoto ? (
                      <img
                        key={circle.circleId}
                        src={circle.coverPhoto}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover border-2 border-white"
                        style={{ zIndex: 3 - i }}
                      />
                    ) : (
                      <div
                        key={circle.circleId}
                        className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-primary to-pink-400 flex items-center justify-center"
                        style={{ zIndex: 3 - i }}
                      >
                        <span className="text-[10px] font-bold text-white">{name?.[0]?.toUpperCase()}</span>
                      </div>
                    )
                  })}
                </div>
                <span className="flex-1 text-[13.5px] font-semibold text-primary">
                  {t('circleList.showMore', { count: hiddenCircleConversations.length })}
                </span>
                <ChevronDown className="w-4 h-4 text-primary shrink-0" />
              </button>
            )}
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
        </>
      )}
    </PageLayout>
  )
}
