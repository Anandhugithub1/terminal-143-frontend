import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { InputField } from '../../shared/common'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../shared/Button'
import { verifyOtp, resendOtp } from '../../features/Auth/authThunks'
import { resetAuthState } from '../../features/Auth/authSlice'
import {
  selectLoading as selectOtpLoading,
  selectError  as selectOtpError,
  selectSuccess as selectOtpSuccess,
  selectMessage as selectOtpMessage,
} from '../../features/Auth/authSelectors'

const EmailOTPVerification = () => {
  const [code, setCode] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  const isLoading = useSelector(selectOtpLoading)
  const isError   = useSelector(selectOtpError)
  const isSuccess = useSelector(selectOtpSuccess)
  const message   = useSelector(selectOtpMessage)

  // Always clear any old auth state on mount
  useEffect(() => {
    dispatch(resetAuthState())
  }, [dispatch])

  // Debug log
  useEffect(() => {
    console.log('OTP state:', { isLoading, isError, isSuccess, message })
  }, [isLoading, isError, isSuccess, message])

  // When we get success, reset slice and navigate
  useEffect(() => {
    if (isSuccess) {
      dispatch(resetAuthState())
      navigate('/login')
    }
  }, [isSuccess, dispatch, navigate])

  const handleVerify = e => {
    e.preventDefault()
    if (!email) return
    dispatch(verifyOtp({ email, code }))
  }

  const handleResend = () => {
    if (!email) return
    dispatch(resendOtp({ email }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Verify Your Email
        </h1>
        <p className="text-center text-sm text-gray-500 mb-4">
          OTP sent to <span className="font-semibold">{email}</span>
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <InputField
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter OTP"
          />
          {isError   && <p className="text-red-500 text-sm">{message}</p>}
          {isSuccess && <p className="text-green-600 text-sm">{message}</p>}
          <Button type="submit" disabled={isLoading || !email}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button
            onClick={handleResend}
            disabled={isLoading || !email}
            type="button"
            className="text-sm text-pink-600 hover:underline bg-transparent shadow-none"
          >
            Resend OTP
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already verified?{' '}
          <Link to="/login" className="text-pink-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default EmailOTPVerification
