import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WizardProvider } from './contexts/ProfileWizard.jsx';
import '@fontsource-variable/inter';
import './App.css';
import './i18n/i18n.js';
import { store } from './Redux/store.js'; 
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
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
import SelectLanguage from './pages/User/Select_lang.jsx';
import UserHomePage from './pages/User/Home.jsx';
import AddDetails from './pages/User/Add/Add_Details.jsx';
import ChooseCategory from './pages/Auth/ChooseCategory.jsx';
import HomePage from './pages/Global/HomePage.jsx';
import PricingPage from './pages/Global/Pricing.jsx';
import SettingsPage from './pages/Settings/Settings.jsx';
import ProfilePage from './pages/User/Profile/Profile.jsx';
import ProfileEditPage from './pages/User/Profile/ProfileEdit.jsx';
import ShareQRCodePage from './pages/User/Profile/Qrcode.jsx';
import NotFoundPage from './pages/404/404.jsx';
import RequireProfileIncomplete from './components/RequireProfileIncomplete.jsx';
import ChatPage from './pages/User/Chat/Chat.jsx';  
import ChatList from './pages/User/Chat/ChatList.jsx';
import ExplorePage from './pages/User/Explore.jsx';
import { AuthenticatedRoute } from './pages/Auth/AuthRoute.jsx';
import PreferencesPage from './pages/Settings/Preference.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomePage />} />  {/* this is path="/" */}

      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="verify" element={<EmailOTPVerification />} />
      <Route path="forgot-password" element={<ForgotAndResetPassword />} />
      <Route path="choose-category" element={<ChooseCategory />} />
      <Route path="select-language" element={<SelectLanguage />} />
      <Route path="pricing" element={<PricingPage />} />

      <Route
        path="complete/*"
        element={
          <RequireProfileIncomplete>
            <WizardProvider>
              <AddDetails />
            </WizardProvider>
          </RequireProfileIncomplete>
        }
      />
 <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="edit-profile" element={<ProfileEditPage />} />
        <Route path="share-qr" element={<ShareQRCodePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat-list" element={<ChatList />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="preferences" element={<PreferencesPage />} />
      {/* Protected routes */}
      <Route element={<AuthenticatedRoute />}>
        <Route path="home" element={<UserHomePage />} />
       
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}> 
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </QueryClientProvider>
  </StrictMode>
);
