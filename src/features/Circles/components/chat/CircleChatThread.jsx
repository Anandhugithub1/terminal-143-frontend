import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, MessageCircleOff, Send, WifiOff } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useTranslation } from 'react-i18next'
import {
  useCircleChatHistory,
  useCircleMembers,
  appendToCircleHistoryCache,
  normalizeIncomingCircleMessage,
} from '../../api/circleChatApi'
import { useCircleChatPreviews } from '../../hooks/useCircleChatPreviews'
import { useSocket, useSocketEvent } from '../../../../shared/socket/useSocket'
import DateDivider from '../../../Chat/components/DateDivider'
import { formatDateDivider, isNewDay } from '../../../Chat/utils/formatMessageDate'
import { getCurrentUsername } from '../../../../shared/utils/getCurrentUsername'

const ACK_TIMEOUT_MS = 10000
const SEND_SPACING_MS = 350
const MAX_CONTENT_LENGTH = 2000

// Fixed palette so a member's initials avatar/name-label color stays
// consistent between the circle-home story ring, the chat list row, and
// this thread — same hue picked for the same userId every time (a
// deterministic hash, not stored state).
const MEMBER_COLORS = [
  '#db2777', '#7c3aed', '#0d9488', '#0891b2', '#ca8a04',
  '#be185d', '#16a34a', '#ea580c', '#2563eb', '#9333ea',
]

export function colorForMember(userId) {
  let hash = 0
  for (let i = 0; i < (userId || '').length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return MEMBER_COLORS[hash % MEMBER_COLORS.length]
}

export function initialsFor(name) {
  return (name || '?').trim().slice(0, 2).toUpperCase()
}

function formatMessageTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

// Same link-parsing fallback as ChatConversationPage's goToProfile / the
// member sheet's version.
function goToProfile(navigate, profileLink) {
  if (!profileLink) return
  try {
    navigate(new URL(profileLink).pathname, { state: { isMatch: true } })
  } catch {
    navigate(profileLink, { state: { isMatch: true } })
  }
}

// `member` is this sender's entry from useCircleMembers (name/avatarUrl/
// isCompatible/profileLink), or undefined if the member directory hasn't
// loaded yet / the sender left the circle since sending — falls back to a
// colored-initials circle and the raw userId in either case. The avatar and
// name label become tappable-to-profile ONLY when the server marked this
// sender isCompatible (a mutual gender/preference match with the viewer,
// computed server-side) — everyone else stays visible but not tappable, by
// design. The bubble body itself is never a tap target either way.
function CircleMessageBubble({ msg, member, t, onRetry, navigate }) {
  const failed = msg.status === 'failed'
  const pending = msg.status === 'pending'
  const color = colorForMember(msg.senderId)
  const displayName = member?.name || msg.senderId
  const canViewProfile = !msg.mine && member?.isCompatible && member?.profileLink

  const avatar = member?.avatarUrl ? (
    <img
      src={member.avatarUrl}
      alt=""
      className="w-6 h-6 rounded-full shrink-0 object-cover select-none"
    />
  ) : (
    <div
      className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white text-[9px] font-bold select-none"
      style={{ backgroundColor: color }}
    >
      {initialsFor(displayName)}
    </div>
  )

  return (
    <div className={`flex gap-1.5 items-end ${msg.mine ? 'justify-end' : 'justify-start'}`}>
      {failed && (
        <button
          type="button"
          onClick={() => onRetry(msg)}
          className="self-end mb-1 shrink-0 text-rose-500"
          aria-label={t('circleConversation.retrySend')}
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      )}
      {!msg.mine && (
        canViewProfile ? (
          <button
            type="button"
            onClick={() => goToProfile(navigate, member.profileLink)}
            aria-label={t('circleConversation.viewProfileAria', { name: displayName })}
          >
            {avatar}
          </button>
        ) : (
          avatar
        )
      )}
      <div className={`flex flex-col ${msg.mine ? 'items-end' : 'items-start'} max-w-[74%]`}>
        {!msg.mine && (
          canViewProfile ? (
            <button
              type="button"
              onClick={() => goToProfile(navigate, member.profileLink)}
              className="text-[10.5px] font-semibold mb-0.5 ml-0.5 select-none underline decoration-dotted underline-offset-2"
              style={{ color }}
            >
              {displayName}
            </button>
          ) : (
            <span className="text-[10.5px] font-semibold mb-0.5 ml-0.5 select-none" style={{ color }}>
              {displayName}
            </span>
          )
        )}
        <div
          className={`px-4 py-2 rounded-2xl text-sm select-none transition-opacity ${pending ? 'opacity-60' : ''} ${
            failed
              ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-br-sm'
              : msg.mine
              ? 'bg-primary text-white rounded-br-sm'
              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
          <p
            className={`text-[10px] mt-1 text-right ${
              failed ? 'text-rose-500' : msg.mine ? 'text-white/70' : 'text-gray-400'
            }`}
          >
            {failed ? t('circleConversation.sendFailed') : pending ? t('circleConversation.sending') : formatMessageTime(msg.sentAt)}
          </p>
        </div>
      </div>
    </div>
  )
}

// The message list + composer, with NO header of its own — used by both
// CircleChatPage (standalone screen, wraps this with its own header/back
// button) and CircleDetailsPage's Chat tab (embeds this under the circle's
// existing hero, no second header). Everything header-independent about the
// 1:1-mirrored send/receive/history logic lives here so neither caller
// duplicates it.
export default function CircleChatThread({ circleId, circleName }) {
  const { t } = useTranslation('chat')
  const navigate = useNavigate()
  const myUsername = getCurrentUsername()

  const {
    data: historyData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCircleChatHistory(circleId)
  const history = historyData?.messages ?? []

  const { send, sendWithAck, isConnected } = useSocket()
  const queryClient = useQueryClient()
  const { previews, markRead, recordSentMessage } = useCircleChatPreviews()
  const chatEnabled = previews[circleId]?.chatEnabled !== false
  const { byUserId: members } = useCircleMembers(circleId)

  const [liveMessages, setLiveMessages] = useState([])
  const liveMessagesRef = useRef([])
  liveMessagesRef.current = liveMessages
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)
  const hasScrolledRef = useRef(false)
  const pendingOlderPageRef = useRef(false)
  const prevScrollHeightRef = useRef(0)
  const prevScrollTopRef = useRef(0)
  const topSentinelRef = useRef(null)

  const ackTimersRef = useRef(new Map())
  const sendQueueRef = useRef([])
  const isDrainingRef = useRef(false)
  const drainTimerRef = useRef(null)

  const messages = useMemo(() => {
    const seen = new Set()
    const combined = []
    for (const msg of [...history, ...liveMessages]) {
      if (seen.has(msg.id)) continue
      seen.add(msg.id)
      combined.push(msg)
    }
    combined.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    return combined
  }, [history, liveMessages])

  useEffect(() => {
    setLiveMessages([])
    hasScrolledRef.current = false
  }, [circleId])

  const [showReconnecting, setShowReconnecting] = useState(false)
  useEffect(() => {
    if (isConnected) {
      setShowReconnecting(false)
      return
    }
    const timer = setTimeout(() => setShowReconnecting(true), 2000)
    return () => clearTimeout(timer)
  }, [isConnected])

  function markConversationRead() {
    markRead(circleId)
    for (let i = messages.length - 1; i >= 0; i--) {
      const candidate = messages[i]
      if (candidate.mine) continue
      if (candidate.id) {
        send({ action: 'readCircleReceipt', circleId, messageId: candidate.id })
      }
      break
    }
    queryClient.invalidateQueries({ queryKey: ['circleChatUnread'] })
  }

  const newestMessageId = messages[messages.length - 1]?.id
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      markConversationRead()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId, isLoading, newestMessageId])

  useSocketEvent('CIRCLE_MESSAGE', (payload) => {
    const msg = normalizeIncomingCircleMessage(payload)
    if (!msg || msg.circleId !== circleId) return
    setLiveMessages((prev) => [...prev, { id: msg.id, text: msg.text, senderId: msg.senderId, sentAt: msg.sentAt, mine: false }])
    appendToCircleHistoryCache(queryClient, circleId, { id: msg.id, text: msg.text, senderId: msg.senderId, sentAt: msg.sentAt, mine: false })
    markRead(circleId)
    if (msg.id) send({ action: 'readCircleReceipt', circleId, messageId: msg.id })
    queryClient.invalidateQueries({ queryKey: ['circleChatUnread'] })
  })

  useSocketEvent('SENT_ACK', (payload) => {
    const { clientMessageId, messageId, sentAt, circleId: ackCircleId } = payload || {}
    if (!clientMessageId || !ackCircleId) return
    const timer = ackTimersRef.current.get(clientMessageId)
    if (timer) {
      clearTimeout(timer)
      ackTimersRef.current.delete(clientMessageId)
    }
    const sentBubble = liveMessagesRef.current.find((m) => m.clientMessageId === clientMessageId)
    setLiveMessages((prev) =>
      prev.map((m) => (m.clientMessageId === clientMessageId ? { ...m, id: messageId || m.id, sentAt: sentAt || m.sentAt, status: 'sent' } : m))
    )
    if (messageId && sentBubble) {
      appendToCircleHistoryCache(queryClient, circleId, {
        id: messageId,
        text: sentBubble.text,
        senderId: myUsername,
        sentAt: sentAt || sentBubble.sentAt,
        mine: true,
      })
    }
  })

  useSocketEvent('SEND_FAILED', (payload) => {
    if (payload?.clientMessageId) markSendFailed(payload.clientMessageId)
  })

  useEffect(() => {
    const timers = ackTimersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
      if (drainTimerRef.current) {
        clearTimeout(drainTimerRef.current)
        drainTimerRef.current = null
      }
      sendQueueRef.current = []
      isDrainingRef.current = false
    }
  }, [circleId])

  useEffect(() => {
    if (!scrollRef.current) return
    if (pendingOlderPageRef.current) {
      pendingOlderPageRef.current = false
      const addedHeight = scrollRef.current.scrollHeight - prevScrollHeightRef.current
      scrollRef.current.scrollTop = prevScrollTopRef.current + addedHeight
      return
    }
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: hasScrolledRef.current ? 'smooth' : 'auto',
    })
    hasScrolledRef.current = true
  }, [messages])

  useEffect(() => {
    const node = topSentinelRef.current
    if (!node || !hasNextPage) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          prevScrollHeightRef.current = scrollRef.current?.scrollHeight || 0
          prevScrollTopRef.current = scrollRef.current?.scrollTop || 0
          pendingOlderPageRef.current = true
          fetchNextPage()
        }
      },
      { root: scrollRef.current, rootMargin: '100px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function markSendFailed(clientMessageId) {
    const timer = ackTimersRef.current.get(clientMessageId)
    if (timer) {
      clearTimeout(timer)
      ackTimersRef.current.delete(clientMessageId)
    }
    setLiveMessages((prev) =>
      prev.map((m) => (m.clientMessageId === clientMessageId && m.status === 'pending' ? { ...m, status: 'failed' } : m))
    )
  }

  function dispatchMessage(localId, text) {
    const clientMessageId = sendWithAck({ action: 'sendCircleMessage', circleId, content: text })
    const timer = setTimeout(() => markSendFailed(clientMessageId), ACK_TIMEOUT_MS)
    ackTimersRef.current.set(clientMessageId, timer)
    setLiveMessages((prev) => prev.map((m) => (m.id === localId ? { ...m, clientMessageId } : m)))
    recordSentMessage(circleId, text)
  }

  function drainSendQueue() {
    if (isDrainingRef.current) return
    const next = sendQueueRef.current.shift()
    if (!next) {
      isDrainingRef.current = false
      return
    }
    isDrainingRef.current = true
    try {
      dispatchMessage(next.localId, next.text)
    } catch (err) {
      isDrainingRef.current = false
      throw err
    }
    drainTimerRef.current = setTimeout(() => {
      drainTimerRef.current = null
      isDrainingRef.current = false
      drainSendQueue()
    }, SEND_SPACING_MS)
  }

  function sendBubble(localId, text) {
    setLiveMessages((prev) => [
      ...prev,
      { id: localId, clientMessageId: localId, text, senderId: myUsername, sentAt: new Date().toISOString(), mine: true, status: 'pending' },
    ])
    sendQueueRef.current.push({ localId, text })
    drainSendQueue()
  }

  function handleRetry(msg) {
    setLiveMessages((prev) => prev.filter((m) => m.id !== msg.id))
    sendBubble(msg.id, msg.text)
  }

  function handleSend(e) {
    e.preventDefault()
    if (!chatEnabled) return
    const text = draft.trim()
    if (!text || text.length > MAX_CONTENT_LENGTH) return
    setDraft('')
    sendBubble(`${Date.now()}-${Math.random()}`, text)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
      {showReconnecting && (
        <div className="flex items-center justify-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium py-1.5 border-b border-amber-100">
          <WifiOff className="w-3.5 h-3.5" />
          {t('circleConversation.reconnecting')}
        </div>
      )}

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
      >
        {isLoading ? (
          <div className="space-y-3">
            {[
              { w: '60%', mine: false },
              { w: '45%', mine: true },
              { w: '70%', mine: false },
              { w: '38%', mine: true },
            ].map((b, i) => (
              <div key={i} className={`flex ${b.mine ? 'justify-end' : 'justify-start'}`}>
                <Skeleton height={40} width={160} borderRadius={16} containerClassName="block" style={{ width: b.w, maxWidth: 260 }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <p className="text-gray-800 font-semibold text-sm">{t('circleConversation.couldNotLoad')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('circleConversation.checkConnection')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16">
            <div
              className="w-20 h-20 rounded-full mb-4 border-4 border-white shadow-md flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: colorForMember(circleId) }}
            >
              {initialsFor(circleName)}
            </div>
            <p className="text-gray-900 font-semibold text-base">{circleName}</p>
            <p className="text-gray-400 text-sm mt-1">{t('circleConversation.sayHelloPrompt')}</p>
          </div>
        ) : (
          <>
            {hasNextPage && (
              <div ref={topSentinelRef} className="py-2 flex justify-center">
                {isFetchingNextPage && <Skeleton circle width={20} height={20} />}
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={msg.id}>
                {isNewDay(messages, index) && <DateDivider label={formatDateDivider(msg.sentAt, t)} />}
                <CircleMessageBubble msg={msg} member={members.get(msg.senderId)} t={t} onRetry={handleRetry} navigate={navigate} />
              </div>
            ))}
          </>
        )}
      </div>

      {chatEnabled ? (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('circleConversation.messagePlaceholder', { name: circleName })}
            style={{ fontSize: 16 }}
            className="flex-1 bg-input rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-gray-900 text-white disabled:opacity-40 active:scale-95 transition-transform"
            aria-label={t('circleConversation.sendMessage')}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <MessageCircleOff className="w-5 h-5 text-gray-400 shrink-0" />
          <p className="flex-1 text-sm text-gray-500">{t('circleConversation.chatDisabled')}</p>
        </div>
      )}
    </div>
  )
}
