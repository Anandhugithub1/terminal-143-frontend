import React, { useState } from 'react';
import { InputField } from '../../../shared/common';
import { Button } from '../../../shared/Button';
import PasswordInput from '../../../shared/Passinput';
import { useNavigate } from 'react-router-dom';
import {
  useForgotPassword,
  useConfirmForgotPassword,
} from '../useAuth';

export const ForgotAndResetPassword = () => {
  const [step, setStep] = useState('forgot');
  const [email, setEmail] = useState('');
  const [ConfirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const forgotPassword = useForgotPassword();
  const confirmForgotPassword = useConfirmForgotPassword();

  // ─── SEND RESET CODE ─────────────────────────────────────
  const handleForgotSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setError('');
    setMessage('');

    forgotPassword.mutate(
      { email },
      {
        onSuccess: () => {
          setMessage('Reset code sent successfully. Please check your email.');
          setTimeout(() => setStep('reset'), 1500);
        },
        onError: (err) => {
          setError(
            err?.response?.data?.error || 'Failed to send reset code.'
          );
        },
      }
    );
  };

  // ─── CONFIRM RESET ───────────────────────────────────────
  const handleResetSubmit = (e) => {
    e.preventDefault();

    if (!email || !ConfirmationCode || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setMessage('');

    confirmForgotPassword.mutate(
      {
        email,
        ConfirmationCode,
        Password: newPassword,
      },
      {
        onSuccess: () => {
          setMessage('Password has been reset successfully.');
          setTimeout(() => navigate('/login'), 2000);
        },
        onError: (err) => {
          setError(
            err?.response?.data?.error || 'Password reset failed.'
          );
        },
      }
    );
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

        {step === 'forgot' ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
              Reset Password
            </h1>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <InputField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-500 text-sm">{message}</p>}

              <Button type="submit" className="text-white">
                Send Reset Code
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
              Reset Password
            </h1>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <InputField value={email} disabled />

              <InputField
                value={ConfirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter confirmation code"
              />

              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />

              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-500 text-sm">{message}</p>}

              <Button type="submit">
                Reset Password
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-pink-600 font-semibold text-sm hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
