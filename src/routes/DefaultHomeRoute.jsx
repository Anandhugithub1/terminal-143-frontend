import { Navigate } from "react-router-dom"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"
import UserHomePage from "../features/UserHome/pages/Home.jsx"
import { useMyProfile } from "../features/UserProfile/Hooks/useMyProfile.js"

// Shares useMyProfile's cache with the rest of the app (React Query), rather
// than running its own uncached fetchMyProfile() — see ProtectedRoute.jsx
// for why that duplication caused inconsistent redirects.
export default function DefaultHomeRoute() {
  const { data, isLoading, isError, error } = useMyProfile()

  if (isLoading) return <LoadingSpinner />

  if (isError) {
    const status = error?.response?.status
    const code = error?.response?.data?.code

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

  return <UserHomePage />
}
