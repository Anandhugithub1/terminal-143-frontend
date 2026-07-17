import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MoreVertical, Send, ShieldOff } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useTranslation } from 'react-i18next'
import { useMatches } from '../../UserHome/api'
import { useConversationHistory, normalizeIncomingMessage, useBlockUser, useUnblockUser } from '../api'
import { useSocket, useSocketEvent } from '../../../shared/socket/useSocket'
import { useConversationPreviews } from '../hooks/useConversationPreviews'
import BottomSheetModal from '../../../shared/components/BottomSheetModal'

// Sends fired within this window of the previous one get folded into the
// same outgoing message/bubble instead of triggering a separate socket
// send — avoids spamming chat-service when someone fires off a quick burst.
const SEND_BATCH_WINDOW_MS = 1800

function formatMessageTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function ChatConversationPage() {
  const { t } = useTranslation('chat')
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { data: matches = [], isLoading: isMatchLoading } = useMatches()
  const match = useMemo(() => matches.find((m) => m.PK === matchId), [matches, matchId])

  // Open the matched user's public profile from the chat header, mirroring
  // how the chat list opens a profile (tolerant of an absolute-URL link).
  function goToProfile() {
    const link = match?.profileLink
    if (!link) return
    try {
      navigate(new URL(link).pathname)
    } catch {
      navigate(link)
    }
  }

  const { data: historyData, isLoading, isError } = useConversationHistory(matchId)
  const history = historyData?.messages ?? []
  const blockedByMe = !!historyData?.blockedByMe
  const blockedByOther = !!historyData?.blockedByOther
  const isBlocked = blockedByMe || blockedByOther

  const { send } = useSocket()
  const queryClient = useQueryClient()
  const { previews, markRead, recordSentMessage, setBlockedByMe } = useConversationPreviews()
  const { mutate: blockUser, isPending: isBlocking } = useBlockUser(matchId)
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser(matchId)

  // Live messages received/sent this session are kept separate from the
  // fetched history so a background history refetch never clobbers them.
  const [liveMessages, setLiveMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false)
  const scrollRef = useRef(null)
  const hasScrolledRef = useRef(false)

  // Sends that land inside SEND_BATCH_WINDOW_MS of each other are folded
  // into one pending bubble/socket send instead of firing one per submit.
  const pendingRef = useRef(null) // { id, lines: string[] }
  const batchTimerRef = useRef(null)
  const flushPendingRef = useRef(() => {})

  const messages = useMemo(() => [...history, ...liveMessages], [history, liveMessages])

  useEffect(() => {
    setLiveMessages([])
    hasScrolledRef.current = false
    // Switching conversations (or leaving the page) should flush whatever
    // was pending for the *previous* matchId, not silently drop it. The ref
    // indirection ensures this always calls the closure for the matchId
    // that was active when the batch was queued, not the incoming one.
    return () => flushPendingRef.current()
  }, [matchId])

  // Mark the conversation read both locally (instant badge clear) and on the
  // SERVER (advance lastRead via a socket readReceipt) so the unread count
  // doesn't reappear on refresh. Then drop the cached /chat/unread so a
  // refetch reflects the cleared state.
  function markConversationRead() {
    markRead(matchId)
    const newest = messages[messages.length - 1]
    if (newest?.id) {
      send({ action: 'readReceipt', otherUserId: matchId, messageId: newest.id })
    }
    queryClient.invalidateQueries({ queryKey: ['chatUnreadCounts'] })
  }

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      markConversationRead()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, isLoading, messages.length])

  // Keep the chat-list cache's blockedByMe in sync with the server on every
  // load — covers the case where the block state changed elsewhere (e.g. a
  // different device) since the list last saw it.
  useEffect(() => {
    if (isLoading || !historyData) return
    setBlockedByMe(matchId, blockedByMe)
  }, [matchId, isLoading, historyData, blockedByMe, setBlockedByMe])

  useSocketEvent('MESSAGE', (payload) => {
    const msg = normalizeIncomingMessage(payload)
    if (!msg || msg.matchId !== matchId) return
    setLiveMessages((prev) => [...prev, { id: msg.id, text: msg.text, sentAt: msg.sentAt, mine: false }])
    // Received while viewing this conversation → immediately read, on the
    // server too (advance lastRead to this message).
    markRead(matchId)
    if (msg.id) send({ action: 'readReceipt', otherUserId: matchId, messageId: msg.id })
    queryClient.invalidateQueries({ queryKey: ['chatUnreadCounts'] })
  })

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: hasScrolledRef.current ? 'smooth' : 'auto',
    })
    hasScrolledRef.current = true
  }, [messages])

  const online = !!previews[matchId]?.online

  // Flush the pending batch: send whatever's accumulated as one socket
  // message and append it as one bubble. Captures the matchId it was
  // queued under via closure, so a flush triggered by switching
  // conversations still targets the right recipient.
  const flushPending = () => {
    const pending = pendingRef.current
    pendingRef.current = null
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current)
      batchTimerRef.current = null
    }
    if (!pending) return

    const text = pending.lines.join('\n')
    send({
      action: 'sendMessage',
      recipientId: matchId,
      content: text,
    })
    setLiveMessages((prev) => [
      ...prev,
      { id: pending.id, text, sentAt: new Date().toISOString(), mine: true },
    ])
    recordSentMessage(matchId, text)
  }
  flushPendingRef.current = flushPending

  function handleSend(e) {
    e.preventDefault()
    if (isBlocked) return
    const text = draft.trim()
    if (!text) return
    setDraft('')

    if (!pendingRef.current) {
      pendingRef.current = { id: `${Date.now()}-${Math.random()}`, lines: [text] }
    } else {
      pendingRef.current.lines.push(text)
    }

    if (batchTimerRef.current) clearTimeout(batchTimerRef.current)
    batchTimerRef.current = setTimeout(flushPending, SEND_BATCH_WINDOW_MS)
  }

  function handleConfirmBlock() {
    blockUser(undefined, {
      onSuccess: () => {
        setBlockedByMe(matchId, true)
        setIsBlockConfirmOpen(false)
      },
    })
  }

  function handleUnblock() {
    unblockUser(undefined, {
      onSuccess: () => setBlockedByMe(matchId, false),
    })
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          aria-label={t('conversation.back')}
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        {isMatchLoading ? (
          <>
            <Skeleton circle width={36} height={36} />
            <div className="flex-1 min-w-0">
              <Skeleton height={14} width="45%" />
              <Skeleton height={11} width="30%" />
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={goToProfile}
            disabled={!match?.profileLink}
            className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-full -my-1 py-1 pr-2 hover:bg-gray-50 disabled:hover:bg-transparent transition-colors"
            aria-label={t('conversation.viewProfileAria', { name: match?.name || '' })}
          >
            <img
              src={match?.photos?.[0]?.url}
              alt={match?.name}
              className="w-9 h-9 rounded-full object-cover bg-gray-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-900 truncate">
                {match?.name || t('conversation.chatFallback')}
              </p>
              {online && !isBlocked && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {t('conversation.online')}
                </span>
              )}
            </div>
          </button>
        )}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-1.5 -mr-1.5 shrink-0 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={t('conversation.moreOptions')}
        >
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[
              { w: '60%', mine: false },
              { w: '45%', mine: true },
              { w: '70%', mine: false },
              { w: '38%', mine: true },
              { w: '52%', mine: false },
            ].map((b, i) => (
              <div key={i} className={`flex ${b.mine ? 'justify-end' : 'justify-start'}`}>
                <Skeleton height={40} width={160} borderRadius={16} containerClassName="block" style={{ width: b.w, maxWidth: 260 }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <p className="text-gray-800 font-semibold text-sm">{t('conversation.couldNotLoad')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('conversation.checkConnection')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16">
            <img
              src={match?.photos?.[0]?.url}
              alt={match?.name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow-md"
            />
            <p className="text-gray-900 font-semibold text-base">
              {match?.name || t('conversation.yourMatchFallback')}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  msg.mine
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${
                    msg.mine ? 'text-white/70' : 'text-gray-400'
                  }`}
                >
                  {formatMessageTime(msg.sentAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {isBlocked ? (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <ShieldOff className="w-5 h-5 text-gray-400 shrink-0" />
          <p className="flex-1 text-sm text-gray-500">
            {blockedByMe ? t('conversation.youBlockedThisUser') : t('conversation.youWereBlocked')}
          </p>
          {blockedByMe && (
            <button
              onClick={handleUnblock}
              disabled={isUnblocking}
              className="shrink-0 text-sm font-semibold text-primary disabled:opacity-40"
            >
              {t('conversation.unblockUser', { name: match?.name || '' })}
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('conversation.typeMessage')}
            className="flex-1 bg-input rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-focus"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-gray-900 text-white disabled:opacity-40 active:scale-95 transition-transform"
            aria-label={t('conversation.sendMessage')}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Overflow menu */}
      <BottomSheetModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        panelClassName="rounded-t-2xl sm:rounded-2xl sm:max-w-sm overflow-hidden"
      >
        {blockedByMe ? (
          <button
            onClick={() => { setIsMenuOpen(false); handleUnblock(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ShieldOff className="w-5 h-5 text-gray-500" />
            {t('conversation.unblockUser', { name: match?.name || '' })}
          </button>
        ) : (
          <button
            onClick={() => { setIsMenuOpen(false); setIsBlockConfirmOpen(true); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-rose-600 hover:bg-gray-50 transition-colors"
          >
            <ShieldOff className="w-5 h-5" />
            {t('conversation.blockUser', { name: match?.name || '' })}
          </button>
        )}
      </BottomSheetModal>

      {/* Block confirmation */}
      <BottomSheetModal
        isOpen={isBlockConfirmOpen}
        onClose={() => setIsBlockConfirmOpen(false)}
        centered
        panelClassName="rounded-2xl overflow-hidden p-5"
      >
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          {t('conversation.blockConfirmTitle', { name: match?.name || '' })}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {t('conversation.blockConfirmBody')}
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleConfirmBlock}
            disabled={isBlocking}
            className="w-full py-3 rounded-full bg-rose-600 text-white text-sm font-semibold disabled:opacity-40"
          >
            {t('conversation.blockConfirmAction')}
          </button>
          <button
            onClick={() => setIsBlockConfirmOpen(false)}
            className="w-full py-3 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold"
          >
            {t('conversation.blockCancelAction')}
          </button>
        </div>
      </BottomSheetModal>
    </div>
  )
}
