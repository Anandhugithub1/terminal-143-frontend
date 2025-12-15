import React, { useEffect, useState } from 'react';
import { InputField } from '../../../shared/common';
import PasswordInput from '../../../shared/Passinput';
import { Button } from '../../../shared/Button';
import Loader from '../../../components/Ui/Loading';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../useAuth';

const LoginForm = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, isPending, isSuccess, data, error } = useLogin();

  useEffect(() => {
    if (isSuccess) {
      if (!data.profileCompleted) {
        navigate('/complete');
      } else {
        navigate('/home');
      }
      localStorage.setItem('userType', data.userType);
    }
  }, [isSuccess, data, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailPhone || !password) {
      return toast.error(t('enterCredentials'));
    }

    mutate(
      { emailPhone, password },
      {
        onError: (err) => {
          const apiErr = err?.response?.data;
          if (apiErr?.notVerified) {
            navigate('/verify', { state: { emailPhone } });
          } else {
            toast.error(apiErr?.error || apiErr?.message || t('loginFailed'));
          }
        },
      }
    );
  };

  return (
    <>
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <Loader />
        </div>
      )}

      <h1 className="text-2xl font-bold text-center mb-6">
        {t('welcomeBack')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          value={emailPhone}
          onChange={(e) => setEmailPhone(e.target.value)}
          placeholder={t('emailOrPhone')}
        />

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password')}
        />

        <div className="text-right">
          <Link to="/reset-password" className="text-sm font-semibold">
            {t('forgotPassword')}
          </Link>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader /> : t('login')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        {t('noAccount')}{' '}
        <Link to="/choose-category" className="font-semibold">
          {t('register')}
        </Link>
      </p>
    </>
  );
};

export default LoginForm;
