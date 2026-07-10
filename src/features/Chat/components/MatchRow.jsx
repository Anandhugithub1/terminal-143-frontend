import { useState } from 'react'
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from 'react-icons/ai'
import { MoreVertical } from 'lucide-react'

function getAge(dob) {
  if (!dob) return null
  return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000))
}

function formatTimestamp(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = diffMs / 60000
  if (diffMin < 1) return 'now'
  if (diffMin < 60) return `${Math.floor(diffMin)}m`
  const diffHr = diffMin / 60
  if (diffHr < 24) return `${Math.floor(diffHr)}h`
  const diffDay = diffHr / 24
  if (diffDay < 7) return `${Math.floor(diffDay)}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function MatchRow({
  match,
  preview,
  feedbackState,
  feedbackDisabled,
  onOpenChat,
  onOpenProfile,
  onLike,
  onDislike,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const hasConversation = !!preview?.lastMessage
  const unread = preview?.unreadCount || 0
  const preview_text = hasConversation
    ? `${preview.lastMessageMine ? 'You: ' : ''}${preview.lastMessage}`
    : 'Say hi 👋'
  const age = getAge(match.dob)

  return (
    <div className="relative flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <button
        onClick={onOpenProfile}
        className="relative shrink-0"
        aria-label={`View ${match.name}'s profile`}
      >
        <img
          src={match.photos?.[0]?.url}
          alt={match.name}
          className="w-14 h-14 rounded-full object-cover"
          loading="lazy"
        />
        {preview?.online && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
        )}
      </button>

      <button onClick={onOpenChat} className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate ${
              unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
            }`}
          >
            {match.name}
            {age != null && <span className="font-normal text-gray-500">, {age}</span>}
          </span>
          <span className="text-xs text-gray-400 shrink-0">
            {formatTimestamp(preview?.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span
            className={`truncate text-sm ${
              unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}
          >
            {preview_text}
          </span>
          {unread > 0 && (
            <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
      </button>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-40">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onOpenProfile()
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                View profile
              </button>
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  disabled={feedbackDisabled || feedbackState === 'liked'}
                  onClick={() => {
                    setMenuOpen(false)
                    onLike()
                  }}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                    feedbackState === 'liked'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                  }`}
                >
                  {feedbackState === 'liked' ? (
                    <AiFillLike size={16} />
                  ) : (
                    <AiOutlineLike size={16} />
                  )}
                </button>
                <button
                  disabled={feedbackDisabled || feedbackState === 'disliked'}
                  onClick={() => {
                    setMenuOpen(false)
                    onDislike()
                  }}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                    feedbackState === 'disliked'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {feedbackState === 'disliked' ? (
                    <AiFillDislike size={16} />
                  ) : (
                    <AiOutlineDislike size={16} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
