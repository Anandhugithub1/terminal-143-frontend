import { HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

// Pinned entry point to the standalone support conversation (see
// SupportChatPage) — always shown first, above real matches, independent of
// whether this user has ever messaged support before. `preview` is
// unreadCounts.conversations['SUPPORT'] (see useUnreadCounts) — undefined
// until the user has actually sent/received a support message.
export default function SupportRow({ onOpenChat, preview }) {
  const { t } = useTranslation('chat')

  const unread = preview?.unreadCount || 0
  const hasConversation = !!preview?.lastMessage
  const previewText = hasConversation ? preview.lastMessage : t('support.rowSubtitle')

  return (
    <button onClick={onOpenChat} className="w-full flex items-center gap-3 px-4 py-2.5 text-left">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <HelpCircle className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[14.5px] font-bold text-gray-900">{t('support.title')}</span>
        <p
          className={`truncate text-[13px] mt-0.5 ${
            unread > 0 ? 'text-gray-800 font-semibold' : 'text-gray-400'
          }`}
        >
          {previewText}
        </p>
      </div>
      <div className="shrink-0 self-start flex flex-col items-end gap-1 pt-0.5">
        <span className={`text-[11px] ${unread > 0 ? 'text-primary font-semibold' : 'text-gray-400'}`}>
          {formatTimestamp(preview?.lastMessageAt, t)}
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
    </button>
  )
}
