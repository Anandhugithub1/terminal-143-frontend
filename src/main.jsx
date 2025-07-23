import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import './i18n/i18n.js';
import { Provider } from 'react-redux';
import { store } from './Redux/store.js';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './shared/lib/client.js';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import App from './App.jsx';

import ProtectedRouteFM from './routes/ProtectedRouteFM.jsx';
import RequireProfileIncomplete from './components/RequireProfileIncomplete.jsx';
import { LoadingSpinner } from './components/Ui/Spinner.jsx';

import { Login } from './pages/Auth/Login.jsx';
import { Register } from './pages/Auth/Register.jsx';
import EmailOTPVerification from './pages/Auth/OtpVerification.jsx';
import { ForgotAndResetPassword } from './pages/Auth/ForgotPassword.jsx';
import ChooseCategory from './pages/Auth/ChooseCategory.jsx';

import { WizardProvider } from './contexts/ProfileWizard.jsx';

import HomePage from './pages/Global/HomePage.jsx';
import PricingPage from './pages/Global/Pricing.jsx';
import NotFoundPage from './pages/404/404.jsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// ✅ LAZY ROUTES (keep heavy ones only)
const MatchesPage = lazy(() => import('./pages/User/Matches.jsx'));
const RequestsPage = lazy(() => import('./pages/User/Request.jsx'));
// const UserHomePage = lazy(() => import('./pages/User/Home.jsx'));
const AddDetails = lazy(() => import('./pages/User/Add/Add_Details.jsx'));
const ProfilePage = lazy(() => import('./pages/User/Profile/Profile.jsx'));
const ProfileEditPage = lazy(() => import('./pages/User/Profile/ProfileEdit.jsx'));
const ShareQRCodePage = lazy(() => import('./pages/User/Profile/Qrcode.jsx'));
const PublicProfilePage = lazy(() => import('./pages/User/Profile/PublicProfile.jsx'));

// ✅ EAGER IMPORTS (lightweight)
import SettingsPage from './pages/Settings/Settings.jsx';
import LanguagePage from './pages/Settings/Language.jsx';
import PreferencesPage from './pages/Settings/Preference.jsx';
import Infopage from './pages/Settings/Info.jsx';
import UserHomePage from './pages/User/Home.jsx';
const route = createBrowserRouter(
  createRoutesFromElements(
    <Route path="" element={<App />}>
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="verify" element={<EmailOTPVerification />} />
      <Route path="reset-password" element={<ForgotAndResetPassword />} />
      <Route path="choose-category" element={<ChooseCategory />} />

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

      <Route path="/" element={<HomePage />} />
      <Route path="pricing" element={<PricingPage />} />
      <Route path="*" element={<NotFoundPage />} />

      {/* ❌ No Suspense for these */}
      <Route path="info" element={<Infopage />} />
      <Route path="language" element={<LanguagePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="preferences" element={<PreferencesPage />} />

      <Route
        path="home"
        element={
          <ProtectedRouteFM>
            {/* <Suspense fallback={<LoadingSpinner />}> */}
              <UserHomePage />
            {/* </Suspense> */}
          </ProtectedRouteFM>
        }
      />

      <Route path="matches" element={<Suspense fallback={<LoadingSpinner />}><MatchesPage /></Suspense>} />
      <Route path="requests" element={<Suspense fallback={<LoadingSpinner />}><RequestsPage /></Suspense>} />
      <Route path="profile" element={<Suspense fallback={<LoadingSpinner />}><ProfilePage /></Suspense>} />
      <Route path="edit-profile" element={<Suspense fallback={<LoadingSpinner />}><ProfileEditPage /></Suspense>} />
      <Route path="share-qr" element={<Suspense fallback={<LoadingSpinner />}><ShareQRCodePage /></Suspense>} />
      <Route path="/profile/:type/:gender/:level/:username" element={<Suspense fallback={<LoadingSpinner />}><PublicProfilePage /></Suspense>} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
          <RouterProvider router={route} />
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  </StrictMode>
);
