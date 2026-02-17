import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { fetchMyProfile } from "../features/UserProfile/api/profile.js"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"

export default function GuestRoute({ children }) {
  const [status, setStatus] = useState("loading") 
  // loading | authenticated | unauthenticated

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await fetchMyProfile()

        if (profile) {
          setStatus("authenticated")
        } else {
          setStatus("unauthenticated")
        }
      } catch {
        setStatus("unauthenticated")
      }
    }

    checkAuth()
  }, [])

  if (status === "loading") {
    return <LoadingSpinner />
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />
  }

  return children
}
