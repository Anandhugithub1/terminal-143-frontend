import React, { useState, useEffect } from 'react';
import { InputField } from '../../../shared/common';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../shared/Button';
import { useVerifyOtp, useResendOtp } from '../useAuth';

const EmailOTPVerification = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  useEffect(() => {
    console.log('OTP state:', {
      isLoading: verifyOtp.isPending,
      isError: verifyOtp.isError,
      isSuccess: verifyOtp.isSuccess,
      message: verifyOtp.data?.message,
    });
  }, [
    verifyOtp.isPending,
    verifyOtp.isError,
    verifyOtp.isSuccess,
    verifyOtp.data,
  ]);

  useEffect(() => {
    if (verifyOtp.isSuccess) {
      navigate('/login');
    }
  }, [verifyOtp.isSuccess, navigate]);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!email) return;

    verifyOtp.mutate({ email, code });
  };

  const handleResend = () => {
    if (!email) return;
    resendOtp.mutate({ email });
  };

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
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter OTP"
          />

          {verifyOtp.isError && (
            <p className="text-red-500 text-sm">
              {verifyOtp.error?.response?.data?.error ||
               verifyOtp.error?.response?.data?.message}
            </p>
          )}

          {verifyOtp.isSuccess && (
            <p className="text-green-600 text-sm">
              {verifyOtp.data?.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={verifyOtp.isPending || !email}
          >
            {verifyOtp.isPending ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            onClick={handleResend}
            disabled={resendOtp.isPending || !email}
            type="button"
            className="text-sm text-pink-600 hover:underline bg-transparent shadow-none"
          >
            Resend OTP
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already verified?{' '}
          <Link
            to="/login"
            className="text-pink-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmailOTPVerification;
