import { useState } from 'react'
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from 'react-icons/ai'
import { MoreVertical, ShieldOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function getAge(dob) {
  if (!dob) return null
  return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000))
}

function formatTimestamp(iso, t) {
  if (!iso) return ''
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = diffMs / 60000
  if (diffMin < 1) return t('matchRow.timeNow')
  if (diffMin < 60) return t('matchRow.timeMinutes', { count: Math.floor(diffMin) })
  const diffHr = diffMin / 60
  if (diffHr < 24) return t('matchRow.timeHours', { count: Math.floor(diffHr) })
  const diffDay = diffHr / 24
  if (diffDay < 7) return t('matchRow.timeDays', { count: Math.floor(diffDay) })
  return t('matchRow.timeLastWeek')
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
  const { t } = useTranslation('chat')
  const [menuOpen, setMenuOpen] = useState(false)

  const blocked = !!preview?.blockedByMe
  const hasConversation = !!preview?.lastMessage
  // A blocked thread shows "Blocked" instead of the last message: the point of
  // keeping it listed is to offer a way back in, not to surface its content.
  // Unread is suppressed for the same reason (the server also zeroes it).
  const unread = blocked ? 0 : preview?.unreadCount || 0
  const preview_text = blocked
    ? t('matchRow.blocked')
    : hasConversation
      ? `${preview.lastMessageMine ? t('matchRow.youPrefix') : ''}${preview.lastMessage}`
      : t('matchRow.sayHi')
  const age = getAge(match.dob)

  return (
    <div className="relative flex items-center gap-3 px-4 py-2.5">
      <button
        onClick={onOpenProfile}
        className="shrink-0"
        aria-label={t('matchRow.viewProfileAria', { name: match.name })}
      >
        <img
          src={match.photos?.[0]?.url}
          alt={match.name}
          className={`w-12 h-12 rounded-full object-cover bg-gray-100 ${
            blocked ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />
      </button>

      <button onClick={onOpenChat} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-[14.5px] font-bold text-gray-900">
            {match.name}
            {age != null && <span className="font-normal text-gray-500">, {age}</span>}
          </span>
        </div>
        <p
          className={`truncate text-[13px] mt-0.5 flex items-center gap-1 ${
            unread > 0 ? 'text-gray-800 font-semibold' : 'text-gray-400'
          }`}
        >
          {blocked && <ShieldOff className="w-3 h-3 shrink-0" />}
          {preview_text}
        </p>
      </button>

      <div className="shrink-0 self-start flex flex-col items-end gap-1 pt-0.5">
        <span className={`text-[11px] ${unread > 0 ? 'text-primary font-semibold' : 'text-gray-400'}`}>
          {blocked ? '' : formatTimestamp(preview?.lastMessageAt, t)}
        </span>
        {unread > 0 && (
          <span
            className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center leading-none"
            aria-label={`${unread} unread`}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1.5 -mr-1.5 text-gray-300 hover:text-gray-500 rounded-full transition-colors"
          aria-label={t('matchRow.moreOptions')}
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
                {t('matchRow.viewProfile')}
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
