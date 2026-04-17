import { Route } from "react-router-dom"
import Register from "../features/Auth/pages/Register.jsx"
import EmailOTPVerification from "../features/Auth/pages/OtpVerification.jsx"
import { ForgotAndResetPassword } from "../features/Auth/pages/ForgotPassword.jsx"
import GuestRoute from "./GuestRoute.jsx"
import React, { Suspense, lazy } from "react"

const Login = lazy(() => import("../features/Auth/pages/Login.jsx"))

export const AuthRoutes = (
  <>
       <Route
      path="login"
      element={
        <Suspense fallback={<div className="flex justify-center p-6">Loading...</div>}>
          <GuestRoute>
            <Login />
          </GuestRoute>
        </Suspense>
      }
    />
    <Route path="register" element={<Register />} />
    <Route path="verify" element={<EmailOTPVerification />} />
    <Route path="reset-password" element={<ForgotAndResetPassword />} />
  </>
)
