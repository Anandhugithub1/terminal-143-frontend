import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InputField } from '../../../shared/common';
import { PasswordInput } from '../../../shared/Passinput';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/Button';
import Loader from '../../../components/Ui/Loading';

import { loginUser } from '../authThunks';
import {
  selectLoading,
  selectError,
  selectAuth,
  selectMessage
} from '../authSelectors';

import { useTranslation } from 'react-i18next';

export const LoginForm = () => {
  const { t } = useTranslation('auth'); // Translation namespace

  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectLoading);
  const isError = useSelector(selectError);
  const errorMessage = useSelector(selectMessage);
  const auth = useSelector(selectAuth);
  const { isSuccess, profileCompleted } = auth;

  useEffect(() => {
    if (isSuccess) {
      if (!profileCompleted) {
        navigate('/complete');
      } else if (auth.userType === 'mp') {
        navigate('/requests');
      } else {
        navigate('/home');
      }
    }
  }, [isSuccess, profileCompleted, auth.userType, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailPhone || !password) {
      return alert(t('enterCredentials'));
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
        {t('welcomeBack')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          value={emailPhone}
          onChange={(e) => setEmailPhone(e.target.value)}
          placeholder={t('emailOrPhone')}
          disabled={isLoading}
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password')}
          disabled={isLoading}
        />

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-text-pr font-semibold text-sm hover:underline"
          >
            {t('forgotPassword')}
          </Link>
        </div>

        {isError && errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader /> : t('login')}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center space-x-2">
        <div className="flex-1 border-t border-border-clr"></div>
        <span className="px-4 text-sm text-gray-500">{t('orContinueWith')}</span>
        <div className="flex-1 border-t border-border-clr"></div>
      </div>

      {/* <GoogleButton onClick={handleGoogleLogin} disabled={isLoading} /> */}

      <p className="mt-6 text-center text-sm text-gray-500">
        {t('noAccount')}{' '}
        <Link
          to="/choose-category"
          className="text-text-pr font-semibold hover:underline"
        >
          {t('register')}
        </Link>
      </p>
    </>
  );
};
