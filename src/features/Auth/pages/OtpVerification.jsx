import React, { useState } from 'react';
import { InputField } from '../../../shared/common';
import { Button } from '../../../shared/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  useVerifyOtp,
  useResendOtp,
} from '../useAuth';

const EmailOTPVerification = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const handleVerify = (e) => {
    e.preventDefault();
    if (!email || !code) return;

    verifyOtp.mutate(
      { email, code },
      {
        onSuccess: () => navigate('/login'),
      }
    );
  };

  const handleResend = () => {
    if (!email) return;
    resendOtp.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          Verify Your Email
        </h1>

        <p className="text-center text-sm mb-4">
          OTP sent to <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <InputField
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter OTP"
          />

          {verifyOtp.isError && (
            <p className="text-red-500 text-sm">
              {verifyOtp.error?.response?.data?.error || 'Verification failed'}
            </p>
          )}

          <Button type="submit" disabled={verifyOtp.isPending}>
            {verifyOtp.isPending ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={resendOtp.isPending}
            className="text-pink-600 text-sm font-semibold hover:underline"
          >
            {resendOtp.isPending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm">
          Already verified?{' '}
          <Link to="/login" className="font-semibold text-pink-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmailOTPVerification;
