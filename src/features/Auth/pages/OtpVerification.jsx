import React, { useState, useEffect } from 'react'
import { InputField } from '../../../shared/common'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../../shared/Button'
import { useVerifyOtp, useResendOtp } from '../useAuth'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

// Fixed cooldown after any resend attempt (success or failure) — the
// backend now rate-limits resend-otp (5/hr email, 3/hr SMS; see
// auth-service/src/lambda/resend-otp.js), so disabling the button for a
// stretch after every tap keeps normal use well under that limit rather
// than just reacting to the 429 after the fact.
const RESEND_COOLDOWN_SECONDS = 30

const EmailOTPVerification = () => {
  const { t } = useTranslation('auth')
  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')

  const verifyOtp = useVerifyOtp()
  const resendOtp = useResendOtp()

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (!email) {
      navigate('/login')
    }
  }, [email, navigate])

  useEffect(() => {
  if (verifyOtp.isSuccess) {
    toast.success(t('otp.verifiedSuccess'))
    setTimeout(() => {
      navigate('/login')
    }, 1200)
  }
}, [verifyOtp.isSuccess, navigate, t])

  const handleVerify = (e) => {
    e.preventDefault()
    if (!email || !code) return

    verifyOtp.mutate({ email, code })
  }

  const handleResend = () => {
    if (!email || resendCooldown > 0) return
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
    resendOtp.mutate(
      { email },
      {
        onError: (err) => {
          // A real 429 tells us exactly how long to wait — trust that over
          // the fixed 30s guess. Extending (never shortening) the cooldown
          // to match also stops the button re-enabling while the error
          // message above it still says "try again in 42m," which read as
          // contradictory/misleading.
          const retryAfterSeconds = err?.response?.data?.retryAfterSeconds
          if (typeof retryAfterSeconds === 'number' && retryAfterSeconds > RESEND_COOLDOWN_SECONDS) {
            setResendCooldown(retryAfterSeconds)
          }
        },
      }
    )
  }
const isPhone = email && /^\+?\d+$/.test(email);
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
       <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
  {isPhone ? t('otp.verifyPhoneTitle') : t('otp.verifyEmailTitle')}
</h1>

<p className="text-center text-sm text-gray-500 mb-4">
  {isPhone ? t('otp.sentToPhone') : t('otp.sentToEmail')}{" "}
  <span className="font-semibold">{email}</span>
</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <InputField
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('otp.placeholder')}
          />

          {verifyOtp.isError && (
            <p className="text-red-500 text-sm">
              {getErrorMessage(verifyOtp.error)}
            </p>
          )}

          <Button
            type="submit"
            disabled={verifyOtp.isPending || !email}
          >
            {verifyOtp.isPending ? t('otp.verifying') : t('otp.verify')}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendOtp.isPending || !email || resendCooldown > 0}
            className="text-sm font-medium text-pink-500 hover:text-pink-600 hover:underline disabled:text-pink-300 disabled:cursor-not-allowed transition-colors"
          >
            {resendOtp.isPending
              ? t('otp.resending')
              // The error message below already states the real wait time
              // (from the backend's retryAfterSeconds) — showing the plain
              // "Resend in Xs" countdown on top of that read as two
              // conflicting hints, so it's suppressed while an error is active.
              : resendOtp.isError
              ? t('otp.resend')
              : resendCooldown > 0
              ? t('otp.resendCooldown', { seconds: resendCooldown })
              : t('otp.resend')}
          </button>

          {resendOtp.isError && (
            <p className="text-red-500 text-sm mt-2">
              {getErrorMessage(resendOtp.error)}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('otp.alreadyVerified')}{' '}
          <Link
            to="/login"
            className="text-pink-600 font-semibold hover:underline">
            {t('otp.signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default EmailOTPVerification
