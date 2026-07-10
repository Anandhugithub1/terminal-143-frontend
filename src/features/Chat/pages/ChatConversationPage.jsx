import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { useMatches } from '../../UserHome/api'
import { useConversationHistory, normalizeIncomingMessage } from '../api'
import { useSocket, useSocketEvent } from '../../../shared/socket/useSocket'
import { useConversationPreviews } from '../hooks/useConversationPreviews'
import PageHeader from '../../../shared/components/PageHeader'
import { getCurrentUsername } from '../../../shared/utils/getCurrentUsername'

function formatMessageTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function ChatConversationPage() {
  const { matchId } = useParams()
  const { data: matches = [] } = useMatches()
  const match = useMemo(() => matches.find((m) => m.PK === matchId), [matches, matchId])

  const { data: history = [], isLoading, isError } = useConversationHistory(matchId)
  const { send, isConnected } = useSocket()
  const { previews, markRead, recordSentMessage } = useConversationPreviews()

  // Live messages received/sent this session are kept separate from the
  // fetched history so a background history refetch never clobbers them.
  const [liveMessages, setLiveMessages] = useState([])
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)
  const hasScrolledRef = useRef(false)

  const messages = useMemo(() => [...history, ...liveMessages], [history, liveMessages])

  useEffect(() => {
    setLiveMessages([])
    hasScrolledRef.current = false
  }, [matchId])

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      markRead(matchId)
    }
  }, [matchId, markRead, isLoading, messages.length])

  useSocketEvent('MESSAGE', (payload) => {
    const msg = normalizeIncomingMessage(payload)
    if (!msg || msg.matchId !== matchId) return
    setLiveMessages((prev) => [...prev, { id: msg.id, text: msg.text, sentAt: msg.sentAt, mine: false }])
    markRead(matchId)
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

  function handleSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return

    const message = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      sentAt: new Date().toISOString(),
      mine: true,
    }

    send({
      action: 'sendMessage',
      senderId: getCurrentUsername(),
      recipientId: matchId,
      content: text,
    })
    setLiveMessages((prev) => [...prev, message])
    recordSentMessage(matchId, text)
    setDraft('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader
        title={match?.name || 'Chat'}
        action={
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span
              className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            {online ? 'Online' : isConnected ? 'Offline' : 'Connecting…'}
          </span>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton height={36} width="60%" borderRadius={16} />
            <Skeleton height={36} width="45%" borderRadius={16} style={{ marginLeft: 'auto' }} />
            <Skeleton height={36} width="55%" borderRadius={16} />
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <p className="text-gray-800 font-semibold text-sm">Couldn't load this conversation</p>
            <p className="text-gray-400 text-xs mt-1">Please check your connection and try again.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <img
              src={match?.photos?.[0]?.url}
              alt={match?.name}
              className="w-16 h-16 rounded-full object-cover mb-3"
            />
            <p className="text-gray-800 font-semibold text-sm">
              You matched with {match?.name || 'each other'}
            </p>
            <p className="text-gray-400 text-xs mt-1">Say hi and break the ice 👋</p>
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

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-input rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-40 active:scale-95 transition-transform"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
