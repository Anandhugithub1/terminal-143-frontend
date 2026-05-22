import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { fetchMyProfile } from "../features/UserProfile/api/profile.js"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetchMyProfile()
        setHasProfile(Boolean(res))
      } catch {
        setHasProfile(false)
      } finally {
        setLoading(false)
      }
    }

    checkProfile()
  }, [])

  if (loading) return <LoadingSpinner />

  if (!hasProfile) {
    return <Navigate to="/login" replace />
  }

  return children
}