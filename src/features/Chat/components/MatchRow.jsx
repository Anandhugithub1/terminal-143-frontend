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
  if (diffMin < 60) return `${Math.floor(diffMin)} min`
  const diffHr = diffMin / 60
  if (diffHr < 24) return `${Math.floor(diffHr)} hrs`
  const diffDay = diffHr / 24
  if (diffDay < 7) return `${Math.floor(diffDay)}d`
  return 'Last week'
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
    <div className="relative flex items-center gap-3 px-4 py-2.5">
      <button
        onClick={onOpenProfile}
        className="shrink-0"
        aria-label={`View ${match.name}'s profile`}
      >
        <img
          src={match.photos?.[0]?.url}
          alt={match.name}
          className="w-12 h-12 rounded-full object-cover bg-gray-100"
          loading="lazy"
        />
      </button>

      <button onClick={onOpenChat} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-[14.5px] font-bold text-gray-900">
            {match.name}
            {age != null && <span className="font-normal text-gray-500">, {age}</span>}
          </span>
          {unread > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
        </div>
        <p
          className={`truncate text-[13px] mt-0.5 ${
            unread > 0 ? 'text-gray-600 font-medium' : 'text-gray-400'
          }`}
        >
          {preview_text}
        </p>
      </button>

      <span className="text-[11px] text-gray-400 shrink-0 self-start pt-0.5">
        {formatTimestamp(preview?.lastMessageAt)}
      </span>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1.5 -mr-1.5 text-gray-300 hover:text-gray-500 rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
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
