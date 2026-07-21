import { Navigate } from "react-router-dom"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"
import { useMyProfile } from "../features/UserProfile/Hooks/useMyProfile.js"

// Shares useMyProfile's cache with the rest of the app (React Query), rather
// than running its own uncached fetchMyProfile() — see ProtectedRoute.jsx
// for why that duplication caused inconsistent redirects.
export default function GuestRoute({ children }) {
  const { data, isLoading, isError } = useMyProfile()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    // Whether it's "no profile"/"not authenticated" (genuinely a guest) or a
    // transient failure (5xx, network), the safe default is the same either
    // way: show the guest page rather than assume they're authenticated.
    return children
  }

  if (data) {
    return <Navigate to="/" replace />
  }

  return children
}
