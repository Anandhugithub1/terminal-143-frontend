import { Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import LazyFallback from "../components/Ui/LazyFallback.jsx"

const SettingsPage = lazy(() => import("../pages/Settings/Settings"))
const LanguagePage = lazy(() => import("../pages/Settings/Language"))
const PreferencesPage = lazy(() => import("../pages/Settings/Preference"))
const PrivacyPage = lazy(() => import("../pages/Settings/Privacy"))
const InfoPage = lazy(() => import("../pages/Settings/Info"))
const HelpCenterPage = lazy(() => import("../pages/Settings/HelpCenterPage"))
const RatingPage = lazy(() => import("../pages/Settings/Rating.jsx"))
const DeleteAccountPage = lazy(() => import("../pages/Settings/DeleteAccount.jsx"))
import ProtectedRoute from './ProtectedRoute.jsx'

export const SettingsRoutes = (
  <>
    {/* Settings hub */}
    <Route
      path="settings"
      element={
        <Suspense fallback={<LazyFallback />}>
          <SettingsPage />
        </Suspense>
      }
    />

    {/* Standalone pages */}
    <Route
      path="language"
      element={
        <Suspense fallback={<LazyFallback />}>
          <LanguagePage />
        </Suspense>
      }
    />

    <Route
      path="preferences"
      element={
        <Suspense fallback={<LazyFallback />}>
          <PreferencesPage />
        </Suspense>
      }
    />

    <Route
      path="privacy"
      element={
        <ProtectedRoute>
          <Suspense fallback={<LazyFallback />}>
            <PrivacyPage />
          </Suspense>
        </ProtectedRoute>
      }
    />

    <Route
      path="info"
      element={
        <Suspense fallback={<LazyFallback />}>
          <InfoPage />
        </Suspense>
      }
    />
    <Route
      path="help-center"
      element={
        <Suspense fallback={<LazyFallback />}>
          <HelpCenterPage />
        </Suspense>
      }
    />
    <Route
      path="rating"
      element={
                <ProtectedRoute>

        <Suspense fallback={<LazyFallback />}>
          <RatingPage />
        </Suspense>
                </ProtectedRoute>

      }
    />

    {/* Destructive — always behind auth (matches the Settings hub link) */}
    <Route
      path="delete-account"
      element={
        <ProtectedRoute>
          <Suspense fallback={<LazyFallback />}>
            <DeleteAccountPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
  </>
)
