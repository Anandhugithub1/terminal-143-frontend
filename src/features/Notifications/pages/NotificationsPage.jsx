import React from "react"
import { useNavigate } from "react-router-dom"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import "@fontsource-variable/inter"

import { ArrowLeft, Bell } from "lucide-react"

export default function NotificationsPage() {
  const navigate = useNavigate()

  const isLoading = false
  const isError = false

  // backend will populate this later
  const notifications = []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-inter">
        <header className="flex items-center px-4 py-3 border-b border-gray-200">
          <button onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft size={24} />
          </button>
          <h1 className="ml-4 text-lg font-semibold">
            Notifications
          </h1>
        </header>

        <main className="px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <Skeleton width={140} height={14} />
              <Skeleton width={220} height={12} className="mt-2" />
            </div>
          ))}
        </main>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        Failed to load notifications
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      <header className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">
          Notifications
        </h1>
      </header>

      <main className="flex items-center justify-center px-6 py-20 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Bell className="text-gray-400" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            No notifications today
          </h2>

          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            You’re all caught up. We’ll let you know when something happens.
          </p>
        </div>
      </main>
    </div>
  )
}
