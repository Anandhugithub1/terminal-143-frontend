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

    <Route
      path="profile/:username"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <PublicProfilePage />
        </Suspense>
      }
    />

    <Route path="/user/:pk/:sk" element={<UserProfilePage />} />
  </>
)
