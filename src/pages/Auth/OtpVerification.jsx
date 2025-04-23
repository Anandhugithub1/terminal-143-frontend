import React, { useState, useEffect } from 'react';
import { InputField } from '../../shared/common';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../shared/Button';
import axios from 'axios';

const EmailOTPVerification = () => {
  const [confirmationCode, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      setError('No email provided. Please complete registration first.');
    }
  }, [email]);

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setMessage('');
    setLoading(true);

    try {
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post('http://localhost:2000/api/auth/confirm', {
        email,
        ConfirmationCode: confirmationCode,
      });

      setMessage('OTP verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await axios.post('http://localhost:3000/api/auth/resend-otp', {
        email,
      });

      setMessage(`OTP has been resent to ${email}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Verify Your Email
        </h1>

        <p className="text-center text-sm text-gray-500 mb-4">
          An OTP has been sent to your email: <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleOtpVerification} className="space-y-4">
          <InputField
            value={confirmationCode}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <Button type="submit" disabled={loading || !email}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            onClick={handleResendOtp}
            disabled={loading || !email}
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
  );
};

export default EmailOTPVerification;
