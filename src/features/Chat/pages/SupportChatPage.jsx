import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Image as ImageIcon, Send, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useSupportHistory, useSendSupportMessage, useMarkSupportRead, uploadSupportImage } from '../api'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

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
//
// Photo attachments are USER-SIDE ONLY — staff replies from the moderation
// dashboard stay text-only (see sendSupportReply.js), so there's no attach
// control for incoming/staff messages, only for what this page sends.
export default function SupportChatPage() {
  const { t } = useTranslation('chat')
  const navigate = useNavigate()
  const { data: messages = [], isLoading, isError } = useSupportHistory()
  const { mutate: sendMessage, isPending: isSending } = useSendSupportMessage()
  const { mutate: markRead } = useMarkSupportRead()

  const [draft, setDraft] = useState('')
  const [pendingImage, setPendingImage] = useState(null) // { file, previewUrl }
  const [isUploading, setIsUploading] = useState(false)
  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)
  const hasScrolledRef = useRef(false)
  const markedReadForRef = useRef(null)

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: hasScrolledRef.current ? 'smooth' : 'auto',
    })
    hasScrolledRef.current = true
  }, [messages.length])

  // Advances the server-side read boundary once per newest incoming message,
  // so /chat/unread stops counting it and the pinned row's badge clears —
  // mirrors ChatConversationPage's markConversationRead, but over REST since
  // there's no socket to send a readReceipt frame through here.
  useEffect(() => {
    const newest = messages[messages.length - 1]
    if (!newest || newest.mine) return
    if (markedReadForRef.current === newest.id) return
    markedReadForRef.current = newest.id
    markRead(newest.id)
  }, [messages, markRead])

  function handlePickImage() {
    fileInputRef.current?.click()
  }

  function handleImageSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(t('support.invalidImageType'))
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t('support.imageTooLarge'))
      return
    }

    setPendingImage({ file, previewUrl: URL.createObjectURL(file) })
  }

  function clearPendingImage() {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl)
    setPendingImage(null)
  }

  async function handleSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if ((!text && !pendingImage) || isSending || isUploading) return

    let imageUrl
    if (pendingImage) {
      setIsUploading(true)
      try {
        imageUrl = await uploadSupportImage(pendingImage.file)
      } catch {
        toast.error(t('support.imageUploadFailed'))
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    setDraft('')
    clearPendingImage()
    sendMessage(
      { content: text, imageUrl },
      { onError: () => toast.error(t('support.sendFailed')) }
    )
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

        {messages.map((msg) =>
          msg.imageUrl ? (
            // Photo message: the image stays the dominant element in its own
            // rounded top section, capped so it can't blow out the thread —
            // caption + time sit below on a plain surface (same treatment as
            // an incoming text bubble), not a full-width accent block, so
            // they never fight the photo's own colors.
            <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[62%] rounded-2xl overflow-hidden bg-white border border-gray-100 ${
                  msg.mine ? 'rounded-br-sm' : 'rounded-bl-sm'
                }`}
              >
                <img
                  src={msg.imageUrl}
                  alt=""
                  loading="lazy"
                  className="w-full max-h-64 object-cover"
                />
                <div className="px-3 pt-1.5 pb-2">
                  {msg.text && (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{msg.text}</p>
                  )}
                  <p className="text-[10px] mt-1 text-right text-gray-400">
                    {formatMessageTime(msg.sentAt)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
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
          )
        )}
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-100 bg-white">
        {pendingImage && (
          <div className="flex items-center gap-2 px-4 pt-3">
            <div className="relative">
              <img src={pendingImage.previewUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
              <button
                type="button"
                onClick={clearPendingImage}
                aria-label={t('support.removeImage')}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-4 py-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleImageSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={handlePickImage}
            disabled={isSending || isUploading}
            aria-label={t('support.attachImage')}
            className="w-10 h-10 shrink-0 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('conversation.typeMessage')}
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={(!draft.trim() && !pendingImage) || isSending || isUploading}
            aria-label={t('conversation.sendMessage')}
            className="w-10 h-10 shrink-0 flex items-center justify-center bg-primary text-white rounded-full disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
