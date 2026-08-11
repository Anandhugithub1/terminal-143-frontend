import { useTranslation } from 'react-i18next'
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

// Members are listed but never tappable-to-profile, same rule as the chat
// bubbles themselves (see CircleChatThread) — this exists so people can see
// who's in the circle, not as a way to reach someone's profile.
export default function CircleMembersSheet({ isOpen, onClose, circleId, circleName, memberCount }) {
  const { t } = useTranslation('chat')
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
          (members || []).map((member) => {
            const displayName = member.name || member.userId
            return (
              <div key={member.userId} className="flex items-center gap-3 px-4 py-2.5">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: colorForMember(member.userId) }}
                  >
                    {initialsFor(displayName)}
                  </div>
                )}
                <span className="flex-1 min-w-0 text-[14px] font-semibold text-gray-900 truncate">{displayName}</span>
                <RoleBadge role={member.role} t={t} />
              </div>
            )
          })
        )}
      </div>
    </BottomSheetModal>
  )
}
