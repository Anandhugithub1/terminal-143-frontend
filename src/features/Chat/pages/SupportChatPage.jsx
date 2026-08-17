import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Image as ImageIcon, RotateCw, Send, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useSupportHistory, useSendSupportMessage, useMarkSupportRead, uploadSupportImage } from '../api'
import { useVisualViewportHeight } from '../../../shared/hooks/useVisualViewportHeight'
import DateDivider from '../components/DateDivider'
import { formatDateDivider, isNewDay } from '../utils/formatMessageDate'

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
  const viewportHeight = useVisualViewportHeight()
  const { data: messages = [], isLoading, isError, refetch: refetchHistory } = useSupportHistory()
  const { mutate: sendMessage, isPending: isSending } = useSendSupportMessage()
  const { mutate: markRead } = useMarkSupportRead()

  const [draft, setDraft] = useState('')
  const [pendingImage, setPendingImage] = useState(null) // { file, previewUrl }
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  // Set only on a failed upload — the file/preview stay in pendingImage so
  // "Retry" can re-attempt without asking the user to re-pick the image.
  const [uploadFailed, setUploadFailed] = useState(false)
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
    setUploadFailed(false)
    setUploadProgress(0)
  }

  function clearPendingImage() {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl)
    setPendingImage(null)
    setUploadFailed(false)
    setUploadProgress(0)
  }

  // Uploads the currently-pending image (retryable in place — uploadToS3
  // already retries transient failures internally; this is the user-facing
  // "try again" for when even those retries were exhausted, e.g. the whole
  // connection dropped). Returns the public URL, or null if it failed (in
  // which case pendingImage/uploadFailed are left set so the Retry button
  // in the JSX can call this again without re-picking the file).
  async function uploadPendingImage() {
    setIsUploading(true)
    setUploadFailed(false)
    setUploadProgress(0)
    try {
      const url = await uploadSupportImage(pendingImage.file, {
        onProgress: setUploadProgress,
      })
      return url
    } catch {
      setUploadFailed(true)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if ((!text && !pendingImage) || isSending || isUploading) return
    if (pendingImage && uploadFailed) return // use the Retry button instead

    // Keep the draft/image in place until we know the message actually went
    // through — a network drop mid-upload or mid-send must not silently
    // lose what the user typed/attached; a failed upload surfaces a Retry
    // button rather than just a toast with nothing to act on.
    let imageUrl
    if (pendingImage) {
      imageUrl = await uploadPendingImage()
      if (!imageUrl) return
    }

    sendMessage(
      { content: text, imageUrl },
      {
        onSuccess: () => {
          setDraft('')
          clearPendingImage()
        },
        onError: () => toast.error(t('support.sendFailed')),
      }
    )
  }

  return (
    <div
      className="flex flex-col bg-gray-50 h-[100dvh]"
      style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
    >
      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <button
          onClick={() => navigate('/matches')}
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
          <div className="flex flex-col items-center gap-2 mt-4">
            <p className="text-center text-sm text-gray-400">{t('conversation.couldNotLoad')}</p>
            <button
              type="button"
              onClick={() => refetchHistory()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary font-medium hover:bg-primary/5 rounded-full transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              {t('support.retry')}
            </button>
          </div>
        )}

        {!isLoading && !isError && messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">{t('support.emptyPrompt')}</p>
        )}

        {messages.map((msg, index) => (
          <div key={msg.id}>
            {isNewDay(messages, index) && (
              <DateDivider label={formatDateDivider(msg.sentAt, t)} />
            )}
            {msg.imageUrl ? (
              // Photo message: the image stays the dominant element in its own
              // rounded top section, capped so it can't blow out the thread —
              // caption + time sit below on a plain surface (same treatment as
              // an incoming text bubble), not a full-width accent block, so
              // they never fight the photo's own colors.
              <div className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
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
              <div className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
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
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
        {pendingImage && (
          <div className="flex items-center gap-3 px-4 pt-3">
            <div className="relative">
              <img
                src={pendingImage.previewUrl}
                alt=""
                className={`w-14 h-14 rounded-lg object-cover ${isUploading ? 'opacity-50' : ''}`}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-white bg-gray-900/70 rounded-full px-1.5 py-0.5">
                    {Math.round(uploadProgress * 100)}%
                  </span>
                </div>
              )}
              {!isUploading && (
                <button
                  type="button"
                  onClick={clearPendingImage}
                  aria-label={t('support.removeImage')}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {uploadFailed && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-rose-600">{t('support.imageUploadFailed')}</p>
                <button
                  type="button"
                  onClick={uploadPendingImage}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <RotateCw className="w-3 h-3" />
                  {t('support.retry')}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 px-3 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
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
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('conversation.typeMessage')}
            // iOS Safari auto-zooms the page on focus for any input with a
            // computed font-size under 16px — text-sm (14px) was tripping
            // that, so this is pinned to 16px directly (matches the fix in
            // ChatConversationPage).
            style={{ fontSize: 16 }}
            className="flex-1 min-w-0 px-4 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={(!draft.trim() && !pendingImage) || isSending || isUploading}
            aria-label={t('conversation.sendMessage')}
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center bg-primary text-white rounded-full disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
