import { HelpCircle, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Pinned entry point to the standalone support conversation (see
// SupportChatPage) — always shown first, above real matches, independent of
// whether this user has ever messaged support before.
export default function SupportRow({ onOpenChat }) {
  const { t } = useTranslation('chat')

  return (
    <button onClick={onOpenChat} className="w-full flex items-center gap-3 px-4 py-2.5 text-left">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <HelpCircle className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[14.5px] font-bold text-gray-900">{t('support.title')}</span>
        <p className="truncate text-[13px] mt-0.5 text-gray-400">{t('support.rowSubtitle')}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </button>
  )
}
