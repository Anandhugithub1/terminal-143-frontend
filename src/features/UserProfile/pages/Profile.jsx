import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Edit2,
  Sliders,
  User,
  Share2
} from "lucide-react"
import TopNav from "../../../components/Layout/TopNavigation"
import BottomNav from "../../../components/Layout/BottomNavigation"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import "@fontsource-variable/inter"

import { useAvatarUpload } from "../Hooks/useAvatarUpload"
import { UploadOptions } from "../components/ProfileEdit/UploadOptions"
import { calculateProfileCompletion } from "../utlis/profileUtils"
import { useEditableProfile } from "../../../Hooks/EditProfile"
import { useMyProfile } from "../Hooks/useMyProfile"

export default function ProfilePage() {
  const navigate = useNavigate()
  const userType = localStorage.getItem("userType")

  const { updateProfileData, uploadImage } = useEditableProfile()
  const {
    data: profile,
    isLoading,
    isError
  } = useMyProfile()

  const {
    showUpload,
    toggleUpload,
    openGallery,
    openCamera,
    galleryRef,
    cameraRef,
    handleFileChange,
    handleRemovePhoto
  } = useAvatarUpload(uploadImage, updateProfileData)

  const avatarimage =
    "https://d36zx1g74mcorc.cloudfront.net/websitephotos/avatar.svg"

  if (isLoading || !profile) {
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
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        Failed to load profile
      </div>
    )
  }

  const completion = calculateProfileCompletion(profile.raw)

  const userName = profile.name
  const userSubText = profile.location?.placeName || ""

const userPhoto = profile.profilePhoto || avatarimage


  return (
    <div className="flex flex-col h-screen bg-white font-inter">
      <TopNav title="Back" />

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="flex flex-col items-center pt-8 pb-6 bg-gray-100 border-b border-gray-200 relative">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={userPhoto}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-md"
              />
            </div>

            <button
              onClick={toggleUpload}
              className="absolute bottom-0 right-0 bg-gray-900 hover:bg-gray-800 p-2 rounded-full shadow-lg"
            >
              <Edit2 size={14} className="text-white" />
            </button>
          </div>

          <h1 className="mt-4 text-lg font-semibold text-gray-900">
            {userName}
          </h1>
          <p className="text-sm text-gray-500">
            {userSubText}
          </p>

          <div className="mt-3 inline-flex items-center justify-center bg-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border border-gray-100">
            <User size={15} className="text-pink-500 mr-1.5" />
            <span className="text-black">
              {completion}% Completed
            </span>
          </div>

          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFileChange(e, userType)}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => handleFileChange(e, userType)}
          />

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

        <div className="bg-white mt-2 divide-y divide-gray-100">
          {[
            { label: "Preferences", icon: <Sliders size={16} />, route: "/preferences" },
            { label: "Profile Information", icon: <User size={16} />, route: "/edit-profile" },
            ...(userType === "mp"
              ? [{ label: "Share QR Code", icon: <Share2 size={16} />, route: "/share-qr" }]
              : [])
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.route)}
              className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
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

      <BottomNav />
    </div>
  )
}
