// src/main.jsx or wherever your router is defined
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WizardProvider } from './contexts/ProfileWizard.jsx';
import '@fontsource-variable/inter';
import './App.css';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx';
import { Login } from './pages/Auth/Login.jsx';
import { Register } from './pages/Auth/Register.jsx';
import AddDetails from './pages/User/Add_Details.jsx';
import EmailOTPVerification from './pages/Auth/OtpVerification.jsx';
import { ForgotAndResetPassword } from './pages/Auth/ForgotPassword.jsx';
import { AuthProvider } from './pages/Auth/State.jsx';
import ChooseCategory from './pages/User/ChooseCategory.jsx';
import SelectLanguage from './pages/User/Select_lang.jsx';
import Home from './pages/Home.jsx'

const route = createBrowserRouter(
  createRoutesFromElements(
    <Route path="" element={<App />}>
      <Route path="register" element={<Register />} />
      {/* Wrap the /complete route with the WizardProvider */}
      <Route
        path="complete/*"
        element={
          <WizardProvider>
            <AddDetails />
          </WizardProvider>
        }
      />
      <Route path="/" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="verify" element={<EmailOTPVerification />} />
      <Route path="forgot-password" element={<ForgotAndResetPassword />} />
      <Route path="choose-category" element={<ChooseCategory />} />
      <Route path="select-language" element={<SelectLanguage />} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={route} />
    </AuthProvider>
  </StrictMode>,
);
