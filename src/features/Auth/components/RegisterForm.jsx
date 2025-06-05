// src/features/Auth/components/RegisterForm.jsx
import React, { useState, useEffect, } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { InputField } from '../../../shared/common';
import { PasswordInput } from '../../../shared/Passinput';
import { Button } from '../../../shared/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { registerUser } from '../authThunks';
import { resetAuthState } from '../authSlice';

import {
  selectLoading,
  selectError,
  selectSuccess,
  selectMessage,
} from '../authSelectors';

export const RegisterForm = () => {


  const location = useLocation();
  const userType = location.state?.userType; // <- this is the passed value
  // local form state
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const isLoading = useSelector(selectLoading);
  const isError = useSelector(selectError);
  const isSuccess = useSelector(selectSuccess);
  const message = useSelector(selectMessage);

  // Whenever registration succeeds, navigate to /verify
  useEffect(() => {
    if (isSuccess) {
      // pass the entered email/phone along in state
      navigate('/verify', { state: { email: emailPhone } });
    }
    // On unmount, reset any leftover auth state (so error/success flags go away)
    return () => {
      dispatch(resetAuthState());
    };
  }, [isSuccess, dispatch, navigate, emailPhone]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // simple local validation
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (!gender) {
      setLocalError('Please select your gender');
      return;
    }

    // clear any local error & dispatch thunk
    setLocalError('');
    dispatch(registerUser({ emailPhone, password, gender,userType }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        value={emailPhone}
        onChange={(e) => setEmailPhone(e.target.value)}
        placeholder="Email or phone number"
      />

      {/* Gender Select */}
      <div>
        <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">
          Gender
        </label>
        <div className="relative">
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none pr-10 bg-white hover:border-gray-400"
          >
            <option value="">— select —</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="TO_FEMALE">Trans Female</option>
            <option value="TO_MALE">Trans Male</option>
            <option value="OTHERS">Other</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            size={20}
          />
        </div>
      </div>

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

      {/* Show either localError or server-side error */}
      {(localError || isError) && (
        <p className="text-red-500 text-sm">{localError || message}</p>
      )}
      {isSuccess && <p className="text-green-600 text-sm">{message}</p>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Get Started'}
      </Button>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-pink-600 font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
};
