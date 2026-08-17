import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useTranslation } from 'react-i18next'
import { useCircle } from '../hooks/useCircles'
import { useVisualViewportHeight } from '../../../shared/hooks/useVisualViewportHeight'
import { useTranslatedCircleName } from '../constants/onboardingCircles'
import CircleChatThread, { colorForMember, initialsFor } from '../components/chat/CircleChatThread'
import CircleMembersSheet from '../components/chat/CircleMembersSheet'

// Standalone full-screen thread — the entry point from the Chats list and
// the story-ring badge. Just a header (back button + circle identity) around
// the shared CircleChatThread; CircleDetailsPage's Chat tab embeds the same
// thread component under its own hero instead of this header.
export default function CircleChatPage() {
  const { t } = useTranslation('chat')
  const { circleId } = useParams()
  const navigate = useNavigate()
  const viewportHeight = useVisualViewportHeight()
  const getCircleName = useTranslatedCircleName()
  const [showMembers, setShowMembers] = useState(false)

  const { data: circle, isLoading: isCircleLoading } = useCircle(circleId)
  const circleName = circle ? getCircleName(circleId, circle.name) : ''
  const memberCount = circle?.memberCount ?? 0

  return (
    <div
      className="flex flex-col bg-gray-50 h-[100dvh]"
      style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
    >
      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <button
          onClick={() => navigate('/matches')}
          className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          aria-label={t('circleConversation.back')}
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        {isCircleLoading ? (
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
            onClick={() => setShowMembers(true)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-full -my-1 py-1 pr-2 hover:bg-gray-50 transition-colors"
            aria-label={t('circleConversation.viewMembersAria', { name: circleName })}
          >
            {circle?.coverPhoto ? (
              <img src={circle.coverPhoto} alt={circleName} className="w-9 h-9 rounded-full object-cover bg-gray-100 shrink-0" />
            ) : (
              <div
                className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: colorForMember(circleId) }}
              >
                {initialsFor(circleName)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-900 truncate">{circleName}</p>
              <span className="text-xs text-gray-400">{t('circleConversation.memberCount', { count: memberCount })}</span>
            </div>
          </button>
        )}
      </header>

      {isCircleLoading ? null : <CircleChatThread circleId={circleId} circleName={circleName} />}

      <CircleMembersSheet
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        circleId={circleId}
        circleName={circleName}
        memberCount={memberCount}
      />
    </div>
  )
}
