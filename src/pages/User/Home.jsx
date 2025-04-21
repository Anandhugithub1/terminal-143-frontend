import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileCard from "../../components/Cards/ProfileCard";
import BottomNav from "../../components/Layout/BottomNavigation";
import TopNav from "../../components/Layout/TopNavigation";
import { DetailSection } from "../../components/User_Home/Details";
import { LocationBar, ActionControls } from "../../components/User_Home/LocationBar";
import AlertMessage from "../../components/Ui/Alerts";

//  // Placeholder image URL (adjust path as needed)


const placeholderImage = "/images/placeholder.png";

export default function UserHomePage() {
  const [idx, setIdx] = useState(0);
  const [profilesData, setProfilesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  const accessToken = localStorage.getItem("accessToken");
  const userType = localStorage.getItem("userType");

  const handleConnect = async (recipientUserId) => {
    try {
       await axios.post(
        "http://localhost:4000/api/request/",
        { recipientUserId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-user-type": userType,
          },
        }
      );

      // advance to the next profile upon success
      setIdx((i) => Math.min(i + 1, profilesData.length - 1));
      setRequestError("");
    } catch (err) {
      console.error("Error sending connect request:", err);
      setRequestError(err.response?.data?.error || "Unable to send request.");
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      setErrorMessage("");
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
        console.log("API response:", response.data);

        const items = response.data.items || [];
        const mapped = items.map((raw) => {
          const birth = new Date(raw.dob);
          const age = Math.floor(
            (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          );
          const std = raw.healthStatus?.stdStatus ?? "Unknown";
          const lastDate = raw.healthStatus?.lastTestedDate
            ? new Date(raw.healthStatus.lastTestedDate).toLocaleDateString()
            : "Unknown";
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
            stdStatus: std,
            lastTestedDate: lastDate,
            healthStatus: { status: std, lastTestedDate: lastDate },
            userId: raw.userId,
          };
        });
        console.log("Mapped profiles:", mapped);
        setProfilesData(mapped);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setErrorMessage("Unexpected error, please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [accessToken, userType]);

  const profile = profilesData[idx] || {};

  const handleReject = () => setIdx((i) => Math.min(i + 1, profilesData.length - 1));
  const handleRefresh = () => console.log("Refreshed");
  const handleLike = () => setIdx((i) => Math.min(i + 1, profilesData.length - 1));

  if (errorMessage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <p className="text-red-500 text-lg">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="pb-20">
          <TopNav />
          <LocationBar />

          {/* Inline request error alert below ProfileCard */}
          {requestError && (
            <div className="px-4 mt-4">
              <AlertMessage
                message={requestError}
                type="error"
                isVisible={!!requestError}
                onClose={() => setRequestError("")}
              />
            </div>
          )}
          <ProfileCard
            profile={profile}
            placeholderImage={placeholderImage}
            onConnectClick={() => handleConnect(profile.userId)}
            onMessageClick={() => console.log("Message clicked for", profile.name)}
          />


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
