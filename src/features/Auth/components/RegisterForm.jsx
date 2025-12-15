import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../../shared/common';
import PasswordInput from '../../../shared/Passinput';
import { Button } from '../../../shared/Button';
import { ChevronDown } from 'lucide-react';
import { useRegister } from '../useAuth';

const RegisterForm = () => {
  const { t, ready } = useTranslation('auth');
  const location = useLocation();
  const userType = location.state?.userType;

  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [localError, setLocalError] = useState('');

  const navigate = useNavigate();

  const {
    mutate,
    isPending,
    isError,
    isSuccess,
    data,
    error,
  } = useRegister();

 
  useEffect(() => {
    if (isSuccess) {
      navigate('/verify', { state: { email: emailPhone } });
    }
  }, [isSuccess, navigate, emailPhone]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setLocalError(t('passwordMismatch'));
      return;
    }

    if (!gender) {
      setLocalError(t('selectGender'));
      return;
    }

    setLocalError('');
    mutate({ emailPhone, password, gender, userType });
  };

  if (!ready) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        value={emailPhone}
        onChange={(e) => setEmailPhone(e.target.value)}
        placeholder={t('emailOrPhone')}
      />

      <div>
        <label
          htmlFor="gender"
          className="block text-gray-700 text-sm font-semibold mb-2"
        >
          {t('gender')}
        </label>

        <div className="relative">
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       focus:outline-none focus:ring-2 focus:ring-pink-500
                       focus:border-transparent transition-all appearance-none
                       pr-10 bg-white hover:border-gray-400"
          >
            <option value="">— {t('select')} —</option>
            <option value="MALE">{t('male')}</option>
            <option value="FEMALE">{t('female')}</option>
            <option value="TO_FEMALE">{t('transFemale')}</option>
            <option value="TO_MALE">{t('transMale')}</option>
            <option value="OTHERS">{t('other')}</option>
          </select>

          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-gray-500 pointer-events-none"
            size={20}
          />
        </div>
      </div>

      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('createPassword')}
      />

      <div className="text-xs text-gray-500">
        {t('passwordRequirements')}
      </div>

      <PasswordInput
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t('confirmPassword')}
      />

      {(localError || isError) && (
        <p className="text-red-500 text-sm">
          {localError ||
            error?.response?.data?.error ||
            error?.response?.data?.message}
        </p>
      )}

      {isSuccess && (
        <p className="text-green-600 text-sm">
          {data?.message}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? t('registering') : t('getStarted')}
      </Button>

      <div className="mt-6 text-center text-sm text-gray-500">
        {t('alreadyHaveAccount')}{' '}
        <Link
          to="/login"
          className="text-pink-600 font-semibold hover:underline"
        >
          {t('signIn')}
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
