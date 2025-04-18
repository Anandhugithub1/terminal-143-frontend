/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ProfileCard } from "../../components/Cards/ProfileCard";
import BottomNav from "../../components/Layout/BottomNavigation";
import TopNav from "../../components/Layout/TopNavigation";
import { DetailSection } from "../../components/User_Home/Details";
import { LocationBar,ActionControls } from "../../components/User_Home/LocationBar";

export default function UserHomePage() {
  const [idx, setIdx] = useState(0);
  const [profilesData, setProfilesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const accessToken = localStorage.getItem("accessToken");
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/users/matchproviders/all",
          {
            params: { limit: 10 },
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "x-user-type": userType,
            },
          }
        );

        const items = response.data.items || [];
        const mapped = items.map((raw) => {
          const birth = new Date(raw.dob);
          const age = Math.floor(
            (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          );
          return {
            name: raw.name,
            age,
            images: raw.photos || [],
            about: raw.bio,
            gender:
              raw.gender === "M"
                ? "Male"
                : raw.gender === "F"
                ? "Female"
                : raw.gender,
            top: raw.popularity || 0,
            compatibility: raw.popularity || 0,
            distance: raw.distance || "N/A",
            location: raw.location,
            job: raw.jobTitle || "",
            languages: raw.languagesKnown?.length
              ? raw.languagesKnown
              : [raw.language],
            interests: raw.interest || [],
            health: {
              status: raw.stdStatus || "Unknown",
              testedOn: raw.updatedAt
                ? new Date(raw.updatedAt).toLocaleDateString()
                : "Unknown",
            },
            userId: raw.userId,
          };
        });

        setProfilesData(mapped);
        setIsLoading(false);

        if (mapped.length > 0 && mapped[0].images.length > 0) {
          const img = new Image();
          img.src = mapped[0].images[0];
          img.onload = () => setIsImageLoaded(true);
          img.onerror = () => setIsImageLoaded(true);
        } else {
          setIsImageLoaded(true);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setIsLoading(false);
        setIsImageLoaded(true);
      }
    };
    fetchProfiles();
  }, [accessToken, userType]);

  useEffect(() => {
    if (isLoading || profilesData.length === 0 || idx >= profilesData.length)
      return;

    const currentProfile = profilesData[idx];
    if (!currentProfile.images || currentProfile.images.length === 0) {
      setIsImageLoaded(true);
      return;
    }

    const img = new Image();
    img.src = currentProfile.images[0];
    setIsImageLoaded(false);
    img.onload = () => setIsImageLoaded(true);
    img.onerror = () => setIsImageLoaded(true);
  }, [idx, profilesData, isLoading]);

  const profile = profilesData[idx] || {
    images: [],
    name: "",
    age: "",
    about: "",
    gender: "",
    top: 0,
    compatibility: 0,
    distance: "",
    location: "",
    job: "",
    languages: [],
    interests: [],
    health: { status: "", testedOn: "" },
  };

  const handleReject = () =>
    setIdx((i) => Math.min(i + 1, profilesData.length - 1));
  const handleRefresh = () => console.log("Refreshed");
  const handleLike = () =>
    setIdx((i) => Math.min(i + 1, profilesData.length - 1));

  return (
    <div className="bg-white min-h-screen">
      {isLoading || !isImageLoaded ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="pb-20">
          <TopNav />
          <LocationBar />
          <ProfileCard profile={profile} />
          <ActionControls
            onReject={handleReject}
            onRefresh={handleRefresh}
            onLike={handleLike}
          />
          <DetailSection profile={profile} />
          <BottomNav />
        </div>
      )}
    </div>
  );
}
