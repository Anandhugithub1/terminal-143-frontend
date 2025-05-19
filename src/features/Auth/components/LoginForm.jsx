// src/features/auth/components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InputField } from '../../../shared/common';
import { PasswordInput } from '../../../shared/Passinput';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/Button';
import Loader from '../../../components/Ui/Loading';

import { loginUser } from '../authThunks';
import { selectLoading, selectError, selectAuth } from '../authSelectors';

export const LoginForm = () => {
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectLoading);
  const errorMessage = useSelector(selectError);
  const auth = useSelector(selectAuth);
  const { isSuccess, userType } = auth;

  // After a successful login, redirect based on userType
  useEffect(() => {
    if (isSuccess) {
      if (userType === null || userType === undefined) {
        navigate('/choose-category');
      } else {
        navigate('/home');
      }
    }
  }, [isSuccess, userType, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailPhone || !password) {
      return alert('Please enter email/phone and password');
    }
    dispatch(loginUser({ emailPhone, password }));
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <Loader />
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-3 rounded-full">
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
          <Link
            to="/forgot-password"
            className="text-text-pr font-semibold text-sm hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader /> : 'Log In'}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center space-x-2">
        <div className="flex-1 border-t border-border-clr"></div>
        <span className="px-4 text-sm text-gray-500">Or continue with</span>
        <div className="flex-1 border-t border-border-clr"></div>
      </div>

      {/* <GoogleButton onClick={handleGoogleLogin} disabled={isLoading} /> */}

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-text-pr font-semibold hover:underline"
        >
          Register
        </Link>
      </p>
    </>
  );
};
