import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import BottomSheetModal from '../../../../shared/components/BottomSheetModal'
import { useCircleMembers } from '../../api/circleChatApi'
import { colorForMember, initialsFor } from './CircleChatThread'

function RoleBadge({ role, t }) {
  if (role !== 'owner' && role !== 'admin') return null
  return (
    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
      {role === 'owner' ? t('circleConversation.roleOwner') : t('circleConversation.roleAdmin')}
    </span>
  )
}

// Same link-parsing fallback as ChatConversationPage's goToProfile — the
// server sends a full URL (profileLink is persisted as `${BASE_URL}/profile/
// {username}`), so navigate by its pathname; fall back to the raw string if
// URL parsing fails for any reason.
function goToProfile(navigate, profileLink) {
  if (!profileLink) return
  try {
    navigate(new URL(profileLink).pathname, { state: { isMatch: true } })
  } catch {
    navigate(profileLink, { state: { isMatch: true } })
  }
}

// A member row is tappable-to-profile ONLY when the server marked them
// isCompatible — that's a mutual gender/preference match against the
// viewer, computed server-side (see chat-service's getCircleMembers.js).
// Everyone else stays visible-but-not-tappable, same as the chat bubbles.
function MemberRow({ member, t, navigate }) {
  const displayName = member.name || member.userId
  const avatar = member.avatarUrl ? (
    <img src={member.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
  ) : (
    <div
      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
      style={{ backgroundColor: colorForMember(member.userId) }}
    >
      {initialsFor(displayName)}
    </div>
  )

  const content = (
    <>
      {avatar}
      <span className="flex-1 min-w-0 text-[14px] font-semibold text-gray-900 truncate text-left">{displayName}</span>
      {member.isCompatible && (
        <Heart className="w-4 h-4 text-primary shrink-0" fill="currentColor" aria-label={t('circleConversation.compatibleMember')} />
      )}
      <RoleBadge role={member.role} t={t} />
    </>
  )

  if (member.isCompatible && member.profileLink) {
    return (
      <button
        onClick={() => goToProfile(navigate, member.profileLink)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        aria-label={t('circleConversation.viewProfileAria', { name: displayName })}
      >
        {content}
      </button>
    )
  }

  return <div className="flex items-center gap-3 px-4 py-2.5">{content}</div>
}

export default function CircleMembersSheet({ isOpen, onClose, circleId, circleName, memberCount }) {
  const { t } = useTranslation('chat')
  const navigate = useNavigate()
  const { data: members, isLoading } = useCircleMembers(circleId)

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose} panelClassName="rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[75vh] flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
        <p className="text-base font-semibold text-gray-900 truncate">{circleName}</p>
        <p className="text-xs text-gray-400">{t('circleConversation.memberCount', { count: memberCount })}</p>
      </div>

      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="px-4 py-3 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton circle width={36} height={36} />
                <Skeleton height={12} width="40%" />
              </div>
            ))}
          </div>
        ) : (
          (members || []).map((member) => (
            <MemberRow key={member.userId} member={member} t={t} navigate={navigate} />
          ))
        )}
      </div>
    </BottomSheetModal>
  )
}
