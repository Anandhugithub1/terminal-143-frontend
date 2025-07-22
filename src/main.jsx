// src/main.jsx 
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WizardProvider } from './contexts/ProfileWizard.jsx';
import './App.css';
import './i18n/i18n.js'
import {store} from './Redux/store.js'; 
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';

import ProtectedRouteFM from './routes/ProtectedRouteFM.jsx';

import { queryClient } from './shared/lib/client.js';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx';
import { Login } from './pages/Auth/Login.jsx';
import { Register } from './pages/Auth/Register.jsx';
import EmailOTPVerification from './pages/Auth/OtpVerification.jsx';
import { ForgotAndResetPassword } from './pages/Auth/ForgotPassword.jsx';
import UserHomePage from './pages/User/Home.jsx'
import AddDetails from './pages/User/Add/Add_Details.jsx';
import ChooseCategory from './pages/Auth/ChooseCategory.jsx';
import HomePage from './pages/Global/HomePage.jsx'
import PricingPage from './pages/Global/Pricing.jsx';
import SettingsPage from './pages/Settings/Settings.jsx';
import ProfilePage  from './pages/User/Profile/Profile.jsx';
import ProfileEditPage  from './pages/User/Profile/ProfileEdit.jsx';
import ShareQRCodePage from './pages/User/Profile/Qrcode.jsx';
import NotFoundPage from './pages/404/404.jsx';
import RequireProfileIncomplete from './components/RequireProfileIncomplete.jsx';
import LanguagePage from './pages/Settings/Language.jsx';
import  ExplorePage from './pages/User/Explore.jsx'; // Import the ExplorePage component
import PreferencesPage from './pages/Settings/Preference.jsx';
import PublicProfilePage from './pages/User/Profile/PublicProfile.jsx';
import MatchesPage from './pages/User/Matches.jsx';
import RequestsPage from './pages/User/Request.jsx';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const route = createBrowserRouter(
  createRoutesFromElements(
    <Route path="" element={<App />}>
      <Route path="register" element={<Register />} />
      {/* Wrap the /complete route with the WizardProvider */}
      <Route
  path="complete/*"
  element={
    // <RequireProfileIncomplete>
      <WizardProvider>
        <AddDetails />
      </WizardProvider>
  }
/>

        
      <Route path="/" element={<HomePage />} />
      <Route path="login" element={<Login />} />
      <Route path="verify" element={<EmailOTPVerification />} />
      <Route path="reset-password" element={<ForgotAndResetPassword />} />
      <Route path="choose-category" element={<ChooseCategory />} />

      <Route
  path="home"
  element={
    <ProtectedRouteFM>
      <UserHomePage />
    </ProtectedRouteFM>
  }
/>


      <Route path="pricing" element={<PricingPage />} />
   <Route path="settings" element={<SettingsPage />}/>
   <Route path="profile" element={<ProfilePage />} />
   <Route path='edit-profile' element={<ProfileEditPage />} />
   <Route path='share-qr' element={<ShareQRCodePage />} />
   <Route path="*" element={<NotFoundPage />} />
   <Route path="language" element={<LanguagePage />} />
   <Route path="matches" element={<MatchesPage />} />
   <Route path="requests" element={<RequestsPage />} />

   <Route path="/profile/:type/:gender/:level/:username" element={<PublicProfilePage />} />


   <Route path="explore" element={<ExplorePage />} />
   <Route Component={PreferencesPage} path="preferences" />


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

  </StrictMode>,
);
