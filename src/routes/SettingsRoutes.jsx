import { Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import LazyFallback from "../components/Ui/LazyFallback.jsx"

const SettingsPage = lazy(() => import("../pages/Settings/Settings"))
const LanguagePage = lazy(() => import("../pages/Settings/Language"))
const PreferencesPage = lazy(() => import("../pages/Settings/Preference"))
const InfoPage = lazy(() => import("../pages/Settings/Info"))
const HelpCenterPage = lazy(() => import("../pages/Settings/HelpCenterPage"))
const RatingPage = lazy(() => import("../pages/Settings/Rating.jsx"))
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
        <Suspense fallback={<LazyFallback />}>
          <RatingPage />
        </Suspense>
      }
    />
  </>
)
