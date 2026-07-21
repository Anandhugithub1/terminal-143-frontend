import { Navigate } from "react-router-dom"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"
import { useMyProfile } from "../features/UserProfile/Hooks/useMyProfile.js"

// Shares useMyProfile's cache with the rest of the app (React Query), rather
// than each route guard running its own uncached fetchMyProfile() — those
// duplicate checks could disagree with each other (and with stale cache
// state) about whether the current user has a profile.
export default function ProtectedRoute({ children }) {
  const { data, isLoading, isError, error } = useMyProfile()

  if (isLoading) return <LoadingSpinner />

  if (isError) {
    const status = error?.response?.status
    const code = error?.response?.data?.code

    // No profile (or not authenticated) — both send them to login. Any other
    // error (5xx, network) is left as-is rather than silently redirecting.
    if (status === 404 || status === 401 || code === "PROFILE_NOT_FOUND") {
      return <Navigate to="/login" replace />
    }

    return (
      <div className="p-4 text-center text-red-500">
        Error loading your profile: {error?.message}
      </div>
    )
  }

  if (!data) {
    return <Navigate to="/login" replace />
  }

  return children
}