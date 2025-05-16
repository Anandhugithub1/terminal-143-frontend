// components/RegisterForm.jsx
// ----------------------
import React, { useState } from 'react';
import { InputField, PasswordInput } from '../../../shared/common';
import { Button } from '../../../shared/Button';

export const RegisterForm = ({ onSubmit, isLoading, error, message }) => {
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [gender, setGender] = useState('');

  const handle = (e) => {
    e.preventDefault();
    onSubmit({ emailPhone, password, gender }, confirmPassword);
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <InputField value={emailPhone} onChange={(e) => setEmailPhone(e.target.value)} placeholder="Email or phone number" />
      {/* gender select... */}
      <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}
      <Button type="submit" disabled={isLoading}>{isLoading ? '...' : 'Register'}</Button>
    </form>
  );
};