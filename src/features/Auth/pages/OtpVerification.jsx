import React, { useState, useEffect } from 'react'
import { InputField } from '../../../shared/common'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../../shared/Button'
import { useVerifyOtp, useResendOtp } from '../useAuth'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const EmailOTPVerification = () => {
  const { t } = useTranslation('auth')
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')

  const verifyOtp = useVerifyOtp()
  const resendOtp = useResendOtp()

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
    if (!email) return
    resendOtp.mutate({ email })
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
              {verifyOtp.error?.response?.data?.error ||
               verifyOtp.error?.response?.data?.message}
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
            disabled={resendOtp.isPending || !email}
            className="text-sm font-medium text-pink-500 hover:text-pink-600 hover:underline disabled:text-pink-300 disabled:cursor-not-allowed transition-colors"
          >
            {resendOtp.isPending ? t('otp.resending') : t('otp.resend')}
          </button>
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
