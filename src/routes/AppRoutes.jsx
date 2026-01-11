// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import App from "../App.jsx";
import RequireProfileIncomplete from "../components/RequireProfileIncomplete.jsx";
import { LoadingSpinner } from "../components/Ui/Spinner.jsx";
import LazyFallback from "../components/Ui/LazyFallback.jsx";
import { WizardProvider } from "../features/AddProfile/contexts/ProfileWizard.jsx";
// Eager
import { Login } from "../features/Auth/pages/Login.jsx";
import  Register  from "../features/Auth/pages/Register.jsx"; 
import EmailOTPVerification from "../features/Auth/pages/OtpVerification.jsx";
import { ForgotAndResetPassword } from "../features/Auth/pages/ForgotPassword.jsx";
import PricingPage from "../pages/Global/Pricing.jsx";
import UserHomePage from "../features/UserHome/pages/Home.jsx";
// import AppHome from "../pages/Global/Route.jsx";
import DefaultHomeRoute from "./DefaultHomeRoute.jsx";
import UserProfilePage from "../features/UserHome/pages/UserProfileById.jsx";
// Lazy
const MatchesPage = lazy(() => import("../features/UserHome/pages/Matches.jsx"));
const RequestsPage = lazy(() => import("../features/UserHome/pages/Request.jsx"));
const AddDetails = lazy(() => import("../features/AddProfile/pages/Add_Details.jsx"));
const NotFoundPage = lazy(() => import("../pages/404/404.jsx"));
const ProfilePage = lazy(() => import("../features/UserProfile/pages/Profile.jsx"));
const ProfileEditPage = lazy(() => import("../features/UserProfile/pages/ProfileEdit.jsx"));
const ShareQRCodePage = lazy(() => import("../features/UserProfile/pages/QrCode.jsx"));
const PublicProfilePage = lazy(() => import("../features/UserProfile/pages/PublicProfile.jsx"));
const SettingsPage = lazy(() => import("../pages/Settings/Settings"));
const LanguagePage = lazy(() => import("../pages/Settings/Language"));
const PreferencesPage = lazy(() => import("../pages/Settings/Preference"));
const InfoPage = lazy(() => import("../pages/Settings/Info"));
const LocationEditPage =lazy(()=> import("../features/UserHome/pages/LocationEditPage.jsx"))

export const appRoutes = (
  <Route path="" element={<App />}>
    <Route path="register" element={<Register />} />
    <Route path="login" element={<Login />} />
    <Route path="verify" element={<EmailOTPVerification />} />
    <Route path="reset-password" element={<ForgotAndResetPassword />} />
      <Route path="/user/:pk/:sk" element={<UserProfilePage />} />


    <Route
      path="complete/*"
      element={
        <RequireProfileIncomplete>
          <WizardProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <AddDetails />
            </Suspense>
          </WizardProvider>
          </RequireProfileIncomplete>
      }
    />

<Route index element={<DefaultHomeRoute />} />

    <Route path="pricing" element={<PricingPage />} />

    <Route
      path="settings"
      element={
        <Suspense fallback={<LazyFallback />}>
          <SettingsPage />
        </Suspense>
      }
    />

    <Route path="profile/edit-location"
    
    element={<Suspense fallback={null}>

      <LocationEditPage/>
    </Suspense>



    }/>

    
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
  path="home"
  element={<DefaultHomeRoute />}
/>


    <Route
      path="matches"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <MatchesPage />
        </Suspense>
      }
    />


    <Route
      path="requests"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <RequestsPage />
        </Suspense>
      }
    />
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
      path="/profile/:username"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <PublicProfilePage />
        </Suspense>
      }
    />
    <Route
      path="*"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <NotFoundPage />
        </Suspense>
      }
    />
  </Route>
);
