import {
  ArrowLeft,
  Users,
  Clock,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  ShieldOff,
  UserMinus,
  Crown,
  Inbox,
  TrendingUp,
  Flame,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCircle, useCircleStats } from "../hooks/useCircles";
import {
  useCircleRequests,
  useAcceptCircleRequest,
  useRejectCircleRequest,
  useRemoveCircleMember,
  useSetCircleMemberRole,
} from "../hooks/useMembership";
import { useCirclePostsForStats } from "../hooks/usePosts";
import { useCircleMembers } from "../api/circleChatApi";
import { useMyProfile } from "../../UserProfile/Hooks/useMyProfile";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import ActivityTrendChart from "../components/common/ActivityTrendChart";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import { formatPostTime, getAuthorDisplayName, DEFAULT_AVATAR } from "../utils/postDisplay";
import {
  getTopPosts,
  getMostActiveMembers,
  getActivityTrend,
  getEngagementRate,
  getTotalEngagement,
} from "../utils/circleInsights";
import { CircleHeaderSkeleton } from "../components/common/Skeletons";

const MODERATOR_ROLES = ["owner", "moderator"];

// Deterministic pastel background per user, so avatars without a photo still
// read as distinct people in a list rather than all being the same gray
// circle — same idea as the initials-avatar pattern elsewhere in the app,
// just with a small fixed palette instead of a random color per render.
const AVATAR_RAMP = [
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-sky-100 text-sky-600",
  "bg-violet-100 text-violet-600",
  "bg-pink-100 text-pink-600",
];

function avatarClass(seed) {
  if (!seed) return AVATAR_RAMP[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_RAMP[hash % AVATAR_RAMP.length];
}

function InitialAvatar({ name, size = "w-10 h-10 text-sm" }) {
  const initial = (name || "?")[0]?.toUpperCase() || "?";
  return (
    <div className={`${size} rounded-full flex items-center justify-center font-bold shrink-0 ${avatarClass(name)}`}>
      {initial}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = "default" }) {
  const toneClasses = {
    default: { icon: "text-gray-400", value: "text-gray-900" },
    warning: { icon: "text-amber-500", value: "text-amber-600" },
    success: { icon: "text-emerald-500", value: "text-gray-900" },
  }[tone];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Icon className={`w-4 h-4 ${toneClasses.icon}`} />
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</span>
      </div>
      <div className={`text-[26px] leading-none font-extrabold tabular-nums ${toneClasses.value}`}>{value}</div>
    </div>
  );
}

function RolePill({ role, t }) {
  if (role === "owner") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
        <Crown className="w-2.5 h-2.5" />
        {t("moderatorDashboard.roleOwner")}
      </span>
    );
  }
  if (role === "moderator") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
        <ShieldCheck className="w-2.5 h-2.5" />
        {t("moderatorDashboard.roleModerator")}
      </span>
    );
  }
  return null;
}

export default function ModeratorDashboardPage() {
  const { t } = useTranslation("circles");
  const { circleId } = useParams();
  const navigate = useNavigate();

  const [removeConfirm, setRemoveConfirm] = useState(null);

  const { data: circle, isLoading: isLoadingCircle } = useCircle(circleId);
  const { data: stats, isLoading: isLoadingStats } = useCircleStats(circleId);
  const { data: requestsData, isLoading: isLoadingRequests } = useCircleRequests(circleId);
  const { byUserId: membersByUserId, data: membersData, isLoading: isLoadingMembers } = useCircleMembers(circleId);
  const { data: myProfile } = useMyProfile();

  const acceptMutation = useAcceptCircleRequest(circleId);
  const rejectMutation = useRejectCircleRequest(circleId);
  const removeMutation = useRemoveCircleMember(circleId);
  const setRoleMutation = useSetCircleMemberRole(circleId);

  const myId = myProfile?.username?.replace(/^USER#/, "") ?? "";
  const isOwner = !!myId && myId === circle?.ownerId;
  const myRole = isOwner ? "owner" : membersByUserId.get(myId)?.role ?? null;
  const canModerate = MODERATOR_ROLES.includes(myRole);

  const requests = requestsData?.items || [];
  // Owner first, then moderators, then members — same hierarchy the role
  // rules enforce, so the list reads top-down as "who has authority here."
  const roleOrder = { owner: 0, moderator: 1, member: 2 };
  const members = [...(membersData || [])].sort(
    (a, b) => (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3)
  );

  // Only fetched once the caller is confirmed to be able to see this page —
  // avoids the extra Query entirely for the brief window before the role
  // check below resolves. Bounded to a single 50-post page (see the hook's
  // own comment): a real DynamoDB Query on the circle's partition key, not
  // a Scan, and never paginated further just to compute stats.
  const { data: postsForStats, isLoading: isLoadingInsights } = useCirclePostsForStats(
    canModerate ? circleId : null,
    { limit: 50 }
  );
  // Memoized so a stable empty array (not a fresh [] literal every render)
  // flows into the useMemo calls below — otherwise each of those would see
  // a "changed" dependency on every render and never actually memoize.
  const recentPosts = useMemo(() => postsForStats?.items || [], [postsForStats]);

  const topPosts = useMemo(() => getTopPosts(recentPosts, { limit: 5 }), [recentPosts]);
  const mostActiveMembers = useMemo(
    () => getMostActiveMembers(recentPosts, { limit: 5 }),
    [recentPosts]
  );
  const activityBuckets = useMemo(() => getActivityTrend(recentPosts, { days: 7 }), [recentPosts]);
  const engagementRate = useMemo(
    () => getEngagementRate(recentPosts, stats?.memberCount),
    [recentPosts, stats?.memberCount]
  );
  const totalEngagement = useMemo(() => getTotalEngagement(recentPosts), [recentPosts]);
  const dayLabels = useMemo(
    () =>
      activityBuckets.map((b) =>
        new Date(b.dayStart).toLocaleDateString(undefined, { weekday: "narrow" })
      ),
    [activityBuckets]
  );
  // A full 50-post page with zero engagement anywhere reads as "insights not
  // meaningful yet" rather than an empty circle — distinct from simply
  // having fewer than 50 posts, which is still a fine sample.
  const hasInsightsSample = recentPosts.length > 0;

  if (isLoadingCircle) {
    return <CircleHeaderSkeleton />;
  }

  if (!isLoadingCircle && circle && !isOwner && myRole && !canModerate) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center px-6">
        <EmptyState
          icon={ShieldOff}
          title={t("moderatorDashboard.notAllowedTitle")}
          subtitle={t("moderatorDashboard.notAllowedBody")}
          action={
            <button
              onClick={() => navigate(`/circles/${circleId}`)}
              className="px-6 py-2.5 btn-filled text-sm rounded-full"
            >
              {t("moderatorDashboard.backToCircle")}
            </button>
          }
        />
      </div>
    );
  }

  const handleAccept = (userId) => {
    acceptMutation.mutate(userId, {
      onSuccess: () => toast.success(t("moderatorDashboard.requestAcceptedToast")),
      onError: (err) => toast.error(getErrorMessage(err, "circleModerateFailed")),
    });
  };

  const handleReject = (userId) => {
    rejectMutation.mutate(userId, {
      onSuccess: () => toast.success(t("moderatorDashboard.requestDeclinedToast")),
      onError: (err) => toast.error(getErrorMessage(err, "circleModerateFailed")),
    });
  };

  const handleConfirmRemove = () => {
    if (!removeConfirm) return;
    removeMutation.mutate(removeConfirm.userId, {
      onSuccess: () => {
        toast.success(t("moderatorDashboard.memberRemovedToast"));
        setRemoveConfirm(null);
      },
      onError: (err) => {
        toast.error(getErrorMessage(err, "circleModerateFailed"));
        setRemoveConfirm(null);
      },
    });
  };

  const handleSetRole = (userId, role) => {
    setRoleMutation.mutate(
      { userId, role },
      {
        onSuccess: () => {
          toast.success(
            role === "moderator"
              ? t("moderatorDashboard.memberPromotedToast")
              : t("moderatorDashboard.memberDemotedToast")
          );
        },
        onError: (err) => toast.error(getErrorMessage(err, "circleModerateFailed")),
      }
    );
  };

  const pendingCount = stats?.requests?.pending ?? requests.length;

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-10">
      <ConfirmDialog
        isOpen={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={handleConfirmRemove}
        title={t("moderatorDashboard.removeMemberTitle")}
        message={t("moderatorDashboard.removeMemberMessage", { name: removeConfirm?.name || removeConfirm?.userId })}
        confirmLabel={t("moderatorDashboard.removeMember")}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-gray-900 truncate">{t("moderatorDashboard.header")}</h1>
          {circle?.name && <p className="text-xs text-gray-400 truncate">{circle.name}</p>}
        </div>
        {pendingCount > 0 && (
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
            {t("moderatorDashboard.pendingBadge", { count: pendingCount })}
          </span>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-6">

        {/* Stats */}
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2 px-1">
            {t("moderatorDashboard.overview")}
          </h2>
          {isLoadingStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-[86px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users} label={t("moderatorDashboard.statMembers")} value={stats?.memberCount ?? 0} />
              <StatCard
                icon={Clock}
                label={t("moderatorDashboard.statPending")}
                value={pendingCount}
                tone={pendingCount > 0 ? "warning" : "default"}
              />
              <StatCard icon={MessageSquare} label={t("moderatorDashboard.statPosts")} value={Math.max(0, stats?.postCount ?? 0)} />
              <StatCard
                icon={CheckCircle2}
                label={t("moderatorDashboard.statAccepted")}
                value={stats?.requests?.accepted ?? 0}
                tone="success"
              />
            </div>
          )}
        </div>

        {/* Insights — computed from the circle's most recent posts, not a
            lifetime total (see useCirclePostsForStats). Only rendered once
            canModerate is confirmed, since that's what gates the fetch. */}
        {canModerate && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2 px-1">
              {t("moderatorDashboard.insights")}
            </h2>

            {isLoadingInsights ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-40 animate-pulse" />
            ) : !hasInsightsSample ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <EmptyState
                  icon={TrendingUp}
                  title={t("moderatorDashboard.noInsightsTitle")}
                  subtitle={t("moderatorDashboard.noInsightsBody")}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Activity trend + engagement rate */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-gray-900">
                        {t("moderatorDashboard.activityTrend")}
                      </span>
                    </div>
                    {engagementRate !== null && (
                      <div className="text-right">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          {t("moderatorDashboard.engagementRate")}
                        </div>
                        <div className="text-sm font-extrabold text-gray-900 tabular-nums">
                          {engagementRate.toFixed(1)}
                          <span className="text-[11px] font-medium text-gray-400">
                            {" "}
                            {t("moderatorDashboard.perMember")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <ActivityTrendChart buckets={activityBuckets} dayLabels={dayLabels} />
                  <p className="text-[11px] text-gray-400 mt-2">
                    {t("moderatorDashboard.insightsSampleNote", {
                      count: recentPosts.length,
                      engagement: totalEngagement,
                    })}
                  </p>
                </div>

                {/* Top posts + most active members, side by side on wider screens */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1.5 px-4 pt-4 pb-1">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-gray-900">
                        {t("moderatorDashboard.topPosts")}
                      </span>
                    </div>
                    {topPosts.length === 0 ? (
                      <p className="text-xs text-gray-400 px-4 pb-4 pt-1">
                        {t("moderatorDashboard.noEngagementYet")}
                      </p>
                    ) : (
                      <div className="pb-2">
                        {topPosts.map(({ post }, idx) => (
                          <div
                            key={post.postId}
                            className={`flex items-center gap-2.5 px-4 py-2.5 ${
                              idx !== topPosts.length - 1 ? "border-b border-gray-50" : ""
                            }`}
                          >
                            <span className="w-4 text-[11px] font-bold text-gray-300 shrink-0 tabular-nums">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-700 truncate">
                                {post.content || t("moderatorDashboard.mediaPost")}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate">
                                {getAuthorDisplayName(post) || post.authorId}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold text-gray-500 tabular-nums">
                              <span className="flex items-center gap-0.5">
                                <Heart className="w-3 h-3" />
                                {(post?.interactions?.match || 0) + (post?.interactions?.pass || 0)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <MessageCircle className="w-3 h-3" />
                                {post.commentCount || 0}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1.5 px-4 pt-4 pb-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-gray-900">
                        {t("moderatorDashboard.mostActive")}
                      </span>
                    </div>
                    {mostActiveMembers.length === 0 ? (
                      <p className="text-xs text-gray-400 px-4 pb-4 pt-1">
                        {t("moderatorDashboard.noEngagementYet")}
                      </p>
                    ) : (
                      <div className="pb-2">
                        {mostActiveMembers.map((member, idx) => {
                          const maxEngagement = mostActiveMembers[0]?.engagement || 1;
                          const barPct = Math.max(6, (member.engagement / maxEngagement) * 100);
                          return (
                            <div
                              key={member.authorId}
                              className={`px-4 py-2.5 ${
                                idx !== mostActiveMembers.length - 1 ? "border-b border-gray-50" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2.5 mb-1.5">
                                <img
                                  src={member.avatarUrl || DEFAULT_AVATAR}
                                  alt={member.displayName}
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                />
                                <span className="text-xs font-semibold text-gray-800 truncate flex-1">
                                  {member.displayName}
                                </span>
                                <span className="text-[11px] font-bold text-gray-500 tabular-nums shrink-0">
                                  {member.postCount} {member.postCount === 1 ? "post" : "posts"}
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary/60 rounded-full"
                                  style={{ width: `${barPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending requests */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              {t("moderatorDashboard.pendingRequests")}
            </h2>
            {requests.length > 0 && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoadingRequests && (
              <div className="p-4 space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!isLoadingRequests && requests.length === 0 && (
              <EmptyState
                icon={Inbox}
                title={t("moderatorDashboard.noPendingTitle")}
                subtitle={t("moderatorDashboard.noPendingBody")}
              />
            )}

            {requests.map((req, idx) => (
              <div
                key={req.requesterId}
                className={`p-4 ${idx !== requests.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <InitialAvatar name={req.requesterId} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{req.requesterId}</p>
                      {req.createdAt && (
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {formatPostTime(new Date(req.createdAt).getTime())}
                        </span>
                      )}
                    </div>
                    {req.message && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 mt-1.5 leading-relaxed">
                        {req.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pl-[52px]">
                  <button
                    onClick={() => handleReject(req.requesterId)}
                    disabled={rejectMutation.isPending}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                  >
                    {t("moderatorDashboard.decline")}
                  </button>
                  <button
                    onClick={() => handleAccept(req.requesterId)}
                    disabled={acceptMutation.isPending}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold btn-filled disabled:opacity-60"
                  >
                    {t("moderatorDashboard.accept")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2 px-1">
            {t("moderatorDashboard.members", { count: members.length })}
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoadingMembers && (
              <div className="p-4 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!isLoadingMembers &&
              members.map((member, idx) => {
                const isMemberOwner = member.role === "owner";
                const isMemberModerator = member.role === "moderator";
                // A moderator cannot act on the owner or on a fellow
                // moderator — matches removeMember.js/setRole.js exactly;
                // only the owner sees controls on another moderator's row.
                const canActOnThisMember =
                  !isMemberOwner && (isOwner || (canModerate && !isMemberModerator));

                return (
                  <div
                    key={member.userId}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      idx !== members.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name || member.userId}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <InitialAvatar name={member.name || member.userId} />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {member.name || member.userId}
                        </p>
                        <RolePill role={member.role} t={t} />
                      </div>
                    </div>

                    {canActOnThisMember ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOwner && (
                          <button
                            onClick={() =>
                              handleSetRole(member.userId, isMemberModerator ? "member" : "moderator")
                            }
                            disabled={setRoleMutation.isPending}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors whitespace-nowrap"
                          >
                            {isMemberModerator
                              ? t("moderatorDashboard.demote")
                              : t("moderatorDashboard.promote")}
                          </button>
                        )}
                        <button
                          onClick={() => setRemoveConfirm(member)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                          aria-label={t("moderatorDashboard.removeMember")}
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      isMemberOwner && (
                        <span className="text-[11px] text-gray-300 font-medium shrink-0">
                          {t("moderatorDashboard.founder")}
                        </span>
                      )
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
