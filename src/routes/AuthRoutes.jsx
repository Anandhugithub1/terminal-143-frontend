import { Route } from "react-router-dom"
import { Login } from "../features/Auth/pages/Login.jsx"
import Register from "../features/Auth/pages/Register.jsx"
import EmailOTPVerification from "../features/Auth/pages/OtpVerification.jsx"
import { ForgotAndResetPassword } from "../features/Auth/pages/ForgotPassword.jsx"

export const AuthRoutes = (
  <>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route path="verify" element={<EmailOTPVerification />} />
    <Route path="reset-password" element={<ForgotAndResetPassword />} />
  </>
)
