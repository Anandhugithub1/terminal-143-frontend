import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { Bell } from "lucide-react";
import { getWelcomeNotification, normalizeNotification, getNotificationLink } from "../utlis/getWelcomeNotification";
import { useNotifications } from "../Hooks/useNotifications";
import PageHeader from "../../../shared/components/PageHeader";
import EmptyState from "../../../shared/components/EmptyState";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useNotifications();

  const notifications = useMemo(() => {
    const raw = data?.pages.flatMap(p => p.items) || [];
    const normalized = raw.map(normalizeNotification);
    const welcome = getWelcomeNotification();
    return welcome ? [welcome, ...normalized] : normalized;
  }, [data]);

  return (
    <div className="min-h-[100dvh] bg-white">
      <PageHeader title="Notifications" />

      {isLoading && (
        <main className="px-4 py-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl border border-border-clr">
              <Skeleton width={160} height={14} />
              <Skeleton width={220} height={12} className="mt-2" />
            </div>
          ))}
        </main>
      )}

      {isError && (
        <div className="h-[60vh] flex items-center justify-center">
          <p className="text-red-500 text-sm">Failed to load notifications</p>
        </div>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No notifications today"
          subtitle="You're all caught up."
          className="mt-16"
        />
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <main className="px-4 py-4 space-y-3">
          {notifications.map(n => {
            const link = getNotificationLink(n);
            const Wrapper = link ? "button" : "div";

            return (
              <Wrapper
                key={n.SK}
                onClick={link ? () => navigate(link) : undefined}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border border-border-clr bg-white text-left ${
                  link ? "cursor-pointer active:bg-gray-50" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  n.type === "WELCOME" ? "bg-blue-50" : "bg-pink-50"
                }`}>
                  <Bell
                    size={18}
                    className={n.type === "WELCOME" ? "text-blue-500" : "text-pink-500"}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 leading-snug">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </Wrapper>
            );
          })}
        </main>
      )}
    </div>
  );
}
