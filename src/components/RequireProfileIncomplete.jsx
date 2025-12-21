import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { LoadingSpinner } from "./Ui/Spinner"
import { useMyProfile } from "../features/UserProfile/Hooks/useMyProfile"

export default function RequireProfileIncomplete({ children }) {
  const location = useLocation()
  const { data, isLoading, isError, error } = useMyProfile()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    const status = error?.response?.status
    const code = error?.response?.data?.code

    if (status === 404 || code === "PROFILE_NOT_FOUND") {
      return children
    }

    return (
      <div className="p-4 text-center text-red-500">
        Error loading your profile: {error?.message}
      </div>
    )
  }

  if (data?.profileCompleted) {
    return <Navigate to="/home" state={{ from: location }} replace />
  }

  return children
}
