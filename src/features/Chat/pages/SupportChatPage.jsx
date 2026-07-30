import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSupportHistory, useSendSupportMessage } from '../api'

function formatMessageTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Support chat is standalone REST, not realtime (no WebSocket path — see
// chat-service's supportChat.js): history is polled (useSupportHistory) and
// sending is a plain POST, so unlike ChatConversationPage there's no ack
// timer, retry queue, or delete-for-me here — just send + poll.
export default function SupportChatPage() {
  const { t } = useTranslation('chat')
  const navigate = useNavigate()
  const { data: messages = [], isLoading, isError } = useSupportHistory()
  const { mutate: sendMessage, isPending: isSending } = useSendSupportMessage()

  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)
  const hasScrolledRef = useRef(false)

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: hasScrolledRef.current ? 'smooth' : 'auto',
    })
    hasScrolledRef.current = true
  }, [messages.length])

  function handleSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || isSending) return
    setDraft('')
    sendMessage(text)
  }

  return (
    <div className="flex flex-col bg-gray-50 h-[100dvh]">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          aria-label={t('conversation.back')}
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <p className="text-[15px] font-semibold text-gray-900 truncate">
            {t('support.title')}
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
      >
        {isLoading && (
          <p className="text-center text-sm text-gray-400 mt-4">{t('support.loading')}</p>
        )}

        {isError && (
          <p className="text-center text-sm text-gray-400 mt-4">{t('conversation.couldNotLoad')}</p>
        )}

        {!isLoading && !isError && messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">{t('support.emptyPrompt')}</p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                msg.mine
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              <p className={`text-[10px] mt-1 text-right ${msg.mine ? 'text-white/70' : 'text-gray-400'}`}>
                {formatMessageTime(msg.sentAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('conversation.typeMessage')}
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!draft.trim() || isSending}
          aria-label={t('conversation.sendMessage')}
          className="w-10 h-10 shrink-0 flex items-center justify-center bg-primary text-white rounded-full disabled:opacity-50 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
