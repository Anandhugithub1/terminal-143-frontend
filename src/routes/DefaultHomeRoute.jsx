import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchMyProfile } from "../features/UserProfile/api/profile.js";
import { LoadingSpinner } from "../components/Ui/Spinner.jsx";
import UserHomePage from "../features/UserHome/pages/Home.jsx";
// import AppHome from "../pages/Global/Route.jsx";
import { Login } from "../features/Auth/pages/Login.jsx";

export default function DefaultHomeRoute() {
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetchMyProfile()
        if (res) {
          setHasProfile(true)
        } else {
          setHasProfile(false)
        }
      } catch {
        setHasProfile(false)
      } finally {
        setLoading(false)
      }
    }

    checkProfile()
  }, [])

  if (loading) return <LoadingSpinner />

  if (hasProfile) {
    return <UserHomePage />
  }

  return <Navigate to="/login" replace />
}

