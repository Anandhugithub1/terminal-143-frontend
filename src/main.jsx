// src/main.jsx or wherever your router is defined
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WizardProvider } from './contexts/ProfileWizard.jsx';
import '@fontsource-variable/inter';
import './App.css';
import './i18n/i18n.js'
import {store} from './Redux/store.js'; 
import { Provider } from 'react-redux';
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
import { AuthProvider } from './pages/Auth/State.jsx';
import SelectLanguage from './pages/User/Select_lang.jsx';
import UserHomePage from './pages/User/Home.jsx'
import AddDetails from './pages/User/Add/Add_Details.jsx';
import ChooseCategory from './pages/User/Add/add_category.jsx';
import HomePage from './pages/Global/HomePage.jsx'
import PricingPage from './pages/Global/Pricing.jsx';
import SettingsPage from './pages/Settings/Settings.jsx';
import ProfilePage  from './pages/User/Profile/Profile.jsx';
import ProfileEditPage  from './pages/User/Profile/ProfileEdit.jsx';
import ShareQRCodePage from './pages/User/Profile/Qrcode.jsx';
import ComingSoon from './pages/Auth/ComingSoon.jsx';

const route = createBrowserRouter(
  createRoutesFromElements(
    <Route path="" element={<App />}>
      <Route path="register" element={<Register />} />
      {/* Wrap the /complete route with the WizardProvider */}
      <Route
        path="complete/*"
        element={<WizardProvider><AddDetails /></WizardProvider>}/>

        
      <Route path="/" element={<HomePage />} />
      <Route path="login" element={<Login />} />
      <Route path="verify" element={<EmailOTPVerification />} />
      <Route path="forgot-password" element={<ForgotAndResetPassword />} />
      <Route path="choose-category" element={<ChooseCategory />} />
      <Route path="select-language" element={<SelectLanguage />} />
      <Route path="home" element={<UserHomePage />} />
      <Route path="pricing" element={<PricingPage />} />
   <Route path="settings" element={<SettingsPage />}/>
   <Route path="profile" element={<ProfilePage />} />
   <Route path='edit-profile' element={<ProfileEditPage />} />
   <Route path='share-qr' element={<ShareQRCodePage />} />
   <Route path="coming-soon" element={<ComingSoon />} />



    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      
    <AuthProvider>
      <RouterProvider router={route} />
    </AuthProvider>
    </Provider>
  </StrictMode>,
);
