import React, { useEffect, useState } from 'react';
import { InputField } from '../../../shared/common';
import PasswordInput from '../../../shared/Passinput';
import { Button } from '../../../shared/Button';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../useAuth';

const RegisterForm = () => {
  const { t, ready } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType;

  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [localError, setLocalError] = useState('');

  const { mutate, isPending, isSuccess, error } = useRegister();

  useEffect(() => {
    if (isSuccess) {
      navigate('/verify', { state: { email: emailPhone } });
    }
  }, [isSuccess, navigate, emailPhone]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setLocalError(t('passwordMismatch'));
    }
    if (!gender) {
      return setLocalError(t('selectGender'));
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
        <label className="text-sm font-semibold">{t('gender')}</label>
        <div className="relative">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 pr-10"
          >
            <option value="">{t('select')}</option>
            <option value="MALE">{t('male')}</option>
            <option value="FEMALE">{t('female')}</option>
            <option value="TO_FEMALE">{t('transFemale')}</option>
            <option value="TO_MALE">{t('transMale')}</option>
            <option value="OTHERS">{t('other')}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('createPassword')}
      />

      <PasswordInput
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t('confirmPassword')}
      />

      {(localError || error) && (
        <p className="text-red-500 text-sm">
          {localError || error?.response?.data?.message}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? t('registering') : t('getStarted')}
      </Button>

      <p className="text-center text-sm mt-4">
        {t('alreadyHaveAccount')}{' '}
        <Link to="/login" className="font-semibold">
          {t('signIn')}
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
