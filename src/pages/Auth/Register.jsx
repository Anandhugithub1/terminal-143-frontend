import React, { useState } from 'react';
import axios from 'axios';
import { InputField } from '../../shared/common';
import { PasswordInput } from '../../shared/Passinput';
import { Link, useNavigate } from 'react-router-dom';
import { Button, GoogleButton } from '../../shared/Button';

export const Register = () => {
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Z])(?=.*[a-z]).+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        'Password must contain at least 1 number, 1 lowercase letter, 1 special character, and 1 uppercase letter.'
      );
      return;
    }

    setError('');
    setLoading(true);
    setMessage('');

    const payload = {
      email: emailPhone.includes('@') ? emailPhone : '',
      phoneNumber: !emailPhone.includes('@') ? emailPhone : '',
      password,
    };

    try {
      // eslint-disable-next-line no-unused-vars
      const { data } = await axios.post('http://localhost:2000/api/users/register', payload);
      navigate('/verify', { state: { email: emailPhone } });
      setMessage(`User registered successfully. An OTP has been sent to ${emailPhone}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
        {/* App Logo */}
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
          Find Your Match
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            value={emailPhone}
            onChange={(e) => setEmailPhone(e.target.value)}
            placeholder="Email or phone number"
          />

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password"
          />

          <div className="text-xs text-gray-500">
            Contains at least 1 number, 1 lowercase letter, 1 special character, and 1 uppercase letter.
          </div>

          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Get Started'}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="flex-1 border-t border-border-clr"></div>
          <span className="px-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-1 border-t border-border-clr"></div>
        </div>

        <GoogleButton onClick={handleGoogleLogin} />

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
