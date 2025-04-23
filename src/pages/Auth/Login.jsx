import React, { useState } from 'react';
import axios from 'axios';
import { InputField } from '../../shared/common';
import { PasswordInput } from '../../shared/Passinput';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './State';
import { Button, GoogleButton } from '../../shared/Button'; // import the common button
import Loader from '../../components/Ui/Loading';

export const Login = () => {
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailPhone || !password) {
      setError('Please enter email/phone and password');
      return;
    }

    setError('');
    const isEmail = emailPhone.includes('@');
    const payload = isEmail
      ? { email: emailPhone, password }
      : { phoneNumber: emailPhone, password };

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:2000/api/auth/login', payload);

      if (response.status === 200) {
        const { accessToken, userType } = response.data;
        login(accessToken, userType);
        console.log('UserType set to:', userType);
        console.log('Login successful', response.data);
        if (userType === null) {
          navigate('/choose-category');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Unexpected error: Please try again later';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Implement your Google login logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4 relative">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative">
        {isLoading && (
          // Center the Loader by using an absolute overlay div
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <Loader />
          </div>
        )}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-3 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            value={emailPhone}
            onChange={(e) => setEmailPhone(e.target.value)}
            placeholder="Email or phone number"
            disabled={isLoading}
          />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={isLoading}
          />
          <div className="text-right">
            <Link to='/forgot-password' className="text-text-pr font-semibold text-sm hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader /> : "Log In"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="flex-1 border-t border-border-clr"></div>
          <span className="px-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-1 border-t border-border-clr"></div>
        </div>

        <GoogleButton onClick={handleGoogleLogin} disabled={isLoading} />

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-text-pr font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
