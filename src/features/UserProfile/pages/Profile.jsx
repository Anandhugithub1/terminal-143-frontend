/* ProfilePage.jsx */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Sliders,
  User,
} from "lucide-react";
import { useAvatarUpload } from "../Hooks/useAvatarUpload";
import { UploadOptions } from "../components/ProfileEdit/UploadOptions";
import { fetchProfile } from "../../../features/UserProfile";
import TopNav from "../../../components/Layout/TopNavigation";
import BottomNav from "../../../components/Layout/BottomNavigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "@fontsource-variable/inter";
import {calculateProfileCompletion} from '../utlis/profileUtils'
import { useEditableProfile } from "../../../Hooks/EditProfile";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.userProfile.currentUser);
  const status = useSelector((state) => state.userProfile.status);

  const { updateProfileData, uploadImage } = useEditableProfile();

  const {
    showUpload,
    toggleUpload,
    openGallery,
    openCamera,
    galleryRef,
    cameraRef,
    handleFileChange,
    handleRemovePhoto,
  } = useAvatarUpload(uploadImage, updateProfileData);

  const avatarimage =
    "https://d36zx1g74mcorc.cloudfront.net/websitephotos/avatar.svg";

  useEffect(() => {
    if (status === "idle" && !profile) {
      dispatch(fetchProfile());
    }
  }, [status, profile, dispatch]);

  //  Show skeleton while loading or profile missing
  if (status !== "succeeded" || !profile) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 font-inter">
        <TopNav title="Profile" />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Skeleton circle width={96} height={96} />
          <Skeleton width={140} height={20} className="mt-4" />
          <Skeleton width={180} height={16} className="mt-2" />
          <Skeleton width={120} height={16} className="mt-3" />
        </main>
        <BottomNav />
      </div>
    );
  }

  //  Safe defaults
  // const completion = profile?.profileCompletion ?? 40;
  const completion = calculateProfileCompletion(profile);

  const userName = profile?.name || "User";
  const userEmail = profile?.email || "";
  const userPhoto = profile?.photo || profile?.photos?.[0] || avatarimage;

  // SVG Circle setup
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col h-screen bg-white font-inter">
      <TopNav title="Back" />

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-8 pb-6 bg-gray-100 border-b border-gray-200 relative">
          <div className="relative w-28 h-28">
            {/* Circular Progress */}
            <svg
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 100 100"
              style={{ transform: "rotate(45deg)" }}
            >
              <circle
                cx="50"
                cy="50"
                r="47"
                stroke="#f3f4f6"
                strokeWidth="3"
                fill="none"
                strokeDasharray={2 * Math.PI * 47 * 0.75}
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="47"
                stroke="url(#pinkGradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray={2 * Math.PI * 47}
                strokeDashoffset={
                  (1 - (completion / 100) * 0.75) * 2 * Math.PI * 47
                }
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset 0.5s ease-in-out",
                }}
              />
              <defs>
                <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Profile Photo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={userPhoto}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-md"
              />
            </div>

            {/* Edit Button */}
            <button
              onClick={toggleUpload}
              className="absolute bottom-0 right-0 bg-gray-900 hover:bg-gray-800 p-2 rounded-full shadow-lg"
            >
              <Edit2 size={14} className="text-white" />
            </button>
          </div>

          {/* Name & Email */}
          <h1 className="mt-4 text-lg font-semibold text-gray-900">{userName}</h1>
          <p className="text-sm text-gray-500">{userEmail}</p>

          {/* Completion Badge */}
          <div className="mt-3 inline-flex items-center justify-center bg-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border border-gray-100">
            <User size={15} className="text-pink-500 mr-1.5" strokeWidth={2} />
            <span className="text-black">{completion}% Completed</span>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, profile.userType)}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e, profile.userType)}
          />

          {/* Upload Options */}
          {showUpload && (
            <div className="absolute top-[13rem] z-50">
              <UploadOptions
                onCamera={openCamera}
                onGallery={openGallery}
                onRemove={handleRemovePhoto}
                onCancel={toggleUpload}
              />
            </div>
          )}
        </div>

        {/* Options Section */}
        <div className="bg-white mt-2 divide-y divide-gray-100">
          {[
            { label: "Preferences", icon: <Sliders color="black" size={16} />, route: "/preferences" },
            { label: "Profile Information", icon: <User size={16} color="black" />, route: "/edit-profile" },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.route)}
              className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
                  {item.icon}
                </div>
                <span className="text-gray-800 text-[15px] font-bold">
                  {item.label}
                </span>
              </div>
              <span className="text-gray-400 text-lg">›</span>
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
