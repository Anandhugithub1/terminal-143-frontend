import React, { Suspense, lazy } from "react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const Footer = lazy(() => import("../../../components/Layout/Footer"))
const Navbar = lazy(() => import("../../../components/Layout/Navbar"))
const RegisterForm = lazy(() => import("../components/RegisterForm"))

const RegisterSkeleton = () => (
  <div className="space-y-4">
    <Skeleton height={40} />
    <Skeleton height={45} />
    <Skeleton height={45} />
    <Skeleton height={20} width={120} />
    <Skeleton height={45} />
    <Skeleton height={45} />
    <Skeleton height={20} width={200} />
    <Skeleton height={45} />
  </div>
)

const Register = () => {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-pink-100 to-purple-200">
      
      {/* Navbar */}
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
          
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            Find Your Match
          </h1>

          <Suspense fallback={<RegisterSkeleton />}>
            <RegisterForm />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>

    </div>
  )
}

export default Register
