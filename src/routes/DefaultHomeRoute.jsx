import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchMyProfile } from "../features/UserProfile/api/profile.js";
import { LoadingSpinner } from "../components/Ui/Spinner.jsx";
import UserHomePage from "../features/UserHome/pages/Home.jsx";
// import AppHome from "../pages/Global/Route.jsx";
import { Login } from "../features/Auth/pages/Login.jsx";

export default function DefaultHomeRoute() {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const userType = localStorage.getItem("userType");

  useEffect(() => {
    if (!userType) {
      setLoading(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const res = await fetchMyProfile();
        if (res?.data) {
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      } catch (err) {
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [userType]);

  if (loading) return <LoadingSpinner />;

  //  If profile exists and userType is 'fm' → UserHomePage
  if (hasProfile && userType === "fm") {
    return <UserHomePage />;
  }

  //  If profile exists but userType is not 'fm' → Requests page
  if (hasProfile && userType !== "fm") {
    return <Navigate to="/requests" replace />;
  }

  //  If no profile but userType exists → Login
  if (userType && !hasProfile) {
    return <Navigate to="/login" replace />;
  }

  //  If no userType → Global landing page
  return <Login />;
}
