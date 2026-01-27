import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Skeleton from "react-loading-skeleton"
import { ArrowLeft, Bell } from "lucide-react"

import { useNotifications } from "../Hooks/useNotifications"

function normalizeNotification(n) {
  if (n.message) return n

  let message = "You have a new notification"

  switch (n.type) {
    case "MATCH":
      message = `${n.fromUsername} matched with you`
      break

    case "REQUEST_ACCEPTED":
      message = `${n.fromUsername} accepted your request`
      break

    case "MESSAGE":
      message = `New message from ${n.fromUsername}`
      break

    default:
      message = n.payload?.message || message
  }

  return {
    ...n,
    message
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate()

  const {
    data,
    isLoading,
    isError
  } = useNotifications()

  const notifications = useMemo(() => {
    const raw = data?.pages.flatMap(p => p.items) || []
    return raw.map(normalizeNotification)
  }, [data])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-900">
            Notifications
          </h1>
        </header>

        <main className="px-4 py-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border-clr"
            >
              <Skeleton width={160} height={14} />
              <Skeleton width={220} height={12} className="mt-2" />
            </div>
          ))}
        </main>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center">
        Failed to load notifications
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-900">
            Notifications
          </h1>
        </header>

        <main className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-input flex items-center justify-center mb-4">
              <Bell className="text-text-pr" />
            </div>
            <h2 className="font-semibold text-gray-900">
              No notifications today
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              You’re all caught up.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="ml-4 text-lg font-semibold text-gray-900">
          Notifications
        </h1>
      </header>

    <main className="px-4 py-4 space-y-3">
  {notifications.map(n => (
    <div
      key={n.SK}
      className="flex items-start gap-3 p-4 rounded-xl border border-border-clr bg-white"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
        <Bell size={18} className="text-pink-500" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 leading-snug">
          {n.message}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {new Date(n.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  ))}
</main>

    </div>
  )
}
