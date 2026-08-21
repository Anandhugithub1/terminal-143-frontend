import { Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"

const ProfilePage = lazy(() =>
  import("../features/UserProfile/pages/Profile.jsx")
)
const ProfileEditPage = lazy(() =>
  import("../features/UserProfile/pages/ProfileEdit.jsx")
)
const ShareQRCodePage = lazy(() =>
  import("../features/UserProfile/pages/QrCode.jsx")
)
const PublicProfilePage = lazy(() =>
  import("../features/UserProfile/pages/PublicProfile.jsx")
)
const UserProfilePage = lazy(() =>
  import("../features/UserHome/pages/UserProfileById.jsx")
)
const UserPostsListPage = lazy(() =>
  import("../features/UserHome/pages/UserPostsListPage.jsx")
)
const ProfileCirclePostsPage = lazy(() =>
  import("../features/UserHome/pages/ProfileCirclePostsPage.jsx")
)

const LocationEditPage =lazy(() => 
import("../features/UserHome/pages/LocationEditPage.jsx")
)

import EditPhotosPage from "../features/UserProfile/pages/EditPhotosPage.jsx"


import LocationEditSkeleton from "../features/UserHome/components/LocationEditSkeleton.jsx"

export const ProfileRoutes = (
  <>
    <Route
      path="profile"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <ProfilePage />
        </Suspense>
      }
    />

    <Route
      path="edit-profile"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <ProfileEditPage />
        </Suspense>
      }
    />

    <Route
      path="share-qr"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <ShareQRCodePage />
        </Suspense>
      }
    />


     <Route path="profile/edit-location"
        
        element={<Suspense fallback={<LocationEditSkeleton/>}>
    
          <LocationEditPage/>
        </Suspense>
    
    
    
        }/>
        <Route path="/edit-photos" element={<EditPhotosPage />} />

    <Route
      path="profile/:username"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <PublicProfilePage />
        </Suspense>
      }
    />

    <Route path="/user/:pk/:sk" element={<UserProfilePage />} />
    <Route
      path="/user/:pk/posts"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <UserPostsListPage />
        </Suspense>
      }
    />
    <Route
      path="/user/:pk/circles/:circleId"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <ProfileCirclePostsPage />
        </Suspense>
      }
    />
  </>
)
